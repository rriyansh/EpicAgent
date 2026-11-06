import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import Terminal from "./components/Terminal";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";

type View = "login" | "onboarding" | "dashboard";

export default function App() {
  const [view, setView] = useState<View>("login");

  return (
    <div className="app">
      {view === "login" ? (
        <Login onSuccess={() => setView("onboarding")} />
      ) : view === "onboarding" ? (
        <Onboarding onFinish={() => setView("dashboard")} />
      ) : (
        <div className="dashboard-shell">
          <Sidebar />
          <main className="dashboard-main">
            <Chat />
            <Terminal />
          </main>
        </div>
      )}
    </div>
  );
}
