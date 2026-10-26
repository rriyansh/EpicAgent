
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDevice } from '../hooks/useDevice';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import Terminal from '../components/Terminal';
import { apiGet, apiPost, apiDelete, apiPut } from '../lib/api';
import { Message, ApiKey, ProviderInfo, Profile } from '../types';
import { getSpeechVoices, speakText } from '../lib/speech';

export default function Dashboard() {
  const { user, profile, refreshMe, logout } = useAuth();
  const device = useDevice();
  const [messages, setMessages] = useState<Message[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(profile?.provider || 'gemini');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | '' } | null>(null);
  const [voiceOptions, setVoiceOptions] = useState<SpeechSynthesisVoice[]>([]);

  function showToast(msg: string, type: 'success' | 'error' | '' = '') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    (async () => {
      try {
        const [pRes, hRes, kRes] = await Promise.all([
          apiGet<{ providers: ProviderInfo[] }>('/agent/providers'),
          apiGet<{ messages: { role: string; content: string; created_at: number }[] }>('/agent/history').catch(() => ({ messages: [] })),
          apiGet<{ keys: ApiKey[] }>('/keys').catch(() => ({ keys: [] })),
        ]);
        setProviders(pRes.providers);
        setKeys(kRes.keys);
        if (hRes.messages.length) {
          setMessages(hRes.messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
            ts: m.created_at,
          })));
        }
      } catch (e: any) {
        showToast(e.message, 'error');
      }
    })();
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    if (profile) {
      root.style.setProperty('--accent', profile.accent);
      const accents: Record<string, string> = {
        '#6366f1': '#a855f7',
        '#0ea5e9': '#06b6d4',
        '#10b981': '#14b8a6',
        '#ef4444': '#f97316',
        '#ec4899': '#f43f5e',
        '#a855f7': '#6366f1',
      };
      root.style.setProperty('--accent-2', accents[profile.accent] || '#a855f7');
      document.body.dataset.wallpaper = profile.wallpaper;
      document.body.dataset.fontScale = profile.font_scale;
      setCurrentProvider(profile.provider);
    }
  }, [profile]);

  useEffect(() => {
    const loadVoices = () => setVoiceOptions(getSpeechVoices());
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  async function handleSend(text: string) {
    if (!text.trim() || busy) return;
    const userMsg: Message = { role: 'user', content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setBusy(true);

    try {
      const history = [...messages, userMsg].slice(-20).map(m => ({ role: m.role, content: m.content }));
      const res = await apiPost<{ text: string; attempts: number }>('/agent/chat', {
        provider: currentProvider,
        messages: history,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.text, ts: Date.now() }]);
      if (res.attempts > 1) showToast(`Rotated ${res.attempts} keys`, 'success');
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}`, error: true, ts: Date.now() }]);
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function newSession() {
    if (!confirm('Start a new session? Current chat will be cleared.')) return;
    try {
      await apiDelete('/agent/history');
      setMessages([]);
      setSidebarOpen(false);
      showToast('New session started', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  }

  async function changeProvider(p: string) {
    setCurrentProvider(p);
    try {
      await apiPut('/profile', { provider: p });
      await refreshMe();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  }

  async function updatePreferences(changes: Partial<Profile>) {
    try {
      await apiPut('/profile', changes);
      await refreshMe();
      showToast('Preferences saved', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  }

  async function addKey(provider: string, key: string, label: string) {
    try {
      await apiPost('/keys', { provider, key, label });
      const kRes = await apiGet<{ keys: ApiKey[] }>('/keys');
      setKeys(kRes.keys);
      showToast('Key added', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  }

  async function deleteKey(id: string) {
    if (!confirm('Delete this API key?')) return;
    try {
      await apiDelete(`/keys/${id}`);
      const kRes = await apiGet<{ keys: ApiKey[] }>('/keys');
      setKeys(kRes.keys);
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  }

  async function toggleKey(id: string) {
    try {
      await apiPost(`/keys/${id}/toggle`);
      const kRes = await apiGet<{ keys: ApiKey[] }>('/keys');
      setKeys(kRes.keys);
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  }

  const isDesktop = device.isDesktop;

  return (
    <div className="dash">
      <div className="wallpaper-layer" />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onNewSession={newSession}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={logout}
        onOpenTerminal={isDesktop ? () => setTerminalOpen(true) : undefined}
        device={device}
      />

      <div className="main-col">
        <div className="topbar">
          <button className="icon-btn" onClick={() => setSidebarOpen(true)} style={{ display: device.isMobile ? 'grid' : 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <div className="topbar-title">
            <h1>{profile ? 'Epic' : 'Epic'}</h1>
            <p>{busy ? 'Thinking…' : `${currentProvider} · ${device.os}`}</p>
          </div>
          <div className={`badge ${keys.filter(k => k.enabled).length > 0 ? 'on' : ''}`}>
            <span className="dot" />
            {keys.filter(k => k.enabled).length} key{keys.filter(k => k.enabled).length !== 1 ? 's' : ''}
          </div>
          {isDesktop && (
            <button className="icon-btn" onClick={() => setTerminalOpen(true)} title="Open terminal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
            </button>
          )}
          <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          </button>
        </div>

        <Chat messages={messages} busy={busy} onSend={handleSend} agentName="Epic" profile={profile} />

        {terminalOpen && isDesktop && (
          <Terminal onClose={() => setTerminalOpen(false)} onToast={showToast} />
        )}
      </div>

      {settingsOpen && (
        <>
          <div className="drawer-backdrop open" onClick={() => setSettingsOpen(false)} />
          <aside className="drawer open">
            <div className="drawer-head">
              <h2>Settings</h2>
              <button className="icon-btn" onClick={() => setSettingsOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="drawer-body">
              <div className="drawer-sec">
                <h3>Appearance</h3>
                <div className="opt-row">
                  {['none', 'aurora', 'dots', 'grid', 'mesh'].map(wallpaper => (
                    <button key={wallpaper} type="button" className={`opt-btn ${profile?.wallpaper === wallpaper ? 'active' : ''}`} onClick={() => updatePreferences({ wallpaper })}>
                      {wallpaper[0].toUpperCase() + wallpaper.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="opt-row setting-gap">
                  {(['small', 'medium', 'large', 'xlarge'] as const).map(font_scale => (
                    <button key={font_scale} type="button" className={`opt-btn ${profile?.font_scale === font_scale ? 'active' : ''}`} onClick={() => updatePreferences({ font_scale })}>
                      {font_scale === 'xlarge' ? 'XL' : font_scale[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="drawer-sec">
                <h3>Voice</h3>
                <select className="voice-select" value={profile?.voice || ''} onChange={e => updatePreferences({ voice: e.target.value })}>
                  <option value="">System default</option>
                  {voiceOptions.map(voice => <option key={voice.name} value={voice.name}>{voice.name} · {voice.lang}</option>)}
                </select>
                <div className="opt-row setting-gap">
                  {(['low', 'medium', 'high'] as const).map(pitch => (
                    <button key={pitch} type="button" className={`opt-btn ${profile?.pitch === pitch ? 'active' : ''}`} onClick={() => updatePreferences({ pitch })}>{pitch}</button>
                  ))}
                  <button type="button" className="opt-btn" onClick={() => profile && speakText('Hello, I am Epic. Your voice settings are ready.', profile)}>Preview</button>
                </div>
              </div>

              <div className="drawer-sec">
                <h3>Provider</h3>
                <div className="opt-row">
                  {providers.map(p => (
                    <button key={p.id} type="button" className={`opt-btn ${currentProvider === p.id ? 'active' : ''}`} onClick={() => changeProvider(p.id)}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="drawer-sec">
                <h3>API Keys ({keys.length})</h3>
                <KeyAddForm providers={providers} onAdd={addKey} />
                {keys.length === 0 ? (
                  <p style={{ color: 'var(--text-3)', fontSize: '.85rem', textAlign: 'center', padding: '1rem' }}>No keys yet. Add one above to get started.</p>
                ) : (
                  keys.map(k => {
                    const cooling = k.cooldown_until > Date.now();
                    return (
                      <div key={k.id} className={`key-item ${!k.enabled ? 'disabled' : ''}`}>
                        <span className={`key-status ${!k.enabled ? 'off' : cooling ? 'cooling' : ''}`} />
                        <div className="key-info">
                          <strong>{k.label}</strong>
                          <span>{k.masked}</span>
                        </div>
                        <div className="key-actions">
                          <button onClick={() => toggleKey(k.id)} title={k.enabled ? 'Disable' : 'Enable'}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              {k.enabled ? <><path d="M18.36 6.64A9 9 0 1 1 5.64 19.36" /><path d="M12 2v10" /></> : <><path d="M5 12h14M13 6l6 6-6 6" /></>}
                            </svg>
                          </button>
                          <button className="danger" onClick={() => deleteKey(k.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="drawer-sec">
                <h3>Account</h3>
                <button className="btn btn-ghost" onClick={logout}>
                  Sign out
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {toast && <div className={`toast show ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}

function KeyAddForm({ providers, onAdd }: { providers: ProviderInfo[]; onAdd: (p: string, k: string, l: string) => void }) {
  const [provider, setProvider] = useState(providers[0]?.id || 'gemini');
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    onAdd(provider, key.trim(), label.trim());
    setKey('');
    setLabel('');
  }

  return (
    <form className="key-add" onSubmit={submit}>
      <div className="row">
        <select value={provider} onChange={e => setProvider(e.target.value)}>
          {providers.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <input type="password" placeholder="API key…" value={key} onChange={e => setKey(e.target.value)} autoComplete="off" spellCheck={false} />
      </div>
      <div className="row">
        <input type="text" placeholder="Label (optional)" value={label} onChange={e => setLabel(e.target.value)} />
        <button type="submit">Add</button>
      </div>
    </form>
  );
}
