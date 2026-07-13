// ═══════════════════════════════════════════════════════════════
//  PACKORA AI — 2D Dieline Renderer
// ═══════════════════════════════════════════════════════════════

/**
 * Draw the 2D dieline on the canvas using the optimized box dimensions.
 * @param {number} L - Box length (mm)
 * @param {number} W - Box width (mm)
 * @param {number} H - Box height (mm)
 */
function drawDieline(L, W, H) {
  const canvas = document.getElementById('dieCanvas');
  const ctx = canvas.getContext('2d');

  const S = 2.0;
  const fl = 20 * S;
  const l = (L * S) / 3;
  const w = (W * S) / 3;
  const h = (H * S) / 3;
  const px = 56, py = 56;
  const ox = px + w;
  const oy = py + h + fl;

  canvas.width  = 2 * l + 2 * w + l + px * 2 + fl * 2 + 40;
  canvas.height = 2 * h + 2 * fl + py * 2 + 40;

  // Background
  ctx.fillStyle = 'rgba(245,255,254,1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Panel definitions [x, y, pw, ph, label, fillColor]
  const panels = [
    [ox + w,           oy - fl,  l,       fl,        'Bottom Flap', 'rgba(245,197,66,.08)'],
    [ox,               oy,       w,       h,          'Side',        'rgba(0,229,160,.08)'],
    [ox + w,           oy,       l,       h,          'Front',       'rgba(0,229,160,.14)'],
    [ox + w + l,       oy,       w,       h,          'Side',        'rgba(56,209,248,.07)'],
    [ox + w + l + w,   oy,       l,       h,          'Back',        'rgba(0,229,160,.1)'],
    [ox + w,           oy + h,   l,       fl,         'Top Flap',    'rgba(245,197,66,.08)'],
    [ox + w + l + w + l, oy,     fl,      h,          'Glue Tab',    'rgba(255,107,107,.12)'],
    [ox,               oy + h,   w,       fl * 0.7,   'Flap',        'rgba(56,209,248,.07)'],
    [ox + w + l + w,   oy + h,   w,       fl * 0.7,   'Flap',        'rgba(56,209,248,.07)'],
    [ox,               oy - fl,  w,       fl,         'Flap',        'rgba(245,197,66,.07)'],
    [ox + w + l + w,   oy - fl,  w,       fl,         'Flap',        'rgba(245,197,66,.07)'],
  ];

  panels.forEach(([x, y, pw, ph, lbl, col]) => {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, pw, ph);
    ctx.fillStyle = 'rgba(0,168,114,.75)';
    ctx.font = `600 ${Math.max(9, Math.min(12, pw / 5))}px Plus Jakarta Sans, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lbl, x + pw / 2, y + ph / 2);
  });

  // Cut lines (solid green)
  ctx.strokeStyle = '#00c98a';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.strokeRect(ox, oy - fl, w + l + w + l + fl, fl + h + fl * 0.7);
  ctx.strokeRect(ox + w, oy - fl, l, fl + h + fl);

  // Score / fold lines (dashed blue)
  ctx.strokeStyle = '#0088bb';
  ctx.lineWidth = 0.9;
  ctx.setLineDash([5, 3]);

  [ox + w, ox + w + l, ox + w + l + w, ox + w + l + w + l, ox + w + l + w + l + fl].forEach(x => {
    ctx.beginPath();
    ctx.moveTo(x, oy - fl);
    ctx.lineTo(x, oy + h + fl);
    ctx.stroke();
  });

  [oy, oy + h].forEach(y => {
    ctx.beginPath();
    ctx.moveTo(ox, y);
    ctx.lineTo(ox + w + l + w + l + fl, y);
    ctx.stroke();
  });

  ctx.setLineDash([]);

  // Dimension arrows and labels
  ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = '#007a52';
  ctx.strokeStyle = '#007a52';
  ctx.lineWidth = 1.2;

  function dimArrow(x1, y1, x2, y2, label, offset, horiz) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    ctx.beginPath();
    if (horiz) {
      const ay = y1 + offset;
      ctx.moveTo(x1, ay); ctx.lineTo(x2, ay);
      ctx.moveTo(x1, ay); ctx.lineTo(x1 + 7, ay - 4);
      ctx.moveTo(x1, ay); ctx.lineTo(x1 + 7, ay + 4);
      ctx.moveTo(x2, ay); ctx.lineTo(x2 - 7, ay - 4);
      ctx.moveTo(x2, ay); ctx.lineTo(x2 - 7, ay + 4);
      ctx.moveTo(x1, ay - 4); ctx.lineTo(x1, ay + 4);
      ctx.moveTo(x2, ay - 4); ctx.lineTo(x2, ay + 4);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, mx, ay + offset - 2);
    } else {
      const ax = x1 + offset;
      ctx.moveTo(ax, y1); ctx.lineTo(ax, y2);
      ctx.moveTo(ax, y1); ctx.lineTo(ax - 4, y1 + 7);
      ctx.moveTo(ax, y1); ctx.lineTo(ax + 4, y1 + 7);
      ctx.moveTo(ax, y2); ctx.lineTo(ax - 4, y2 - 7);
      ctx.moveTo(ax, y2); ctx.lineTo(ax + 4, y2 - 7);
      ctx.moveTo(ax - 4, y1); ctx.lineTo(ax + 4, y1);
      ctx.moveTo(ax - 4, y2); ctx.lineTo(ax + 4, y2);
      ctx.stroke();
      ctx.save();
      ctx.translate(ax + offset - 2, (y1 + y2) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }
  }

  dimArrow(ox + w, oy, ox + w + l, oy, `L = ${L} mm`, -28, true);
  dimArrow(ox, oy, ox + w, oy, `W = ${W} mm`, -28, true);
  dimArrow(ox + w + l + w + l + fl, oy, ox + w + l + w + l + fl, oy + h, `H = ${H} mm`, 28, false);

  // Update info labels
  document.getElementById('dieInfo').textContent = `Box: ${L} × ${W} × ${H} mm`;
  document.getElementById('dieArea').textContent = `Total flat area: ${((L * W * 2 + L * H * 2 + W * H * 2) / 1e4).toFixed(1)} cm²`;
}

/**
 * Export the current dieline canvas as a PNG file.
 */
function dlDieline() {
  const canvas = document.getElementById('dieCanvas');
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'packoraAI_dieline.png';
  a.click();
}
