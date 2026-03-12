import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GOALS = [
  { value: 'bulking', label: '📈 Bulking', sub: 'Gain muscle mass' },
  { value: 'cutting', label: '🔥 Cutting', sub: 'Lose body fat' },
  { value: 'recomposition', label: '⚖️ Recomp', sub: 'Build & burn simultaneously' },
  { value: 'maintenance', label: '🎯 Maintain', sub: 'Stay at current weight' },
];

const Register = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    fitnessGoal: 'maintenance',
    dailyCalorieTarget: 2000,
    proteinTarget: 150,
    fatTarget: 65,
    carbTarget: 250,
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Let\'s get started 💪');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-forge-900">
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500 shadow-amber-glow mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-6 h-6 text-forge-950">
              <path d="M6 4v6m0 4v6M18 4v6m0 4v6M2 9h4m12 0h4M2 15h4m12 0h4" />
            </svg>
          </div>
          <h1 className="font-display font-800 text-2xl text-white tracking-wider uppercase">FitTrack Pro</h1>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-5">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-amber-500' : 'bg-forge-700'}`} />
          ))}
        </div>

        <div className="card p-6">
          {step === 1 ? (
            <>
              <h2 className="font-display font-700 text-xl text-white mb-1">Create Account</h2>
              <p className="text-forge-500 text-sm mb-5">Your fitness journey starts here.</p>

              <div className="space-y-4">
                <div className="form-group">
                  <label className="input-label">Username</label>
                  <input name="username" value={form.username} onChange={handleChange}
                    className="input" placeholder="ironwarrior99" autoComplete="username" />
                </div>
                <div className="form-group">
                  <label className="input-label">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    className="input" placeholder="you@example.com" autoComplete="email" />
                </div>
                <div className="form-group">
                  <label className="input-label">Password</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange}
                    className="input" placeholder="Min 6 characters" autoComplete="new-password" />
                </div>

                <div className="form-group">
                  <label className="input-label">Fitness Goal</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {GOALS.map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, fitnessGoal: g.value }))}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          form.fitnessGoal === g.value
                            ? 'border-amber-500 bg-amber-500/10 text-white'
                            : 'border-forge-600 bg-forge-750 text-forge-400 hover:border-forge-500'
                        }`}
                      >
                        <div className="text-sm font-display font-600">{g.label}</div>
                        <div className="text-xs text-forge-500 mt-0.5 font-mono">{g.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!form.username || !form.email || !form.password) {
                      toast.error('Please fill in all fields'); return;
                    }
                    setStep(2);
                  }}
                  className="btn-primary w-full"
                >
                  Next: Set Targets →
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="font-display font-700 text-xl text-white mb-1">Daily Targets</h2>
              <p className="text-forge-500 text-sm mb-5">Set your nutrition goals (you can change these later).</p>

              <div className="space-y-4">
                {[
                  { name: 'dailyCalorieTarget', label: 'Calories', unit: 'kcal', min: 500, max: 10000 },
                  { name: 'proteinTarget', label: 'Protein', unit: 'g', min: 0, max: 500 },
                  { name: 'fatTarget', label: 'Fat', unit: 'g', min: 0, max: 500 },
                  { name: 'carbTarget', label: 'Carbs', unit: 'g', min: 0, max: 1000 },
                ].map(({ name, label, unit, min, max }) => (
                  <div key={name} className="form-group">
                    <div className="flex items-center justify-between">
                      <label className="input-label">{label}</label>
                      <span className="font-mono text-amber-400 text-sm font-500">{form[name]} {unit}</span>
                    </div>
                    <input
                      type="number" name={name} value={form[name]}
                      onChange={handleChange} min={min} max={max}
                      className="input"
                    />
                  </div>
                ))}

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-forge-500 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-500 hover:text-amber-400 font-600 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
