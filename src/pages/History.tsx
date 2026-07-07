import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { TimerSession } from '../types';
import Footer from '../components/Footer';
import { Navbar } from '../components/Navbar';

export const History: React.FC = () => {
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
      <Navbar />

      <div className="main-container">
        <div className="card-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '800px' }}>
          <div className="card" style={{ width: '100%' }}>
            <div className="card-body p-4 p-md-5">
              <h2 className="mb-4" style={{ color: 'var(--accent-study)', fontFamily: "'Cinzel', serif", letterSpacing: '2px' }}>
                Session History
              </h2>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-primary)' }}>Loading...</div>
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
<tr key={index} className="table-row">
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
      <Footer />
    </>
  );
};