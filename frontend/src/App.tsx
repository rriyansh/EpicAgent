import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import { loadProfile, saveProfile, type Profile, type ThemeMode } from "./lib/profile";

type View = "login" | "onboarding" | "app";

function applyTheme(theme: ThemeMode) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export default function App() {
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [view, setView] = useState<View>(() => (loadProfile().done ? "app" : "login"));

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

  return (
    <div className="app">
      {view === "login" ? (
        <Login
          onSuccess={(email) => {
            updateProfile({ ...profile, email: email || profile.email });
            setView(profile.done ? "app" : "onboarding");
          }}
        />
      ) : view === "onboarding" ? (
        <Onboarding
          profile={profile}
          onChange={updateProfile}
          onBack={() => setView("login")}
          onFinish={(next) => {
            updateProfile({ ...next, done: true });
            setView("app");
          }}
        />
      ) : (
        <Dashboard
          profile={profile}
          onChange={updateProfile}
          onSignOut={() => {
            updateProfile({ ...profile, done: false });
            setView("login");
          }}
        />
      )}
    </div>
  );
}
