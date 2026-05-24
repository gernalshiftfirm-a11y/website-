/* =====================================================================
 * POST /api/booking
 * ---------------------------------------------------------------------
 * Public endpoint. Accepts an appointment booking, persists it to
 * Supabase, and fires WhatsApp + email notifications (best-effort).
 *
 * Returns 200 with the new booking id on success, 4xx on validation
 * errors, 5xx if the database write fails.
 * ==================================================================== */

import { createClient } from '@supabase/supabase-js';
import { notifyNewBooking } from './_utils/notify.js';

const env = (k, fallback = '') => (process.env[k] ?? fallback).trim();

// ---------------------------------------------------------------------
// Supabase client — service-role key bypasses RLS so we can insert.
// NEVER expose the service-role key in the browser.
// ---------------------------------------------------------------------
const supabase = createClient(
  env('SUPABASE_URL'),
  env('SUPABASE_SERVICE_ROLE_KEY'),
  { auth: { persistSession: false } },
);

// ---------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------
const ALLOWED_TREATMENTS = new Set([
  'General Consultation',
  'Dental Implants',
  'Root Canal Treatment',
  'Teeth Whitening',
  'Smile Designing',
  'Tooth Capping / Crown',
  'Braces & Aligners',
  'Sensitivity Treatment',
  'Pediatric Dentistry',
  'Dentures',
  'Cosmetic Dentistry',
  'Emergency',
]);

function validate(data) {
  const errors = {};
  const trim = (s, n = 500) => String(s ?? '').trim().slice(0, n);

  const name      = trim(data.name, 120);
  const phone     = trim(data.phone, 30);
  const treatment = trim(data.treatment, 80);
  const date      = trim(data.date, 12);
  const time      = trim(data.time, 30);
  const message   = trim(data.message, 1000);

  if (name.length < 2)                 errors.name      = 'Please enter your name.';
  if (!/^[+0-9 ()\-]{8,30}$/.test(phone)) errors.phone   = 'Please enter a valid phone number.';
  if (!ALLOWED_TREATMENTS.has(treatment)) errors.treatment = 'Please select a treatment.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))  errors.date    = 'Please pick a date.';
  if (!time)                            errors.time      = 'Please pick a time slot.';

  // date must be today or future
  if (!errors.date) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const picked = new Date(date + 'T00:00:00');
    if (isNaN(picked.getTime()) || picked < today) {
      errors.date = 'Please pick today or a future date.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { name, phone, treatment, date, time, message },
  };
}

// ---------------------------------------------------------------------
// Tiny in-memory rate-limiter (per cold container instance)
// Light protection — Netlify also has DDoS protection at the edge.
// ---------------------------------------------------------------------
const rateMap = new Map();
function rateLimited(ip, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const arr = (rateMap.get(ip) || []).filter(t => now - t < windowMs);
  arr.push(now);
  rateMap.set(ip, arr);
  return arr.length > limit;
}

// ---------------------------------------------------------------------
// Standard JSON response
// ---------------------------------------------------------------------
const json = (status, body) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(body),
});

// ---------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------
export const handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'method_not_allowed' });
  }

  // Rate limit per IP
  const ip = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return json(429, { ok: false, error: 'rate_limited', message: 'Too many requests, please try again in a minute.' });
  }

  // Parse body
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { ok: false, error: 'invalid_json' });
  }

  // Honeypot — silently accept then drop (bots tend to fill all fields)
  if (body.website || body.url) {
    return json(200, { ok: true, id: 'spam-ignored' });
  }

  // Validate
  const { valid, errors, data } = validate(body);
  if (!valid) {
    return json(400, { ok: false, error: 'validation_failed', fields: errors });
  }

  // Insert into DB
  if (!env('SUPABASE_URL') || !env('SUPABASE_SERVICE_ROLE_KEY')) {
    console.error('Supabase env vars missing — booking not persisted.');
    return json(500, { ok: false, error: 'server_misconfigured' });
  }

  const { data: row, error } = await supabase
    .from('bookings')
    .insert({
      name:           data.name,
      phone:          data.phone,
      treatment:      data.treatment,
      preferred_date: data.date,
      preferred_time: data.time,
      message:        data.message || null,
      source:         'website',
    })
    .select('id, created_at')
    .single();

  if (error) {
    console.error('DB insert failed:', error);
    return json(500, { ok: false, error: 'db_write_failed' });
  }

  // Fire-and-await notifications (we want to know if they failed in logs,
  // but the booking is already saved either way).
  let notify = {};
  try {
    notify = await notifyNewBooking({
      id:             row.id,
      name:           data.name,
      phone:          data.phone,
      treatment:      data.treatment,
      preferred_date: data.date,
      preferred_time: data.time,
      message:        data.message,
    });
  } catch (e) {
    console.error('Notify threw (non-fatal):', e);
  }

  return json(200, {
    ok: true,
    id: row.id,
    message: "Booking received. We'll confirm on WhatsApp within 30 minutes.",
    notify,
  });
};
