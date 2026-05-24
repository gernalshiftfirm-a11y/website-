# Jindal Dental Clinic — Website + Backend

A premium dental clinic site (Sangrur, Punjab) with a full Netlify-hosted
backend, Supabase database, WhatsApp + email notifications, and a private
admin dashboard.

---

## What's in this repo

```
website-/
├── index.html              ← public site (hero, services, booking, contact, ...)
├── styles.css
├── script.js
│
├── admin/                  ← private admin dashboard (/admin/)
│   ├── index.html
│   ├── admin.css
│   └── admin.js
│
├── netlify/
│   └── functions/          ← serverless API
│       ├── booking.js      ← POST /api/booking
│       ├── contact.js      ← POST /api/contact
│       ├── config.js       ← GET  /api/config (public Supabase config)
│       └── _utils/
│           └── notify.js   ← WhatsApp Cloud API + Resend email helpers
│
├── db/
│   └── schema.sql          ← run this once in Supabase
│
├── netlify.toml            ← redirects, headers, build config
├── package.json
└── .env.example            ← env-var template
```

---

## How the booking flow works

1. Patient submits the booking form on `/`
2. Frontend POSTs JSON to `/api/booking`
3. Netlify Function validates, rate-limits, and writes to Supabase
4. Notifications fire **in parallel** (any can fail without breaking the others):
   - Email to clinic via Resend (with tap-to-WhatsApp + tap-to-call buttons)
   - WhatsApp template message to clinic _(Tier 2, optional)_
   - WhatsApp template message to patient _(Tier 2, optional)_
5. Admin sees the booking appear in real-time on `/admin/` and updates status,
   adds notes, taps WhatsApp / Call to reply

---

## ⚡ Quick deploy — 5 steps

### 1 · Create a Supabase project (free)

1. Go to **<https://app.supabase.com>** → **New project**.
2. Pick a strong DB password, choose the closest region (Mumbai / Singapore).
3. Wait ~2 minutes for it to provision.
4. Open **SQL Editor → New query**, paste the contents of
   [`db/schema.sql`](./db/schema.sql), and **Run**.
5. **Authentication → Users → Add user**:
   - Email: e.g. `admin@jindaldentalclinic.in` (used to log in)
   - Password: a strong one — write it down
   - Toggle **Auto Confirm User**: **ON**
6. **Project Settings → API** — copy these three values, you'll need them next:
   - `URL`                 → goes to `SUPABASE_URL` and `PUBLIC_SUPABASE_URL`
   - `anon` `public` key   → goes to `PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → goes to `SUPABASE_SERVICE_ROLE_KEY`

### 2 · Create a Resend account (free, 3000 emails / month)

1. Sign up at **<https://resend.com>** with the same email you'll receive
   booking alerts at.
2. **API Keys → Create API Key** → copy it (starts with `re_…`)
3. _(Recommended later)_ **Domains → Add domain** → verify
   `jindaldentalclinic.in` so emails come from your real domain.
   Until then, set `RESEND_FROM=Jindal Dental Clinic <onboarding@resend.dev>`.

### 3 · Push this repo to GitHub

```bash
git push origin main           # or whatever branch you use
```

### 4 · Connect to Netlify

1. **<https://app.netlify.com>** → **Add new site → Import an existing project**
2. Choose this repo. Netlify detects `netlify.toml` automatically.
3. **Site settings → Environment variables** — add all of these:

   | Key                          | Value                                                |
   | ---------------------------- | ---------------------------------------------------- |
   | `SUPABASE_URL`               | (from step 1.6)                                      |
   | `SUPABASE_SERVICE_ROLE_KEY`  | (from step 1.6 — **secret**, never expose)           |
   | `PUBLIC_SUPABASE_URL`        | (same as `SUPABASE_URL`)                             |
   | `PUBLIC_SUPABASE_ANON_KEY`   | (from step 1.6)                                      |
   | `CLINIC_PHONE`               | `+919815171917`                                      |
   | `CLINIC_EMAIL`               | `contact@jindaldentalclinic.in`                      |
   | `CLINIC_NAME`                | `Jindal Dental Clinic`                               |
   | `RESEND_API_KEY`             | (from step 2 — leave empty to disable emails)        |
   | `RESEND_FROM`                | `Jindal Dental Clinic <onboarding@resend.dev>`       |

4. **Trigger deploy** → wait for green checkmark.

### 5 · Test it!

1. Open your `https://YOUR-SITE.netlify.app` URL.
2. Submit a test booking.
3. Within seconds:
   - You should get a styled email at your clinic email address with
     **Reply on WhatsApp** + **Call patient** buttons.
   - Open `https://YOUR-SITE.netlify.app/admin/`, sign in with the email +
     password you created in step 1.5 — your test booking is right there.

🎉 **You're live.**

---

## 🟢 Tier 2 — Fully automated WhatsApp messages (optional)

Out of the box you get **email** + **tap-to-WhatsApp links**. To make
WhatsApp messages send **automatically** to both clinic and patient,
follow these one-time steps:

