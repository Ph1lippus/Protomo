import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { TimerSession } from '../types';
import Footer from '../components/Footer';
import { Navbar } from '../components/Navbar';

export const Progress: React.FC = () => {
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

  // Calculate daily stats (last 7 days)
  const getDailyStats = () => {
    const now = new Date();
    const dailyData: { date: string; minutes: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayMinutes = sessions
        .filter(s => s.date === dateStr)
        .reduce((total, s) => total + s.duration, 0);
      dailyData.push({
        date: dateStr,
        minutes: dayMinutes
      });
    }
    
    return dailyData;
  };

  // Calculate streak
  const getStreak = () => {
    if (sessions.length === 0) return 0;
    
    const sortedDates = [...new Set(sessions.map(s => s.date))].sort((a, b) => b.localeCompare(a));
    let streak = 0;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(now.getTime() - streak * 24 * 60 * 60 * 1000);
      
      if (sortedDates[i] === expectedDate.toISOString().split('T')[0] || 
          (streak === 0 && sortedDates[i] === today)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Get max daily minutes for chart scaling
  const maxDailyMinutes = Math.max(...getDailyStats().map(d => d.minutes), 1);

  return (
    <>
      <Navbar />

      <div className="main-container">
        <div className="card-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '900px' }}>
          <div className="card" style={{ width: '100%' }}>
            <div className="card-body p-4 p-md-5">
              <h2 className="mb-4" style={{ color: 'var(--accent-study)', fontFamily: "'Cinzel', serif", letterSpacing: '2px' }}>
                Progress Dashboard
              </h2>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-primary)' }}>Loading...</div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="row g-4 mb-5">
                    <div className="col-md-3 col-sm-6">
                      <div className="card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-muted)' }}>
                        <div className="card-body text-center">
                          <div className="text-muted small mb-2">Total Study Time</div>
                          <div className="h1" style={{ color: 'var(--accent-study)' }}>{totalStudyMinutes}</div>
                          <div style={{ color: 'var(--text-primary)' }}>minutes</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <div className="card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-muted)' }}>
                        <div className="card-body text-center">
                          <div className="text-muted small mb-2">This Week</div>
                          <div className="h1" style={{ color: 'var(--accent-study)' }}>{getWeeklyStats()}</div>
                          <div style={{ color: 'var(--text-primary)' }}>minutes</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                  {/* Stats Cards */}
                  <div className="row g-4 mb-5">
                    <div className="col-md-3 col-sm-6">
                      <div className="card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-muted)' }}>
                        <div className="card-body text-center">
                          <div className="text-muted small mb-2">Total Study Time</div>
                          <div className="h1" style={{ color: 'var(--accent-study)' }}>{totalStudyMinutes}</div>
                          <div style={{ color: 'var(--text-primary)' }}>minutes</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <div className="card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-muted)' }}>
                        <div className="card-body text-center">
                          <div className="text-muted small mb-2">This Week</div>
                          <div className="h1" style={{ color: 'var(--accent-study)' }}>{getWeeklyStats()}</div>
                          <div style={{ color: 'var(--text-primary)' }}>minutes</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <div className="card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-muted)' }}>
                        <div className="card-body text-center">
                          <div className="text-muted small mb-2">This Month</div>
                          <div className="h1" style={{ color: 'var(--accent-study)' }}>{getMonthlyStats()}</div>
                          <div style={{ color: 'var(--text-primary)' }}>minutes</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <div className="card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-muted)' }}>
                        <div className="card-body text-center">
                          <div className="text-muted small mb-2">Current Streak</div>
                          <div className="h1" style={{ color: 'var(--accent-study)' }}>{getStreak()}</div>
                          <div style={{ color: 'var(--text-primary)' }}>days</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Activity Chart */}
                  <div className="mb-4">
                    <h4 style={{ color: 'var(--text-primary)', fontFamily: "'Cinzel', serif", letterSpacing: '1px', marginBottom: '1rem' }}>
                      Last 7 Days Activity
                    </h4>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-end', 
                      gap: '0.5rem', 
                      height: '120px',
                      padding: '0.5rem 0'
                    }}>
                      {getDailyStats().map((day, index) => (
                        <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ 
                            width: '100%', 
                            height: `${Math.max((day.minutes / maxDailyMinutes) * 100, 5)}px`,
                            backgroundColor: day.minutes > 0 ? 'var(--accent-study)' : 'var(--text-muted)',
                            borderRadius: '4px 4px 0 0',
                            minHeight: '5px',
                            transition: 'height 0.3s ease'
                          }}></div>
                          <span style={{ 
                            color: 'var(--text-muted)', 
                            fontSize: '0.7rem', 
                            marginTop: '0.25rem',
                            fontFamily: "'Cinzel', serif"
                          }}>
                            {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Session Count */}
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-muted)' }}>
                        <div className="card-body">
                          <h5 style={{ color: 'var(--text-primary)', fontFamily: "'Cinzel', serif", letterSpacing: '1px', marginBottom: '1rem' }}>
                            Session Statistics
                          </h5>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Sessions</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{sessions.length}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Average per Session</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                              {sessions.length > 0 ? Math.round(totalStudyMinutes / sessions.length) : 0} min
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Longest Session</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                              {sessions.length > 0 ? Math.max(...sessions.map(s => s.duration)) : 0} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-muted)' }}>
                        <div className="card-body">
                          <h5 style={{ color: 'var(--text-primary)', fontFamily: "'Cinzel', serif", letterSpacing: '1px', marginBottom: '1rem' }}>
                            Study Insights
                          </h5>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Total Hours</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                              {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Daily Average</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                              {sessions.length > 0 ? Math.round(totalStudyMinutes / 30) : 0} min
                            </span>
                          </div>
