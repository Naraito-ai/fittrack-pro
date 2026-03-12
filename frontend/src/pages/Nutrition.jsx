import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNutrition } from '../hooks/useNutrition';
import MacroBar from '../components/ui/MacroBar';
import Modal from '../components/ui/Modal';
import FoodLogForm from '../components/nutrition/FoodLogForm';
import FoodLogItem from '../components/nutrition/FoodLogItem';
import MacroRing from '../components/nutrition/MacroRing';
import CalorieChart from '../components/charts/CalorieChart';
import { todayStr, formatDate } from '../utils/dateHelpers';
import toast from 'react-hot-toast';
import { addDays, subDays, format } from 'date-fns';

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '⚡' };

const Nutrition = () => {
  const { user } = useAuth();
  const { logs, summary, weeklyTrend, fetchLogs, fetchSummary, fetchWeeklyTrend, addLog, updateLog, deleteLog } = useNutrition();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchLogs(selectedDate), fetchSummary(selectedDate)]);
      setLoading(false);
    };
    load();
  }, [selectedDate]);

  useEffect(() => { fetchWeeklyTrend(7); }, []);

  const groupedLogs = useMemo(() => {
    const groups = {};
    MEAL_ORDER.forEach(m => { groups[m] = []; });
    logs.forEach(log => {
      const meal = log.mealType || 'snack';
      if (!groups[meal]) groups[meal] = [];
      groups[meal].push(log);
    });
    return groups;
  }, [logs]);

  const targets = { calories: user?.dailyCalorieTarget || 2000, protein: user?.proteinTarget || 150, fats: user?.fatTarget || 65, carbs: user?.carbTarget || 250 };
  const current = { calories: summary?.totalCalories || 0, protein: summary?.totalProtein || 0, fats: summary?.totalFats || 0, carbs: summary?.totalCarbs || 0 };
  const isOver = current.calories > targets.calories;
  const caloriePct = Math.min((current.calories / targets.calories) * 100, 100);
  const isSelectedToday = selectedDate === todayStr();

  const navigateDate = (dir) => {
    const cur = new Date(selectedDate + 'T12:00:00');
    const next = dir === 'prev' ? subDays(cur, 1) : addDays(cur, 1);
    const nextStr = format(next, 'yyyy-MM-dd');
    if (nextStr <= todayStr()) setSelectedDate(nextStr);
  };

  const handleAddFood = async (payload) => {
    try {
      await addLog({ ...payload, date: selectedDate });
      await Promise.all([fetchSummary(selectedDate), fetchWeeklyTrend(7)]);
      toast.success('Food logged!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to log food'); throw err; }
  };

  const handleUpdateFood = async (payload) => {
    try {
      await updateLog(editingLog._id, payload);
      await fetchSummary(selectedDate);
      toast.success('Entry updated');
    } catch (err) { toast.error('Failed to update entry'); throw err; }
  };

  const handleDeleteFood = async (id) => {
    try {
      await deleteLog(id);
      await Promise.all([fetchSummary(selectedDate), fetchWeeklyTrend(7)]);
      toast.success('Entry removed');
    } catch (err) { toast.error('Failed to delete entry'); }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="font-display font-800 text-2xl text-white tracking-wide">Nutrition</h1>
          <p className="font-mono text-xs text-forge-500 mt-0.5">Track every macro. Own every meal.</p>
        </div>
        <button onClick={() => { setEditingLog(null); setShowAddModal(true); }} className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
          Log Food
        </button>
      </div>

      {/* Date Navigator */}
      <div className="flex items-center justify-between animate-slide-up">
        <button onClick={() => navigateDate('prev')} className="btn-ghost p-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button onClick={() => setSelectedDate(todayStr())} className="flex flex-col items-center group">
          <span className={`font-display font-700 text-base tracking-wide transition-colors ${isSelectedToday ? 'text-amber-400' : 'text-white group-hover:text-amber-400'}`}>
            {isSelectedToday ? 'Today' : formatDate(selectedDate + 'T12:00:00', 'EEE, MMM d')}
          </span>
          {!isSelectedToday && <span className="font-mono text-xs text-forge-500 group-hover:text-amber-500">tap for today</span>}
        </button>
        <button onClick={() => navigateDate('next')} disabled={isSelectedToday} className="btn-ghost p-2 disabled:opacity-30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-forge-800 p-1 rounded-xl animate-slide-up">
        {[{ key: 'today', label: 'Daily View' }, { key: 'weekly', label: '7-Day Trend' }].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 text-sm font-display font-600 tracking-wide rounded-lg transition-all ${activeTab === key ? 'bg-forge-950 text-white shadow-forge' : 'text-forge-500 hover:text-forge-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'today' ? (
        <>
          {/* Summary Card */}
          <div className="card p-5 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <MacroRing protein={current.protein} fats={current.fats} carbs={current.carbs} calories={current.calories} targetCalories={targets.calories} size={110} />
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <MacroBar label="Calories" current={current.calories} target={targets.calories} unit="kcal" type="calories" compact />
                <MacroBar label="Protein"  current={current.protein}  target={targets.protein}  unit="g"    type="protein"  compact />
                <MacroBar label="Fat"      current={current.fats}     target={targets.fats}     unit="g"    type="fats"     compact />
                <MacroBar label="Carbs"    current={current.carbs}    target={targets.carbs}    unit="g"    type="carbs"    compact />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-forge-700 flex items-center justify-between">
              <div className="text-center">
                <p className="font-mono text-xs text-forge-500">Goal</p>
                <p className="font-display font-700 text-white text-lg tabular-nums">{targets.calories}</p>
              </div>
              <div className="flex-1 px-4">
                <div className="h-1 bg-forge-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-crimson-500' : 'bg-amber-500'}`} style={{ width: `${caloriePct}%` }} />
                </div>
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-forge-500">{isOver ? 'Over' : 'Left'}</p>
                <p className={`font-display font-700 text-lg tabular-nums ${isOver ? 'text-crimson-400' : 'text-amber-400'}`}>
                  {isOver ? Math.round(current.calories - targets.calories) : Math.round(targets.calories - current.calories)}
                </p>
              </div>
            </div>
          </div>

          {/* Food logs */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="font-mono text-xs text-forge-500 animate-pulse tracking-widest">LOADING...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-forge-800 border border-forge-700 flex items-center justify-center text-2xl">🥗</div>
              <p className="font-display font-600 text-white">Nothing logged yet</p>
              <p className="font-mono text-xs text-forge-500">Add your first meal to start tracking</p>
              <button onClick={() => setShowAddModal(true)} className="btn-primary mt-2">Log First Meal</button>
            </div>
          ) : (
            <div className="space-y-3">
              {MEAL_ORDER.map((meal) => {
                const mealLogs = groupedLogs[meal];
                if (!mealLogs || mealLogs.length === 0) return null;
                const mealCals = Math.round(mealLogs.reduce((s, l) => s + l.calories * l.quantity, 0));
                const mealProtein = Math.round(mealLogs.reduce((s, l) => s + l.protein * l.quantity, 0) * 10) / 10;
                return (
                  <div key={meal} className="card overflow-hidden animate-slide-up">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-forge-700 bg-forge-750/50">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{MEAL_ICONS[meal]}</span>
                        <span className="font-display font-700 text-white text-sm tracking-wide capitalize">{meal}</span>
                        <span className="font-mono text-xs text-forge-500">{mealLogs.length} item{mealLogs.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-azure-400">{mealProtein}g P</span>
                        <span className="font-mono font-500 text-amber-400 text-sm">{mealCals} kcal</span>
                      </div>
                    </div>
                    <div className="px-1 py-1 divide-y divide-forge-750">
                      {mealLogs.map((log) => (
                        <FoodLogItem key={log._id} log={log}
                          onEdit={(log) => { setEditingLog(log); setShowAddModal(true); }}
                          onDelete={handleDeleteFood} />
                      ))}
                    </div>
                    <div className="px-4 pb-3 pt-1">
                      <button onClick={() => { setEditingLog(null); setShowAddModal(true); }}
                        className="text-xs text-forge-500 hover:text-amber-400 font-display font-600 tracking-wide transition-colors flex items-center gap-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
                        ADD TO {meal.toUpperCase()}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Weekly Tab */
        <div className="space-y-4 animate-fade-in">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-700 text-white text-base tracking-wide">7-Day Calories</h2>
              <span className="font-mono text-xs text-forge-500">target: {targets.calories} kcal</span>
            </div>
            <CalorieChart data={weeklyTrend} targetCalories={targets.calories} days={7} />
          </div>
          <div className="card p-5">
            <h2 className="font-display font-700 text-white text-base tracking-wide mb-4 border-b border-forge-700 pb-3">7-Day Averages</h2>
            <div className="space-y-3">
              {weeklyTrend.length > 0 ? (() => {
                const avg = {
                  cals: Math.round(weeklyTrend.reduce((s, d) => s + d.totalCalories, 0) / weeklyTrend.length),
                  protein: Math.round(weeklyTrend.reduce((s, d) => s + d.totalProtein, 0) / weeklyTrend.length * 10) / 10,
                  fats: Math.round(weeklyTrend.reduce((s, d) => s + d.totalFats, 0) / weeklyTrend.length * 10) / 10,
                  carbs: Math.round(weeklyTrend.reduce((s, d) => s + d.totalCarbs, 0) / weeklyTrend.length * 10) / 10,
                };
                return (<>
                  <MacroBar label="Avg Calories" current={avg.cals}    target={targets.calories} unit="kcal" type="calories" />
                  <MacroBar label="Avg Protein"  current={avg.protein} target={targets.protein}  unit="g"    type="protein" />
                  <MacroBar label="Avg Fat"      current={avg.fats}    target={targets.fats}     unit="g"    type="fats" />
                  <MacroBar label="Avg Carbs"    current={avg.carbs}   target={targets.carbs}    unit="g"    type="carbs" />
                </>);
              })() : (
                <p className="font-mono text-xs text-forge-500 text-center py-4">No data yet — start logging meals!</p>
              )}
            </div>
          </div>
          {weeklyTrend.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-forge-700">
                <h2 className="font-display font-700 text-white text-base tracking-wide">Daily Breakdown</h2>
              </div>
              <div className="divide-y divide-forge-750">
                {[...weeklyTrend].reverse().map((day) => {
                  const isOverDay = day.totalCalories > targets.calories;
                  return (
                    <div key={day._id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="font-display font-600 text-white text-sm">{formatDate(day._id + 'T12:00:00', 'EEE, MMM d')}</p>
                        <p className="font-mono text-xs text-forge-500 mt-0.5">
                          <span className="text-azure-400">{Math.round(day.totalProtein)}g P</span> · <span className="text-tangerine-400">{Math.round(day.totalFats)}g F</span> · <span className="text-teal-400">{Math.round(day.totalCarbs)}g C</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-500 text-sm tabular-nums ${isOverDay ? 'text-crimson-400' : 'text-amber-400'}`}>{Math.round(day.totalCalories)}</span>
                        <span className="font-mono text-xs text-forge-500"> kcal</span>
                        {isOverDay && <p className="font-mono text-xs text-crimson-400/70">+{Math.round(day.totalCalories - targets.calories)}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="h-4 lg:hidden" />

      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setEditingLog(null); }} title={editingLog ? 'Edit Food Entry' : 'Log Food'}>
        <FoodLogForm onSubmit={editingLog ? handleUpdateFood : handleAddFood} onClose={() => { setShowAddModal(false); setEditingLog(null); }} initialData={editingLog} date={selectedDate} />
      </Modal>
    </div>
  );
};

export default Nutrition;
