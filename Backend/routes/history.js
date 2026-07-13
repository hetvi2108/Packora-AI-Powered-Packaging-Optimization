// ═══════════════════════════════════════════════════════════════
//  PACKORA AI — History Route
//  Saves & retrieves past optimizations using lowdb (JSON file)
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const path    = require('path');
const low     = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync(path.join(__dirname, '../data/history.json'));
const db      = low(adapter);

// Init DB with defaults
db.defaults({ optimizations: [] }).write();

// ── POST /api/history — save a result
router.post('/', (req, res) => {
  try {
    const { result, name } = req.body;
    if (!result) return res.status(400).json({ success: false, error: 'No result provided' });

    const record = {
      id:        Date.now().toString(),
      name:      name || `${result.input?.cat || 'Product'} — ${new Date().toLocaleDateString('en-IN')}`,
      savedAt:   new Date().toISOString(),
      input:     result.input,
      dims:      result.dims,
      material:  result.material,
      supplier:  result.supplier,
      strength:  result.strength,
      cost:      result.cost,
      eco:       result.eco,
      ista:      result.ista,
    };

    db.get('optimizations').push(record).write();
    res.json({ success: true, id: record.id, message: 'Saved successfully' });
  } catch (err) {
    console.error('History save error:', err);
    res.status(500).json({ success: false, error: 'Failed to save' });
  }
});

// ── GET /api/history — get all saved optimizations (newest first)
router.get('/', (req, res) => {
  const records = db.get('optimizations').value().slice().reverse();
  res.json({ success: true, count: records.length, records });
});

// ── GET /api/history/:id — get single record
router.get('/:id', (req, res) => {
  const record = db.get('optimizations').find({ id: req.params.id }).value();
  if (!record) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, record });
});

// ── DELETE /api/history/:id — delete a record
router.delete('/:id', (req, res) => {
  const before = db.get('optimizations').size().value();
  db.get('optimizations').remove({ id: req.params.id }).write();
  const after = db.get('optimizations').size().value();
  if (before === after) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, message: 'Deleted' });
});

// ── DELETE /api/history — clear all
router.delete('/', (req, res) => {
  db.set('optimizations', []).write();
  res.json({ success: true, message: 'All history cleared' });
});

module.exports = router;
