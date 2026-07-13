// ═══════════════════════════════════════════════════════════════
//  PACKORA AI — Express Backend Server
// ═══════════════════════════════════════════════════════════════

const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const optimizeRoute  = require('./routes/optimize');
const datasetsRoute  = require('./routes/datasets');
const historyRoute   = require('./routes/history');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting (100 requests per 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please slow down.' },
});
app.use('/api', limiter);

// ── Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes
app.use('/api/optimize',  optimizeRoute);
app.use('/api/datasets',  datasetsRoute);
app.use('/api/history',   historyRoute);

// ── Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status:  'ok',
    version: '1.0.0',
    uptime:  Math.floor(process.uptime()),
  });
});

// ── Fallback: serve frontend for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Start server
app.listen(PORT, () => {
  console.log(`\n🌱 Packora AI server running at http://localhost:${PORT}`);
  console.log(`   API  → http://localhost:${PORT}/api/optimize`);
  console.log(`   Docs → http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
