# Addiction Fitness Factory — Premium Gym Website

A cinematic, dark-luxury fitness website for **Addiction Fitness Factory**,
Sangrur's premium gym. Built with vanilla HTML, CSS and JavaScript — zero
build step, runs anywhere.

> _"A luxury futuristic fitness brand built for serious transformations
> and a premium gym lifestyle."_

---

## What's inside

| Section | Highlights |
| --- | --- |
| **Premium loader** | Animated brand reveal with progress bar |
| **Custom cursor** | Smooth-follow ring with hover state (desktop) |
| **Sticky nav** | Glassmorphism, dark/light theme toggle, mobile drawer |
| **Hero** | Cinematic video background, neon glow blobs, grid overlay, big motivational headline, **5 animated counters** (391+ reviews, 1000+ members, 15+ trainers, 100+ machines, 500+ transformations), 3 CTAs (Join Now, Book Free Trial, View Memberships) |
| **Marquee** | High-energy scrolling ribbon — _NO PAIN NO GAIN · BUILT BY DISCIPLINE · TRANSFORMATION FACTORY_ |
| **About** | Premium photo collage with floating badge + spinning sticker, 4 differentiators |
| **Why Choose Us** | **12 glass feature cards** — certified trainers, premium equipment, personal training, fat loss, muscle building, cardio zone, strength training, functional area, spacious floor, hygiene, motivating vibe, flexible plans |
| **Trainers** | 4 coach cards (Anshul, Preet Ma'am, Vikram, Neha) — grayscale-to-color hover, motivational quote, certifications |
| **Plans** | **5 luxury pricing cards** — Monthly (₹1,999), Quarterly, Half-Year (featured), Annual, Personal Training |
| **Transformations** | Drag/touch/keyboard before-after slider with neon handle, plus 4 result cards |
| **Reviews** | Auto-rotating carousel of 6 glassmorphism review cards |
| **Gallery** | 9-image masonry with full-screen lightbox (arrow-key + Esc nav) |
| **Free Trial CTA** | Glassmorphism form (name, phone, goal, timing, plan), tap-to-call & WhatsApp |
| **Fitness Tools** | **BMI Calculator** (with category interpretation), **Calorie Calculator** (Mifflin–St Jeor → maintain / cut / bulk), **Goal Tracker** with progress bar |
| **Location** | Embedded Google Map (dark-themed), address, hours, Instagram, Get Directions / Call / WhatsApp buttons |
| **FAQ** | 8 accordion items |
| **Footer** | Quick links, memberships, contact, hours, newsletter |
| **Floating actions** | WhatsApp, call, back-to-top |
| **Mobile bottom bar** | Sticky Call · WhatsApp · Join Now |

---

## Brand & contact data baked into the site

- **Name:** Addiction Fitness Factory Premium Gym
- **Address:** Singla Road, Near Dr Dharmpal Road, Mubarik Mehal Colony,
  Sangrur, Punjab 148001
- **Phone / WhatsApp:** +91 90410 01005
- **Hours:** Mon–Sat 5 AM – 11 PM · Sun 6 AM – 2 PM
- **Trainers featured:** Anshul (Head Coach), Preet Ma'am (Women's Coach),
  Vikram (Cardio/HIIT), Neha (Nutrition)

---

## Design language

- **Palette:** matte black `#0a0a0a` · neon red `#ff2d2d` · neon orange `#ff7a18` · pure white
- **Typography:** Bebas Neue (display) · Oswald (headings) · Inter (body)
- **Effects:** glassmorphism cards, neon glow shadows, cinematic vignettes, animated grids, mouse-follow radial glow on cards, 3D tilt on hover, custom cursor
- **Motion:** smooth scroll, scroll-reveal with stagger, animated counters, marquee, spinning brand sticker
- **Theme:** Dark by default; light theme toggle persists in `localStorage`

---

## File structure

```
website-/
├── index.html      ← all sections / markup
├── styles.css      ← dark luxury theme, glassmorphism, neon, light theme support
├── script.js       ← all interactions (cursor, slider, calcs, carousels, theme)
├── netlify.toml    ← static publish + security headers
├── package.json    ← static-site shell
└── README.md
```

---

## Run locally

Open `index.html` directly in any modern browser — that's it. No build,
no install. Or, if you want a proper local server:

```bash
npm start             # starts python3 -m http.server on :8080
# then visit http://localhost:8080
```

---

## Deploy

The site is a static bundle — drop it on **Netlify**, **Vercel**,
**Cloudflare Pages**, **GitHub Pages**, or any host:

- **Netlify:** import the repo, no env vars needed; `netlify.toml`
  publishes the root.
- **Vercel:** import; framework preset = "Other"; root directory = `.`.
- **GitHub Pages:** push to `main`, enable Pages → root.

---

## Customising

| What to change | Where |
| --- | --- |
| Brand name, address, phone | search `Addiction Fitness Factory`, `+91 90410 01005`, `Singla Road` in `index.html` |
| Pricing | `<section id="plans">` plan cards |
| Trainer names / photos | `<section id="trainers">` |
| Hero video | `<source src="...">` inside `.hero__bg` (Pexels MP4 or your own URL) |
| Stock photos | All `<img src="https://images.unsplash.com/...">` URLs |
| Theme colours | CSS variables at top of `styles.css` (`--neon-red`, `--neon-orange`, `--bg`) |
| Google Map | `iframe src` inside `<section id="contact">` — replace with your exact place embed URL |

The Google Maps **Get Directions** button searches for the gym name +
address, so it works as soon as the place is correctly listed on Google
Business.

---

## Optional next steps (not yet built)

- AI fitness assistant chatbot (e.g. via OpenAI realtime API)
- Workout plan generator (rule-based or LLM-backed)
- Online membership purchase (Razorpay / Stripe)
- Trainer booking system (Cal.com embed or custom)
- Diet consultation booking (form + calendar integration)
- Member dashboard

These can be layered on as serverless functions or a separate API later
without changing the public marketing site.

---

Built with sweat &amp; code for the addiction fitness lifestyle. 🔥
