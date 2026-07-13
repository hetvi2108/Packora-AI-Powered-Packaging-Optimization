const express = require('express');
const router  = express.Router();
const DS      = require('../data/datasets');

/** GET /api/datasets — return all datasets (excludes the giant fba array for perf) */
router.get('/', (req, res) => {
  res.json({
    success: true,
    meta:    DS._meta,
    datasets: {
      ista:   DS.ista,
      tappi:  DS.tappi,
      lca:    DS.lca,
      prices: DS.prices,
      ghg:    DS.ghg,
      fbaCount: DS.fba.length,  // don't send 32k rows to browser
    },
  });
});

/** GET /api/datasets/meta — dataset source info */
router.get('/meta', (req, res) => {
  res.json({ success: true, meta: DS._meta });
});

/** GET /api/datasets/:name — single dataset by name */
router.get('/:name', (req, res) => {
  const name = req.params.name;
  if (!DS[name]) {
    return res.status(404).json({ success: false, error: `Dataset "${name}" not found` });
  }
  // Paginate fba since it's large
  if (name === 'fba') {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 100;
    const start = (page - 1) * limit;
    return res.json({
      success: true,
      total:   DS.fba.length,
      page, limit,
      data:    DS.fba.slice(start, start + limit),
    });
  }
  res.json({ success: true, data: DS[name] });
});

module.exports = router;
