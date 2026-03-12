const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getLogs, createLog, updateLog, deleteLog,
  getDailySummary, getWeeklyTrend,
} = require('../controllers/nutritionController');

const router = express.Router();
router.use(protect);

router.get('/logs',        getLogs);
router.post('/logs',       createLog);
router.put('/logs/:id',    updateLog);
router.delete('/logs/:id', deleteLog);
router.get('/summary',     getDailySummary);
router.get('/weekly',      getWeeklyTrend);

module.exports = router;
