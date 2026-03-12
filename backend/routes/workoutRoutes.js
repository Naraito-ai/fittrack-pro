const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getLogs, createLog, updateLog, deleteLog,
  getHistory, getExerciseList, getStrengthProgress, getWorkoutFrequency,
} = require('../controllers/workoutController');

const router = express.Router();
router.use(protect);

router.get('/logs',                  getLogs);
router.post('/logs',                 createLog);
router.put('/logs/:id',              updateLog);
router.delete('/logs/:id',           deleteLog);
router.get('/history',               getHistory);
router.get('/exercises',             getExerciseList);
router.get('/frequency',             getWorkoutFrequency);
router.get('/strength/:exercise',    getStrengthProgress);

module.exports = router;
