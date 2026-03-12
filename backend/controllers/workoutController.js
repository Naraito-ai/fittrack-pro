const WorkoutLog = require('../models/WorkoutLog');

const dayRange = (dateStr) => {
  const s = new Date(dateStr); s.setHours(0,0,0,0);
  const e = new Date(dateStr); e.setHours(23,59,59,999);
  return { start: s, end: e };
};

exports.getLogs = async (req, res, next) => {
  try {
    const { date } = req.query;
    const { start, end } = dayRange(date || new Date().toISOString().split('T')[0]);
    const logs = await WorkoutLog.find({ userId: req.user._id, date: { $gte: start, $lte: end } })
      .sort({ createdAt: 1 });
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};

exports.createLog = async (req, res, next) => {
  try {
    const { exerciseName, weightKg=0, reps, sets, muscleGroup='other', notes, date } = req.body;
    if (!exerciseName || !reps || !sets)
      return res.status(400).json({ success: false, message: 'exerciseName, reps, sets required' });

    const log = await WorkoutLog.create({
      userId: req.user._id, exerciseName, weightKg, reps, sets,
      muscleGroup, notes, date: date ? new Date(date) : new Date(),
    });
    res.status(201).json({ success: true, data: log });
  } catch (err) { next(err); }
};

exports.updateLog = async (req, res, next) => {
  try {
    const log = await WorkoutLog.findOne({ _id: req.params.id, userId: req.user._id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });

    const fields = ['exerciseName','weightKg','reps','sets','muscleGroup','notes','date'];
    fields.forEach(f => { if (req.body[f] !== undefined) log[f] = req.body[f]; });
    log.volume = Math.round(log.weightKg * log.reps * log.sets * 100) / 100;
    await log.save();
    res.json({ success: true, data: log });
  } catch (err) { next(err); }
};

exports.deleteLog = async (req, res, next) => {
  try {
    const log = await WorkoutLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const end = new Date(); end.setHours(23,59,59,999);
    const start = new Date(); start.setDate(start.getDate() - (days-1)); start.setHours(0,0,0,0);

    const data = await WorkoutLog.aggregate([
      { $match: { userId: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          exercises:   { $addToSet: '$exerciseName' },
          totalVolume: { $sum: '$volume' },
          totalSets:   { $sum: '$sets' },
          logCount:    { $sum: 1 },
      }},
      { $sort: { _id: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getExerciseList = async (req, res, next) => {
  try {
    const list = await WorkoutLog.distinct('exerciseName', { userId: req.user._id });
    res.json({ success: true, data: list.sort() });
  } catch (err) { next(err); }
};

exports.getStrengthProgress = async (req, res, next) => {
  try {
    const exercise = decodeURIComponent(req.params.exercise);
    const days = parseInt(req.query.days) || 90;
    const end = new Date(); end.setHours(23,59,59,999);
    const start = new Date(); start.setDate(start.getDate() - (days-1)); start.setHours(0,0,0,0);

    const data = await WorkoutLog.aggregate([
      { $match: {
          userId: req.user._id,
          exerciseName: { $regex: new RegExp(`^${exercise}$`, 'i') },
          date: { $gte: start, $lte: end },
      }},
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          maxWeight:   { $max: '$weightKg' },
          totalVolume: { $sum: '$volume' },
          totalSets:   { $sum: '$sets' },
      }},
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, exercise, data });
  } catch (err) { next(err); }
};

exports.getWorkoutFrequency = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const end = new Date(); end.setHours(23,59,59,999);
    const start = new Date(); start.setDate(start.getDate() - (days-1)); start.setHours(0,0,0,0);

    const data = await WorkoutLog.aggregate([
      { $match: { userId: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalVolume: { $sum: '$volume' },
      }},
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
