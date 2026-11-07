import { useEffect, useMemo, useRef, useState } from "react";
import { displayName, initials, type Profile } from "../lib/profile";
import { play } from "../lib/sound";

type Msg = { id: string; role: "user" | "agent"; text: string; time: string };

const SEED_THREADS = [
  { id: "bio", title: "Biology study plan" },
  { id: "cell", title: "Understanding cell division" },
  { id: "essay", title: "Essay outline ideas" },
  { id: "week", title: "Weekly study routine" },
];

const SEED: Msg[] = [
  {
    id: "u1",
    role: "user",
    text: "Hey EpicAgent! I have a biology quiz on Friday and one hour to study today. Can you help me plan it?",
    time: "10:24 AM",
  },
  {
    id: "a1",
    role: "agent",
    text: "Absolutely. Let’s make that hour count without making it overwhelming. We’ll use active recall, a little practice, and a proper break.",
    time: "10:24 AM",
  },
  {
    id: "u2",
    role: "user",
    text: "Mitosis vs. meiosis. I always mix up the stages.",
    time: "10:26 AM",
  },
];

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function Chat({
  profile,
  signedIn,
  queued,
  onNeedLogin,
  onQueueDone,
}: {
  profile: Profile;
  signedIn: boolean;
  queued: string;
  onNeedLogin: (text: string) => void;
  onQueueDone: () => void;
}) {
  const [threadsList, setThreadsList] = useState(SEED_THREADS);
  const [active, setActive] = useState(SEED_THREADS[0].id);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [openList, setOpenList] = useState(false);
  const [threads, setThreads] = useState<Record<string, Msg[]>>({ bio: SEED });

  const messages = threads[active] ?? [];
  const title = threadsList.find((item) => item.id === active)?.title ?? "New conversation";
  const visible = useMemo(
    () => threadsList.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())),
    [query, threadsList]
  );

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    if (!signedIn) {
      setDraft(clean);
      onNeedLogin(clean);
      return;
    }
    const time = nowLabel();
    const user: Msg = { id: crypto.randomUUID(), role: "user", text: clean, time };
    const reply: Msg = {
      id: crypto.randomUUID(),
      role: "agent",
      text: replyFor(clean, profile.firstName || "there"),
      time,
    };
    setThreads((prev) => ({ ...prev, [active]: [...(prev[active] ?? []), user, reply] }));
    setDraft("");
    play("send");
    window.setTimeout(() => play("reply"), 280);
  }

  const sendRef = useRef(send);
  sendRef.current = send;
  useEffect(() => {
    if (!signedIn || !queued) return;
    sendRef.current(queued);
    onQueueDone();
  }, [signedIn, queued, onQueueDone]);

  function fresh() {
    const id = `new-${Date.now()}`;
    setThreadsList((prev) => [{ id, title: "New conversation" }, ...prev]);
    setThreads((prev) => ({
      ...prev,
      [id]: [
        {
          id: crypto.randomUUID(),
          role: "agent",
          text: `Hi ${profile.firstName || "there"}. What should we work on in the next hour?`,
          time: nowLabel(),
        },
      ],
    }));
    setActive(id);
    setOpenList(false);
  }

  return (
    <section className="workspace chat-view">
      <header className="topbar">
        <div>
          <h1>{title}</h1>
          <p className="status-line">
            <i /> Your personal study companion
          </p>
        </div>
        <div className="top-actions">
          <button type="button" className="icon-btn mobile-only" aria-label="Conversations" onClick={() => setOpenList(true)}>
            <MenuIcon />
          </button>
          <label className="search-pill">
            <span className="sr-only">Search conversations</span>
            <SearchIcon />
            <input value={query} placeholder="Search" onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>
      </header>

      <div className="chat-layout">
        <aside className={`thread-list ${openList ? "open" : ""}`}>
          <button type="button" className="btn-primary new-chat" onClick={fresh}>
            + New conversation
          </button>
          <p className="kicker">Recent conversations</p>
          {visible.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === active ? "thread active" : "thread"}
              onClick={() => {
                setActive(item.id);
                setOpenList(false);
              }}
            >
              <ChatMini />
              {item.title}
            </button>
          ))}
          <button type="button" className="text-link close-list" onClick={() => setOpenList(false)}>
            Close
          </button>
        </aside>

        <div className="pane">
        <div className="transcript">
          <p className="day-chip">Today, October 28</p>
          {messages.map((msg) =>
            msg.role === "user" ? (
              <article key={msg.id} className="bubble user rise">
                <p>{msg.text}</p>
                <footer>
                  <time>{msg.time}</time>
                  <span className="mini-avatar">{initials(profile)}</span>
                </footer>
              </article>
            ) : (
              <article key={msg.id} className="agent-block rise">
                <header>
                  <span className="agent-badge">
                    <Shield />
                  </span>
                  EpicAgent <time>{msg.time}</time>
                </header>
                <p>{msg.text}</p>
                {msg.id === "a1" && <PlanCard />}
                <div className="msg-tools" aria-label="Message actions">
                  <button type="button" aria-label="Copy" onClick={() => navigator.clipboard?.writeText(msg.text)}>
                    <CopyIcon />
                  </button>
                  <button type="button" aria-label="Helpful">
                    <Thumb />
                  </button>
                  <button type="button" aria-label="Not helpful">
                    <Thumb down />
                  </button>
                </div>
              </article>
            )
          )}
          {active === "bio" && (
            <div className="suggestions">
              {["Compare the stages", "Quiz me on cell division", "Save this plan"].map((label) => (
                <button key={label} type="button" onClick={() => send(label)}>
                  {label}
                </button>
              ))}
            </div>
          )}
          </div>
          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <span className="clip" aria-hidden="true">
              <Clip />
            </span>
            <input
              value={draft}
              placeholder="Ask EpicAgent anything…"
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="send" aria-label="Send">
              <Arrow />
            </button>
          </form>
          <p className="disclaimer">EpicAgent can make mistakes. Always double-check important information.</p>
        </div>
      </div>
      <p className="sr-only">{displayName(profile)}</p>
    </section>
  );
}

