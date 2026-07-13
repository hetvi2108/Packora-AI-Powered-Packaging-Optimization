// ═══════════════════════════════════════════════════════════════
//  PACKORA AI — History Manager
// ═══════════════════════════════════════════════════════════════

// ── Save current result to history
async function saveToHistory() {
  const btn    = document.getElementById('saveBtn');
  const msgEl  = document.getElementById('saveMsg');

  if (!G.ran || !G.result) {
    msgEl.textContent = '⚠ Run an optimization first';
    msgEl.style.color = 'var(--red)';
    setTimeout(() => { msgEl.textContent = ''; }, 2500);
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Saving...';

  try {
    const productName = document.getElementById('pname')?.value || G.result.input.cat;
    await apiSaveHistory(G.result, productName);
    msgEl.textContent = '✅ Saved to history';
    msgEl.style.color = 'var(--leaf2)';
    btn.textContent = '✓ Saved';
  } catch (err) {
    msgEl.textContent = '⚠ ' + err.message;
    msgEl.style.color = 'var(--red)';
    btn.textContent = '💾 Save Result';
    btn.disabled = false;
  }
  setTimeout(() => {
    msgEl.textContent = '';
    btn.textContent   = '💾 Save Result';
    btn.disabled      = false;
  }, 3000);
}

// ── Load and render history list
async function loadHistory() {
  const container = document.getElementById('historyList');
  container.innerHTML = '<div style="text-align:center;padding:30px"><div class="spin-ring"></div></div>';

  try {
    const data = await apiGetHistory();

    if (!data.records || data.records.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:50px;color:var(--muted)">
          <div style="font-size:2.5rem;margin-bottom:12px">📭</div>
          <div style="font-size:.9rem;font-weight:600">No saved optimizations yet.</div>
          <div style="font-size:.78rem;margin-top:6px">Run an optimization and click 💾 Save Result.</div>
        </div>`;
      return;
    }

    container.innerHTML = data.records.map(r => renderHistoryCard(r)).join('');
  } catch (err) {
    container.innerHTML = `<div style="color:var(--red);padding:20px;font-size:.85rem">⚠ Could not load history: ${err.message}</div>`;
  }
}

// ── Render a single history card
function renderHistoryCard(r) {
  const date    = new Date(r.savedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const ecoGrade = r.eco.ecoScore >= 85 ? 'A+' : r.eco.ecoScore >= 70 ? 'A' : r.eco.ecoScore >= 55 ? 'B+' : 'B';
  const matColor = r.eco.ecoScore >= 70 ? 'var(--leaf2)' : r.eco.ecoScore >= 50 ? 'var(--amber)' : 'var(--red)';

  return `
  <div class="history-card" id="hcard-${r.id}">
    <div class="hc-top">
      <div>
        <div class="hc-name">${r.name}</div>
        <div class="hc-date">${date}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button onclick="loadHistoryResult('${r.id}')" class="hc-btn-load">📂 Load</button>
        <button onclick="exportHistoryPDF('${r.id}')" class="hc-btn-pdf">⬇ PDF</button>
        <button onclick="deleteHistory('${r.id}')" class="hc-btn-del">🗑</button>
      </div>
    </div>
    <div class="hc-grid">
      <div class="hc-stat">
        <div class="hc-val">${r.dims?.optimized?.L}×${r.dims?.optimized?.W}×${r.dims?.optimized?.H}</div>
        <div class="hc-lbl">Box (mm)</div>
      </div>
      <div class="hc-stat">
        <div class="hc-val" style="color:var(--leaf2)">${r.eco?.saving}%</div>
        <div class="hc-lbl">Material Saved</div>
      </div>
      <div class="hc-stat">
        <div class="hc-val" style="color:var(--amber)">₹${r.cost?.unitCost}</div>
        <div class="hc-lbl">Cost/Unit</div>
      </div>
      <div class="hc-stat">
        <div class="hc-val" style="color:var(--sky)">${r.eco?.co2Saved}%</div>
        <div class="hc-lbl">CO₂ Reduced</div>
      </div>
      <div class="hc-stat">
        <div class="hc-val" style="color:${matColor}">${ecoGrade}</div>
        <div class="hc-lbl">Eco Grade</div>
      </div>
      <div class="hc-stat">
        <div class="hc-val" style="font-size:.75rem;color:var(--leaf3)">${r.material?.friendlyName?.split(' ')[0]}</div>
        <div class="hc-lbl">Material</div>
      </div>
    </div>
  </div>`;
}

// ── Load a history record back into the result view
async function loadHistoryResult(id) {
  try {
    const data = await apiGetHistoryById(id);
    G.result = data.record;
    G.ran    = true;

    // Re-render results with loaded data
    renderResults(data.record);
    nav('result', document.querySelectorAll('.tb')[2]);
  } catch (err) {
    alert('Could not load this record: ' + err.message);
  }
}

// ── Export a specific history record as PDF
async function exportHistoryPDF(id) {
  try {
    const data = await apiGetHistoryById(id);
    generatePDF(data.record);
  } catch (err) {
    alert('Could not export PDF: ' + err.message);
  }
}

// ── Delete a single history record
async function deleteHistory(id) {
  if (!confirm('Delete this saved result?')) return;
  try {
    await apiDeleteHistory(id);
    const card = document.getElementById('hcard-' + id);
    if (card) {
      card.style.transition = 'opacity .3s, transform .3s';
      card.style.opacity    = '0';
      card.style.transform  = 'translateY(-8px)';
      setTimeout(() => { card.remove(); checkEmpty(); }, 300);
    }
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

// ── Clear all history
async function clearHistory() {
  if (!confirm('Clear ALL saved optimizations? This cannot be undone.')) return;
  try {
    await apiClearHistory();
    loadHistory();
  } catch (err) {
    alert('Failed: ' + err.message);
  }
}

function checkEmpty() {
  const container = document.getElementById('historyList');
  if (container && !container.querySelector('.history-card')) {
    container.innerHTML = `
      <div style="text-align:center;padding:50px;color:var(--muted)">
        <div style="font-size:2.5rem;margin-bottom:12px">📭</div>
        <div style="font-size:.9rem;font-weight:600">No saved optimizations yet.</div>
      </div>`;
  }
}
