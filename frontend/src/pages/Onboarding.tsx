import { useState } from "react";
import Mascot from "../components/Mascot";
import type { Profile } from "../lib/profile";

const FORM_STEPS = ["name", "birthday", "permissions", "agent"] as const;
type Step = "welcome" | (typeof FORM_STEPS)[number] | "ready";

export default function Onboarding({
  profile,
  onChange,
  onBack,
  onFinish,
}: {
  profile: Profile;
  onChange: (profile: Profile) => void;
  onBack: () => void;
  onFinish: (profile: Profile) => void;
}) {
  const [step, setStep] = useState<Step>("welcome");
  const [error, setError] = useState("");

  function patch(partial: Partial<Profile>) {
    onChange({ ...profile, ...partial });
  }

  function next() {
    setError("");
    if (step === "welcome") return setStep("name");
    if (step === "name") {
      if (!profile.firstName.trim() || !profile.lastName.trim()) {
        setError("Add both your first and last name.");
        return;
      }
      return setStep("birthday");
    }
    if (step === "birthday") {
      const day = Number(profile.day);
      const month = Number(profile.month);
      const year = Number(profile.year);
      const date = new Date(year, month - 1, day);
      const valid =
        day >= 1 &&
        day <= 31 &&
        month >= 1 &&
        month <= 12 &&
        year >= 1900 &&
        year <= new Date().getFullYear() - 10 &&
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;
      if (!valid) {
        setError("Enter a real date of birth. You need to be at least 10.");
        return;
      }
      return setStep("permissions");
    }
    if (step === "permissions") return setStep("agent");
    if (step === "agent") {
      if (!profile.agentOnly) {
        setError("EpicAgent only works when the agent leads this workspace.");
        return;
      }
      return setStep("ready");
    }
    onFinish(profile);
  }

  function back() {
    setError("");
    if (step === "welcome") return onBack();
    if (step === "name") return setStep("welcome");
    if (step === "birthday") return setStep("name");
    if (step === "permissions") return setStep("birthday");
    if (step === "agent") return setStep("permissions");
    setStep("agent");
  }

  const formIndex = FORM_STEPS.indexOf(step as (typeof FORM_STEPS)[number]);

  return (
    <div className="onboard">
      <div className="onboard-hero">
        <Mascot />
      </div>
      <section className="onboard-sheet">
        {formIndex >= 0 && (
          <div className="step-row">
            <span>Personalize your profile</span>
            <span className="step-meta">
              Step {formIndex + 1} of {FORM_STEPS.length}
              <i className="bars" aria-hidden="true">
                {FORM_STEPS.map((item, index) => (
                  <b key={item} className={index <= formIndex ? "on" : ""} />
                ))}
              </i>
            </span>
          </div>
        )}

        {step === "welcome" && (
          <>
            <h1>Meet EpicAgent</h1>
            <p className="sheet-lead">
              A calm study companion. One agent plans the hour, asks the questions, and keeps you moving.
            </p>
          </>
        )}

        {step === "name" && (
          <>
            <h1>What’s your name?</h1>
            <p className="sheet-lead">Let’s make EpicAgent yours. Tell us what we should call you.</p>
            <label>
              First name
              <input
                value={profile.firstName}
                placeholder="Enter your first name"
                onChange={(e) => patch({ firstName: e.target.value })}
              />
            </label>
            <label>
              Last name
              <input
                value={profile.lastName}
                placeholder="Enter your last name"
                onChange={(e) => patch({ lastName: e.target.value })}
              />
            </label>
          </>
        )}

        {step === "birthday" && (
          <>
            <h1>When’s your birthday?</h1>
            <p className="sheet-lead">Add your date of birth to help us personalize your EpicAgent experience.</p>
            <p className="field-label">Date of birth</p>
            <div className="dob-grid">
              <label>
                Day
                <input inputMode="numeric" maxLength={2} placeholder="DD" value={profile.day} onChange={(e) => patch({ day: e.target.value.replace(/\D/g, "") })} />
              </label>
              <label>
                Month
                <input inputMode="numeric" maxLength={2} placeholder="MM" value={profile.month} onChange={(e) => patch({ month: e.target.value.replace(/\D/g, "") })} />
              </label>
              <label>
                Year
                <input inputMode="numeric" maxLength={4} placeholder="YYYY" value={profile.year} onChange={(e) => patch({ year: e.target.value.replace(/\D/g, "") })} />
              </label>
            </div>
            <p className="fine">Your date of birth stays private and won’t appear on your profile.</p>
          </>
        )}

        {step === "permissions" && (
          <>
            <h1>A few permissions</h1>
            <p className="sheet-lead">EpicAgent stays quiet unless you ask it to speak up. You can change these later.</p>
            <Perm
              title="Notifications"
              text="Session replies and focus nudges on this device."
              on={profile.notifications}
              set={(notifications) => patch({ notifications })}
            />
            <Perm
              title="Study reminders"
              text="A gentle nudge for your daily study time."
              on={profile.reminders}
              set={(reminders) => patch({ reminders })}
            />
            <Perm
              title="Room mentions"
              text="Know when your study group needs you."
              on={profile.mentions}
              set={(mentions) => patch({ mentions })}
            />
          </>
        )}

        {step === "agent" && (
          <>
            <h1>Only the agent works</h1>
            <p className="sheet-lead">
              This workspace has one assistant. EpicAgent plans the session, asks the questions, and keeps the study room moving. No extra bots. No tool switching.
            </p>
            <label className="check-card">
              <input
                type="checkbox"
                checked={profile.agentOnly}
                onChange={(e) => patch({ agentOnly: e.target.checked })}
              />
              <span>
                <strong>Let EpicAgent lead</strong>
                <small>Chat, study room, and plans all go through the agent.</small>
              </span>
            </label>
          </>
        )}

        {step === "ready" && (
          <>
            <h1>You’re ready, {profile.firstName.trim()}.</h1>
            <p className="sheet-lead">
              Your profile stays private. Open chat when you want a plan, or the study room when you want company.
            </p>
          </>
        )}

        {error && <p className="form-error">{error}</p>}

        <button className="btn-primary sheet-cta" type="button" onClick={next}>
          {step === "welcome" ? "Get started" : step === "ready" ? "Open EpicAgent" : "Continue"}
        </button>
        <button className="text-link sheet-back" type="button" onClick={back}>
          {step === "welcome" ? "Back to sign in" : "Back"}
        </button>
      </section>
    </div>
  );
}

function Perm({
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
      <button
        type="button"
        className={`switch ${on ? "on" : ""}`}
        role="switch"
        aria-checked={on}
        aria-label={title}
        onClick={() => set(!on)}
      />
    </div>
  );
}
