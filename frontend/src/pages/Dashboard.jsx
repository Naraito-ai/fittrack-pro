import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNutrition } from '../hooks/useNutrition';
import { useWorkout } from '../hooks/useWorkout';
import { useWeight } from '../hooks/useWeight';
import MacroBar from '../components/ui/MacroBar';
import StatCard from '../components/ui/StatCard';
import { todayStr, formatDate } from '../utils/dateHelpers';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const { summary, fetchSummary, weeklyTrend, fetchWeeklyTrend } = useNutrition();
  const { history, fetchHistory } = useWorkout();
  const { logs: weightLogs, fetchLogs: fetchWeightLogs } = useWeight();
  const [loadingAll, setLoadingAll] = useState(true);

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        fetchSummary(todayStr()),
        fetchWeeklyTrend(7),
        fetchHistory(7),
        fetchWeightLogs(),
      ]);
      setLoadingAll(false);
    };
    load();
  }, []);

  const latestWeight = weightLogs[0]?.bodyWeight;
  const todayWorkout = history.find(h => h._id === todayStr());
  const weeklyWorkouts = history.length;

  const avgCalories = weeklyTrend.length
    ? Math.round(weeklyTrend.reduce((s, d) => s + d.totalCalories, 0) / weeklyTrend.length)
    : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <p className="font-mono text-xs text-forge-500 tracking-widest uppercase mb-1">
            {formatDate(new Date(), 'EEEE, MMM d')}
          </p>
          <h1 className="font-display font-800 text-2xl text-white leading-tight">
            {greeting()},<br />
            <span className="text-amber-400">{user?.username}</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="section-title mb-1">Goal</p>
          <span className="badge bg-amber-500/15 text-amber-400 border border-amber-500/25 capitalize">
            {user?.fitnessGoal}
          </span>
        </div>
      </div>

      {/* Today's Macros */}
      <div className="card p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-700 text-white text-base tracking-wide">Today's Nutrition</h2>
          <Link to="/nutrition" className="text-amber-500 hover:text-amber-400 text-xs font-display font-600 tracking-wide transition-colors">
            LOG FOOD →
          </Link>
        </div>
        <div className="space-y-4">
          <MacroBar label="Calories" current={summary?.totalCalories || 0} target={user?.dailyCalorieTarget || 2000} unit="kcal" type="calories" />
          <MacroBar label="Protein" current={summary?.totalProtein || 0} target={user?.proteinTarget || 150} type="protein" />
          <MacroBar label="Fat" current={summary?.totalFats || 0} target={user?.fatTarget || 65} type="fats" />
          <MacroBar label="Carbs" current={summary?.totalCarbs || 0} target={user?.carbTarget || 250} type="carbs" />
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="section-title mb-3">This Week</h2>
        <div className="grid grid-cols-2 gap-3 stagger-children">
          <StatCard
            label="Avg Calories"
            value={avgCalories}
            unit="kcal"
            color="amber"
            sub="7-day average"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg>}
          />
          <StatCard
            label="Workouts"
            value={weeklyWorkouts}
            unit="sessions"
            color="green"
            sub="Last 7 days"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4"><path d="M6 4v6m0 4v6M18 4v6m0 4v6M2 9h4m12 0h4M2 15h4m12 0h4" strokeLinecap="round"/></svg>}
          />
          <StatCard
            label="Body Weight"
            value={latestWeight}
            unit="kg"
            color="blue"
            sub={weightLogs[0] ? formatDate(weightLogs[0].date, 'MMM d') : 'No entries'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3" strokeLinecap="round"/></svg>}
          />
          <StatCard
            label="Today's Volume"
            value={todayWorkout ? Math.round(todayWorkout.totalVolume) : 0}
            unit="kg"
            color="orange"
            sub={todayWorkout ? `${todayWorkout.totalSets} sets` : 'Rest day'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
        </div>
      </div>

      {/* Recent Workout Sessions */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">Recent Sessions</h2>
            <Link to="/workout" className="text-amber-500 hover:text-amber-400 text-xs font-display font-600 tracking-wide transition-colors">
              VIEW ALL →
            </Link>
          </div>
          <div className="space-y-2">
            {history.slice(0, 3).map((session) => (
              <div key={session._id} className="card-sm px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-display font-600 text-white text-sm">{session._id}</p>
                  <p className="font-mono text-xs text-forge-500 mt-0.5">
                    {session.exercises?.slice(0, 2).join(', ')}
                    {session.exercises?.length > 2 ? ` +${session.exercises.length - 2}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-500 text-amber-400 text-sm">{Math.round(session.totalVolume)} kg</p>
                  <p className="font-mono text-xs text-forge-500">{session.totalSets} sets</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="section-title mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/nutrition" className="card p-4 flex items-center gap-3 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/20 transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="font-display font-600 text-white text-sm">Log Food</p>
              <p className="font-mono text-xs text-forge-500">Track macros</p>
            </div>
          </Link>
          <Link to="/workout" className="card p-4 flex items-center gap-3 hover:border-lime-500/30 hover:bg-lime-500/5 transition-all group">
            <div className="w-9 h-9 rounded-lg bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 group-hover:bg-lime-500/20 transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
                <path d="M6 4v6m0 4v6M18 4v6m0 4v6M2 9h4m12 0h4M2 15h4m12 0h4" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="font-display font-600 text-white text-sm">Log Workout</p>
              <p className="font-mono text-xs text-forge-500">Track lifts</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="h-4 lg:hidden" />
    </div>
  );
};

export default Dashboard;
