
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiPost } from '../lib/api';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setSession, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const access = hashParams.get('access') || params.get('access');
    const refresh = hashParams.get('refresh') || params.get('refresh');
    if (access && refresh) {
      void setSession(access, refresh).then(() => navigate('/', { replace: true }));
    }
    const err = hashParams.get('error') || params.get('error');
    if (err) setError(err === 'google_denied' ? 'Google sign-in was cancelled.' : 'Sign-in failed.');
  }, [params, setSession, navigate]);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, name };
      const res = await apiPost<{ access: string; refresh: string; needsOnboarding: boolean }>(path, body);
      await setSession(res.access, res.refresh);
      navigate(res.needsOnboarding ? '/onboarding' : '/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Try After Sometimes');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    setGoogleLoading(true);
    window.location.href = '/api/auth/google';
  }

  return (
    <div className="login-wrap epic-auth">
      <div className="auth-art"><AgentIllustration /></div>
      <div className="login-form-side auth-sheet">
        <div className="login-card">
          <div className="auth-brand">EpicAgent</div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="sub">{mode === 'login' ? 'Sign in to your EpicAgent account and continue your mission.' : 'Create your private, personalized AI workspace.'}</p>

          {error && <div className="error-msg">{error}</div>}

          <button type="button" className="btn btn-google" onClick={handleGoogle} disabled={googleLoading}>
            <svg viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Logging into Epic AGENT…' : 'Continue with Google'}
          </button>

          <div className="divider">or</div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-field">
                <label htmlFor="name">Your name</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" autoComplete="name" />
              </div>
            )}
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <div className="input-with-icon"><Mail size={20} /><input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" autoComplete="email" required /></div>
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon"><LockKeyhole size={20} /><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'login' ? 'Password' : 'At least 8 characters'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 8 : 1} required /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Show password">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
            </div>
            {mode === 'login' && <button type="button" className="forgot-link" onClick={() => setError('Password reset is not configured yet. Please sign in with Google or create a new account.')}>Forgot Password?</button>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="link-row">
            {mode === 'login' ? (
              <>Not an agent yet? <button type="button" onClick={() => { setMode('register'); setError(''); }}>Create Account</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentIllustration() {
  return <div className="agent-illustration" aria-hidden="true"><div className="orb orb-one" /><div className="orb orb-two" /><div className="agent-head" /><div className="agent-body"><ShieldCheck size={48} /></div><div className="agent-arm left" /><div className="agent-arm right" /><div className="agent-leg left" /><div className="agent-leg right" /></div>;
}
