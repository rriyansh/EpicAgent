import { useState } from "react";
import Sidebar, { type Tab } from "../components/Sidebar";
import Chat from "../components/Chat";
import StudyRoom from "../components/StudyRoom";
import SettingsPanel from "../components/SettingsPanel";
import type { Profile } from "../lib/profile";

type Pending = { tab: "chat" | "study"; text: string } | null;

export default function Dashboard({
  profile,
  signedIn,
  pending,
  onPendingDone,
  onChange,
  onNeedLogin,
  onSignIn,
  onSignOut,
}: {
  profile: Profile;
  signedIn: boolean;
  pending: Pending;
  onPendingDone: () => void;
  onChange: (profile: Profile) => void;
  onNeedLogin: (pending: { tab: "chat" | "study"; text: string }) => void;
  onSignIn: () => void;
  onSignOut: () => void;
}) {
  const [tab, setTab] = useState<Tab>(pending?.tab ?? "chat");

  return (
    <div className="shell">
      <Sidebar
        tab={tab}
        onTab={setTab}
        profile={profile}
        signedIn={signedIn}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
      />
      {tab === "chat" && (
        <Chat
          profile={profile}
          signedIn={signedIn}
          queued={pending?.tab === "chat" ? pending.text : ""}
          onNeedLogin={(text) => onNeedLogin({ tab: "chat", text })}
          onQueueDone={onPendingDone}
        />
      )}
      {tab === "study" && (
        <StudyRoom
          profile={profile}
          signedIn={signedIn}
          queued={pending?.tab === "study" ? pending.text : ""}
          onNeedLogin={(text) => onNeedLogin({ tab: "study", text })}
          onQueueDone={onPendingDone}
        />
      )}
      {tab === "settings" && (
        <SettingsPanel profile={profile} signedIn={signedIn} onChange={onChange} onSignIn={onSignIn} onSignOut={onSignOut} />
      )}
    </div>
  );
}
