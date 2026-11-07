import { useEffect, useState } from "react";
import Mascot from "../components/Mascot";
import { play } from "../lib/sound";
import type { Profile } from "../lib/profile";

const FORM_STEPS = ["name", "birthday", "permissions", "agent"] as const;
type Step = "welcome" | (typeof FORM_STEPS)[number] | "ready";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const JOBS = [
  { id: "plan", title: "Plan the hour", text: "Turn one hour into a short study plan." },
  { id: "ask", title: "Ask the questions", text: "Quiz you instead of handing over the answer." },
  { id: "room", title: "Keep the room moving", text: "Stay with the study group until the goal is done." },
] as const;

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
  const [jobs, setJobs] = useState<string[]>(() => (profile.agentOnly ? JOBS.map((job) => job.id) : []));
  const [typed, setTyped] = useState("");

  const first = profile.firstName.trim();
  const birthdayOk = isBirthday(profile);

  useEffect(() => {
    if (step !== "ready") return;
    const line = `${first || "there"}, I'll plan the hour, ask the questions, and keep you moving.`;
    setTyped("");
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setTyped(line.slice(0, i));
      if (i >= line.length) window.clearInterval(timer);
    }, 28);
    return () => window.clearInterval(timer);
  }, [step, first]);

  function patch(partial: Partial<Profile>) {
    onChange({ ...profile, ...partial });
  }

  function toggleJob(id: string) {
    const next = jobs.includes(id) ? jobs.filter((job) => job !== id) : [...jobs, id];
    setJobs(next);
    patch({ agentOnly: next.length === JOBS.length });
    setError("");
  }

  function next() {
    play("tap");
    setError("");
    if (step === "welcome") return setStep("name");
    if (step === "name") {
      if (!first || !profile.lastName.trim()) {
        setError("Add both your first and last name.");
        return;
      }
      return setStep("birthday");
    }
    if (step === "birthday") {
      if (!birthdayOk) {
        setError("Enter a real date of birth. You need to be at least 10.");
        return;
      }
      return setStep("permissions");
    }
    if (step === "permissions") return setStep("agent");
    if (step === "agent") {
      if (jobs.length < JOBS.length) {
        setError("Tap all three so EpicAgent can lead this workspace.");
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

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") next();
  }

  const formIndex = FORM_STEPS.indexOf(step as (typeof FORM_STEPS)[number]);
  const say =
    step === "welcome"
      ? "Hi. I'm EpicAgent. I'll stay with you for the whole session."
      : step === "name"
        ? first
          ? `Nice to meet you, ${first}.`
          : "What should I call you?"
        : step === "birthday"
          ? birthdayOk
            ? "Got it. That stays private."
            : "Pick your month, then add the day and year."
          : step === "permissions"
            ? permissionLine(profile)
            : step === "agent"
              ? jobs.length === JOBS.length
                ? "All set. I'll lead chat, plans, and the study room."
                : `Pick ${JOBS.length - jobs.length} more thing${JOBS.length - jobs.length === 1 ? "" : "s"} for me to do.`
              : typed || "…";

  return (
    <div className="onboard">
      <div className="onboard-hero">
        <Mascot talking={step === "welcome" || step === "ready"} />
      </div>
      <section className="onboard-sheet" onKeyDown={onKeyDown}>
        {formIndex >= 0 && (
          <div className="step-row">
            <span>Personalize your profile</span>
            <span className="step-meta">
              Step {formIndex + 1} of {FORM_STEPS.length}
              <i className="bars" aria-hidden="true">
                {FORM_STEPS.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    className={index <= formIndex ? "on" : ""}
                    aria-label={`Go to step ${index + 1}`}
                    onClick={() => index < formIndex && setStep(item)}
                  />
                ))}
              </i>
            </span>
          </div>
        )}

        <p className="agent-say" aria-live="polite">
          {say}
          {step === "ready" && typed.length < 80 ? <span className="caret" /> : null}
        </p>

        <div key={step} className="sheet-in">
          {step === "welcome" && (
            <>
              <h1>Meet EpicAgent</h1>
              <p className="sheet-lead">One agent plans the hour, asks the questions, and keeps you moving.</p>
            </>
          )}

          {step === "name" && (
            <>
              <h1>What’s your name?</h1>
              <label>
                First name
                <input
                  autoFocus
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
              <p className="field-label">Month</p>
              <div className="month-picks" role="listbox" aria-label="Month">
                {MONTHS.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className={Number(profile.month) === index + 1 ? "on" : ""}
                    onClick={() => patch({ month: String(index + 1) })}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="dob-grid two">
                <label>
                  Day
                  <input inputMode="numeric" maxLength={2} placeholder="DD" value={profile.day} onChange={(e) => patch({ day: e.target.value.replace(/\D/g, "") })} />
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
              <Perm title="Notifications" text="Session replies and focus nudges on this device." on={profile.notifications} set={(notifications) => patch({ notifications })} />
              <Perm title="Study reminders" text="A gentle nudge for your daily study time." on={profile.reminders} set={(reminders) => patch({ reminders })} />
              <Perm title="Room mentions" text="Know when your study group needs you." on={profile.mentions} set={(mentions) => patch({ mentions })} />
            </>
          )}

          {step === "agent" && (
            <>
              <h1>Only the agent works</h1>
              <p className="sheet-lead">Tap what you want EpicAgent to handle. No extra bots.</p>
              <div className="job-picks">
                {JOBS.map((job) => {
                  const on = jobs.includes(job.id);
                  return (
                    <button key={job.id} type="button" className={on ? "on" : ""} aria-pressed={on} onClick={() => toggleJob(job.id)}>
                      <strong>{job.title}</strong>
                      <small>{job.text}</small>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === "ready" && (
            <>
              <h1>You’re ready{first ? `, ${first}` : ""}.</h1>
              <p className="sheet-lead">Your profile stays private. Open chat when you want a plan.</p>
            </>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn-primary sheet-cta" type="button" onClick={next} disabled={step === "ready" && typed.length < 20}>
          {step === "welcome" ? "Get started" : step === "ready" ? "Open EpicAgent" : "Continue"}
        </button>
        <button className="text-link sheet-back" type="button" onClick={back}>
          {step === "welcome" ? "Look around first" : "Back"}
        </button>
      </section>
    </div>
  );
}

function permissionLine(profile: Profile) {
  const on = [profile.notifications && "replies", profile.reminders && "reminders", profile.mentions && "room mentions"].filter(Boolean);
  if (on.length === 0) return "I'll stay quiet until you message me.";
  if (on.length === 3) return "I'll nudge you, remind you, and ping you in the room.";
  return `I'll use ${on.join(" and ")}. You can change this later.`;
}

function isBirthday(profile: Profile) {
  const day = Number(profile.day);
  const month = Number(profile.month);
  const year = Number(profile.year);
  const date = new Date(year, month - 1, day);
  return (
    day >= 1 &&
    day <= 31 &&
    month >= 1 &&
    month <= 12 &&
    year >= 1900 &&
    year <= new Date().getFullYear() - 10 &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
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
      <button type="button" className={`switch ${on ? "on" : ""}`} role="switch" aria-checked={on} aria-label={title} onClick={() => set(!on)} />
    </div>
  );
}
