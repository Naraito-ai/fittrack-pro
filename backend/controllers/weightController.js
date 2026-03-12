const WeightLog = require('../models/WeightLog');
const User      = require('../models/User');

exports.getLogs = async (req, res, next) => {
  try {
    const logs = await WeightLog.find({ userId: req.user._id })
      .sort({ date: -1 }).limit(parseInt(req.query.limit) || 100);
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};

exports.createLog = async (req, res, next) => {
  try {
    const { bodyWeight, date, note, bodyFatPercentage } = req.body;
    if (!bodyWeight) return res.status(400).json({ success: false, message: 'bodyWeight required' });

    const log = await WeightLog.create({
      userId: req.user._id, bodyWeight,
      date: date ? new Date(date) : new Date(),
      note, bodyFatPercentage,
    });
    await User.findByIdAndUpdate(req.user._id, { bodyWeight });
    res.status(201).json({ success: true, data: log });
  } catch (err) { next(err); }
};

exports.updateLog = async (req, res, next) => {
  try {
    const log = await WeightLog.findOne({ _id: req.params.id, userId: req.user._id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    const fields = ['bodyWeight','date','note','bodyFatPercentage'];
    fields.forEach(f => { if (req.body[f] !== undefined) log[f] = req.body[f]; });
    await log.save();
    res.json({ success: true, data: log });
  } catch (err) { next(err); }
};

exports.deleteLog = async (req, res, next) => {
  try {
    const log = await WeightLog.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.getWeightTrend = async (req, res, next) => {
  try {
    const periodMap = { '30d':30, '90d':90, '6m':180, '1y':365 };
    const days = periodMap[req.query.period] || 30;
    const end = new Date(); end.setHours(23,59,59,999);
    const start = new Date(); start.setDate(start.getDate() - (days-1)); start.setHours(0,0,0,0);

    const logs = await WeightLog.find({ userId: req.user._id, date: { $gte: start, $lte: end } })
      .sort({ date: 1 });

    const withAvg = logs.map((log, i, arr) => {
      const window = arr.slice(Math.max(0, i-6), i+1);
      const avg = window.reduce((s, l) => s + l.bodyWeight, 0) / window.length;
      return { ...log.toObject(), rollingAvg: Math.round(avg * 10) / 10 };
    });

    const stats = logs.length ? {
      start:  logs[0].bodyWeight,
      end:    logs[logs.length-1].bodyWeight,
      change: Math.round((logs[logs.length-1].bodyWeight - logs[0].bodyWeight) * 10) / 10,
      min:    Math.min(...logs.map(l => l.bodyWeight)),
      max:    Math.max(...logs.map(l => l.bodyWeight)),
    } : null;

    res.json({ success: true, data: withAvg, stats });
  } catch (err) { next(err); }
};
