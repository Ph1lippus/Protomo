import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <>
      <nav className="navbar" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '2px solid var(--accent-study)', padding: '0.8rem 0' }}>
        <div className="container justify-content-center">
          <span className="navbar-brand mb-0 h1" style={{ color: 'var(--text-primary)', fontFamily: "'Cinzel', serif", letterSpacing: '10px', fontWeight: 800 }}>
            PROTOMO
          </span>
        </div>
      </nav>
      
      <nav className="sub-nav">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '40px' }}></div>
            <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center' }}>
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }} className={`nav-tab ${isActive('/timer') ? 'active' : ''}`} onClick={() => navigate('/timer')}>Timer</span>
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }} className={`nav-tab ${isActive('/history') ? 'active' : ''}`} onClick={() => navigate('/history')}>History</span>
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }} className={`nav-tab ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>Dashboard</span>
            </div>
            <div style={{ width: '40px' }}></div>
          </div>
        </div>
      </nav>
    </>
  );
};