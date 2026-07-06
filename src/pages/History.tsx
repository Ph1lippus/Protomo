import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { TimerSession } from '../types';

export const History: React.FC = () => {
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadSessions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (data) {
      setSessions(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-');
    return `${day}/${month}/${year}`;
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
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }} className="nav-tab active" onClick={() => navigate('/history')}>History</span>
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }} className="nav-tab" onClick={() => navigate('/dashboard')}>Dashboard</span>
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
                Session History
              </h2>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
              ) : sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No sessions recorded yet. Start the timer to track your progress!
                </div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table" style={{ color: 'var(--text-primary)', marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--text-muted)' }}>Date</th>
                        <th style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--text-muted)' }}>Time</th>
                        <th style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--text-muted)' }}>Type</th>
                        <th style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--text-muted)' }}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <td style={{ color: 'var(--text-primary)' }}>{formatDate(session.date)}</td>
                          <td style={{ color: 'var(--text-primary)' }}>{session.time}</td>
                          <td>
                            <span className={session.type === 'study' ? 'study-mode' : 'break-mode'}>
                              {session.type === 'study' ? 'STUDY' : 'BREAK'}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-primary)' }}>{session.duration} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};