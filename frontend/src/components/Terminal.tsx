
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { apiGet, apiPost } from '../lib/api';

interface Line { type: 'cmd' | 'out' | 'err' | 'info'; text: string; }

interface Props {
  onClose: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | '') => void;
}

export default function Terminal({ onClose, onToast }: Props) {
  const [lines, setLines] = useState<Line[]>([
    { type: 'info', text: 'Epic Terminal — allowlisted commands only. All commands require confirmation.' },
    { type: 'info', text: 'Type "help" to see available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState<{ command: string; args: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  function addLine(type: Line['type'], text: string) {
    setLines(prev => [...prev, { type, text }]);
  }

  function parseInput(raw: string): { command: string; args: string[] } | null {
    const parts = raw.trim().split(/\s+/);
    if (!parts.length || !parts[0]) return null;
    return { command: parts[0], args: parts.slice(1) };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseInput(input);
    if (!parsed) return;
    if (parsed.command === 'help') {
      try {
        const res = await apiGet<{ commands: string[] }>('/system/terminal/commands');
        addLine('info', `Available commands: ${res.commands.join(', ')}`);
      } catch {
        addLine('err', 'Could not load allowed commands.');
      }
      setInput('');
      return;
    }
    if (parsed.command === 'clear') {
      setLines([]);
      setInput('');
      return;
    }
    addLine('cmd', `$ ${input}`);
    setInput('');
    setPending(parsed);
  }

  async function confirmRun() {
    if (!pending) return;
    const { command, args } = pending;
    setPending(null);
    setBusy(true);
    try {
      const res = await apiPost<{ stdout: string; stderr: string }>('/system/terminal/run', {
        command,
        args,
        confirmed: true,
      });
      if (res.stdout) addLine('out', res.stdout);
      if (res.stderr) addLine('err', res.stderr);
      if (!res.stdout && !res.stderr) addLine('info', '(no output)');
    } catch (e: any) {
      addLine('err', e.message);
      onToast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  function cancelRun() {
    addLine('info', 'Cancelled.');
    setPending(null);
  }

  return (
    <>
      <div className="terminal-panel" style={{ margin: '0 1rem 1rem', maxHeight: 340 }}>
        {lines.map((l, i) => (
          <div key={i} className={`line ${l.type === 'cmd' ? 'cmd' : l.type === 'err' ? 'err' : l.type === 'info' ? 'info' : ''}`}>
            {l.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="term-row" style={{ padding: '0 1rem 1rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '.35rem', width: '100%' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a command… (help for list)"
            disabled={busy || !!pending}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" disabled={busy || !input.trim() || !!pending}>Run</button>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '.55rem .8rem', borderRadius: 'var(--r-sm)' }}>
            <X size={16} />
          </button>
        </form>
      </div>

      {pending && (
        <div className="modal-backdrop" onClick={cancelRun}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Confirm command</h3>
            <p>Epic is about to run this command on your machine. Only approve if you trust the request.</p>
            <div className="cmd-preview">$ {pending.command} {pending.args.join(' ')}</div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={cancelRun}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmRun}>Run</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}