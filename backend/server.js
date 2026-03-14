require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const nutritionRoutes = require("./routes/nutritionRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const weightRoutes = require("./routes/weightRoutes");

const app = express();

/* ===============================
   CONNECT DATABASE
================================ */
connectDB();

/* ===============================
   SECURITY MIDDLEWARE
================================ */

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.options("*", cors());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ===============================
   BODY PARSER
================================ */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===============================
   LOGGER
================================ */

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

/* ===============================
   HEALTH CHECK
================================ */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FitTrack Pro API running",
    ts: new Date(),
  });
});

/* ===============================
   API ROUTES
================================ */

app.use("/api/auth", authRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/weight", weightRoutes);

/* ===============================
   404 HANDLER
================================ */

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* ===============================
   ERROR HANDLER
================================ */

app.use(errorHandler);

/* ===============================
   SERVER START
================================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});

module.exports = app;