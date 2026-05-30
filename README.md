# Satija's Bakers & Cafe — Premium Bakery Website

A cinematic, modern website for **Satija's Bakers & Cafe**, a premium
bakery and cafe in Sangrur, Punjab. Built with plain HTML / CSS / JS —
no frameworks, no build step. Deployed via GitHub Pages.

> Open `index.html` in any modern browser to preview.

## Live business info baked in

- **Name:** Satija's Bakers & Cafe
- **Phone:** +91 99887 99191
- **Address:** Sector-17, near Kidzee School, Guru Nanak Colony, Sangrur, Punjab 148001
- **Hours:** Every day · 8:00 AM – 9:00 PM
- **Instagram:** [@satija_bakers_and_cafe](https://www.instagram.com/satija_bakers_and_cafe)
- **Rating:** 4.8 ★ (150+ reviews)

## Highlights

- Cinematic loading screen
- Glassmorphism navbar with dark / light mode toggle
- **3D rotating cake** in the hero (pure CSS, with orbital floating items)
- Live offers ticker
- About section with floating cards
- Signature Specials trio
- **Full interactive menu** with category tabs, search, 3D-tilt hover,
  and one-click add-to-cart
- Cakes & Bento showcase
- Combo deals dark cards
- Reviews testimonial cards
- Instagram-style gallery (8 tiles)
- Embedded Google Maps location
- Reservation form that sends to WhatsApp
- Footer with social links
- **Floating WhatsApp button** with pulse ring
- **Floating cart** drawer — items persist in `localStorage`,
  one-click "Order via WhatsApp" with full itemised message
- **AI-style FAQ chatbot** widget (timings, address, recommendations…)
- Scroll-triggered reveal animations
- Fully responsive (mobile / tablet / desktop)
- SEO meta tags + JSON-LD structured data

## File structure

```
website-/
├── .github/workflows/pages.yml   ← auto-deploy to GitHub Pages
├── index.html
├── styles.css
├── script.js                     ← menu data + all interactions
├── package.json
└── README.md
```

## Run locally

```bash
# Any static server works. Quickest:
npx --yes http-server -p 8080 -c-1 .
```

Then open http://localhost:8080.

## Deployment — GitHub Pages

A workflow at `.github/workflows/pages.yml` auto-deploys the default
branch on every push.

**One-time setup on GitHub:**

1. Repo → **Settings** → **Pages**
2. **Build and deployment → Source** → choose **GitHub Actions**
3. (Optional) Add a custom domain on the same page

After the next push to the default branch, the site goes live at:

```
https://gernalshiftfirm-a11y.github.io/website-/
```

## Customising

### Edit the menu
All menu data lives in `script.js` near the top in the `MENU` array.
Each item:

```js
M('Truffle Pastry', 'Pastries', 65, '🍫', 'Premium dark truffle ganache pastry.')
//  name              category    price emoji description
```

Adding, removing or re-pricing items just means editing this array —
the rest of the site (tabs, search, cart, WhatsApp order message)
updates automatically.

### Change shop info
At the top of `script.js`:

```js
const SHOP = {
  name: "Satija's Bakers & Cafe",
  phone: '+919988799191',
  whatsapp: '919988799191',
  address: 'Sector-17, near Kidzee School, Guru Nanak Colony, Sangrur, Punjab 148001',
  timings: '8:00 AM – 9:00 PM',
  instagram: 'satija_bakers_and_cafe',
  rating: 4.8,
  reviewsCount: 150,
};
```

### Theme colours
Top of `styles.css` — `:root` for light mode, `[data-theme="dark"]`
for dark.

## Tech notes

- No build step — everything works by just opening `index.html`.
- `localStorage` keys: `satija_cart`, `satija_theme`.
- Fonts loaded from Google Fonts (Playfair Display + Inter).
- Icons from Font Awesome 6 CDN.
- The 3D cake is built with stacked CSS ellipses + `transform: rotateX/rotateZ`
  for a luxe rotating-platter feel.

## Known limitations

- The Google Maps embed uses a public unauthenticated URL; for a custom
  pin / styled map, replace the `iframe src` with a Google Maps embed
  API URL.
- The chatbot is a keyword-match FAQ assistant, not an LLM. Replace
  `findAnswer` in `script.js` if you want to wire it to a real model.
- The Instagram gallery uses static tiles (with hover effects). Embed
  real reels by replacing each `<a class="gallery-item">` with an
  Instagram embed once you have post URLs.
