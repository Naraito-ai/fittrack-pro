import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeight } from '../hooks/useWeight';
import { useWorkout } from '../hooks/useWorkout';
import WeightChart from '../components/charts/WeightChart';
import StrengthChart from '../components/charts/StrengthChart';
import FrequencyHeatmap from '../components/charts/FrequencyHeatmap';
import WeightLogForm from '../components/ui/WeightLogForm';
import Modal from '../components/ui/Modal';
import { formatDate } from '../utils/dateHelpers';
import toast from 'react-hot-toast';

const PERIODS = [
  { key: '30d',  label: '30D' },
  { key: '90d',  label: '3M'  },
  { key: '6m',   label: '6M'  },
  { key: '1y',   label: '1Y'  },
];

const Progress = () => {
  const { user } = useAuth();
  const { trend, stats, logs: weightLogs, fetchTrend, fetchLogs, addLog, deleteLog } = useWeight();
  const { exercises, history, fetchExercises, fetchHistory, fetchStrengthProgress } = useWorkout();

  const [activeTab,       setActiveTab]       = useState('weight');
  const [weightPeriod,    setWeightPeriod]     = useState('90d');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [strengthData,    setStrengthData]     = useState([]);
  const [strengthLoading, setStrengthLoading]  = useState(false);
  const [showWeightModal, setShowWeightModal]  = useState(false);
  const [heatmapWeeks,    setHeatmapWeeks]     = useState(13);
  const [loading,         setLoading]          = useState(true);

  // Initial data load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchTrend(weightPeriod),
        fetchLogs(),
        fetchExercises(),
        fetchHistory(90),
      ]);
      setLoading(false);
    };
    load();
  }, []);

  // Reload weight trend when period changes
  useEffect(() => {
    fetchTrend(weightPeriod);
  }, [weightPeriod]);

  // Load strength data when exercise selection changes
  useEffect(() => {
    if (!selectedExercise) return;
    const load = async () => {
      setStrengthLoading(true);
      const data = await fetchStrengthProgress(selectedExercise, 90);
      setStrengthData(data);
      setStrengthLoading(false);
    };
    load();
  }, [selectedExercise]);

  // Auto-select first exercise
  useEffect(() => {
    if (exercises.length > 0 && !selectedExercise) {
      setSelectedExercise(exercises[0]);
    }
  }, [exercises]);

  const handleLogWeight = async (payload) => {
    try {
      await addLog(payload);
      await Promise.all([fetchTrend(weightPeriod), fetchLogs()]);
      toast.success('Weight logged! 🎯');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log weight');
      throw err;
    }
  };

  const handleDeleteWeight = async (id) => {
    try {
      await deleteLog(id);
      await Promise.all([fetchTrend(weightPeriod), fetchLogs()]);
      toast.success('Entry deleted');
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  const latestWeight  = weightLogs[0]?.bodyWeight;
  const startWeight   = stats?.start;
  const totalChange   = stats?.change;
  const isGain        = totalChange >= 0;

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="font-display font-800 text-2xl text-white tracking-wide">Progress</h1>
          <p className="font-mono text-xs text-forge-500 mt-0.5">Data doesn't lie. Charts don't either.</p>
        </div>
        <button onClick={() => setShowWeightModal(true)} className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
          </svg>
          Log Weight
        </button>
      </div>

      {/* ── Tab selector ── */}
      <div className="flex gap-1 bg-forge-800 p-1 rounded-xl animate-slide-up">
        {[
          { key: 'weight',    label: '⚖️ Weight'   },
          { key: 'strength',  label: '💪 Strength'  },
          { key: 'frequency', label: '📅 Frequency' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 text-xs sm:text-sm font-display font-600 tracking-wide rounded-lg transition-all ${
              activeTab === key
                ? 'bg-forge-950 text-white shadow-forge'
                : 'text-forge-500 hover:text-forge-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* WEIGHT TAB                                                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'weight' && (
        <div className="space-y-4 animate-fade-in">

          {/* Period picker */}
          <div className="flex items-center justify-between">
            <h2 className="section-title">Body Weight Trend</h2>
            <div className="flex gap-1">
              {PERIODS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setWeightPeriod(key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-display font-600 transition-all ${
                    weightPeriod === key
                      ? 'bg-azure-500/20 text-azure-400 border border-azure-500/30'
                      : 'text-forge-500 hover:text-forge-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Stat strip */}
          {stats && (
            <div className="grid grid-cols-4 gap-2 animate-slide-up">
              {[
                { label: 'Current',  value: latestWeight,                    unit: 'kg', color: 'text-azure-400' },
                { label: 'Start',    value: startWeight,                     unit: 'kg', color: 'text-forge-300' },
                { label: 'Change',   value: totalChange != null ? `${totalChange > 0 ? '+' : ''}${totalChange}` : '—', unit: 'kg', color: isGain ? 'text-tangerine-400' : 'text-lime-400' },
                { label: 'Entries',  value: weightLogs.length,               unit: '',   color: 'text-forge-300' },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="card-sm p-3 text-center">
                  <p className="section-title mb-1">{label}</p>
                  <p className={`font-display font-800 text-base sm:text-lg tabular-nums ${color}`}>
                    {value ?? '—'}
                    {unit && <span className="text-forge-500 text-xs ml-0.5">{unit}</span>}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Chart */}
          <div className="card p-5 animate-slide-up">
            <WeightChart data={trend} height={220} />
          </div>

          {/* Min / Max */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 animate-slide-up">
              <div className="card-sm p-4">
                <p className="section-title mb-2">Lowest</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-800 text-xl text-lime-400 tabular-nums">{stats.min}</span>
                  <span className="font-mono text-xs text-forge-500">kg</span>
                </div>
                <p className="font-mono text-xs text-forge-500 mt-1">in this period</p>
              </div>
              <div className="card-sm p-4">
                <p className="section-title mb-2">Highest</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-800 text-xl text-tangerine-400 tabular-nums">{stats.max}</span>
                  <span className="font-mono text-xs text-forge-500">kg</span>
                </div>
                <p className="font-mono text-xs text-forge-500 mt-1">in this period</p>
              </div>
            </div>
          )}

          {/* Weight log history */}
          {weightLogs.length > 0 && (
            <div className="card overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between px-5 py-3 border-b border-forge-700">
                <h2 className="font-display font-700 text-white text-base tracking-wide">Weight Log</h2>
                <span className="font-mono text-xs text-forge-500">{weightLogs.length} entries</span>
              </div>
              <div className="divide-y divide-forge-750 max-h-80 overflow-y-auto">
                {weightLogs.slice(0, 20).map((entry, i) => {
                  const prev = weightLogs[i + 1];
                  const diff = prev ? entry.bodyWeight - prev.bodyWeight : null;
                  return (
                    <div key={entry._id} className="flex items-center justify-between px-5 py-3 group hover:bg-forge-750/40 transition-colors">
                      <div>
                        <p className="font-display font-600 text-white text-sm">
                          {formatDate(entry.date, 'EEE, MMM d yyyy')}
                        </p>
                        {entry.note && (
                          <p className="font-mono text-xs text-forge-500 mt-0.5 italic">"{entry.note}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {diff !== null && (
                          <span className={`font-mono text-xs ${diff > 0 ? 'text-tangerine-400' : diff < 0 ? 'text-lime-400' : 'text-forge-500'}`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                          </span>
                        )}
                        <span className="font-mono font-500 text-azure-400 text-sm tabular-nums">
                          {entry.bodyWeight} <span className="text-forge-500 text-xs">kg</span>
                        </span>
                        <button
                          onClick={() => handleDeleteWeight(entry._id)}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-forge-600 hover:text-crimson-400 hover:bg-crimson-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {weightLogs.length === 0 && !loading && (
            <div className="empty-state animate-fade-in">
              <div className="text-3xl">⚖️</div>
              <p className="font-display font-600 text-white">No weight entries yet</p>
              <p className="font-mono text-xs text-forge-500">Log your body weight to start tracking progress</p>
              <button onClick={() => setShowWeightModal(true)} className="btn-primary mt-2">
                Log First Weight
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STRENGTH TAB                                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'strength' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Strength Progress</h2>
          </div>

          {exercises.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <div className="text-3xl">💪</div>
              <p className="font-display font-600 text-white">No exercises logged yet</p>
              <p className="font-mono text-xs text-forge-500">Log workouts to track strength progress</p>
            </div>
          ) : (
            <>
              {/* Exercise picker */}
              <div className="card p-4 animate-slide-up">
                <label className="input-label mb-2">Select Exercise</label>
                <div className="flex flex-wrap gap-2">
                  {exercises.slice(0, 20).map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setSelectedExercise(ex)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-display font-600 tracking-wide transition-all ${
                        selectedExercise === ex
                          ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                          : 'border-forge-600 text-forge-400 hover:border-forge-500 hover:text-forge-300'
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strength chart */}
              {selectedExercise && (
                <div className="card p-5 animate-slide-up">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-display font-700 text-white text-base tracking-wide">{selectedExercise}</h2>
                    <span className="font-mono text-xs text-forge-500">Last 90 days</span>
                  </div>
                  <p className="font-mono text-xs text-forge-500 mb-4">
                    <span className="text-amber-400">━━</span> Max Weight (kg)
                    {'  '}
                    <span className="text-lime-400">╌╌</span> Volume (tonnes)
                  </p>

                  {strengthLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="font-mono text-xs text-forge-500 animate-pulse tracking-widest">LOADING...</div>
                    </div>
                  ) : (
                    <StrengthChart data={strengthData} exerciseName={selectedExercise} height={200} />
                  )}

                  {/* PR summary */}
                  {strengthData.length > 0 && (() => {
                    const maxW = Math.max(...strengthData.map(d => d.maxWeight));
                    const totalVol = strengthData.reduce((s, d) => s + d.totalVolume, 0);
                    const sessions = strengthData.length;
                    const firstW = strengthData[0]?.maxWeight;
                    const lastW = strengthData[strengthData.length - 1]?.maxWeight;
                    const improvement = firstW > 0 ? Math.round((lastW - firstW) / firstW * 100) : 0;
                    return (
                      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-forge-700">
                        <div className="text-center">
                          <p className="section-title mb-1">PR</p>
                          <p className="font-display font-800 text-xl text-amber-400 tabular-nums">
                            {maxW}<span className="text-forge-500 text-sm ml-0.5">kg</span>
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="section-title mb-1">Sessions</p>
                          <p className="font-display font-800 text-xl text-forge-300 tabular-nums">{sessions}</p>
                        </div>
                        <div className="text-center">
                          <p className="section-title mb-1">Progress</p>
                          <p className={`font-display font-800 text-xl tabular-nums ${improvement >= 0 ? 'text-lime-400' : 'text-crimson-400'}`}>
                            {improvement >= 0 ? '+' : ''}{improvement}%
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* FREQUENCY TAB                                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'frequency' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Workout Frequency</h2>
            <div className="flex gap-1">
              {[13, 26, 52].map((w) => (
                <button
                  key={w}
                  onClick={() => setHeatmapWeeks(w)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-display font-600 transition-all ${
                    heatmapWeeks === w
                      ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                      : 'text-forge-500 hover:text-forge-300'
                  }`}
                >
                  {w === 13 ? '3M' : w === 26 ? '6M' : '1Y'}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5 animate-slide-up">
            <FrequencyHeatmap data={history} weeks={heatmapWeeks} />
          </div>

          {/* Weekly breakdown */}
          {history.length > 0 && (() => {
            const workoutDays = history.filter(d => d.totalVolume > 0);
            const totalWeeks = heatmapWeeks;
            const avgPerWeek = (workoutDays.length / totalWeeks).toFixed(1);
            const totalVolume = history.reduce((s, d) => s + d.totalVolume, 0);

            // Group by week number for frequency bar
            const weeklyFreq = [];
            for (let w = 0; w < Math.min(totalWeeks, 12); w++) {
              const weekEnd = new Date();
              weekEnd.setDate(weekEnd.getDate() - w * 7);
              weekEnd.setHours(23, 59, 59, 999);
              const weekStart = new Date(weekEnd);
              weekStart.setDate(weekEnd.getDate() - 6);
              weekStart.setHours(0, 0, 0, 0);

              const count = workoutDays.filter(d => {
                const date = new Date(d._id + 'T12:00:00');
                return date >= weekStart && date <= weekEnd;
              }).length;

              weeklyFreq.unshift({ week: w, count, label: w === 0 ? 'This wk' : `${w}w ago` });
            }

            return (
              <>
                <div className="grid grid-cols-3 gap-3 animate-slide-up">
                  {[
                    { label: 'Avg/Week',   value: avgPerWeek,  color: 'text-lime-400',    unit: 'days' },
                    { label: 'Sessions',   value: workoutDays.length, color: 'text-amber-400', unit: '' },
                    { label: 'Total Vol',  value: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(0)}k` : Math.round(totalVolume), color: 'text-azure-400', unit: 'kg' },
                  ].map(({ label, value, color, unit }) => (
                    <div key={label} className="card-sm p-3 text-center">
                      <p className="section-title mb-1">{label}</p>
                      <p className={`font-display font-800 text-xl tabular-nums ${color}`}>
                        {value}
                        {unit && <span className="text-forge-500 text-xs ml-0.5">{unit}</span>}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Weekly frequency bar mini-chart */}
                <div className="card p-5 animate-slide-up">
                  <h3 className="section-title mb-4">Weekly Sessions</h3>
                  <div className="flex items-end gap-1.5 h-24">
                    {weeklyFreq.map(({ count, label, week }) => {
                      const pct = count > 0 ? (count / 7) * 100 : 0;
                      return (
                        <div key={week} className="flex-1 flex flex-col items-center gap-1">
                          <span className="font-mono text-[10px] text-forge-500 tabular-nums">{count || ''}</span>
                          <div className="w-full bg-forge-700 rounded-sm overflow-hidden flex-1 relative">
                            <div
                              className={`absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-500 ${week === 0 ? 'bg-lime-400' : 'bg-lime-500/50'}`}
                              style={{ height: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[9px] text-forge-600 whitespace-nowrap" style={{ fontSize: '9px' }}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}

          {history.length === 0 && !loading && (
            <div className="empty-state animate-fade-in">
              <div className="text-3xl">📅</div>
              <p className="font-display font-600 text-white">No workout data yet</p>
              <p className="font-mono text-xs text-forge-500">Log workouts to see your frequency heatmap</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom padding mobile */}
      <div className="h-4 lg:hidden" />

      {/* Weight log modal */}
      <Modal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        title="Log Body Weight"
      >
        <WeightLogForm
          onSubmit={handleLogWeight}
          onClose={() => setShowWeightModal(false)}
          lastWeight={latestWeight}
        />
      </Modal>
    </div>
  );
};

export default Progress;
