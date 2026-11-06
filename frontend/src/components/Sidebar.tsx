export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">EpicAgent</div>
      <nav className="nav">
        <a href="#" className="active">
          Dashboard
        </a>
        <a href="#">Chat</a>
        <a href="#">Terminal</a>
        <a href="#">Keys</a>
        <a href="#">Settings</a>
      </nav>
    </aside>
  );
}
