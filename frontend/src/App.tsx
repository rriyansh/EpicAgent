
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import VoiceSetup from './pages/VoiceSetup';
import AppearanceSetup from './pages/AppearanceSetup';
import Dashboard from './pages/Dashboard';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!needsOnboarding) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Loading…</div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<OnboardingGuard><Onboarding /></OnboardingGuard>} />
      <Route path="/customize/voice" element={<OnboardingGuard><VoiceSetup /></OnboardingGuard>} />
      <Route path="/customize/appearance" element={<OnboardingGuard><AppearanceSetup /></OnboardingGuard>} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
