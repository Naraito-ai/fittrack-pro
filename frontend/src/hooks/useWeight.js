import { useState, useCallback } from 'react';
import api from '../api/axios';

export const useWeight = () => {
  const [logs,    setLogs]    = useState([]);
  const [trend,   setTrend]   = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLogs  = useCallback(async () => { try { const { data } = await api.get('/weight/logs'); setLogs(data.data); } catch {} }, []);
  const fetchTrend = useCallback(async (period = '30d') => {
    setLoading(true);
    try { const { data } = await api.get(`/weight/trend?period=${period}`); setTrend(data.data); setStats(data.stats); }
    catch {} finally { setLoading(false); }
  }, []);

  const addLog    = useCallback(async (p)     => { const { data } = await api.post('/weight/logs', p);       setLogs(prev => [data.data, ...prev]); return data.data; }, []);
  const updateLog = useCallback(async (id, p) => { const { data } = await api.put(`/weight/logs/${id}`, p);  setLogs(prev => prev.map(l => l._id === id ? data.data : l)); return data.data; }, []);
  const deleteLog = useCallback(async (id)    => { await api.delete(`/weight/logs/${id}`);                    setLogs(prev => prev.filter(l => l._id !== id)); }, []);

  return { logs, trend, stats, loading, fetchLogs, fetchTrend, addLog, updateLog, deleteLog };
};
