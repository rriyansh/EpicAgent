import { useEffect, useRef, useState } from "react";
import { initials, type Profile } from "../lib/profile";

type Note = { id: string; name: string; initials: string; text: string; time: string; agent?: boolean };

const START: Note[] = [
  {
    id: "1",
    name: "Sofia Patel",
    initials: "SP",
    time: "10:30 AM",
    text: "Hey everyone! I added my cell division notes. Shall we start with the difference between mitosis and meiosis?",
  },
  {
    id: "2",
    name: "Maya Chen · You",
    initials: "MC",
    time: "10:31 AM",
    text: "Yes please! I keep mixing up how many daughter cells each one produces.",
  },
  {
    id: "3",
    name: "Liam Brooks",
    initials: "LB",
    time: "10:32 AM",
    text: "Mitosis makes 2 identical cells. Meiosis makes 4 different cells with half the chromosomes. I remember it as “meiosis mixes it up.”",
  },
  {
    id: "4",
    name: "EpicAgent",
    initials: "EA",
    time: "10:32 AM",
    agent: true,
    text: "Exactly, Liam! Try this together: a cell has 46 chromosomes. How many would each daughter cell have after meiosis? Discuss first, then check your answer.",
  },
];

export default function StudyRoom({
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
  const [notes, setNotes] = useState(START);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState("Sofia is typing…");
  const [invited, setInvited] = useState(false);
  const you = initials(profile);

  function post(text: string) {
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setNotes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: `${profile.firstName || "You"} · You`, initials: you, text, time },
    ]);
    setDraft("");
    setTyping("EpicAgent is thinking…");
    window.setTimeout(() => {
      setNotes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: "EpicAgent",
          initials: "EA",
          agent: true,
          time,
          text: "Good. Say it in one sentence, then check each other before looking it up. After meiosis, each cell has 23 chromosomes.",
        },
      ]);
      setTyping("");
    }, 700);
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (!signedIn) {
      onNeedLogin(text);
      return;
    }
    post(text);
  }

  const postRef = useRef(post);
  postRef.current = post;
  useEffect(() => {
    if (!signedIn || !queued) return;
    postRef.current(queued);
    onQueueDone();
  }, [signedIn, queued, onQueueDone]);

  return (
    <section className="workspace study-view">
      <header className="topbar">
        <div className="room-title">
          <span className="book" aria-hidden="true">
            <Book />
          </span>
          <div>
            <h1>Biology study club</h1>
            <p>A little teamwork. A lot of learning.</p>
          </div>
        </div>
        <div className="top-actions">
          <span className="online">
            <i /> 4 online
          </span>
          <button type="button" className="btn-quiet" onClick={() => setInvited(true)}>
            Invite friends
          </button>
        </div>
      </header>
      {invited && <p className="banner">Invite link copied for this room. Only people you add can join.</p>}

      <div className="study-grid">
        <div className="room-stream pane">
          <div className="room-feed">
          <div className="goal">
            <Pin /> Today’s goal: understand mitosis vs. meiosis
          </div>
          <p className="day-chip">Today, October 28</p>
          {notes.map((note) => (
            <article key={note.id} className={note.agent ? "room-note agent rise" : "room-note rise"}>
              <span className={`avatar ${note.agent ? "agent" : ""}`}>{note.agent ? <Shield /> : note.initials}</span>
              <div>
                <header>
                  <strong>{note.name}</strong>
                  <time>{note.time}</time>
                </header>
                <p>{note.text}</p>
                {note.id === "1" && (
                  <div className="file-chip">
                    <FileIcon />
                    <span>
                      <strong>Cell division notes.pdf</strong>
                      <small>PDF · 2.4 MB · Shared by Sofia</small>
                    </span>
                    <button type="button" aria-label="Download">
                      <Down />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
          {typing && <p className="typing">{typing}</p>}
          </div>
          <form className="composer" onSubmit={send}>
            <span className="clip" aria-hidden="true">
              <Clip />
            </span>
            <input value={draft} placeholder="Message the room…" onChange={(e) => setDraft(e.target.value)} />
            <button type="submit" className="send" aria-label="Send">
              <Arrow />
            </button>
          </form>
          <p className="disclaimer">A kind space to learn together. Be curious. Be respectful.</p>
        </div>

        <aside className="room-side">
          <div className="focus-card">
            <p>FOCUS SESSION · OF 3</p>
            <strong>
              <Timer /> 18:42 <small>remaining</small>
            </strong>
            <span>Cell division · 25 minutes</span>
          </div>
          <div className="side-block">
            <header>
              In this room <span>4 members</span>
            </header>
            {[
              [you, profile.firstName || "Maya", "You · Room host"],
              ["SP", "Sofia Patel", "Studying cell division"],
              ["LB", "Liam Brooks", "Studying cell division"],
            ].map(([mark, name, role]) => (
              <div key={name} className="member">
                <span className="avatar">{mark}</span>
                <span>
                  <strong>{name}</strong>
                  <small>{role}</small>
                </span>
                <i />
              </div>
            ))}
            <div className="member">
              <span className="avatar agent">
                <Shield />
              </span>
              <span>
                <strong>EpicAgent</strong>
                <small>Here to help everyone</small>
              </span>
              <i />
            </div>
          </div>
          <div className="side-block">
            <header>
              Shared resources <button type="button" aria-label="Add resource">+</button>
            </header>
            <div className="file-chip flat">
              <FileIcon />
              <span>
                <strong>Cell division notes.pdf</strong>
                <small>Sofia · 2.4 MB</small>
              </span>
            </div>
            <div className="file-chip flat">
              <FileIcon />
              <span>
                <strong>Practice questions.pdf</strong>
                <small>Liam · 840 KB</small>
              </span>
            </div>
          </div>
          <div className="together">
            <strong>Better, together.</strong>
            <p>Ask questions, share what you know, and make room for every curious mind.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Book() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 5.5h6.2A2.8 2.8 0 0 1 14 8.3V19a2.2 2.2 0 0 0-2.2-1.6H5zM19 5.5h-6.2A2.8 2.8 0 0 0 10 8.3V19a2.2 2.2 0 0 1 2.2-1.6H19z" />
    </svg>
  );
}
function Pin() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 4h6l-1 6 3 2v2H7v-2l3-2-1-6zM12 14v6" />
    </svg>
  );
}
function Shield() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3.5 19 6v6.2c0 4.2-2.8 7-7 8.3-4.2-1.3-7-4.1-7-8.3V6l7-2.5z" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5z" />
      <path d="M13 3.5V8h4.5M8 13h8M8 16.5h6" />
    </svg>
  );
}
function Down() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 5v10M8 11l4 4 4-4M6 19h12" />
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
function Timer() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="13" r="7" />
      <path d="M12 13V9.5M10 4h4" />
    </svg>
  );
}
