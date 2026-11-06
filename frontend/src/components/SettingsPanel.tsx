import { dobLabel, type Profile, type ThemeMode } from "../lib/profile";

export default function SettingsPanel({
  profile,
  onChange,
  onSignOut,
}: {
  profile: Profile;
  onChange: (profile: Profile) => void;
  onSignOut: () => void;
}) {
  function patch(partial: Partial<Profile>) {
    onChange({ ...profile, ...partial });
  }

  return (
    <section className="workspace settings-view">
      <header className="topbar slim">
        <h1>Settings</h1>
        <p className="saved">
          <span /> All changes saved
        </p>
      </header>
      <div className="settings-body">
        <h2>Make yourself at home.</h2>
        <p className="sheet-lead">Your profile, your preferences, your EpicAgent.</p>

        <section className="card profile-card">
          <div className="who">
            <span className="avatar lg">{(profile.firstName[0] || "M") + (profile.lastName[0] || "")}</span>
            <div>
              <strong>
                {profile.firstName} {profile.lastName}
              </strong>
              <small>Curious mind · Joined October 2026</small>
            </div>
            <button type="button" className="btn-quiet">
              Change photo
            </button>
          </div>
          <div className="profile-grid">
            <label>
              First name
              <input value={profile.firstName} onChange={(e) => patch({ firstName: e.target.value })} />
            </label>
            <label>
              Last name
              <input value={profile.lastName} onChange={(e) => patch({ lastName: e.target.value })} />
            </label>
            <label>
              Email address
              <input type="email" value={profile.email} onChange={(e) => patch({ email: e.target.value })} />
            </label>
            <label>
              Date of birth · Private
              <input value={dobLabel(profile)} readOnly />
            </label>
          </div>
        </section>

        <div className="settings-split">
          <section className="card">
            <h3>
              <Bell /> Notifications
            </h3>
            <Toggle
              title="Study reminders"
              text="A gentle nudge for your daily study time."
              on={profile.reminders}
              set={(reminders) => patch({ reminders })}
            />
            <Toggle
              title="Room mentions"
              text="Know when your study group needs you."
              on={profile.mentions}
              set={(mentions) => patch({ mentions })}
            />
            <Toggle
              title="Product updates"
              text="Tips and news from EpicAgent."
              on={profile.notifications}
              set={(notifications) => patch({ notifications })}
            />
          </section>
          <section className="card">
            <h3>Appearance & language</h3>
            <p className="fine">A workspace that feels right for you.</p>
            <div className="theme-row" role="radiogroup" aria-label="Appearance">
              {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={profile.theme === mode}
                  className={profile.theme === mode ? "on" : ""}
                  onClick={() => patch({ theme: mode })}
                >
                  {mode[0].toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <label className="lang">
              Language
              <select value={profile.language} onChange={(e) => patch({ language: e.target.value })}>
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </label>
          </section>
        </div>

        <section className="card privacy">
          <div>
            <h3>
              <Shield /> Privacy & security
            </h3>
            <Toggle
              title="Help improve EpicAgent"
              text="Share anonymous usage data. Your conversations stay private."
              on={profile.improve}
              set={(improve) => patch({ improve })}
            />
          </div>
          <div className="privacy-actions">
            <button type="button" className="btn-quiet">
              Change password
            </button>
            <button type="button" className="btn-quiet">
              Export my data
            </button>
          </div>
        </section>
        <div className="settings-foot">
          <p>Your personal details are only visible to you.</p>
          <button type="button" className="signout" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </section>
  );
}

function Toggle({
  title,
  text,
  on,
  set,
}: {
  title: string;
  text: string;
  on: boolean;
  set: (value: boolean) => void;
}) {
  return (
    <div className="perm-row">
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      <button type="button" className={`switch ${on ? "on" : ""}`} role="switch" aria-checked={on} aria-label={title} onClick={() => set(!on)} />
    </div>
  );
}

function Bell() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 16V10a6 6 0 1 1 12 0v6l1.5 2h-15L6 16z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
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
