# Packora AI — Smart Packaging Optimizer

AI-powered packaging optimization that finds the right box dimensions, material, and cost for your product — with full carbon footprint analysis.

---

## Features

- Smart box dimensions from 32,945 real Olist products (FBA-matched padding)
- Material selection using Ecoinvent LCA v3.9 database
- BCT strength via McKee Formula (TAPPI T811 standard)
- ISTA drop test compliance (1A / 2A / 3A levels)
- Carbon footprint using GCB 2022 + GHG Protocol data
- Supplier matching with real India pricing (₹/m²), MOQ, and lead times
- 2D dieline export (PNG)
- Interactive 3D box visualization
- Optimization history (save / restore / clear)
- PDF report export

---

## Project Structure

```
backend/
  server.js           → Express API server (port 3000)
  engine/
    optimizer.js      → Core optimization logic
    lookupTables.js   → Dataset-backed lookup functions
  routes/
    optimize.js       → POST /api/optimize
    datasets.js       → GET  /api/datasets
    history.js        → GET/POST/DELETE /api/history
  data/               → CSV datasets + loader

frontend/
  index.html          → Single-page app
  css/                → Styles
  js/
    app.js            → Main controller + result renderer
    api.js            → Backend API client
    dieline.js        → 2D dieline canvas
    viewer3d.js       → 3D box canvas
    report.js         → Eco report + sustainability score
    history.js        → Saved optimizations UI
    pdf.js            → PDF export
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3 (for frontend dev server)

### Install dependencies

```bash
cd backend
npm install
```

### Run

Start the backend:

```bash
cd backend
node server.js
```

Serve the frontend (any static server works):

```bash
cd frontend
python -m http.server 5500
```

Open `http://localhost:5500` in your browser.

> Alternatively, the backend itself also serves the frontend at `http://localhost:3000` since it has `express.static` pointing to `/frontend`.

---

## API Reference

### `POST /api/optimize`

Run packaging optimization.

**Request body:**

| Field   | Type   | Description                                      |
|---------|--------|--------------------------------------------------|
| `L`     | number | Product length (mm)                              |
| `W`     | number | Product width (mm)                               |
| `H`     | number | Product height (mm)                              |
| `wt`    | number | Product weight (grams)                           |
| `frag`  | number | Fragility 1–10                                   |
| `qty`   | number | Quantity per shipment                            |
| `stack` | number | Stack layers                                     |
| `sus`   | string | `"max"` / `"balanced"` / `"cost"`               |
| `cat`   | string | Category: `electronics`, `food`, `cosmetics`, `industrial`, `medical`, `ecommerce` |
| `ista`  | string | Protection level: `"1A"` / `"2A"` / `"3A"`     |
| `dist`  | string | Transport distance                               |

**Response:** optimized dimensions, material, strength analysis, cost, eco scores, supplier info, and full material comparison table.

### `GET /api/health`

Returns server status and uptime.

### `GET /api/datasets`

Returns loaded dataset summaries (FBA, ISTA, LCA, GHG, suppliers).

### `GET /api/history` / `POST /api/history` / `DELETE /api/history/:id`

Manage saved optimization results.

---

## Data Sources

| Dataset | Use |
|---------|-----|
| Olist (32,945 products) | Box dimensions + category padding |
| Supply Chain CSV | Supplier prices, MOQ, lead times |
| ISTA / Train.csv (11,000 shipments) | Drop test levels, weight class rules |
| GCB 2022 + OWID | CO₂ factors, batch carbon analysis |
| Ecoinvent LCA v3.9 | Material eco scores, recyclability |
| TAPPI T801 | ECT, BCT, wall thickness |

---

## Rate Limiting

100 requests per 15 minutes per IP on all `/api` routes.
