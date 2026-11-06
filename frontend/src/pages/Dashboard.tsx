import { useState } from "react";
import Sidebar, { type Tab } from "../components/Sidebar";
import Chat from "../components/Chat";
import StudyRoom from "../components/StudyRoom";
import SettingsPanel from "../components/SettingsPanel";
import type { Profile } from "../lib/profile";

export default function Dashboard({
  profile,
  onChange,
  onSignOut,
}: {
  profile: Profile;
  onChange: (profile: Profile) => void;
  onSignOut: () => void;
}) {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <div className="shell">
      <Sidebar tab={tab} onTab={setTab} profile={profile} onSignOut={onSignOut} />
      {tab === "chat" && <Chat profile={profile} />}
      {tab === "study" && <StudyRoom profile={profile} />}
      {tab === "settings" && <SettingsPanel profile={profile} onChange={onChange} onSignOut={onSignOut} />}
    </div>
  );
}