1. **Meta Business setup** (free, takes 1–3 days for approval):
   - Create a Meta Business account → <https://business.facebook.com>
   - Set up a **WhatsApp Business Account (WABA)** there
   - Add a phone number you control (Meta will verify it via OTP)
   - In **WhatsApp Manager → Message Templates**, create two templates:

   **Template 1 — `appointment_confirmation`** (sent to patients)
   - Category: `UTILITY`
   - Language: `en`
   - Body: `Hi {{1}}, your appointment for {{2}} on {{3}} at {{4}} has been received. We'll confirm shortly. — Jindal Dental Clinic`

   **Template 2 — `new_appointment_alert`** (sent to clinic)
   - Category: `UTILITY`
   - Language: `en`
   - Body: `New appointment request: {{1}} ({{2}}) — {{3}} on {{4}} at {{5}}.`

   Submit for approval. Approval is usually within a few hours.

2. **Get your credentials** (Meta Business → WhatsApp → API setup):
   - **Permanent access token** → `WHATSAPP_TOKEN`
   - **Phone number ID**       → `WHATSAPP_PHONE_ID`

3. **Add to Netlify env vars** and redeploy:

   | Key                          | Value                            |
   | ---------------------------- | -------------------------------- |
   | `WHATSAPP_TOKEN`             | (permanent access token)         |
   | `WHATSAPP_PHONE_ID`          | (phone number ID)                |
   | `WHATSAPP_TEMPLATE_PATIENT`  | `appointment_confirmation`       |
   | `WHATSAPP_TEMPLATE_CLINIC`   | `new_appointment_alert`          |

That's it — no code changes. The next booking will trigger automatic
WhatsApp messages on both ends.

---

## 🔐 Using the admin dashboard

URL: `https://YOUR-SITE.netlify.app/admin/`

- **Sign in** with the Supabase admin email + password you created.
- **Stats** at the top show today's bookings, pending count, week total,
  and all-time total.
- **Filter chips** narrow the list by status. **Search** by patient
  name or phone.
- **Status dropdown** on each card updates the booking immediately
  (`pending → confirmed → completed`, or `cancelled` / `no_show`).
- **Notes** auto-save 700ms after you stop typing.
- **WhatsApp** button opens a chat with the patient with a pre-filled
  confirmation message. **Call** button opens the dialer.
- **New bookings appear instantly** via Supabase Realtime — no refresh
  needed. You'll see a toast notification when one arrives.
- **Messages tab** shows contact-form submissions with mailto: replies.

### Adding more admin users

**Supabase dashboard → Authentication → Users → Add user**.
Any user with a Supabase auth account can log into the dashboard.

---

## 🛠 Local development

```bash
# from the repo root
npm install
npx netlify login
npx netlify link        # link this folder to your Netlify site
npx netlify dev         # runs site + functions on http://localhost:8888
```

`netlify dev` automatically loads env vars from your linked site, or
from a local `.env` file if you create one (copy from `.env.example`).

---

## 🔧 Troubleshooting

| Symptom                                    | Likely cause / fix                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| Booking returns 500                        | Check Netlify **Functions logs** → most likely missing `SUPABASE_*` env vars         |
| Booking succeeds but no email arrives      | `RESEND_API_KEY` not set, or your `RESEND_FROM` domain isn't verified                |
| Admin dashboard shows "Setup needed"       | `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` not set in Netlify env vars       |
| Admin login fails with "Invalid login"     | User doesn't exist in Supabase Auth, or "Auto Confirm User" wasn't ticked            |
| Bookings list empty for admin              | RLS blocking access — re-run `db/schema.sql` (it creates the right policies)         |
| WhatsApp messages don't send automatically | Tier 2 not configured yet — see Tier 2 section above                                 |
| `429 rate_limited` on submit               | Working as designed — 5 bookings / minute / IP limit. Wait a minute.                 |

For function logs: **Netlify dashboard → Site → Functions → click a
function → Logs**.

---

## 🔒 Security notes

- The **service-role key** is a database superuser key. Keep it server-side
  only (never put it in `PUBLIC_*` vars or browser code).
- The **anon key** is meant to be public — Row Level Security on
  `bookings` and `contact_messages` controls who can do what:
  - Anyone (anon) can `INSERT` only.
  - Authenticated users (admins) can `SELECT` / `UPDATE` / `DELETE`.
- The `/admin/` route is `noindex,nofollow` so search engines won't
  surface it. The route itself isn't blocked — security comes entirely
  from Supabase Auth + RLS.
- Forms include a **honeypot field** (`name="website"`) and a small
  per-IP **rate limiter** to discourage automated spam.

---

## 📞 Clinic info (used in defaults)

- **Phone / WhatsApp:** +91 98151 71917
- **Email:** contact@jindaldentalclinic.in
- **Address:** 9-House Street, Banasar Bagh Road, Patiala Gate,
  Near SBI Bank, Sangrur, Punjab

Update these in:
- Netlify env vars (`CLINIC_PHONE`, `CLINIC_EMAIL`, `CLINIC_NAME`)
- `index.html` (header, hero, contact section, footer, floating buttons,
  Google Maps embed)

---

Made with care for healthier smiles. 🦷
