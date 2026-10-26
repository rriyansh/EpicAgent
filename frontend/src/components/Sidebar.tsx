
import { X, Plus, Settings, LogOut, Terminal as TermIcon } from 'lucide-react';
import { User } from '../types';
import { DeviceInfo } from '../lib/device';

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onNewSession: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenTerminal?: () => void;
  device: DeviceInfo;
  avatar?: string | null;
}

export default function Sidebar({ open, onClose, user, onNewSession, onOpenSettings, onLogout, onOpenTerminal, device, avatar }: Props) {
  const initial = (user?.name || user?.email || 'E').charAt(0).toUpperCase();

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sb-head">
        <div className={`sb-avatar ${avatar ? 'has-image' : ''}`} style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}>{avatar ? null : initial}</div>
        <div className="sb-name">
          <strong>{user?.name || 'Epic user'}</strong>
          <span>{device.os} · {device.browser}</span>
        </div>
        {device.isMobile && (
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        )}
      </div>

      <button className="sb-new" onClick={onNewSession}>
        <Plus size={16} /> New session
      </button>

      <div className="sb-sec">
        <div className="sb-label">Tools</div>
        {onOpenTerminal && (
          <button className="sb-item" onClick={onOpenTerminal}>
            <TermIcon size={16} /> Terminal
          </button>
        )}
        <button className="sb-item" onClick={onOpenSettings}>
          <Settings size={16} /> Settings & keys
        </button>
      </div>

      <div className="sb-foot">
        <button className="sb-profile" onClick={onOpenSettings}>
          <div className={`sb-avatar ${avatar ? 'has-image' : ''}`} style={avatar ? { width: '2rem', height: '2rem', fontSize: '.8rem', backgroundImage: `url(${avatar})` } : { width: '2rem', height: '2rem', fontSize: '.8rem' }}>{avatar ? null : initial}</div>
          <div className="sb-profile-info">
            <strong>{user?.name || 'Epic user'}</strong>
            <span>{user?.email}</span>
          </div>
        </button>
        <button className="sb-item" onClick={onLogout} style={{ marginTop: '.5rem' }}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
