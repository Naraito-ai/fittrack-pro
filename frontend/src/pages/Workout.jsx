import { useEffect, useState, useMemo } from 'react';
import { useWorkout } from '../hooks/useWorkout';
import WorkoutForm from '../components/workout/WorkoutForm';
import WorkoutCard from '../components/workout/WorkoutCard';
import WorkoutHistory from '../components/workout/WorkoutHistory';
import VolumeChart from '../components/charts/VolumeChart';
import Modal from '../components/ui/Modal';
import { todayStr, formatDate } from '../utils/dateHelpers';
import { addDays, subDays, format } from 'date-fns';
import toast from 'react-hot-toast';

const Workout = () => {
  const {
    logs, history, exercises,
    fetchLogs, fetchHistory, fetchExercises,
    addLog, updateLog, deleteLog,
  } = useWorkout();

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);
  const [historyPeriod, setHistoryPeriod] = useState(30);

  // Load logs when date changes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchLogs(selectedDate);
      setLoading(false);
    };
    load();
  }, [selectedDate]);

  // Load history & exercises on mount / period change
  useEffect(() => {
    fetchHistory(historyPeriod);
    fetchExercises();
  }, [historyPeriod]);

  const isSelectedToday = selectedDate === todayStr();

  // Group logs by exercise name
  const groupedByExercise = useMemo(() => {
    const groups = {};
    logs.forEach(log => {
      const name = log.exerciseName;
      if (!groups[name]) groups[name] = { sets: [], muscleGroup: log.muscleGroup };
      groups[name].sets.push(log);
    });
    return groups;
  }, [logs]);

  // Daily totals
  const dailyTotals = useMemo(() => ({
    exercises: Object.keys(groupedByExercise).length,
    sets: logs.length,
    volume: logs.reduce((s, l) => s + (l.volume || 0), 0),
    totalReps: logs.reduce((s, l) => s + l.reps * l.sets, 0),
  }), [logs, groupedByExercise]);

  const navigateDate = (dir) => {
    const cur = new Date(selectedDate + 'T12:00:00');
    const next = dir === 'prev' ? subDays(cur, 1) : addDays(cur, 1);
    const nextStr = format(next, 'yyyy-MM-dd');
    if (nextStr <= todayStr()) setSelectedDate(nextStr);
  };

  const handleAddWorkout = async (payload) => {
    try {
      await addLog({ ...payload, date: selectedDate });
      await fetchHistory(historyPeriod);
      toast.success('Set logged! 💪');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log set');
      throw err;
    }
  };

  const handleUpdateWorkout = async (payload) => {
    try {
      await updateLog(editingLog._id, payload);
      await fetchHistory(historyPeriod);
      toast.success('Set updated');
    } catch (err) {
      toast.error('Failed to update set');
      throw err;
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await deleteLog(id);
      await fetchHistory(historyPeriod);
      toast.success('Set removed');
    } catch (err) {
      toast.error('Failed to delete set');
    }
  };

  const openEdit = (log) => {
    setEditingLog(log);
    setShowAddModal(true);
  };

  const openAdd = (prefill = null) => {
    setEditingLog(prefill);
    setShowAddModal(true);
  };

  const volumeDisplay = dailyTotals.volume >= 1000
    ? `${(dailyTotals.volume / 1000).toFixed(1)}k`
    : Math.round(dailyTotals.volume).toLocaleString();

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="font-display font-800 text-2xl text-white tracking-wide">Workout</h1>
          <p className="font-mono text-xs text-forge-500 mt-0.5">Iron doesn't lie. Neither do your logs.</p>
        </div>
        <button
          onClick={() => openAdd(null)}
          className="btn-primary"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
          </svg>
          Log Set
        </button>
      </div>

      {/* ── Date Navigator ── */}
      <div className="flex items-center justify-between animate-slide-up">
        <button onClick={() => navigateDate('prev')} className="btn-ghost p-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={() => setSelectedDate(todayStr())} className="flex flex-col items-center group">
          <span className={`font-display font-700 text-base tracking-wide transition-colors ${isSelectedToday ? 'text-amber-400' : 'text-white group-hover:text-amber-400'}`}>
            {isSelectedToday ? 'Today' : formatDate(selectedDate + 'T12:00:00', 'EEE, MMM d')}
          </span>
          {!isSelectedToday && (
            <span className="font-mono text-xs text-forge-500 group-hover:text-amber-500">tap for today</span>
          )}
        </button>
        <button
          onClick={() => navigateDate('next')}
          disabled={isSelectedToday}
          className="btn-ghost p-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-forge-800 p-1 rounded-xl animate-slide-up">
        {[
          { key: 'today',   label: 'Today\'s Session' },
          { key: 'history', label: 'History' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 text-sm font-display font-600 tracking-wide rounded-lg transition-all ${
              activeTab === key
                ? 'bg-forge-950 text-white shadow-forge'
                : 'text-forge-500 hover:text-forge-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'today' ? (
        <>
          {/* ── Daily Summary Strip ── */}
          {logs.length > 0 && (
            <div className="grid grid-cols-3 gap-3 animate-slide-up">
              {[
                { label: 'Exercises', value: dailyTotals.exercises, color: 'text-white' },
                { label: 'Total Sets', value: dailyTotals.sets, color: 'text-azure-400' },
                { label: 'Volume', value: `${volumeDisplay}kg`, color: 'text-amber-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="card-sm p-3 text-center">
                  <p className="section-title mb-1">{label}</p>
                  <p className={`font-display font-800 text-xl ${color} tabular-nums`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Exercise cards ── */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="font-mono text-xs text-forge-500 animate-pulse tracking-widest">LOADING...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-forge-800 border border-forge-700 flex items-center justify-center text-2xl">🏋️</div>
              <p className="font-display font-600 text-white">
                {isSelectedToday ? 'No sets logged today' : 'Rest day'}
              </p>
              <p className="font-mono text-xs text-forge-500">
                {isSelectedToday ? 'Start logging your workout' : 'No workout logged for this day'}
              </p>
              {isSelectedToday && (
                <button onClick={() => openAdd(null)} className="btn-primary mt-2">
                  Start Workout
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedByExercise).map(([exerciseName, { sets, muscleGroup }]) => (
                <WorkoutCard
                  key={exerciseName}
                  exerciseName={exerciseName}
                  sets={sets}
                  muscleGroup={muscleGroup}
                  onEdit={(log) => {
                    if (log._isNewSet) {
                      // prefill form with last set values
                      openAdd({ exerciseName: log.exerciseName, muscleGroup: log.muscleGroup, weightKg: log.weightKg, reps: log.reps, sets: 1 });
                    } else {
                      openEdit(log);
                    }
                  }}
                  onDelete={handleDeleteWorkout}
                />
              ))}

              {/* Add new exercise button */}
              <button
                onClick={() => openAdd(null)}
                className="w-full card py-4 border-dashed hover:border-amber-500/40 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-2 text-forge-500 hover:text-amber-400"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                </svg>
                <span className="font-display font-600 text-sm tracking-wide">ADD EXERCISE</span>
              </button>
            </div>
          )}
        </>
      ) : (
        /* ── History Tab ── */
        <div className="space-y-4 animate-fade-in">
          {/* Volume chart */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-700 text-white text-base tracking-wide">Volume History</h2>
              <div className="flex gap-1">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setHistoryPeriod(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-display font-600 transition-all ${
                      historyPeriod === d
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-forge-500 hover:text-forge-300'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            <VolumeChart data={history} days={historyPeriod} />
          </div>

          {/* Summary stats */}
          {history.length > 0 && (() => {
            const workoutDays = history.filter(d => d.totalVolume > 0).length;
            const totalVol = history.reduce((s, d) => s + d.totalVolume, 0);
            const avgVol = workoutDays > 0 ? Math.round(totalVol / workoutDays) : 0;
            return (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Sessions', value: workoutDays, color: 'text-lime-400' },
                  { label: 'Total Vol', value: totalVol >= 1000 ? `${(totalVol / 1000).toFixed(1)}k` : Math.round(totalVol), color: 'text-amber-400', unit: 'kg' },
                  { label: 'Avg/Session', value: avgVol >= 1000 ? `${(avgVol / 1000).toFixed(1)}k` : avgVol, color: 'text-azure-400', unit: 'kg' },
                ].map(({ label, value, color, unit }) => (
                  <div key={label} className="card-sm p-3 text-center">
                    <p className="section-title mb-1">{label}</p>
                    <p className={`font-display font-800 text-xl ${color} tabular-nums`}>
                      {value}{unit && <span className="text-forge-500 text-sm font-mono ml-0.5">{unit}</span>}
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Session list */}
          <div>
            <h2 className="section-title mb-3">Past Sessions</h2>
            <WorkoutHistory
              history={history.filter(h => h.logCount > 0)}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setActiveTab('today');
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom padding mobile */}
      <div className="h-4 lg:hidden" />

      {/* ── Modals ── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingLog(null); }}
        title={editingLog && !editingLog._isNewSet ? 'Edit Set' : 'Log Exercise'}
        size="lg"
      >
        <WorkoutForm
          onSubmit={editingLog && !editingLog._isNewSet ? handleUpdateWorkout : handleAddWorkout}
          onClose={() => { setShowAddModal(false); setEditingLog(null); }}
          initialData={editingLog && !editingLog._isNewSet ? editingLog : editingLog}
          existingExercises={exercises}
          date={selectedDate}
        />
      </Modal>
    </div>
  );
};

export default Workout;
