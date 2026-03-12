import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Sidebar  from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import Navbar   from './components/layout/Navbar';

// PWA
import { OfflineBanner, UpdateBanner, InstallPrompt } from './components/ui/PWAPrompt';

// Pages
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Nutrition from './pages/Nutrition';
import Workout   from './pages/Workout';
import Progress  from './pages/Progress';
import Profile   from './pages/Profile';

// ── Protected Route ─────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading, initialized } = useAuth();
  if (!initialized || loading) return <AppLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// ── App Shell ────────────────────────────────────────────────────────────────
const AppShell = ({ children }) => (
  <div className="min-h-dvh bg-forge-900">
    <Sidebar />
    <Navbar />
    {/* Desktop: left margin for sidebar. Mobile: top + bottom nav offsets */}
    <main className="lg:ml-[240px] pt-14 lg:pt-0 pb-[64px] lg:pb-0">
      {children}
    </main>
    <BottomNav />
  </div>
);

// ── Full-screen loader ───────────────────────────────────────────────────────
const AppLoader = () => (
  <div className="min-h-dvh bg-forge-900 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-amber-glow animate-pulse-slow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-6 h-6 text-forge-950">
          <path d="M6 4v6m0 4v6M18 4v6m0 4v6M2 9h4m12 0h4M2 15h4m12 0h4" />
        </svg>
      </div>
      <p className="font-mono text-xs text-forge-500 tracking-widest animate-pulse">LOADING...</p>
    </div>
  </div>
);

// ── Router ───────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { user, initialized } = useAuth();
  if (!initialized) return <AppLoader />;

  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>
      } />
      <Route path="/nutrition" element={
        <ProtectedRoute><AppShell><Nutrition /></AppShell></ProtectedRoute>
      } />
      <Route path="/workout" element={
        <ProtectedRoute><AppShell><Workout /></AppShell></ProtectedRoute>
      } />
      <Route path="/progress" element={
        <ProtectedRoute><AppShell><Progress /></AppShell></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><AppShell><Profile /></AppShell></ProtectedRoute>
      } />

      <Route path="/"  element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="*"  element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
};

// ── Root App ─────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>

        {/* PWA System UI — always mounted */}
        <OfflineBanner />
        <UpdateBanner />
        <InstallPrompt />

        <AppRoutes />

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#181c26',
              color: '#94a3b8',
              border: '1px solid #323a4e',
              borderRadius: '10px',
              fontFamily: '"DM Mono", monospace',
              fontSize: '13px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#84cc16', secondary: '#0f1117' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0f1117' } },
          }}
        />

      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
