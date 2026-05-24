/* =====================================================================
 * Notification helpers — WhatsApp Cloud API + Resend email
 *
 * Both helpers are designed to *never throw* into the request handler.
 * They log failures and return a status object the caller can use.
 *
 * Behaviour:
 *   • If WHATSAPP_TOKEN + WHATSAPP_PHONE_ID are set      → real WhatsApp send
 *   • If RESEND_API_KEY is set                           → real email send
 *   • Otherwise → log a structured warning and return false
 *
 * This means the booking endpoint always succeeds (the data is saved),
 * regardless of whether notification credentials are configured.
 * ==================================================================== */

const env = (k, fallback = '') => (process.env[k] ?? fallback).trim();

// ---------------------------------------------------------------------
// Phone number formatting — WhatsApp Cloud API expects digits only
// e.g. "+91 98151 71917" → "919815171917"
// ---------------------------------------------------------------------
export function normalizePhone(input, defaultCountry = '91') {
  if (!input) return '';
  let digits = String(input).replace(/\D+/g, '');
  // strip leading 0 commonly used in India
  if (digits.startsWith('0')) digits = digits.slice(1);
  // assume IN country code if 10 digits and no country prefix
  if (digits.length === 10) digits = defaultCountry + digits;
  return digits;
}

// e164 format with leading + for tel: links, e.g. "+919815171917"
export function toE164(input, defaultCountry = '91') {
  const d = normalizePhone(input, defaultCountry);
  return d ? '+' + d : '';
}

// ---------------------------------------------------------------------
// WhatsApp Cloud API — send a pre-approved template message
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
// ---------------------------------------------------------------------
async function sendWhatsAppTemplate({ to, templateName, params, language = 'en' }) {
  const token   = env('WHATSAPP_TOKEN');
  const phoneId = env('WHATSAPP_PHONE_ID');

  if (!token || !phoneId || !templateName) {
    return { sent: false, reason: 'whatsapp_not_configured' };
  }

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to: normalizePhone(to),
    type: 'template',
    template: {
      name: templateName,
      language: { code: language },
      components: params?.length
        ? [{
            type: 'body',
            parameters: params.map(p => ({ type: 'text', text: String(p ?? '') })),
          }]
        : undefined,
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn('WhatsApp send failed:', res.status, data);
      return { sent: false, reason: 'whatsapp_api_error', status: res.status, error: data };
    }
    return { sent: true, id: data?.messages?.[0]?.id };
  } catch (err) {
    console.error('WhatsApp send threw:', err);
    return { sent: false, reason: 'whatsapp_network_error', error: String(err) };
  }
}

// ---------------------------------------------------------------------
// Resend email — https://resend.com/docs/api-reference/emails/send-email
// ---------------------------------------------------------------------
async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = env('RESEND_API_KEY');
  if (!apiKey) return { sent: false, reason: 'resend_not_configured' };

  const from = env('RESEND_FROM', 'Jindal Dental Clinic <onboarding@resend.dev>');
  const body = { from, to: Array.isArray(to) ? to : [to], subject, html };
  if (replyTo) body.reply_to = replyTo;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn('Resend send failed:', res.status, data);
      return { sent: false, reason: 'resend_api_error', status: res.status, error: data };
    }
    return { sent: true, id: data?.id };
  } catch (err) {
    console.error('Resend send threw:', err);
    return { sent: false, reason: 'resend_network_error', error: String(err) };
  }
}

// ---------------------------------------------------------------------
// HTML email template (used by both booking + contact)
// ---------------------------------------------------------------------
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function emailShell({ title, intro, rows = [], footer = '' }) {
  const rowHtml = rows.map(([k, v]) => `
    <tr>
      <td style="padding:8px 0;color:#64748b;font-size:14px;width:130px;">${escapeHtml(k)}</td>
      <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;">${v /* may contain links */}</td>
    </tr>`).join('');

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(2,132,199,.08);">
    <div style="background:linear-gradient(135deg,#0284c7,#14b8a6);padding:28px 28px 24px;color:#fff;">
      <div style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;opacity:.85;">Jindal Dental Clinic</div>
      <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;">${escapeHtml(title)}</h1>
    </div>
    <div style="padding:24px 28px;color:#334155;font-size:15px;line-height:1.6;">
      ${intro ? `<p style="margin:0 0 18px;">${intro}</p>` : ''}
      ${rows.length ? `<table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0;">${rowHtml}</table>` : ''}
      ${footer ? `<div style="margin-top:22px;font-size:13px;color:#64748b;">${footer}</div>` : ''}
    </div>
    <div style="padding:14px 28px;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center;">
      Sangrur, Punjab · +91 98151 71917
    </div>
  </div>
</body></html>`;
}

// ---------------------------------------------------------------------
// Tap-to-WhatsApp link the clinic can click in the alert email
// ---------------------------------------------------------------------
function waLinkForPatient(patientPhone, patientName, treatment, date, time) {
  const msg = encodeURIComponent(
    `Hello ${patientName}, this is Jindal Dental Clinic. ` +
    `Your appointment for ${treatment} on ${date} at ${time} is confirmed. ` +
    `Please arrive 10 minutes early. Thank you!`
  );
  return `https://wa.me/${normalizePhone(patientPhone)}?text=${msg}`;
}

