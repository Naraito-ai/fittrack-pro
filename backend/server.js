require("dotenv").config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes      = require('./routes/authRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const workoutRoutes   = require('./routes/workoutRoutes');
const weightRoutes    = require('./routes/weightRoutes');
connectDB();
const app = express();
app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'FitTrack Pro API running', ts: new Date() });
});

app.use('/api/auth',      authRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/workouts',  workoutRoutes);
app.use('/api/weight',    weightRoutes);

app.use('*', (req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
module.exports = app;
