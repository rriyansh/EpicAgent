
import { useEffect, useRef, useState } from 'react';
import { Copy, Volume2, Square } from 'lucide-react';
import { Message, Profile } from '../types';
import { speakText, stopSpeaking } from '../lib/speech';

interface Props {
  messages: Message[];
  busy: boolean;
  onSend: (text: string) => void;
  agentName: string;
  profile: Profile | null;
}

export default function Chat({ messages, busy, onSend, agentName, profile }: Props) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  function send() {
    const text = input.trim();
    if (!text || busy) return;
    onSend(text);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <>
      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 && !busy ? (
          <div className="empty-chat">
            <h2>Hi, I'm {agentName}.</h2>
            <p>Ask me anything or pick a suggestion below. Add API keys in Settings to enable live responses.</p>
            <div className="suggestion-list">
              <button className="suggestion" onClick={() => onSend('What can you do for me?')}>
                What can you do for me?
              </button>
              <button className="suggestion" onClick={() => onSend('Summarize my day in 3 bullet points')}>
                Summarize my day in 3 bullet points
              </button>
              <button className="suggestion" onClick={() => onSend('Write a short welcome message for a website')}>
                Write a short welcome message for a website
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} className={`msg-row ${m.role === 'user' ? 'user' : 'ai'} ${m.error ? 'error' : ''}`}>
                <div className="msg-avatar">{m.role === 'user' ? 'You'.charAt(0) : agentName.charAt(0)}</div>
                <div className="msg-body">
                  <div className="msg-who">{m.role === 'user' ? 'You' : agentName}</div>
                  <div className="msg-content">{m.content}</div>
                  <div className="msg-actions">
                    <button onClick={() => copy(m.content)} title="Copy"><Copy size={12} /></button>
                    {m.role === 'assistant' && profile && (
                      <button onClick={() => speakText(m.content, profile)} title="Read aloud with your selected voice"><Volume2 size={12} /></button>
                    )}
                    {m.role === 'assistant' && (
                      <button onClick={stopSpeaking} title="Stop speaking"><Square size={11} /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {busy && (
              <div className="msg-row ai">
                <div className="msg-avatar">{agentName.charAt(0)}</div>
                <div className="msg-body">
                  <div className="msg-who">{agentName}</div>
                  <div className="msg-content">
                    <span className="typing"><span /><span /><span /></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="composer">
        <div className="composer-inner">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder={`Message ${agentName}…`}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={busy}
          />
          <button className="composer-btn send" onClick={send} disabled={!input.trim() || busy} title="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
        <div className="composer-foot">
          <span>Enter to send · Shift+Enter for new line</span>
          <span>Powered by Epic</span>
        </div>
      </div>
    </>
  );
}
