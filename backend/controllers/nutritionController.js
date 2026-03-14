const FoodLog = require('../models/FoodLog');
const axios = require('axios');

const dayRange = (dateStr) => {
  const s = new Date(dateStr); s.setHours(0,0,0,0);
  const e = new Date(dateStr); e.setHours(23,59,59,999);
  return { start: s, end: e };
};

/* ---------- GET LOGS ---------- */

exports.getLogs = async (req, res, next) => {
  try {

    const { date } = req.query;

    const { start, end } = dayRange(
      date || new Date().toISOString().split('T')[0]
    );

    const logs = await FoodLog.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: logs
    });

  } catch (err) {
    next(err);
  }
};

/* ---------- CREATE LOG ---------- */

exports.createLog = async (req, res, next) => {
  try {

    const {
      foodName,
      calories,
      protein = 0,
      fats = 0,
      carbs = 0,
      quantity = 1,
      unit = 'serving',
      mealType = 'snack',
      date
    } = req.body;

    if (!foodName || calories === undefined)
      return res.status(400).json({
        success: false,
        message: 'foodName and calories required'
      });

    const log = await FoodLog.create({
      userId: req.user._id,
      foodName,
      calories,
      protein,
      fats,
      carbs,
      quantity,
      unit,
      mealType,
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({
      success: true,
      data: log
    });

  } catch (err) {
    next(err);
  }
};

/* ---------- UPDATE LOG ---------- */

exports.updateLog = async (req, res, next) => {
  try {

    const log = await FoodLog.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!log)
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });

    const fields = [
      'foodName',
      'calories',
      'protein',
      'fats',
      'carbs',
      'quantity',
      'unit',
      'mealType',
      'date'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined)
        log[f] = req.body[f];
    });

    await log.save();

    res.json({
      success: true,
      data: log
    });

  } catch (err) {
    next(err);
  }
};

/* ---------- DELETE LOG ---------- */

exports.deleteLog = async (req, res, next) => {
  try {

    const log = await FoodLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!log)
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });

    res.json({
      success: true,
      message: 'Deleted'
    });

  } catch (err) {
    next(err);
  }
};

/* ---------- DAILY SUMMARY ---------- */

exports.getDailySummary = async (req, res, next) => {
  try {

    const dateStr =
      req.query.date ||
      new Date().toISOString().split('T')[0];

    const { start, end } = dayRange(dateStr);

    const [result] = await FoodLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalCalories: {
            $sum: { $multiply: ['$calories', '$quantity'] }
          },
          totalProtein: {
            $sum: { $multiply: ['$protein', '$quantity'] }
          },
          totalFats: {
            $sum: { $multiply: ['$fats', '$quantity'] }
          },
          totalCarbs: {
            $sum: { $multiply: ['$carbs', '$quantity'] }
          },
          logCount: { $sum: 1 }
        }
      }
    ]);

    const summary = result || {
      totalCalories: 0,
      totalProtein: 0,
      totalFats: 0,
      totalCarbs: 0,
      logCount: 0
    };

    Object.keys(summary).forEach(k => {
      if (k !== '_id' && k !== 'logCount')
        summary[k] = Math.round(summary[k] * 10) / 10;
    });

    res.json({
      success: true,
      date: dateStr,
      data: summary
    });

  } catch (err) {
    next(err);
  }
};

/* ---------- WEEKLY TREND ---------- */

exports.getWeeklyTrend = async (req, res, next) => {
  try {

    const days = parseInt(req.query.days) || 7;

    const end = new Date();
    end.setHours(23,59,59,999);

    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0,0,0,0);

    const data = await FoodLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date'
            }
          },
          totalCalories: {
            $sum: { $multiply: ['$calories','$quantity'] }
          },
          totalProtein: {
            $sum: { $multiply: ['$protein','$quantity'] }
          },
          totalFats: {
            $sum: { $multiply: ['$fats','$quantity'] }
          },
          totalCarbs: {
            $sum: { $multiply: ['$carbs','$quantity'] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data
    });

  } catch (err) {
    next(err);
  }
};

/* ---------- AI FOOD ANALYZER ---------- */

exports.aiFood = async (req, res) => {
  try {

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success:false,
        message:"Food text required"
      });
    }

    const response = await axios.get(
      "https://api.spoonacular.com/recipes/guessNutrition",
      {
        params: {
          title: text,
          apiKey: process.env.SPOONACULAR_API_KEY
        }
      }
    );

    const data = response.data;

    res.json({
      success:true,
      data:{
        calories: Math.round(data.calories.value),
        protein: Math.round(data.protein.value),
        fats: Math.round(data.fat.value),
        carbs: Math.round(data.carbs.value)
      }
    });

  } catch (err) {

    console.log("AI FOOD ERROR:", err.message);

    res.status(500).json({
      success:false,
      message:"AI failed to analyze food"
    });

  }
};