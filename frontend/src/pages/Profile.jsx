import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const GOALS = ['bulking', 'cutting', 'recomposition', 'maintenance'];

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: user?.username || '',
    fitnessGoal: user?.fitnessGoal || 'maintenance',
    dailyCalorieTarget: user?.dailyCalorieTarget || 2000,
    proteinTarget: user?.proteinTarget || 150,
    fatTarget: user?.fatTarget || 65,
    carbTarget: user?.carbTarget || 250,
    bodyWeight: user?.bodyWeight || '',
    height: user?.height || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/me', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-container">
      <div className="animate-slide-up">
        <h1 className="font-display font-800 text-2xl text-white">Profile</h1>
        <p className="text-forge-500 font-mono text-xs mt-1">{user?.email}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Account */}
        <div className="card p-5 space-y-4 animate-slide-up">
          <h2 className="font-display font-700 text-white text-base tracking-wide border-b border-forge-700 pb-3">Account</h2>
          <div className="form-group">
            <label className="input-label">Username</label>
            <input name="username" value={form.username} onChange={handleChange} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="input-label">Body Weight (kg)</label>
              <input type="number" name="bodyWeight" value={form.bodyWeight} onChange={handleChange}
                className="input" placeholder="75" step="0.1" min="20" max="500" />
            </div>
            <div className="form-group">
              <label className="input-label">Height (cm)</label>
              <input type="number" name="height" value={form.height} onChange={handleChange}
                className="input" placeholder="175" min="50" max="300" />
            </div>
          </div>
        </div>

        {/* Fitness Goal */}
        <div className="card p-5 space-y-4 animate-slide-up">
          <h2 className="font-display font-700 text-white text-base tracking-wide border-b border-forge-700 pb-3">Fitness Goal</h2>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <button key={g} type="button"
                onClick={() => setForm((p) => ({ ...p, fitnessGoal: g }))}
                className={`p-3 rounded-lg border text-sm font-display font-600 capitalize tracking-wide transition-all ${
                  form.fitnessGoal === g
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-forge-600 text-forge-400 hover:border-forge-500'
                }`}
              >{g}</button>
            ))}
          </div>
        </div>

        {/* Nutrition Targets */}
        <div className="card p-5 space-y-4 animate-slide-up">
          <h2 className="font-display font-700 text-white text-base tracking-wide border-b border-forge-700 pb-3">Daily Targets</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'dailyCalorieTarget', label: 'Calories', unit: 'kcal', color: 'text-amber-400' },
              { name: 'proteinTarget', label: 'Protein', unit: 'g', color: 'text-azure-400' },
              { name: 'fatTarget', label: 'Fat', unit: 'g', color: 'text-tangerine-400' },
              { name: 'carbTarget', label: 'Carbs', unit: 'g', color: 'text-teal-400' },
            ].map(({ name, label, unit, color }) => (
              <div key={name} className="form-group">
                <div className="flex items-center justify-between">
                  <label className="input-label">{label}</label>
                  <span className={`font-mono text-xs font-500 ${color}`}>{form[name]}{unit}</span>
                </div>
                <input type="number" name={name} value={form[name]} onChange={handleChange}
                  className="input" min="0" />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Danger zone */}
      <div className="card p-5 border-crimson-500/20 animate-slide-up">
        <h2 className="font-display font-700 text-crimson-400 text-sm tracking-wide mb-3">Account Actions</h2>
        <button onClick={handleLogout} className="btn-danger w-full">
          Sign Out
        </button>
      </div>

      <div className="h-4 lg:hidden" />
    </div>
  );
};

export default Profile;
