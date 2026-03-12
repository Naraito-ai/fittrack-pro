import { useState, useCallback } from 'react';
import api from '../api/axios';
import { todayStr } from '../utils/dates';

export const useNutrition = () => {
  const [logs,        setLogs]        = useState([]);
  const [summary,     setSummary]     = useState(null);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  const fetchLogs = useCallback(async (date = todayStr()) => {
    setLoading(true); setError(null);
    try { const { data } = await api.get(`/nutrition/logs?date=${date}`); setLogs(data.data); }
    catch (e) { setError(e.response?.data?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, []);

  const fetchSummary = useCallback(async (date = todayStr()) => {
    try { const { data } = await api.get(`/nutrition/summary?date=${date}`); setSummary(data.data); } catch {}
  }, []);

  const fetchWeeklyTrend = useCallback(async (days = 7) => {
    try { const { data } = await api.get(`/nutrition/weekly?days=${days}`); setWeeklyTrend(data.data); } catch {}
  }, []);

  const addLog    = useCallback(async (p)     => { const { data } = await api.post('/nutrition/logs', p);          setLogs(prev => [...prev, data.data]); return data.data; }, []);
  const updateLog = useCallback(async (id, p) => { const { data } = await api.put(`/nutrition/logs/${id}`, p);     setLogs(prev => prev.map(l => l._id === id ? data.data : l)); return data.data; }, []);
  const deleteLog = useCallback(async (id)    => { await api.delete(`/nutrition/logs/${id}`);                       setLogs(prev => prev.filter(l => l._id !== id)); }, []);

  return { logs, summary, weeklyTrend, loading, error, fetchLogs, fetchSummary, fetchWeeklyTrend, addLog, updateLog, deleteLog };
};
