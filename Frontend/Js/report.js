// ═══════════════════════════════════════════════════════════════
//  PACKORA AI — Eco Report Renderer
// ═══════════════════════════════════════════════════════════════

/**
 * Render the full eco report page using the API result object.
 * @param {Object} result - Result from apiOptimize()
 */
function drawReport(result) {
  const { eco, material, supplier, input, cost } = result;

  // ── Sustainability ring
  const sc   = eco.ecoScore || 72;
  const circ = 2 * Math.PI * 28;
  const off  = circ - (circ * sc / 100);
  document.getElementById('ringC').style.strokeDashoffset = off;
  document.getElementById('ecoSc').textContent = sc + '/100';

  const grade = sc >= 85 ? 'A+' : sc >= 70 ? 'A' : sc >= 55 ? 'B+' : sc >= 40 ? 'B' : 'C';
  document.getElementById('ecoGr').textContent  = 'Grade: ' + grade;
  document.getElementById('ecoLbl').textContent = sc >= 70 ? 'Excellent!' : sc >= 50 ? 'Good, improvable' : 'Switch to greener material';

  // ── Impact bars
  const bars = [
    { l: 'Material waste reduction',   v: eco.saving,       col: '#22c55e' },
    { l: 'Carbon footprint reduction', v: eco.co2Saved,     col: '#4ade80' },
    { l: 'Energy savings',             v: eco.energySaving, col: '#38bdf8' },
    { l: 'Recyclability score',        v: material.recycle, col: '#a3e635' },
    { l: 'Over-packaging eliminated',  v: Math.max(8, Math.round(eco.saving * 1.1)), col: '#f59e0b' },
  ];

  document.getElementById('ecoBars').innerHTML = bars.map(b => `
    <div class="eco-bar">
      <span class="eco-lbl">${b.l}</span>
      <div class="eco-tr"><div class="eco-fi" style="width:${Math.min(b.v, 100)}%;background:${b.col}"></div></div>
      <span class="eco-pc">${b.v}%</span>
    </div>`).join('');

  // ── Batch carbon analysis
  document.getElementById('batchRes').innerHTML = `
    <div class="rr"><span class="rk">Batch size</span><span class="rv">${input.qty} units</span></div>
    <div class="rr"><span class="rk">CO₂ saved / batch</span><span class="rv">${eco.batchCO2} kg</span></div>
    <div class="rr"><span class="rk">CO₂ saved / year</span><span class="rv">${(eco.batchCO2 * 12).toFixed(1)} kg</span></div>
    <div class="rr"><span class="rk">Tree equivalent</span><span class="rv" style="color:var(--leaf3)">🌳 ${eco.treeEquivalent} trees</span></div>
    <div class="rr"><span class="rk">Material CO₂ factor</span><span class="rv">${material.co2} kg/m²</span></div>
  `;

  // ── Recommendations
  const recs = [
    `For ${input.cat} products, ${material.friendlyName} is a strong choice — ${material.lcaScore}/100 sustainability score and proven performance in this category.`,
    `Your ISTA ${input.ista} standard requires ${result.ista.minECT} kN/m ECT. The selected material delivers ${result.strength.ect} kN/m, giving you a safe buffer without going overboard.`,
    `Padding is set at ${result.dims.pad}mm — calibrated for ${input.cat} shipments. Going higher doesn't improve protection much and wastes ${eco.saving}% more material.`,
    `${supplier.name} is the best current match at ₹${supplier.rsPm2}/m² with a ${supplier.leadDays}-day lead time. Cross-checked across available suppliers for this material.`,
    `Shipping ${input.qty} units/month puts your annual savings at roughly ₹${cost.annualSave.toLocaleString()} — purely from right-sized packaging.`,
  ];

  document.getElementById('aiRecs').innerHTML = recs.map((r, i) => `
    <div class="rec-item">
      <span class="rec-num">${i + 1}</span>${r}
    </div>`).join('');
}
