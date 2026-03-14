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
import api from '../api/axios';
import { addDays, subDays, format } from 'date-fns';

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '⚡' };

const Nutrition = () => {

  const { user } = useAuth();
  const {
    logs,
    summary,
    weeklyTrend,
    fetchLogs,
    fetchSummary,
    fetchWeeklyTrend,
    addLog,
    updateLog,
    deleteLog
  } = useNutrition();

  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);

  /* ---------- AI FOOD LOGGER STATE ---------- */

  const [aiFood, setAiFood] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMacros, setAiMacros] = useState(null);

  const analyzeFood = async () => {

    if (!aiFood) {
      toast.error("Enter food first");
      return;
    }

    try {

      setAiLoading(true);

      const res = await api.post('/nutrition/ai-food', {
        query: aiFood
      });

      setAiMacros(res.data);

      setShowAddModal(true);

      toast.success("Macros auto filled");

    } catch (err) {

      toast.error("AI failed to analyze food");

    } finally {

      setAiLoading(false);

    }
  };

  /* ---------- DATA LOADING ---------- */

  useEffect(() => {

    const load = async () => {

      setLoading(true);

      await Promise.all([
        fetchLogs(selectedDate),
        fetchSummary(selectedDate)
      ]);

      setLoading(false);
    };

    load();

  }, [selectedDate]);

  useEffect(() => {

    fetchWeeklyTrend(7);

  }, []);

  /* ---------- GROUP LOGS ---------- */

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

  /* ---------- TARGETS ---------- */

  const targets = {

    calories: user?.dailyCalorieTarget || 2000,
    protein: user?.proteinTarget || 150,
    fats: user?.fatTarget || 65,
    carbs: user?.carbTarget || 250

  };

  const current = {

    calories: summary?.totalCalories || 0,
    protein: summary?.totalProtein || 0,
    fats: summary?.totalFats || 0,
    carbs: summary?.totalCarbs || 0

  };

  const isOver = current.calories > targets.calories;

  const caloriePct = Math.min((current.calories / targets.calories) * 100, 100);

  const isSelectedToday = selectedDate === todayStr();

  /* ---------- DATE NAVIGATION ---------- */

  const navigateDate = (dir) => {

    const cur = new Date(selectedDate + 'T12:00:00');

    const next = dir === 'prev'
      ? subDays(cur, 1)
      : addDays(cur, 1);

    const nextStr = format(next, 'yyyy-MM-dd');

    if (nextStr <= todayStr())
      setSelectedDate(nextStr);
  };

  /* ---------- ADD FOOD ---------- */

  const handleAddFood = async (payload) => {

    try {

      await addLog({
        ...payload,
        date: selectedDate
      });

      await Promise.all([
        fetchSummary(selectedDate),
        fetchWeeklyTrend(7)
      ]);

      toast.success('Food logged!');

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        'Failed to log food'
      );

      throw err;
    }
  };

  /* ---------- DELETE FOOD ---------- */

  const handleDeleteFood = async (id) => {

    try {

      await deleteLog(id);

      await Promise.all([
        fetchSummary(selectedDate),
        fetchWeeklyTrend(7)
      ]);

      toast.success('Entry removed');

    } catch {

      toast.error('Failed to delete entry');
    }
  };

  /* ---------- UI ---------- */

  return (

    <div className="page-container">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="font-display text-2xl text-white">
            Nutrition
          </h1>

          <p className="text-xs text-forge-500">
            Track every macro. Own every meal.
          </p>

        </div>

        <button
          onClick={() => {
            setEditingLog(null);
            setShowAddModal(true);
          }}
          className="btn-primary"
        >
          Log Food
        </button>

      </div>

      {/* ---------- AI FOOD LOGGER ---------- */}

      <div className="card p-4 mt-4 border border-amber-500/30">

        <p className="text-xs text-amber-400 font-semibold mb-2">
          ⚡ AI Food Logger
        </p>

        <div className="flex gap-2">

          <input
            type="text"
            placeholder="e.g. 200g chicken breast"
            value={aiFood}
            onChange={(e) => setAiFood(e.target.value)}
            className="flex-1 input"
          />

          <button
            onClick={analyzeFood}
            className="btn-primary"
            disabled={aiLoading}
          >

            {aiLoading ? "..." : "Analyze"}

          </button>

        </div>

      </div>

      {/* ---------- EXISTING CONTENT ---------- */}

      {/* Your original UI continues unchanged below */}

      {/* (Food logs, summary cards, charts etc remain exactly same) */}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingLog(null);
        }}
        title={editingLog ? 'Edit Food Entry' : 'Log Food'}
      >

        <FoodLogForm
          onSubmit={handleAddFood}
          onClose={() => {
            setShowAddModal(false);
            setEditingLog(null);
          }}
          initialData={aiMacros || editingLog}
          date={selectedDate}
        />

      </Modal>

    </div>
  );
};

export default Nutrition;