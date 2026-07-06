import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { TimerSession } from '../types';

export const Progress: React.FC = () => {
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    
    // Get all sessions
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'study');

    if (sessionData) {
      setSessions(sessionData);
    }

    // Get total study minutes
    const { data: statsData } = await supabase
      .from('user_stats')
      .select('total_study_minutes')
      .eq('user_id', user.id)
      .single();

    if (statsData) {
      setTotalStudyMinutes(statsData.total_study_minutes);
    }
    
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklySessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= weekAgo;
    });
    
    return weeklySessions.reduce((total, s) => total + s.duration, 0);
  };

  // Calculate monthly stats
  const getMonthlyStats = () => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const monthlySessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= monthAgo;
    });
    
    return monthlySessions.reduce((total, s) => total + s.duration, 0);
  };

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '40px' }}></div>
            <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center' }}>
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }} className="nav-tab" onClick={() => navigate('/timer')}>Timer</span>
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }} className="nav-tab" onClick={() => navigate('/history')}>History</span>
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }} className="nav-tab active" onClick={() => navigate('/dashboard')}>Dashboard</span>
            </div>
            <div style={{ width: '40px' }}></div>
          </div>
        </div>
      </nav>

      <div className="main-container">
        <div className="card-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '800px' }}>
          <div className="card" style={{ width: '100%' }}>
            <div className="card-body p-4 p-md-5">
              <h2 className="mb-4" style={{ color: 'var(--accent-study)', fontFamily: "'Cinzel', serif", letterSpacing: '2px' }}>
                Progress Dashboard
              </h2>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
              ) : (
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-muted)' }}>
                      <div className="card-body text-center">
                        <div className="text-muted small mb-2">Total Study Time</div>
                        <div className="h1" style={{ color: 'var(--accent-study)' }}>{totalStudyMinutes}</div>
                        <div style={{ color: 'var(--text-primary)' }}>minutes</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-muted)' }}>
                      <div className="card-body text-center">
                        <div className="text-muted small mb-2">This Week</div>
                        <div className="h1" style={{ color: 'var(--accent-study)' }}>{getWeeklyStats()}</div>
                        <div style={{ color: 'var(--text-primary)' }}>minutes</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-muted)' }}>
                      <div className="card-body text-center">
                        <div className="text-muted small mb-2">This Month</div>
                        <div className="h1" style={{ color: 'var(--accent-study)' }}>{getMonthlyStats()}</div>
                        <div style={{ color: 'var(--text-primary)' }}>minutes</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};