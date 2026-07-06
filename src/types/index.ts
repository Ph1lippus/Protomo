export interface TimerSession {
  id?: string;
  user_id?: string;
  type: 'study' | 'break';
  duration: number;
  date: string;
  time: string;
  created_at?: string;
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  study_minutes: number;
  break_minutes: number;
  theme: 'light' | 'dark';
  created_at?: string;
}

export interface UserStats {
  id?: string;
  user_id?: string;
  total_study_minutes: number;
  created_at?: string;
}