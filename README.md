# 🏋️ FitTrack Pro

Full-stack fitness tracking PWA — MyFitnessPal + Strong App combined.

## Stack
- **Frontend**: React 18 + Vite + TailwindCSS + Chart.js
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **PWA**: vite-plugin-pwa + Workbox
- **Deploy**: Vercel (frontend) + Render (backend) + MongoDB Atlas

## Run Locally

### 1. Backend
```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
npm install
npm run dev          # → http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env
# Leave VITE_API_URL empty (Vite proxy handles /api)
npm install
npm run dev          # → http://localhost:5173
```

## PWA Icons
Add PNG files to `frontend/public/icons/`:
- icon-72.png, icon-96.png, icon-128.png
- icon-192.png, icon-512.png
- icon-maskable-192.png, icon-maskable-512.png

Generate at: https://realfavicongenerator.net or https://maskable.app

## Deploy

### MongoDB Atlas
1. Create free M0 cluster at cloud.mongodb.com
2. Create database user + allow all IPs (0.0.0.0/0)
3. Copy connection string → use as MONGO_URI

### Backend → Render
1. New Web Service → connect GitHub repo
2. Root Directory: `backend` | Build: `npm install` | Start: `node server.js`
3. Set env vars: NODE_ENV, MONGO_URI, JWT_SECRET, ALLOWED_ORIGINS

### Frontend → Vercel
1. New Project → connect GitHub repo
2. Root Directory: `frontend`
3. Set env var: `VITE_API_URL=https://your-api.onrender.com/api`

## API Endpoints

All protected routes require `Authorization: Bearer <token>`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | ❌ | Register |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/auth/me | ✅ | Get profile |
| PUT | /api/auth/me | ✅ | Update profile |
| GET | /api/nutrition/logs?date= | ✅ | Food logs |
| POST | /api/nutrition/logs | ✅ | Add food log |
| GET | /api/nutrition/summary?date= | ✅ | Daily totals |
| GET | /api/nutrition/weekly | ✅ | 7-day trend |
| GET | /api/workouts/logs?date= | ✅ | Workout logs |
| POST | /api/workouts/logs | ✅ | Add workout |
| GET | /api/workouts/history | ✅ | Session history |
| GET | /api/workouts/strength/:exercise | ✅ | Strength progress |
| GET | /api/weight/logs | ✅ | Weight entries |
| POST | /api/weight/logs | ✅ | Log weight |
| GET | /api/weight/trend?period=30d | ✅ | Weight trend |
