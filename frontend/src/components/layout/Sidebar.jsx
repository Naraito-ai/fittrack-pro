import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/nutrition',
    label: 'Nutrition',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
  },
  {
    to: '/workout',
    label: 'Workout',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <path d="M6 4v6m0 4v6M18 4v6m0 4v6M2 9h4m12 0h4M2 15h4m12 0h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[240px] bg-forge-950 border-r border-forge-800 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-forge-800">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-amber-glow">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-forge-950">
            <path d="M6 4v6m0 4v6M18 4v6m0 4v6M2 9h4m12 0h4M2 15h4m12 0h4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div>
          <div className="font-display font-800 text-white text-base tracking-wide leading-none">FITTRACK</div>
          <div className="font-mono text-xs text-amber-500 tracking-widest leading-none mt-0.5">PRO</div>
        </div>
      </div>

      {/* User pill */}
      <div className="px-4 py-3 border-b border-forge-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-forge-800">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <span className="text-amber-400 font-display font-700 text-xs uppercase">
              {user?.username?.[0] || 'U'}
            </span>
          </div>
          <div className="overflow-hidden">
            <div className="text-white text-sm font-display font-600 truncate leading-none">{user?.username}</div>
            <div className="text-forge-500 text-xs font-mono mt-0.5 capitalize">{user?.fitnessGoal}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="section-title px-3 pb-2">Navigation</p>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display font-600 tracking-wide transition-all duration-150 group
              ${isActive
                ? 'nav-item-active'
                : 'text-forge-400 hover:text-forge-300 hover:bg-forge-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-amber-500' : 'text-forge-500 group-hover:text-forge-400 transition-colors'}>
                  {icon}
                </span>
                {label}
                {isActive && (
                  <div className="ml-auto w-1 h-4 rounded-full bg-amber-500" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-forge-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display font-600 tracking-wide text-forge-500 hover:text-crimson-400 hover:bg-crimson-500/10 transition-all duration-150"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
