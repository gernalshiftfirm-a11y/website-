# Spice Garden — Restaurant POS

A clean, single-page **Point of Sale system for a restaurant**. Built
with plain HTML / CSS / JavaScript — no build step, no backend. Data
is persisted in the browser's `localStorage`.

Open `index.html` in any modern browser to start.

## Features

### Customer view
- **Menu** of 24 dishes across 6 categories (Starters, Main Course,
  Breads, Rice, Beverages, Desserts) with veg / non-veg indicators
- Search bar and category filter chips
- Click a dish to add it to the cart, with `+ / -` quantity controls
- Live **subtotal, GST (5%) and grand total**
- **Place Order** with a table number / customer name

### Admin view
- **Stat cards**: today's earnings, this week, total earnings, pending
  orders
- **Earnings bar chart** for the last 7 days (today highlighted)
- **Live orders** grid with a status workflow:
  `pending → preparing → ready → billed`
- **One-click bill generation** that opens a printable bill modal
  (CGST / SGST split, restaurant header, GSTIN, totals, footer)
- Filter orders by **Active / Billed / All**
- **Export sales** as JSON (one-click download)
- **Reset all data** (with confirmation)

### Other
- Responsive (mobile / tablet / desktop)
- Toast notifications for actions
- Print-friendly bill (use browser **Print → Save as PDF**)
- Live date/time clock in the top bar

## File structure

```
website-/
├── .github/workflows/
│   └── pages.yml      ← GitHub Pages auto-deploy
├── index.html         ← single-page POS, customer + admin views
├── styles.css         ← UI styles + print stylesheet for bills
├── script.js          ← menu data, cart, orders, bills, earnings
├── package.json
└── README.md
```

## Deployment — GitHub Pages

Every push to the default branch triggers
`.github/workflows/pages.yml` which deploys the repo as a static site
to GitHub Pages.

**One-time setup (already / soon to be done):**

1. Go to the repo on GitHub → **Settings** → **Pages**
2. Under **Build and deployment → Source**, choose **GitHub Actions**
3. (Optional) Add a custom domain under the same page

After the first push to the default branch, the site will be live at:

```
https://<owner>.github.io/<repo>/
```

## Customise

### Menu
Edit the `MENU` array at the top of `script.js`. Each entry:

```js
{ id: 's1', name: 'Paneer Tikka', category: 'Starters',
  price: 220, veg: true, emoji: '🧀',
  desc: 'Char-grilled cottage cheese cubes in tandoori spices.' }
```

### Tax rate / restaurant info
Also in `script.js`:

```js
const TAX_RATE = 0.05; // 5% GST (split as CGST 2.5% + SGST 2.5% on the bill)

const RESTAURANT = {
  name:    'Spice Garden',
  address: '12 MG Road, Sangrur, Punjab',
  phone:   '+91 98765 43210',
  gstin:   '03ABCDE1234F1Z5',
};
```

## Order workflow

1. Customer adds items, enters table, clicks **Place Order** —
   order saved with status `pending`.
2. Admin clicks **Start Preparing** → status `preparing`.
3. Admin clicks **Mark Ready** → status `ready`.
4. Admin clicks **Generate Bill** — status becomes `billed`,
   the printable bill opens, and the order's amount is added to
   today's earnings and the 7-day chart.

## Run locally

Just open `index.html` in any browser — no install required.

## Limitations

- All data lives in the browser's `localStorage`. It is not synced
  across devices or browsers. For multi-device use, swap the
  `loadOrders` / `saveOrders` helpers in `script.js` for API calls
  to your backend.
- The Admin view has no authentication. To add a basic passcode,
  gate the click on the *Admin* tab in `script.js`.
