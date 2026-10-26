import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Volume2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiPut } from '../lib/api';
import { getSpeechVoices, speakText } from '../lib/speech';

const ACCENTS = ['#2d8634', '#0ea5e9', '#7c3aed', '#e11d48'];

export default function Onboarding() {
  const { user, profile, refreshMe, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || '');
  const [dob, setDob] = useState(profile?.dob || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function saveBasics() {
    setSaving(true); setError('');
    try {
      await apiPut('/profile', { name, dob });
      await refreshMe(); navigate('/customize/voice', { replace: true });
    } catch (e: any) { setError(e.message || 'Could not save your profile'); } finally { setSaving(false); }
  }

  function next() {
    if (step === 1 && !name.trim()) return setError('Please tell us what to call you.');
    if (step === 2 && !dob) return setError('Please add your date of birth.');
    setError(''); if (step < 2) setStep(step + 1); else void saveBasics();
  }

  return <div className="onb-flow"><div className="onb-art"><div className="orb orb-one" /><div className="orb orb-two" /><div className="onb-bot"><ShieldCheck size={42} /></div></div><main className="onb-sheet"><div className="onb-meta"><strong>Personalize your profile</strong><span>Step {step} of 4 <i className="filled" /><i className={step > 1 ? 'filled' : ''} /><i /><i /></span></div>{error && <div className="error-msg">{error}</div>}
    {step === 1 && <section className="onb-step"><h1>What’s your name?</h1><p>Let’s make EpicAgent yours. Tell us what we should call you.</p><label>First name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your first name" autoComplete="given-name" autoFocus /></section>}
    {step === 2 && <section className="onb-step"><h1>When’s your birthday?</h1><p>Add your date of birth to help us personalize your EpicAgent experience.</p><label>Date of birth</label><input type="date" value={dob} onChange={e => setDob(e.target.value)} max={new Date().toISOString().slice(0, 10)} /><small>Your date of birth stays private and won’t appear on your profile.</small></section>}
    <div className="onb-actions"><button type="button" className="btn btn-primary" onClick={next} disabled={saving}>{saving ? 'Saving…' : 'Continue'}</button>{step > 1 ? <button className="onb-back" type="button" onClick={() => setStep(step - 1)}><ArrowLeft size={17} /> Back</button> : <button className="onb-back" type="button" onClick={logout}>Back to sign in</button>}</div>
  </main></div>;
}
