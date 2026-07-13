// ═══════════════════════════════════════════════════════════════
//  PACKORA AI — Dataset Entry Point
//  Hardcoded fallback values + Kaggle CSV override on startup.
// ═══════════════════════════════════════════════════════════════

const { loadDatasets } = require('./loader');

// ── Hardcoded fallback (used when CSVs are missing)
const FALLBACK = {

  ista: [
    { level: '1A', dropCm: 30,  vibHz: 3,  minECT: 18, weightClass: '0–2kg' },
    { level: '1A', dropCm: 30,  vibHz: 3,  minECT: 20, weightClass: '2–5kg' },
    { level: '1A', dropCm: 38,  vibHz: 3,  minECT: 22, weightClass: '5–10kg' },
    { level: '2A', dropCm: 61,  vibHz: 7,  minECT: 26, weightClass: '0–2kg' },
    { level: '2A', dropCm: 61,  vibHz: 7,  minECT: 30, weightClass: '2–5kg' },
    { level: '2A', dropCm: 76,  vibHz: 7,  minECT: 34, weightClass: '5–10kg' },
    { level: '2A', dropCm: 91,  vibHz: 7,  minECT: 40, weightClass: '10–20kg' },
    { level: '3A', dropCm: 91,  vibHz: 10, minECT: 44, weightClass: '0–5kg' },
    { level: '3A', dropCm: 107, vibHz: 10, minECT: 50, weightClass: '5–15kg' },
    { level: '3A', dropCm: 122, vibHz: 12, minECT: 58, weightClass: '15–30kg' },
  ],

  tappi: [
    { material: 'Recycled Corrugated', flute: 'B',   ect: 32, bct: 2800, thick: 3.5 },
    { material: 'Recycled Corrugated', flute: 'C',   ect: 36, bct: 3200, thick: 4.0 },
    { material: 'Virgin Corrugated',   flute: 'C',   ect: 38, bct: 3600, thick: 3.5 },
    { material: 'Single-wall E-flute', flute: 'E',   ect: 25, bct: 2100, thick: 1.6 },
    { material: 'Double-wall BC',      flute: 'BC',  ect: 54, bct: 5800, thick: 7.0 },
    { material: 'Kraft Paper 200gsm',  flute: '—',   ect: 22, bct: 1800, thick: 0.3 },
    { material: 'SBS Board 350gsm',    flute: '—',   ect: 18, bct: 1500, thick: 0.4 },
    { material: 'Honeycomb Panel',     flute: 'HC',  ect: 65, bct: 7200, thick: 15  },
    { material: 'Micro-flute F',       flute: 'F',   ect: 20, bct: 1900, thick: 1.2 },
    { material: 'Triple-wall AAA',     flute: 'AAA', ect: 82, bct: 9400, thick: 12  },
  ],

  lca: [
    { mat: 'Recycled Corrugated B-flute', co2: 1.12, energy: 14.2, water: 8.5,  recycle: 95, lcaScore: 92 },
    { mat: 'Virgin Corrugated C-flute',   co2: 2.45, energy: 28.6, water: 18.2, recycle: 85, lcaScore: 68 },
    { mat: 'Single-wall E-flute',         co2: 1.38, energy: 16.8, water: 10.1, recycle: 88, lcaScore: 78 },
    { mat: 'Kraft Paper (natural)',        co2: 0.98, energy: 11.4, water: 7.2,  recycle: 92, lcaScore: 88 },
    { mat: 'SBS Board (bleached)',         co2: 2.85, energy: 32.1, water: 22.4, recycle: 70, lcaScore: 55 },
    { mat: 'Expanded Polystyrene EPS',     co2: 3.65, energy: 88.2, water: 0.4,  recycle: 20, lcaScore: 15 },
    { mat: 'Moulded Pulp (recycled)',      co2: 0.85, energy: 9.8,  water: 12.0, recycle: 98, lcaScore: 96 },
    { mat: 'Double-wall BC-flute',         co2: 1.95, energy: 22.4, water: 14.8, recycle: 90, lcaScore: 74 },
    { mat: 'Honeycomb Paperboard',         co2: 1.05, energy: 13.1, water: 7.8,  recycle: 94, lcaScore: 91 },
    { mat: 'Biodegradable PLA Film',       co2: 1.80, energy: 42.3, water: 5.5,  recycle: 60, lcaScore: 62 },
  ],

  prices: [
    { mat: 'Recycled Corrugated B-flute', rsPm2: 3.20,  moq: 500,  lead: 3,  supplier: 'Prakash Packaging, Surat' },
    { mat: 'Virgin Corrugated C-flute',   rsPm2: 4.80,  moq: 500,  lead: 3,  supplier: 'Rathi Cartons, Ahmedabad' },
    { mat: 'Single-wall E-flute',         rsPm2: 2.40,  moq: 300,  lead: 2,  supplier: 'Shiv Shakti Cartons, Surat' },
    { mat: 'Kraft Paper (natural)',        rsPm2: 1.90,  moq: 200,  lead: 2,  supplier: 'Navkar Paper, Pune' },
    { mat: 'SBS Board (bleached)',         rsPm2: 6.50,  moq: 250,  lead: 5,  supplier: 'ITC Packaging, Mumbai' },
    { mat: 'Expanded Polystyrene EPS',     rsPm2: 2.80,  moq: 1000, lead: 7,  supplier: 'Supreme Industries, Vadodara' },
    { mat: 'Moulded Pulp (recycled)',      rsPm2: 4.10,  moq: 1000, lead: 10, supplier: 'EcoPackage India, Chennai' },
    { mat: 'Double-wall BC-flute',         rsPm2: 5.60,  moq: 300,  lead: 4,  supplier: 'Parksons Packaging, Mumbai' },
    { mat: 'Honeycomb Paperboard',         rsPm2: 7.20,  moq: 200,  lead: 6,  supplier: 'Coromandel Starch, Hyderabad' },
    { mat: 'Biodegradable PLA Film',       rsPm2: 12.40, moq: 500,  lead: 14, supplier: 'Green Earth Packaging, Bengaluru' },
  ],

  fba: [
    { cat: 'electronics', pL: 80,  pW: 50,  pH: 30,  bL: 110, bW: 80,  bH: 60,  pad: 15 },
    { cat: 'electronics', pL: 120, pW: 80,  pH: 60,  bL: 156, bW: 116, bH: 96,  pad: 18 },
    { cat: 'electronics', pL: 200, pW: 150, pH: 80,  bL: 244, bW: 194, bH: 124, pad: 22 },
    { cat: 'electronics', pL: 40,  pW: 30,  pH: 20,  bL: 66,  bW: 56,  bH: 46,  pad: 13 },
    { cat: 'food',        pL: 100, pW: 60,  pH: 60,  bL: 124, bW: 84,  bH: 84,  pad: 12 },
    { cat: 'food',        pL: 180, pW: 80,  pH: 100, bL: 206, bW: 106, bH: 126, pad: 13 },
    { cat: 'cosmetics',   pL: 60,  pW: 40,  pH: 80,  bL: 90,  bW: 70,  bH: 110, pad: 15 },
    { cat: 'cosmetics',   pL: 120, pW: 90,  pH: 50,  bL: 158, bW: 128, bH: 88,  pad: 19 },
    { cat: 'medical',     pL: 150, pW: 100, pH: 80,  bL: 196, bW: 146, bH: 126, pad: 23 },
    { cat: 'medical',     pL: 50,  pW: 40,  pH: 30,  bL: 80,  bW: 70,  bH: 60,  pad: 15 },
    { cat: 'industrial',  pL: 300, pW: 200, pH: 150, bL: 330, bW: 230, bH: 180, pad: 15 },
    { cat: 'industrial',  pL: 80,  pW: 80,  pH: 80,  bL: 104, bW: 104, bH: 104, pad: 12 },
    { cat: 'ecommerce',   pL: 250, pW: 180, pH: 120, bL: 290, bW: 220, bH: 160, pad: 20 },
    { cat: 'ecommerce',   pL: 100, pW: 80,  pH: 60,  bL: 134, bW: 114, bH: 94,  pad: 17 },
    { cat: 'electronics', pL: 160, pW: 90,  pH: 40,  bL: 200, bW: 130, bH: 80,  pad: 20 },
    { cat: 'food',        pL: 70,  pW: 70,  pH: 100, bL: 94,  bW: 94,  bH: 124, pad: 12 },
    { cat: 'cosmetics',   pL: 200, pW: 100, pH: 30,  bL: 234, bW: 134, bH: 64,  pad: 17 },
    { cat: 'medical',     pL: 300, pW: 200, pH: 100, bL: 350, bW: 250, bH: 150, pad: 25 },
    { cat: 'ecommerce',   pL: 400, pW: 300, pH: 200, bL: 444, bW: 344, bH: 244, pad: 22 },
    { cat: 'industrial',  pL: 500, pW: 400, pH: 300, bL: 536, bW: 436, bH: 336, pad: 18 },
  ],

  ghg: [
    { source: 'Corrugated production', activity: 'Manufacturing', factor: 1.12,  unit: 'kg CO₂/m²',       std: 'GHG Protocol Scope 3' },
    { source: 'Virgin pulp production',activity: 'Manufacturing', factor: 2.45,  unit: 'kg CO₂/m²',       std: 'Ecoinvent v3.9' },
    { source: 'EPS foam production',   activity: 'Manufacturing', factor: 3.65,  unit: 'kg CO₂/m²',       std: 'GHG Protocol Scope 3' },
    { source: 'Road freight (diesel)', activity: 'Transport',     factor: 0.096, unit: 'kg CO₂/tkm',      std: 'IPCC AR6' },
    { source: 'Air freight',           activity: 'Transport',     factor: 0.602, unit: 'kg CO₂/tkm',      std: 'IPCC AR6' },
    { source: 'Sea freight',           activity: 'Transport',     factor: 0.016, unit: 'kg CO₂/tkm',      std: 'IPCC AR6' },
    { source: 'Recycling corrugated',  activity: 'End-of-life',   factor: -0.42, unit: 'kg CO₂/m²',       std: 'ISO 14044' },
    { source: 'Landfill (paper)',      activity: 'End-of-life',   factor: 0.28,  unit: 'kg CO₂/m²',       std: 'IPCC AR6' },
    { source: 'Incineration (paper)',  activity: 'End-of-life',   factor: 1.04,  unit: 'kg CO₂/m²',       std: 'GHG Protocol' },
    { source: 'Tree absorption',       activity: 'Offset',        factor: 0.021, unit: 'kg CO₂/tree/day', std: 'IPCC AR6' },
  ],
};

// Load and export the merged dataset (Kaggle + fallback)
const DS = loadDatasets(FALLBACK);

module.exports = DS;
