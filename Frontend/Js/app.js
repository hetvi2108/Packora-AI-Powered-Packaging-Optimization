// ═══════════════════════════════════════════════════════════════
//  PACKORA AI — Main App Controller
// ═══════════════════════════════════════════════════════════════

// Global state — stores the last successful optimization result
let G = { ran: false, result: null };

// ──────────────────────────────────────────────────────────────
//  NAVIGATION
// ──────────────────────────────────────────────────────────────
function nav(id, el) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.tb').forEach(b => { b.classList.remove('on'); b.removeAttribute('aria-current'); });
  document.getElementById('pg-' + id).classList.add('on');
  if (el) { el.classList.add('on'); el.setAttribute('aria-current', 'page'); }

  // Trigger renders when switching to visual pages
  if (id === 'dieline' && G.ran) {
    const d = G.result.dims.optimized;
    drawDieline(d.L, d.W, d.H);
  }
  if (id === 'viz' && G.ran) {
    const d = G.result.dims.optimized;
    init3D(d.L, d.W, d.H);
  }
  if (id === 'report' && G.ran) {
    drawReport(G.result);
  }
  if (id === 'history') {
    loadHistory();
  }
}

// ──────────────────────────────────────────────────────────────
//  CATEGORY SELECTION
// ──────────────────────────────────────────────────────────────
function selCat(el) {
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.remove('sel');
    b.removeAttribute('aria-pressed');
  });
  el.classList.add('sel');
  el.setAttribute('aria-pressed', 'true');
}

// Keyboard support for category buttons
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selCat(btn); }
  });
});

// ──────────────────────────────────────────────────────────────
//  OPTIMIZATION — calls backend API
// ──────────────────────────────────────────────────────────────
async function runOptimize() {
  const btn      = document.getElementById('runBtn');
  const errBox   = document.getElementById('apiError');
  const loadEl   = document.getElementById('ldst');
  const resultEl = document.getElementById('rstst');

  // Show loading state
  btn.classList.add('ld');
  btn.disabled = true;
  btn.textContent = '⏳ Processing...';
  loadEl.style.display = 'block';
  resultEl.style.opacity = '0.3';
  errBox.style.display = 'none';

  try {
    const payload = {
      L:     Number(document.getElementById('pL').value)     || 120,
      W:     Number(document.getElementById('pW').value)     || 80,
      H:     Number(document.getElementById('pH').value)     || 60,
      wt:    Number(document.getElementById('pWt').value)    || 250,
      frag:  Number(document.getElementById('pFrag').value)  || 5,
      qty:   Number(document.getElementById('pQty').value)   || 100,
      stack: Number(document.getElementById('pStack').value) || 5,
      sus:   document.getElementById('pSus').value,
      cat:   document.querySelector('.cat-btn.sel')?.dataset?.cat || 'electronics',
      ista:  document.getElementById('pISTA').value,
      dist:  document.getElementById('pDist').value,
    };

    const result = await apiOptimize(payload);

    // Store result globally
    G = { ran: true, result };

    // Render results
    renderResults(result);

    // Navigate to result tab
    nav('result', document.querySelectorAll('.tb')[2]);

  } catch (err) {
    errBox.textContent = '⚠ ' + err.message;
    errBox.style.display = 'block';
    console.error('Optimization failed:', err);
  } finally {
    loadEl.style.display = 'none';
    resultEl.style.opacity = '1';
    btn.classList.remove('ld');
    btn.disabled = false;
    btn.textContent = G.ran ? '✓ Re-Optimize' : '🌿 Run Optimization';
  }
}

