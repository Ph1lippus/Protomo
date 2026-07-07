import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarWithThemeProps {
  isLightMode: boolean;
  onThemeToggle: () => void;
  showThemeMenu: boolean;
  onMenuToggle: () => void;
}

export const NavbarWithTheme: React.FC<NavbarWithThemeProps> = ({ 
  isLightMode, 
  onThemeToggle, 
  showThemeMenu, 
  onMenuToggle 
}) => {
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ width: '40px' }}></div>
            <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center' }}>
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }} className={`nav-tab ${isActive('/timer') ? 'active' : ''}`} onClick={() => navigate('/timer')}>Timer</span>
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }} className={`nav-tab ${isActive('/history') ? 'active' : ''}`} onClick={() => navigate('/history')}>History</span>
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }} className={`nav-tab ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>Dashboard</span>
            </div>
            <button 
              id="menuToggle" 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                padding: '0.4rem', 
                fontSize: '1.3rem', 
                cursor: 'pointer', 
                color: 'var(--text-primary)', 
                transition: 'transform 0.3s ease',
                transform: showThemeMenu ? 'rotate(90deg)' : undefined
              }} 
              onClick={onMenuToggle}
            >
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <div 
              id="themeMenu" 
              style={{ 
                display: showThemeMenu ? 'block' : 'none', 
                position: 'absolute', 
                right: 0, 
                top: 'calc(100% + 0.5rem)', 
                backgroundColor: 'var(--bg-card)', 
                borderRadius: '12px', 
                padding: '0.8rem 1.2rem', 
                minWidth: '180px', 
                boxShadow: '0 15px 50px rgba(0,0,0,0.6)', 
                zIndex: 20, 
                border: '1px solid rgba(255,255,255,0.06)' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ fontFamily: "'Cinzel'", fontSize: '0.85rem', color: 'var(--text-primary)' }}>Dark Mode</span>
                <label className="switch">
                  <input type="checkbox" id="themeSwitch" checked={isLightMode} onChange={onThemeToggle} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};