// =====================================================================
// PUBLIC API: notifyNewBooking
// Sends 4 things in parallel (any can fail without breaking the others):
//   1. WhatsApp template to the clinic phone     (Tier 2)
//   2. WhatsApp template to the patient          (Tier 2)
//   3. Email to clinic with all booking details  (Tier 1)
//   4. Email confirmation to patient if email    (skipped — we don't collect)
// Returns a small status object for logging.
// =====================================================================
export async function notifyNewBooking(booking) {
  const {
    name, phone, treatment, preferred_date, preferred_time, message, id
  } = booking;

  const clinicPhone = env('CLINIC_PHONE', '+919815171917');
  const clinicEmail = env('CLINIC_EMAIL');
  const clinicName  = env('CLINIC_NAME', 'Jindal Dental Clinic');

  const tplPatient = env('WHATSAPP_TEMPLATE_PATIENT', 'appointment_confirmation');
  const tplClinic  = env('WHATSAPP_TEMPLATE_CLINIC',  'new_appointment_alert');

  // formatted strings shared by all channels
  const dateStr = preferred_date;          // e.g. "2026-05-25"
  const timeStr = preferred_time;          // e.g. "05:00 PM"
  const idShort = id ? id.split('-')[0].toUpperCase() : 'NEW';

  // -------- 1+2: WhatsApp via Cloud API (Tier 2) --------
  const waPatient = sendWhatsAppTemplate({
    to: phone,
    templateName: tplPatient,
    params: [name, treatment, dateStr, timeStr],
  });

  const waClinic = sendWhatsAppTemplate({
    to: clinicPhone,
    templateName: tplClinic,
    params: [name, phone, treatment, dateStr, timeStr],
  });

  // -------- 3: Email alert to clinic (Tier 1) --------
  const tapToReply = waLinkForPatient(phone, name, treatment, dateStr, timeStr);
  const callLink   = `tel:${toE164(phone)}`;

  const clinicEmailPromise = clinicEmail
    ? sendEmail({
        to: clinicEmail,
        replyTo: clinicEmail,
        subject: `🦷 New booking — ${name} · ${treatment} · ${dateStr} ${timeStr}`,
        html: emailShell({
          title: 'New appointment request',
          intro: `<strong>${escapeHtml(name)}</strong> just requested an appointment via the website.`,
          rows: [
            ['Reference',   `<code>#${escapeHtml(idShort)}</code>`],
            ['Patient',     escapeHtml(name)],
            ['Phone',       `<a href="${callLink}" style="color:#0284c7;text-decoration:none;">${escapeHtml(toE164(phone))}</a>`],
            ['Treatment',   escapeHtml(treatment)],
            ['Date',        escapeHtml(dateStr)],
            ['Time',        escapeHtml(timeStr)],
            ['Note',        escapeHtml(message || '—')],
            ['Submitted',   new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
          ],
          footer: `
            <a href="${tapToReply}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:600;font-size:14px;">
              💬 Reply on WhatsApp
            </a>
            &nbsp;
            <a href="${callLink}" style="display:inline-block;background:#0284c7;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:600;font-size:14px;">
              📞 Call patient
            </a>
            <p style="margin:18px 0 0;color:#64748b;font-size:12px;">
              Manage all bookings in your <a href="${env('SITE_URL', 'https://your-site.netlify.app')}/admin/" style="color:#0284c7;">admin dashboard</a>.
            </p>`,
        }),
      })
    : Promise.resolve({ sent: false, reason: 'no_clinic_email' });

  const [r1, r2, r3] = await Promise.all([waPatient, waClinic, clinicEmailPromise]);

  return {
    whatsappPatient: r1,
    whatsappClinic:  r2,
    emailClinic:     r3,
  };
}

// =====================================================================
// notifyNewContactMessage — for the generic contact form
// =====================================================================
export async function notifyNewContactMessage({ name, email, message }) {
  const clinicEmail = env('CLINIC_EMAIL');
  if (!clinicEmail) return { emailClinic: { sent: false, reason: 'no_clinic_email' } };

  const result = await sendEmail({
    to: clinicEmail,
    replyTo: email,
    subject: `📬 New website message — ${name}`,
    html: emailShell({
      title: 'New contact message',
      intro: `<strong>${escapeHtml(name)}</strong> sent a message via the website contact form.`,
      rows: [
        ['Name',     escapeHtml(name)],
        ['Email',    `<a href="mailto:${escapeHtml(email)}" style="color:#0284c7;">${escapeHtml(email)}</a>`],
        ['Message',  escapeHtml(message).replace(/\n/g, '<br/>')],
        ['Received', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
      ],
      footer: `Reply directly to this email — it goes to the sender.`,
    }),
  });

  return { emailClinic: result };
}
