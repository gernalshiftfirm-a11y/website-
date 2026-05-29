# Maths with Sahil Verma — SG Coaching Centre

Premium concept-based Mathematics coaching website for **SG Coaching
Centre, Sangrur**, run by **Sahil Verma**. Static HTML/CSS/JS — no build
step.

## Highlights

- **Free Demo form → WhatsApp**: Submitting the demo form composes a
  formatted WhatsApp message with all the student's details (name,
  class, phone, subject, preferred timing, timestamp) and opens it in
  WhatsApp directed at **+91 79864 22304**. No backend required.
- **Quick Inquiry form → WhatsApp**: Same flow for the contact-section
  inquiry form (name, phone, message).
- Light & dark theme with persistent preference.
- Sticky navbar, smooth-scroll, animated counters, reveal-on-scroll,
  testimonials slider with autoplay, animated FAQ.
- Floating WhatsApp + call buttons, back-to-top.
- Fully responsive (mobile, tablet, desktop).

## File structure

```
website-/
├── index.html     ← all sections / markup
├── styles.css     ← navy + gold premium UI, light/dark themes
├── script.js      ← interactions + WhatsApp form redirect
├── netlify.toml   ← static-site config + cache headers
├── package.json
└── README.md
```

## How the WhatsApp redirect works

When the user submits the **Free Demo** form (or the **Quick Inquiry**
form), the JS:

1. Validates the form with native HTML5 validation.
2. Builds a formatted WhatsApp message, e.g.:

   ```
   *New Free Demo Class Request*
   _via Maths with Sahil Verma website_

   *Student Name:* Aarav Singh
   *Class:* Class 10
   *Phone:* +91 9XXXXXXXXX
   *Subject / Stream:* Mathematics
   *Preferred Timing:* Evening (5:00 PM)

   Submitted: 29 May 2026, 04:30 pm
   ```

3. URL-encodes that message and opens
   `https://wa.me/917986422304?text=<message>` in a new tab.
4. On mobile this hands off to the WhatsApp app; on desktop it opens
   `web.whatsapp.com`. If the popup is blocked, the page falls back to
   a same-tab redirect.
5. A small success message is shown with a manual fallback link in case
   the redirect didn't fire.

## Customise the WhatsApp number

Open `script.js` and change the constant at the top:

```js
const WHATSAPP_NUMBER = '917986422304'; // country code + number, no '+', no spaces
```

Also update the `tel:` and `wa.me/` links throughout `index.html` to
match (search for `7986422304`).

## Run locally

Just open `index.html` in any modern browser. No build step required.

For Netlify dev (optional):

```bash
npm install
npx netlify dev
```
