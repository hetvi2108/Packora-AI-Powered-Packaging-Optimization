const express  = require('express');
const router   = express.Router();
const { optimize } = require('../engine/optimizer');

/**
 * POST /api/optimize
 * Body: { L, W, H, wt, frag, qty, stack, sus, cat, ista, dist }
 */
router.post('/', (req, res) => {
  try {
    const {
      L, W, H, wt, frag, qty, stack,
      sus, cat, ista, dist,
    } = req.body;

    // --- Input validation
    const errors = [];
    if (!L  || isNaN(L)  || L  < 10) errors.push('Length (L) must be ≥ 10mm');
    if (!W  || isNaN(W)  || W  < 10) errors.push('Width (W) must be ≥ 10mm');
    if (!H  || isNaN(H)  || H  < 10) errors.push('Height (H) must be ≥ 10mm');
    if (!wt || isNaN(wt) || wt < 1)  errors.push('Weight must be ≥ 1g');
    if (!qty|| isNaN(qty)|| qty< 1)  errors.push('Quantity must be ≥ 1');
    if (!['1A','2A','3A'].includes(ista)) errors.push('Invalid ISTA level');
    if (!['max','balanced','cost'].includes(sus)) errors.push('Invalid sustainability value');

    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }

    const result = optimize({
      L:     Number(L),
      W:     Number(W),
      H:     Number(H),
      wt:    Number(wt),
      frag:  Number(frag) || 5,
      qty:   Number(qty),
      stack: Number(stack) || 5,
      sus,
      cat:   cat || 'electronics',
      ista,
      dist:  dist || 'Regional (100–1000km)',
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('Optimization error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
