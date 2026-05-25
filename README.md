# Iron Forge Gym — Website

A modern, bold, dark-themed gym website built with vanilla HTML, CSS and
JavaScript. Zero build step, runs anywhere.

## What's inside

- **Hero** with full-screen background, animated stats, strong CTAs
- **Marquee** ribbon — high-energy moving callout
- **About** — story, key differentiators
- **Amenities** — 12 cards covering strength, cardio, CrossFit, yoga,
  spin, sauna, locker rooms, smoothie bar, parking, personal training
  and more
- **Membership** — 3 plans (Starter / Pro / Elite) with **monthly /
  quarterly / annual** billing toggle and animated price swaps
- **Photo gallery** — masonry grid with full-screen lightbox
  (keyboard + click navigation)
- **Trainers** — team section with hover-to-reveal photos
- **Location** — embedded Google Map + "Get Directions" button that
  opens the gym's exact Google Maps short link
- **Join form** — captures name, phone, email, plan interest and goal
  for the free trial signup
- **Footer** — quick links, contact info, social, newsletter signup
- **Floating WhatsApp** chat button + back-to-top

## File structure

```
website-/
├── index.html     ← all sections / markup
├── styles.css     ← dark + electric-yellow gym aesthetic
├── script.js      ← interactions (nav, gallery, lightbox, plan toggle, form)
├── netlify/       ← optional serverless API (booking + contact)
└── package.json
```

## Run locally

Just open `index.html` in any modern browser. No build step required.

For the optional Netlify Functions backend (booking notifications):

```bash
npm install
npx netlify dev
```

## Things to customise

Open `index.html` and search-replace these placeholders:

| Placeholder            | Where it appears                                  |
| ---------------------- | ------------------------------------------------- |
| `Iron Forge Gym`       | Brand name in hero, nav, footer, og description   |
| `+91 90000 00000`      | Topbar, location section, footer, WhatsApp link   |
| `hello@ironforgegym…`  | Location section, footer                          |
| `Mon – Sat: 5 AM…`     | Topbar and location section hours                 |
| Pricing                | `data-monthly` / `data-quarterly` / `data-annual` |
| Amenities list         | `<section id="amenities">` cards                  |
| Photos                 | All gallery `<a>` and trainer `<img>` URLs        |

The Google Maps "Get Directions" button uses the link
`https://maps.app.goo.gl/SDMSimyBpvaQiEZD7` already.

For a more accurate **embedded map**, replace the iframe `src` in the
`<section id="location">` block with the place's exact embed URL —
Google Maps → Share → "Embed a map" → copy the iframe `src`.