// ──────────────────────────────────────────────────────────────
//  RENDER RESULTS — populates all result-page DOM elements
// ──────────────────────────────────────────────────────────────
function renderResults(result) {
  const { dims, strength, material, supplier, cost, eco, ista, materialTable } = result;

  // ── Top metrics
  document.getElementById('mSav').textContent  = eco.saving + '%';
  document.getElementById('mCost').textContent = '₹' + cost.unitCost;
  document.getElementById('mCO2').textContent  = eco.co2Saved + '%';
  document.getElementById('mStr').textContent  = strength.safetyScore + '/100';

  // ── Dimensions
  document.getElementById('dimRes').innerHTML = `
    <div class="rr"><span class="rk">Product dims</span><span class="rv">${dims.product.L}×${dims.product.W}×${dims.product.H} mm</span></div>
    <div class="rr"><span class="rk">FBA-matched padding</span><span class="rv">${dims.pad} mm/side</span></div>
    <div class="rr"><span class="rk">Optimized box</span><span class="rv" style="color:var(--leaf3)">${dims.optimized.L}×${dims.optimized.W}×${dims.optimized.H} mm</span></div>
    <div class="rr"><span class="rk">ISTA drop height</span><span class="rv">${ista.dropCm} cm</span></div>
    <div class="rr"><span class="rk">Min ECT required</span><span class="rv">${ista.minECT} kN/m</span></div>
    <div class="rr"><span class="rk">Surface area</span><span class="rv">${dims.surfaceArea} m²</span></div>
  `;

  // ── Strength
  const sClass = strength.safetyScore > 70 ? 'bg' : strength.safetyScore > 40 ? 'ba' : 'br2';
  document.getElementById('strRes').innerHTML = `
    <div class="rr"><span class="rk">ECT (tested)</span><span class="rv">${strength.ect} kN/m</span></div>
    <div class="rr"><span class="rk">BCT (McKee formula)</span><span class="rv">${strength.bct} N</span></div>
    <div class="rr"><span class="rk">Stack stress</span><span class="rv">${strength.stackLoad} N</span></div>
    <div class="rr"><span class="rk">Safety factor</span><span class="rv">${strength.safetyFactor}×</span></div>
    <div class="rr"><span class="rk">Wall thickness</span><span class="rv">${strength.thickness} mm</span></div>
    <div style="margin-top:8px">
      <div style="display:flex;justify-content:space-between;font-size:.72rem;color:var(--muted);margin-bottom:3px">
        <span>${strength.safetyLabel || 'Safety Score'}</span><span>${strength.safetyScore}/100</span>
      </div>
      <div class="bw"><div class="bf ${sClass}" style="width:${strength.safetyScore}%"></div></div>
    </div>
  `;

  // ── Material
  const ecoTag = material.lcaScore >= 85 ? '🟢 Excellent eco rating' : material.lcaScore >= 70 ? '🟡 Good eco rating' : '🔴 Low eco rating';
  document.getElementById('matRes').innerHTML = `
    <div style="background:rgba(0,201,138,.06);border:1px solid rgba(0,201,138,.2);border-radius:10px;padding:10px 14px;margin-bottom:10px">
      <div style="font-size:.95rem;font-weight:700;color:var(--leaf3)">${material.friendlyName}</div>
      <div style="font-size:.72rem;color:var(--muted);margin-top:2px">${ecoTag}</div>
    </div>
    <div class="rr"><span class="rk">Eco Score</span><span class="rv">${material.lcaScore}/100</span></div>
    <div class="rr"><span class="rk">CO₂ footprint</span><span class="rv">${material.co2} kg/m²</span></div>
    <div class="rr"><span class="rk">Energy use</span><span class="rv">${material.energy} MJ/m²</span></div>
    <div class="rr"><span class="rk">Water use</span><span class="rv">${material.water} L/m²</span></div>
    <div class="rr"><span class="rk">Recyclability</span><span class="rv">${material.recycle}%</span></div>
  `;

  // ── Cost & savings
  document.getElementById('savRes').innerHTML = `
    <div class="rr"><span class="rk">Price/m²</span><span class="rv">₹${supplier.rsPm2}</span></div>
    <div class="rr"><span class="rk">Unit box cost</span><span class="rv">₹${cost.unitCost}</span></div>
    <div class="rr"><span class="rk">MOQ</span><span class="rv">${supplier.moq} m²</span></div>
    <div class="rr"><span class="rk">Lead time</span><span class="rv">${supplier.leadDays} days</span></div>
    <div class="rr"><span class="rk">Batch savings (${result.input.qty}u)</span><span class="rv" style="color:var(--amber)">₹${cost.batchSave}</span></div>
    <div class="rr"><span class="rk">Annual projection</span><span class="rv" style="color:var(--amber)">₹${cost.annualSave.toLocaleString()}</span></div>
    <div class="rr"><span class="rk">Avg freight cost</span><span class="rv">₹${cost.freightAvg || '—'}</span></div>
  `;

  // ── Material comparison table
  document.getElementById('matTbl').innerHTML = materialTable.map(m => {
    const badge = m.isBest
      ? '<span class="badge bg-g">Best Pick</span>'
      : m.lcaScore < 30
        ? '<span class="badge bg-r">Avoid</span>'
        : '<span class="badge bg-a">Alt</span>';
    return `<tr style="${m.isBest ? 'background:rgba(34,197,94,.04)' : ''}">
      <td style="font-weight:${m.isBest ? '600' : '400'}">${m.friendlyName}</td>
      <td>${m.ect}</td>
      <td>₹${m.rsPm2}</td>
      <td>
        <div class="bw" style="width:60px;display:inline-block">
          <div class="bf bg" style="width:${m.lcaScore}%"></div>
        </div> ${m.lcaScore}
      </td>
      <td>${m.co2}</td>
      <td>${m.recycle}%</td>
      <td>${badge}</td>
    </tr>`;
  }).join('');
}

// ──────────────────────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────────────────────
(async function init() {
  // Verify backend is up (non-blocking)
  try {
    await apiHealth();
    console.log('✅ Packora AI backend connected');
  } catch {
    console.warn('⚠ Backend not reachable — start the server with: cd backend && npm start');
  }
})();
