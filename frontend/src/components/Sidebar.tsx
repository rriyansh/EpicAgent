import { displayName, initials, type Profile } from "../lib/profile";

export type Tab = "chat" | "study" | "settings";

const ITEMS: { id: Tab; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "study", label: "Study Room" },
  { id: "settings", label: "Settings" },
];

export default function Sidebar({
  tab,
  onTab,
  profile,
  onSignOut,
}: {
  tab: Tab;
  onTab: (tab: Tab) => void;
  profile: Profile;
  onSignOut: () => void;
}) {
  return (
    <>
      <aside className="sidebar">
        <div className="brand">
          <span className="logo-mark" aria-hidden="true">
            <Shield />
          </span>
          EpicAgent
        </div>
        <nav className="nav" aria-label="Workspace">
          {ITEMS.map((item) => (
            <button key={item.id} type="button" className={tab === item.id ? "active" : ""} onClick={() => onTab(item.id)}>
              <NavIcon id={item.id} />
              {item.label}
            </button>
          ))}
        </nav>
        <aside className="side-note">
          <span className="sprout" aria-hidden="true">
            <Sprout />
          </span>
          <strong>A little progress, daily.</strong>
          <p>Your next great idea starts with a little curiosity.</p>
        </aside>
        <button type="button" className="help-link">
          <HelpIcon /> Help & feedback
        </button>
        <div className="account">
          <span className="avatar">{initials(profile)}</span>
          <span>
            <strong>{displayName(profile)}</strong>
            <small>Personal account</small>
          </span>
          <button type="button" className="text-link" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </aside>
      <nav className="tabbar" aria-label="Workspace">
        {ITEMS.map((item) => (
          <button key={item.id} type="button" className={tab === item.id ? "active" : ""} onClick={() => onTab(item.id)}>
            <NavIcon id={item.id} />
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}

function NavIcon({ id }: { id: Tab }) {
  if (id === "chat") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 16.5 4 19V6.8A1.8 1.8 0 0 1 5.8 5h12.4A1.8 1.8 0 0 1 20 6.8v7.9a1.8 1.8 0 0 1-1.8 1.8H6z" />
      </svg>
    );
  }
  if (id === "study") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="9" r="3" />
        <circle cx="16" cy="10" r="2.4" />
        <path d="M4.5 18.5c.6-2.4 2.5-3.6 4.6-3.6s3.9 1.2 4.5 3.6M14 14.8c1.2-.5 2.4-.6 3.6-.3 1.4.4 2.3 1.5 2.7 3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
    </svg>
  );
}

function Shield() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3.5 19 6v6.2c0 4.2-2.8 7-7 8.3-4.2-1.3-7-4.1-7-8.3V6l7-2.5z" />
    </svg>
  );
}

function Sprout() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20V10" />
      <path d="M12 13c0-4 3-6 7-6-1 4-3 6-7 6zM12 15c0-3-2.5-5-6-5 1 3.2 3 5 6 5z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.7.3-1.2.8-1.2 1.6V14" />
      <circle cx="11.5" cy="16.5" r="0.6" fill="currentColor" />
    </svg>
  );
}
