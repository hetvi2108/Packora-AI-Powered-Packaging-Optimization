// ═══════════════════════════════════════════════════════════════
//  PACKORA AI — 3D Box Viewer
// ═══════════════════════════════════════════════════════════════

const View3D = {
  anim:  true,
  angle: 0.4,
  pitch: 0.42,
  zoom:  1,
  drag:  false,
  lx:    0,
  animID: null,
  L: 156, W: 116, H: 96,
};

/**
 * Initialise the 3D canvas and start the render loop.
 * @param {number} L - Box length
 * @param {number} W - Box width
 * @param {number} H - Box height
 */
function init3D(L, W, H) {
  const canvas = document.getElementById('c3d');
  if (!canvas) return;

  View3D.L = L || 156;
  View3D.W = W || 116;
  View3D.H = H || 96;

  canvas.width  = canvas.offsetWidth || 800;
  canvas.height = 340;

  document.getElementById('dims3d').textContent = `${View3D.L} × ${View3D.W} × ${View3D.H} mm`;

  // Mouse interaction
  canvas.onmousedown  = e => { View3D.drag = true; View3D.lx = e.clientX; };
  canvas.onmousemove  = e => {
    if (View3D.drag) {
      View3D.angle += (e.clientX - View3D.lx) * 0.013;
      View3D.lx = e.clientX;
    }
  };
  canvas.onmouseup    = () => View3D.drag = false;
  canvas.onmouseleave = () => View3D.drag = false;
  canvas.onwheel      = e => {
    View3D.zoom = Math.max(0.4, Math.min(2, View3D.zoom - e.deltaY * 0.001));
    e.preventDefault();
  };

  if (View3D.animID) cancelAnimationFrame(View3D.animID);
  View3D.anim = true;
  document.getElementById('animBtn').textContent = '⏸ Pause';
  render3D();
}

function render3D() {
  if (View3D.anim) {
    View3D.angle += 0.008;
    View3D.animID = requestAnimationFrame(render3D);
  }

  const canvas = document.getElementById('c3d');
  const ctx    = canvas.getContext('2d');
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(245,255,254,.9)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const BL = View3D.L / 2.2;
  const BW = View3D.W / 2.2;
  const BH = View3D.H / 2.2;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2 + 20;
  const sc = View3D.zoom * Math.min(canvas.width, canvas.height) / (Math.max(BL, BW, BH) * 3.2);

  function proj(x, y, z) {
    const ca = Math.cos(View3D.angle), sa = Math.sin(View3D.angle);
    const cp = Math.cos(View3D.pitch), sp = Math.sin(View3D.pitch);
    const rx = x * ca - z * sa;
    const rz = x * sa + z * ca;
    const ry = y * cp - rz * sp;
    const rz2 = y * sp + rz * cp;
    return { x: cx + rx * sc, y: cy - ry * sc, z: rz2 };
  }

  const pts = [
    { x: -BL, y: -BH, z: -BW }, { x: BL, y: -BH, z: -BW },
    { x:  BL, y:  BH, z: -BW }, { x:-BL, y:  BH, z: -BW },
    { x: -BL, y: -BH, z:  BW }, { x: BL, y: -BH, z:  BW },
    { x:  BL, y:  BH, z:  BW }, { x:-BL, y:  BH, z:  BW },
  ].map(p => ({ ...proj(p.x, p.y, p.z) }));

  const faces = [
    { v: [4,5,6,7], c: 'rgba(0,201,138,.22)' },
    { v: [0,1,2,3], c: 'rgba(0,201,138,.10)' },
    { v: [0,4,7,3], c: 'rgba(0,201,138,.18)' },
    { v: [1,5,6,2], c: 'rgba(0,201,138,.18)' },
    { v: [3,2,6,7], c: 'rgba(0,201,138,.32)' },
    { v: [0,1,5,4], c: 'rgba(0,201,138,.08)' },
  ];

  faces.forEach(f => f.z = f.v.reduce((s, i) => s + pts[i].z, 0) / 4);
  faces.sort((a, b) => a.z - b.z);

  faces.forEach(f => {
    ctx.beginPath();
    f.v.forEach((i, k) => k === 0 ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y));
    ctx.closePath();
    ctx.fillStyle = f.c;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,201,138,.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Grid floor
  ctx.strokeStyle = 'rgba(0,201,138,.1)';
  ctx.lineWidth = 0.5;
  for (let i = -4; i <= 4; i++) {
    const a = proj(i * 20, -BH - 2, -80);
    const b = proj(i * 20, -BH - 2,  80);
    const d = proj(-80, -BH - 2, i * 20);
    const e = proj( 80, -BH - 2, i * 20);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(e.x, e.y); ctx.stroke();
  }
}

function tog3d() {
  View3D.anim = !View3D.anim;
  document.getElementById('animBtn').textContent = View3D.anim ? '⏸ Pause' : '▶ Play';
  if (View3D.anim) render3D();
}

function rst3d() {
  View3D.angle = 0.4;
  View3D.pitch = 0.42;
  View3D.zoom  = 1;
  if (!View3D.anim) render3D();
}
