import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Mascot from "./components/Mascot";
import SoundToggle from "./components/SoundToggle";
import { clearSession, readSession } from "./hooks/useAuth";
import { play } from "./lib/sound";
import { loadProfile, saveProfile, type Profile, type ThemeMode } from "./lib/profile";

type View = "splash" | "login" | "onboarding" | "app";
type Pending = { tab: "chat" | "study"; text: string } | null;

function applyTheme(theme: ThemeMode) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export default function App() {
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [view, setView] = useState<View>("splash");
  const [signedIn, setSignedIn] = useState(() => Boolean(readSession()));
  const [pending, setPending] = useState<Pending>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setView((current) => (current === "splash" ? (loadProfile().done ? "app" : "onboarding") : current));
    }, 1600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyTheme(profile.theme);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(profile.theme);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [profile.theme]);

  function updateProfile(next: Profile) {
    setProfile(next);
    saveProfile(next);
  }

  function openLogin(next: Pending) {
    setPending(next);
    setView("login");
  }

  return (
    <div className="app">
      <SoundToggle />
      <div key={view} className="view-in">
      {view === "splash" ? (
        <Splash />
      ) : view === "login" ? (
        <Login
          onSuccess={(email) => {
            updateProfile({ ...profile, email: email || profile.email });
            setSignedIn(Boolean(readSession()));
            setView(profile.done ? "app" : "onboarding");
          }}
        />
      ) : view === "onboarding" ? (
        <Onboarding
          profile={profile}
          onChange={updateProfile}
          onBack={() => setView("app")}
          onFinish={(next) => {
            updateProfile({ ...next, done: true });
            setView("app");
          }}
        />
      ) : (
        <Dashboard
          profile={profile}
          signedIn={signedIn}
          pending={pending}
          onPendingDone={() => setPending(null)}
          onChange={updateProfile}
          onNeedLogin={openLogin}
          onSignIn={() => setView("login")}
          onSignOut={() => {
            clearSession();
            setSignedIn(false);
            setPending(null);
            setView("app");
          }}
        />
      )}
      </div>
    </div>
  );
}

function Splash() {
  useEffect(() => {
    const timer = window.setTimeout(() => play("hello"), 280);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="splash" role="status" aria-live="polite">
      <Mascot talking />
      <p className="splash-title">
        EpicAgent
        <span className="dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </p>
      <p className="splash-note">Getting your study space ready</p>
    </div>
  );
}
