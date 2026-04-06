import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ theme, toggleTheme, currentTeacher }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">📱</div>
          <span>نظام الحضور الذكي</span>
        </Link>

        <ul className="navbar-menu">
          <li>
            <Link to="/scanner" className={`navbar-item ${isActive('/scanner')}`}>
              📷 المسح
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className={`navbar-item ${isActive('/dashboard')}`}>
              📊 لوحة التحكم
            </Link>
          </li>
          <li>
            <Link to="/students" className={`navbar-item ${isActive('/students')}`}>
              👥 الطلاب
            </Link>
          </li>
          <li>
            <Link to="/reports" className={`navbar-item ${isActive('/reports')}`}>
              📄 التقارير
            </Link>
          </li>
          <li>
            <Link to="/settings" className={`navbar-item ${isActive('/settings')}`}>
              ⚙️ الإعدادات
            </Link>
          </li>
        </ul>

        <div className="navbar-actions">
          {currentTeacher && (
            <div className="navbar-user">
              <span>👤</span>
              <span>{currentTeacher.full_name || currentTeacher.name}</span>
            </div>
          )}
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
