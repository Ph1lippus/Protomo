import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { TimerSession } from '../types';

export const Timer: React.FC = () => {
  const [studyMinutes, setStudyMinutes] = useState(() => {
    const saved = localStorage.getItem('protomoStudy');
    return saved ? parseInt(saved, 10) : 25;
  });
  
  const [breakMinutes, setBreakMinutes] = useState(() => {
    const saved = localStorage.getItem('protomoBreak');
    return saved ? parseInt(saved, 10) : 5;
  });
  
  const [remainingSeconds, setRemainingSeconds] = useState(studyMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isStudy, setIsStudy] = useState(true);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(() => {
    const saved = localStorage.getItem('protomoTotal');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [clockTime, setClockTime] = useState('--:--');
  const [dateStr, setDateStr] = useState('--');
  const [showSettings, setShowSettings] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem('protomoTheme');
    return saved === 'light';
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timerIntervalRef = useRef<any>(null);
  const { user } = useAuth();

  const loadUserData = useCallback(async () => {
    if (!user) return;

    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settings) {
      setStudyMinutes(settings.study_minutes);
      setBreakMinutes(settings.break_minutes);
      if (settings.theme === 'light') {
        setIsLightMode(true);
        document.body.classList.add('light-mode');
      }
    }

    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (stats) {
      setTotalStudyMinutes(stats.total_study_minutes);
    }
  }, [user]);

  const startClock = useCallback(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      setClockTime(timeStr);
      setDateStr(date);
    };
    updateClock();
    setInterval(updateClock, 1000);
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
    startClock();
  }, [user, loadUserData, startClock]);

  const saveToSupabase = async (type: 'study' | 'break', duration: number) => {
    if (!user) return;

    const entry: Partial<TimerSession> = {
      user_id: user.id,
      type,
      duration,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5)
    };

    await supabase.from('sessions').insert(entry);

    if (type === 'study') {
      const newTotal = totalStudyMinutes + duration;
      setTotalStudyMinutes(newTotal);
      localStorage.setItem('protomoTotal', String(newTotal));
      
      await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          total_study_minutes: newTotal
        });
    }
  };

  const tick = () => {
    setRemainingSeconds(prev => {
      const next = prev - 1;
      
      if (next <= 0) {
        const completed = isStudy ? studyMinutes : breakMinutes;
        saveToSupabase(isStudy ? 'study' : 'break', completed);
        
        const nowStudy = !isStudy;
        setIsStudy(nowStudy);
        return nowStudy ? studyMinutes * 60 : breakMinutes * 60;
      }
      
      return next;
    });
  };

  const toggleStartPause = () => {
    if (isRunning) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setIsRunning(false);
    } else {
      timerIntervalRef.current = setInterval(tick, 1000);
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRunning(false);
    setIsStudy(true);
    setRemainingSeconds(studyMinutes * 60);
  };

  const skipBlock = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRunning(false);
    
    const nowStudy = !isStudy;
    setIsStudy(nowStudy);
    setRemainingSeconds(nowStudy ? studyMinutes * 60 : breakMinutes * 60);
  };

  const applyConfig = () => {
    const newStudy = studyMinutes;
    const newBreak = breakMinutes;

    if (newStudy < 1 || newBreak < 1) return;

    localStorage.setItem('protomoStudy', String(newStudy));
    localStorage.setItem('protomoBreak', String(newBreak));

    if (!isRunning) {
      setRemainingSeconds(newStudy * 60);
      setIsStudy(true);
    }

    if (user) {
      supabase.from('user_settings').upsert({
        user_id: user.id,
        study_minutes: newStudy,
        break_minutes: newBreak,
        theme: isLightMode ? 'light' : 'dark'
      });
    }

    setShowSettings(false);
  };

  const toggleTheme = () => {
    const nowLight = !isLightMode;
    setIsLightMode(nowLight);
    document.body.classList.toggle('light-mode', nowLight);
    localStorage.setItem('protomoTheme', nowLight ? 'light' : 'dark');
  };

  const handleStudyChange = (value: number) => {
    if (value >= 1) setStudyMinutes(value);
  };

  const handleBreakChange = (value: number) => {
    if (value >= 1) setBreakMinutes(value);
  };

  const formatTime = () => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    const minuteDigits = String(minutes).padStart(2, '0').split('');
    const secondDigits = String(seconds).padStart(2, '0').split('');

    return {
      minuteTens: minuteDigits[0],
      minuteOnes: minuteDigits[1],
      secondTens: secondDigits[0],
      secondOnes: secondDigits[1]
    };
  };

  const { minuteTens, minuteOnes, secondTens, secondOnes } = formatTime();

  const toggleMenu = () => {
    setShowThemeMenu(prev => !prev);
  };

  const syncThemeSwitch = () => {
    const switchEl = document.getElementById('themeSwitch') as HTMLInputElement;
    if (switchEl) {
      switchEl.checked = isLightMode;
    }
  };

  useEffect(() => {
    syncThemeSwitch();
  }, [isLightMode]);

  return (
    <>
      <nav className="navbar" style={{ backgroundColor: '#333232', borderBottom: '2px solid #f9b9f2', padding: '0.8rem 0' }}>
        <div className="container justify-content-center">
          <span className="navbar-brand mb-0 h1" style={{ color: '#eef4ed', fontFamily: "'Cinzel', serif", letterSpacing: '10px', fontWeight: 800 }}>
            PROTOMO
          </span>
        </div>
      </nav>
      
      <nav className="sub-nav">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ width: '40px' }}></div>
            <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center' }}>
              <span style={{ fontWeight: 'bold' }} className="nav-tab active" data-page="timer">Timer</span>
              <span style={{ fontWeight: 'bold' }} className="nav-tab" data-page="history">History</span>
              <span style={{ fontWeight: 'bold' }} className="nav-tab" data-page="dashboard">Dashboard</span>
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
              onClick={toggleMenu}
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
                  <input type="checkbox" id="themeSwitch" checked={isLightMode} onChange={toggleTheme} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="main-container">
        <div className="card-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '640px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px' }}>
            <div style={{ position: 'relative' }} className="card-body text-center p-4 p-md-5">
              <button 
                className="btn-icon btn-custom" 
                style={{ 
                  position: 'absolute', 
                  top: '1.2rem', 
                  right: '1.2rem', 
                  background: 'transparent', 
                  border: 'none', 
                  padding: 0, 
                  fontSize: '1.5rem', 
                  cursor: 'pointer' 
                }} 
                id="settingsToggle" 
                onClick={() => setShowSettings(prev => !prev)}
              >
                <i className="fa-solid fa-gear fa-rotate-270"></i>
              </button>
              
              <div 
                id="modeLabel" 
                className={isStudy ? 'study-mode h3 mb-1' : 'break-mode h3 mb-1'} 
                style={{ letterSpacing: '4px', fontWeight: 700 }}
              >
                {isStudy ? 'STUDY' : 'BREAK'}
              </div>
              
              <div 
                id="timerDisplay" 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  width: '100%', 
                  maxWidth: '100%', 
                  margin: '0 auto', 
                  fontVariantNumeric: 'tabular-nums', 
                  fontFeatureSettings: '"tnum" 1', 
                  fontSize: '6rem', 
                  fontWeight: 700, 
                  letterSpacing: '0.02em', 
                  transition: 'color 0.3s ease', 
                  fontFamily: "'Cinzel', serif", 
                  lineHeight: 1.2, 
                  whiteSpace: 'nowrap', 
                  gap: 0 
                }}
              >
                <span id="timerMinutesTens" className="timer-digit">{minuteTens}</span>
                <span id="timerMinutesOnes" className="timer-digit">{minuteOnes}</span>
                <span className="timer-separator">:</span>
                <span id="timerSecondsTens" className="timer-digit">{secondTens}</span>
                <span id="timerSecondsOnes" className="timer-digit">{secondOnes}</span>
              </div>

              <div className="d-flex gap-3 justify-content-center flex-wrap mt-3">
                <button id="startPauseBtn" className="btn btn-custom btn-study" onClick={toggleStartPause}>
                  {isRunning ? 'Pause' : 'Start'}
                </button>
                <button id="resetBtn" className="btn btn-custom btn-reset" onClick={resetTimer}>Reset</button>
                <button id="skipBtn" className="btn btn-custom btn-skip" onClick={skipBlock}>Skip</button>
              </div>

              <hr style={{ borderColor: '#444', margin: '2.5rem 0 1.5rem' }} />

              <div className="row g-3">
                <div className="col-6">
                  <div className="text-muted small">Current Time</div>
                  <div id="clockDisplay">{clockTime}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted small">Date</div>
                  <div id="dateDisplay">{dateStr}</div>
                </div>
                <div className="col-12 mt-2">
                  <div className="text-muted small">Today's Study</div>
                  <div id="todayStudyDisplay">{totalStudyMinutes} min</div>
                </div>
              </div>
            </div>

            {showSettings && (
              <div 
                id="settingsPanel" 
                style={{ 
                  maxWidth: '400px', 
                  width: '100%', 
                  position: 'absolute', 
                  top: 'calc(100% + 1rem)', 
                  left: '50%', 
                  transform: 'translateX(-50%) translateY(0)', 
                  zIndex: 10, 
                  backgroundColor: 'var(--bg-card)', 
                  border: 'none', 
                  borderRadius: '25px', 
                  padding: '1.2rem 1.8rem', 
                  color: 'var(--text-primary)', 
                  opacity: 1, 
                  pointerEvents: 'all' 
                }}
              >
                <div className="row g-2 justify-content-center mb-4">
                  <div className="col-auto" style={{ textAlign: 'center' }}>
                    <label className="form-label text-muted small">Study (min)</label>
                    <input 
                      type="number" 
                      id="studyInput" 
                      className="form-control" 
                      value={studyMinutes} 
                      min="1" 
                      onChange={(e) => handleStudyChange(parseInt(e.target.value) || 1)}
                      style={{ background: 'transparent', borderColor: '#a0a0a0', fontFamily: "'Cinzel', serif", textAlign: 'center' }} 
                    />
                  </div>
                  <div className="col-auto" style={{ textAlign: 'center' }}>
                    <label className="form-label text-muted small">Break (min)</label>
                    <input 
                      type="number" 
                      id="breakInput" 
                      className="form-control" 
                      value={breakMinutes} 
                      min="1" 
                      onChange={(e) => handleBreakChange(parseInt(e.target.value) || 1)}
                      style={{ background: 'transparent', borderColor: '#a0a0a0', fontFamily: "'Cinzel', serif", textAlign: 'center' }} 
                    />
                  </div>
                </div>
                <div className="row justify-content-center mt-3">
                  <div className="col-auto">
                    <button id="applyBtn" className="btn btn-custom btn-study" onClick={applyConfig}>Apply</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};