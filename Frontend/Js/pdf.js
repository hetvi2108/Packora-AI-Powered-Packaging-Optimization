// ═══════════════════════════════════════════════════════════════
//  PACKORA AI — PDF Export
//  Uses jsPDF (loaded from CDN) to generate a clean report.
// ═══════════════════════════════════════════════════════════════

function exportPDF() {
  if (!G.ran || !G.result) {
    alert('Run an optimization first before exporting PDF.');
    return;
  }
  generatePDF(G.result);
}

function generatePDF(result) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W     = 210;   // A4 width mm
  const PAD   = 18;    // page padding
  const GREEN = [0, 168, 114];
  const DARK  = [10, 26, 20];
  const MUTED = [74, 122, 102];
  const WHITE = [255, 255, 255];
  const AMBER = [192, 120, 0];
  const SKY   = [0, 136, 187];

  let y = 0;   // current Y cursor

  // ── helper: add new page and reset cursor
  function newPage() {
    doc.addPage();
    y = 20;
    drawHeaderBar();
  }

  // ── helper: check page overflow
  function checkY(needed = 10) {
    if (y + needed > 270) newPage();
  }

  // ── helper: thin divider line
  function divider(color = [220, 240, 232]) {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(PAD, y, W - PAD, y);
    y += 4;
  }

  // ── helper: section heading
  function sectionHead(title, icon = '') {
    checkY(14);
    doc.setFillColor(...GREEN);
    doc.roundedRect(PAD, y, W - PAD * 2, 8, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${icon}  ${title}`, PAD + 4, y + 5.5);
    y += 12;
    doc.setTextColor(...DARK);
  }

  // ── helper: key-value row
  function row(label, value, valueColor = DARK) {
    checkY(7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(label, PAD + 2, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...valueColor);
    doc.text(String(value), W - PAD - 2, y, { align: 'right' });
    doc.setDrawColor(230, 245, 238);
    doc.setLineWidth(0.2);
    doc.line(PAD + 2, y + 1.5, W - PAD - 2, y + 1.5);
    y += 7;
    doc.setTextColor(...DARK);
  }

  // ── helper: metric box (4 across)
  function metricBoxes(metrics) {
    checkY(22);
    const bw = (W - PAD * 2 - 9) / 4;
    metrics.forEach((m, i) => {
      const x = PAD + i * (bw + 3);
      doc.setFillColor(240, 253, 251);
      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, y, bw, 18, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...m.color);
      doc.text(m.val, x + bw / 2, y + 10, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.text(m.label, x + bw / 2, y + 15.5, { align: 'center' });
    });
    y += 24;
    doc.setTextColor(...DARK);
  }

  // ══════════════════════════════════════════
  //  PAGE 1
  // ══════════════════════════════════════════

  // Cover banner
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 38, 'F');

  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Packora AI', PAD, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Packaging Optimization Report', PAD, 24);

  const now = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
  doc.setFontSize(8);
  doc.setTextColor(200, 240, 225);
  doc.text(now, W - PAD, 24, { align: 'right' });

  y = 46;

  // Product name bar
  const pname = document.getElementById('pname')?.value || result.input?.cat || 'Product';
  doc.setFillColor(240, 253, 251);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.roundedRect(PAD, y, W - PAD * 2, 10, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...GREEN);
  doc.text(`📦  ${pname}`, PAD + 5, y + 6.8);
  y += 16;

  // Top 4 metrics
  metricBoxes([
    { val: result.eco.saving + '%',       label: 'Material Saved',  color: GREEN },
    { val: '₹' + result.cost.unitCost,    label: 'Cost / Unit',     color: AMBER },
    { val: result.eco.co2Saved + '%',     label: 'CO₂ Reduced',     color: SKY   },
    { val: result.strength.safetyScore + '/100', label: 'Safety Score', color: [204, 68, 68] },
  ]);

  // ── DIMENSIONS
  sectionHead('Optimized Dimensions', '📐');
  row('Product (L × W × H)', `${result.input.L} × ${result.input.W} × ${result.input.H} mm`);
  row('Optimized Box',        `${result.dims.optimized.L} × ${result.dims.optimized.W} × ${result.dims.optimized.H} mm`, GREEN);
  row('Padding per side',     `${result.dims.pad} mm`);
  row('Surface Area',         `${result.dims.surfaceArea} m²`);
  row('ISTA Drop Height',     `${result.ista.dropCm} cm`);
  row('Min ECT Required',     `${result.ista.minECT} kN/m`);
  y += 2;

  // ── STRENGTH
  sectionHead('Strength Analysis  (TAPPI T801)', '🔬');
  row('ECT (tested)',          `${result.strength.ect} kN/m`);
  row('BCT (McKee Formula)',   `${result.strength.bct} N`);
  row('Stack Stress',          `${result.strength.stackLoad} N`);
  row('Safety Factor',         `${result.strength.safetyFactor}×`);
  row('Wall Thickness',        `${result.strength.thickness} mm`);
  row('Safety Rating',         result.strength.safetyLabel || '', GREEN);
  y += 2;

  // ── MATERIAL
  sectionHead('Material Recommendation  (Ecoinvent LCA v3.9)', '🌿');
  row('Selected Material',     result.material.friendlyName, GREEN);
  row('LCA Eco Score',         `${result.material.lcaScore} / 100`);
  row('CO₂ Footprint',         `${result.material.co2} kg/m²`);
  row('Energy Use',            `${result.material.energy} MJ/m²`);
  row('Water Use',             `${result.material.water} L/m²`);
  row('Recyclability',         `${result.material.recycle}%`);

  // ══════════════════════════════════════════
  //  PAGE 2
  // ══════════════════════════════════════════
  newPage();

  // ── COST
  sectionHead('Cost & Supplier  (Supply Chain Dataset)', '💰');
  row('Supplier',              result.supplier.name);
  row('Price per m²',          `₹${result.supplier.rsPm2}`);
  row('MOQ',                   `${result.supplier.moq} m²`);
  row('Lead Time',             `${result.supplier.leadDays} days`);
  row('Unit Box Cost',         `₹${result.cost.unitCost}`,  AMBER);
  row('Batch Savings',         `₹${result.cost.batchSave}`, AMBER);
  row('Annual Projection',     `₹${result.cost.annualSave.toLocaleString()}`, AMBER);
  y += 2;

  // ── ECO REPORT
  sectionHead('Sustainability Report  (GCB 2022 + Ecoinvent)', '🌍');

  // Eco score ring (drawn as arc approximation)
  const sc = result.eco.ecoScore;
  const grade = sc >= 85 ? 'A+' : sc >= 70 ? 'A' : sc >= 55 ? 'B+' : sc >= 40 ? 'B' : 'C';
  checkY(30);
  doc.setFillColor(240, 253, 251);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.roundedRect(PAD, y, W - PAD * 2, 24, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...GREEN);
  doc.text(`${sc}/100`, W / 2 - 18, y + 14);
  doc.setFontSize(12);
  doc.text(`Grade: ${grade}`, W / 2 + 12, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(sc >= 70 ? 'Excellent sustainability performance' : sc >= 50 ? 'Good — room to improve' : 'Consider switching material', W / 2, y + 20, { align: 'center' });
  y += 30;

  row('Material Waste Reduction', `${result.eco.saving}%`,       GREEN);
  row('Carbon Footprint Reduction',`${result.eco.co2Saved}%`,    SKY);
  row('Energy Saving',             `${result.eco.energySaving}%`);
  row('CO₂ Saved per Batch',       `${result.eco.batchCO2} kg`);
  row('CO₂ Saved per Year',        `${(result.eco.batchCO2 * 12).toFixed(1)} kg`);
  row('Tree Equivalent',           `🌳 ${result.eco.treeEquivalent} trees`, GREEN);
  y += 4;

  // ── MATERIAL COMPARISON TABLE
  sectionHead('Full Material Comparison', '📊');
  checkY(10);

  // Table header
  const cols  = [PAD, PAD + 56, PAD + 82, PAD + 103, PAD + 124, PAD + 144];
  const heads = ['Material', 'ECT kN/m', '₹/m²', 'LCA Score', 'CO₂ kg/m²', 'Recycle%'];

  doc.setFillColor(230, 248, 240);
  doc.rect(PAD, y, W - PAD * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  heads.forEach((h, i) => doc.text(h, cols[i] + 1, y + 5));
  y += 9;

  // Table rows
  (result.materialTable || []).forEach((m, idx) => {
    checkY(7);
    if (m.isBest) {
      doc.setFillColor(240, 253, 246);
      doc.rect(PAD, y - 1, W - PAD * 2, 7, 'F');
    } else if (idx % 2 === 0) {
      doc.setFillColor(249, 253, 251);
      doc.rect(PAD, y - 1, W - PAD * 2, 7, 'F');
    }
    doc.setFont('helvetica', m.isBest ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(m.isBest ? 0 : 40, m.isBest ? 120 : 80, m.isBest ? 70 : 60);

    const vals = [
      m.friendlyName.length > 28 ? m.friendlyName.slice(0, 26) + '…' : m.friendlyName,
      String(m.ect),
      '₹' + m.rsPm2,
      String(m.lcaScore),
      String(m.co2),
      m.recycle + '%',
    ];
    vals.forEach((v, i) => doc.text(v, cols[i] + 1, y + 4.5));

    if (m.isBest) {
      doc.setTextColor(...GREEN);
      doc.setFontSize(6.5);
      doc.text('✓ Best', W - PAD - 2, y + 4.5, { align: 'right' });
    }
    y += 7;
  });
  y += 4;

  // ── INPUT SUMMARY
  checkY(40);
  sectionHead('Input Summary', '⚙');
  const inp = result.input;
  row('Category',          inp.cat.charAt(0).toUpperCase() + inp.cat.slice(1));
  row('Dimensions',        `${inp.L} × ${inp.W} × ${inp.H} mm`);
  row('Weight',            `${inp.wt} g`);
  row('Fragility',         `${inp.frag} / 10`);
  row('Qty / Shipment',    `${inp.qty} units`);
  row('Stack Layers',      String(inp.stack));
  row('ISTA Level',        inp.ista);
  row('Transport',         inp.dist);
  row('Sustainability',    inp.sus === 'max' ? 'Maximize eco' : inp.sus === 'cost' ? 'Minimize cost' : 'Balanced');

  // ── Footer on last page
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(245, 255, 254);
    doc.rect(0, 285, W, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text('Packora AI — Packaging Optimization Report', PAD, 291);
    doc.text(`Page ${p} of ${pageCount}`, W - PAD, 291, { align: 'right' });
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.4);
    doc.line(PAD, 285.5, W - PAD, 285.5);
  }

  // Save
  const fname = `Packora_${(pname || 'Report').replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(fname);
}

function drawHeaderBar() {
  // small green bar at top of each continuation page
  const GREEN = [0, 168, 114];
  const doc   = arguments[0]; // not needed — jsPDF is global
}
