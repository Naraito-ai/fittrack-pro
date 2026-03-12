import { useState, useCallback } from 'react';
import api from '../api/axios';
import { todayStr } from '../utils/dates';

export const useWorkout = () => {
  const [logs,      setLogs]      = useState([]);
  const [history,   setHistory]   = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const fetchLogs      = useCallback(async (date = todayStr()) => {
    setLoading(true); setError(null);
    try { const { data } = await api.get(`/workouts/logs?date=${date}`); setLogs(data.data); }
    catch (e) { setError(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  }, []);

  const fetchHistory   = useCallback(async (days = 30)   => { try { const { data } = await api.get(`/workouts/history?days=${days}`);  setHistory(data.data);   } catch {} }, []);
  const fetchExercises = useCallback(async ()             => { try { const { data } = await api.get('/workouts/exercises');              setExercises(data.data); } catch {} }, []);
  const fetchStrength  = useCallback(async (ex, days=90) => { try { const { data } = await api.get(`/workouts/strength/${encodeURIComponent(ex)}?days=${days}`); return data.data; } catch { return []; } }, []);

  const addLog    = useCallback(async (p)     => { const { data } = await api.post('/workouts/logs', p);           setLogs(prev => [...prev, data.data]); return data.data; }, []);
  const updateLog = useCallback(async (id, p) => { const { data } = await api.put(`/workouts/logs/${id}`, p);      setLogs(prev => prev.map(l => l._id === id ? data.data : l)); return data.data; }, []);
  const deleteLog = useCallback(async (id)    => { await api.delete(`/workouts/logs/${id}`);                        setLogs(prev => prev.filter(l => l._id !== id)); }, []);

  return { logs, history, exercises, loading, error, fetchLogs, fetchHistory, fetchExercises, fetchStrength, addLog, updateLog, deleteLog };
};
