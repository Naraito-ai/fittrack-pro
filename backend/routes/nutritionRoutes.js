const express = require('express');
const { protect } = require('../middleware/auth');

const {
  getLogs,
  createLog,
  updateLog,
  deleteLog,
  getDailySummary,
  getWeeklyTrend,
  aiFood
} = require('../controllers/nutritionController');

const router = express.Router();

/* Protect all nutrition routes */
router.use(protect);

/* Food logs */
router.get('/logs', getLogs);
router.post('/logs', createLog);
router.put('/logs/:id', updateLog);
router.delete('/logs/:id', deleteLog);

/* Nutrition summaries */
router.get('/summary', getDailySummary);
router.get('/weekly', getWeeklyTrend);

/* AI FOOD ANALYZER */
router.post('/ai-food', aiFood);

module.exports = router;