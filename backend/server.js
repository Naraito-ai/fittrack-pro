require("dotenv").config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const weightRoutes = require('./routes/weightRoutes');

connectDB();

const app = express();

app.use(helmet());

app.use(cors({
  origin: true,
  credentials: true
}));

app.options('*', cors());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FitTrack Pro API running',
    ts: new Date()
  });
});


// ============================
// AI FOOD LOGGER ROUTE
// ============================
app.post("/api/food-ai", async (req, res) => {
  try {

    const { food } = req.body;

    const response = await axios.get(
      "https://api.edamam.com/api/nutrition-data",
      {
        params: {
          app_id: process.env.EDAMAM_APP_ID,
          app_key: process.env.EDAMAM_APP_KEY,
          ingr: food
        }
      }
    );

    const data = response.data;

    res.json({
      calories: data.calories,
      protein: data.totalNutrients.PROCNT?.quantity || 0,
      carbs: data.totalNutrients.CHOCDF?.quantity || 0,
      fat: data.totalNutrients.FAT?.quantity || 0
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Food analysis failed" });
  }
});


// Existing routes
app.use('/api/auth', authRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/weight', weightRoutes);


// 404
app.use('*', (req, res) =>
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
);


// Error handler
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});

module.exports = app;