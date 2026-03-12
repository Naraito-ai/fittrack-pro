import { useLocation } from 'react-router-dom';
import { NetworkIndicator } from '../ui/PWAPrompt';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/nutrition': 'Nutrition',
  '/workout':   'Workout',
  '/progress':  'Progress',
  '/profile':   'Profile',
};

const Navbar = () => {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'FitTrack Pro';

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-forge-950/95 backdrop-blur-md border-b border-forge-800 h-14 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shadow-amber-glow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5 text-forge-950">
            <path d="M6 4v6m0 4v6M18 4v6m0 4v6M2 9h4m12 0h4M2 15h4m12 0h4" />
          </svg>
        </div>
        <h1 className="font-display font-700 text-white text-lg tracking-wide uppercase">{title}</h1>
      </div>
      {/* Network status dot */}
      <div className="pr-1">
        <NetworkIndicator />
      </div>
    </header>
  );
};

export default Navbar;