function replyFor(text: string, name: string) {
  const lower = text.toLowerCase();
  if (lower.includes("quiz")) return `${name}, let’s do five quick questions. First: how many daughter cells does mitosis produce?`;
  if (lower.includes("compare") || lower.includes("stage"))
    return "Mitosis copies one cell into two identical cells. Meiosis splits that into four cells with half the chromosomes. Want the stage names next, or a 5-question check?";
  if (lower.includes("save")) return "Saved to this conversation. You can reopen “Biology study plan” any time and pick up at the quiz.";
  return `Got it, ${name}. I’ll keep this to one clear next step. Want a 10-minute recall, or should I quiz you on what you just said?`;
}

function PlanCard() {
  const rows = [
    ["10 min", "Recall", "Write what you know about cells."],
    ["25 min", "Practice", "Compare mitosis and meiosis."],
    ["5 min", "Recharge", "Step away. Stretch. Get some water."],
    ["20 min", "Test yourself", "Try 5 questions without your notes."],
  ];
  return (
    <div className="plan-card">
      <header>
        <strong>Your 60-minute game plan</strong>
        <CopyIcon />
      </header>
      {rows.map(([time, title, text]) => (
        <div key={title} className="plan-row">
          <span>{time}</span>
          <div>
            <strong>{title}</strong>
            <p>{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Shield() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3.5 19 6v6.2c0 4.2-2.8 7-7 8.3-4.2-1.3-7-4.1-7-8.3V6l7-2.5z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  );
}
function ChatMini() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 16.5 4 19V6.8A1.8 1.8 0 0 1 5.8 5h12.4A1.8 1.8 0 0 1 20 6.8v7.9a1.8 1.8 0 0 1-1.8 1.8H6z" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="8" y="8" width="10" height="11" rx="2" />
      <path d="M6 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1" />
    </svg>
  );
}
function Thumb({ down = false }: { down?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" style={down ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M8 11V5.5A1.5 1.5 0 0 1 9.5 4h.8L14 10h4.2a1.8 1.8 0 0 1 1.8 2.1l-.8 5A1.8 1.8 0 0 1 17.4 20H8" />
      <path d="M8 10H5.5A1.5 1.5 0 0 0 4 11.5v7A1.5 1.5 0 0 0 5.5 20H8" />
    </svg>
  );
}
function Clip() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 12.5 14.2 6.3a3 3 0 0 1 4.2 4.2l-7.6 7.6a4.2 4.2 0 0 1-6-6l7.2-7.2" />
    </svg>
  );
}
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 18V6M7 10l5-5 5 5" />
    </svg>
  );
}
