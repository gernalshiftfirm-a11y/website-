/* =====================================================================
 * POST /api/contact
 * ---------------------------------------------------------------------
 * Public endpoint for the generic contact form. Saves the message and
 * emails the clinic.
 * ==================================================================== */

import { createClient } from '@supabase/supabase-js';
import { notifyNewContactMessage } from './_utils/notify.js';

const env = (k, fallback = '') => (process.env[k] ?? fallback).trim();

const supabase = createClient(
  env('SUPABASE_URL'),
  env('SUPABASE_SERVICE_ROLE_KEY'),
  { auth: { persistSession: false } },
);

const json = (status, body) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

const trim = (s, n = 1000) => String(s ?? '').trim().slice(0, n);

function validate(data) {
  const name    = trim(data.name, 120);
  const email   = trim(data.email, 200);
  const message = trim(data.message, 5000);
  const errors  = {};
  if (name.length < 2)                                    errors.name    = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))          errors.email   = 'Please enter a valid email.';
  if (message.length < 5)                                 errors.message = 'Please write a short message.';
  return { valid: Object.keys(errors).length === 0, errors, data: { name, email, message } };
}

// per-IP rate limit (10/min)
const rateMap = new Map();
function rateLimited(ip, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const arr = (rateMap.get(ip) || []).filter(t => now - t < windowMs);
  arr.push(now);
  rateMap.set(ip, arr);
  return arr.length > limit;
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'method_not_allowed' });

  const ip = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return json(429, { ok: false, error: 'rate_limited' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return json(400, { ok: false, error: 'invalid_json' }); }

  // honeypot
  if (body.website || body.url) return json(200, { ok: true, id: 'spam-ignored' });

  const { valid, errors, data } = validate(body);
  if (!valid) return json(400, { ok: false, error: 'validation_failed', fields: errors });

  if (!env('SUPABASE_URL') || !env('SUPABASE_SERVICE_ROLE_KEY')) {
    return json(500, { ok: false, error: 'server_misconfigured' });
  }

  const { data: row, error } = await supabase
    .from('contact_messages')
    .insert({ name: data.name, email: data.email, message: data.message })
    .select('id')
    .single();

  if (error) {
    console.error('Contact DB insert failed:', error);
    return json(500, { ok: false, error: 'db_write_failed' });
  }

  let notify = {};
  try { notify = await notifyNewContactMessage(data); }
  catch (e) { console.error('Contact notify threw:', e); }

  return json(200, {
    ok: true,
    id: row.id,
    message: "Thanks! We'll reply within 24 hours.",
    notify,
  });
};
