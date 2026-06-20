import { NavLink } from 'react-router-dom';

export function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">Test Design Studio</div>
      <ul className="sidebar-nav">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            ダッシュボード
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/projects"
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            プロジェクト
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
