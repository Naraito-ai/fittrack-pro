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

router.use(protect);

/* -------- FOOD LOG ROUTES -------- */

router.get('/logs', getLogs);
router.post('/logs', createLog);
router.put('/logs/:id', updateLog);
router.delete('/logs/:id', deleteLog);

/* -------- SUMMARY ROUTES -------- */

router.get('/summary', getDailySummary);
router.get('/weekly', getWeeklyTrend);

/* -------- AI FOOD ANALYZER -------- */

router.post('/ai-food', aiFood);

module.exports = router;