import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Timer } from './pages/Timer';
import { History } from './pages/History';
import { Progress } from './pages/Progress';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
// App.css removed - using index.css for global styles

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="main-container d-flex justify-content-center align-items-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/timer" element={
        <PrivateRoute>
          <Timer />
        </PrivateRoute>
      } />
      <Route path="/history" element={
        <PrivateRoute>
          <History />
        </PrivateRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Progress />
        </PrivateRoute>
      } />
      <Route path="/" element={<Navigate to="/timer" />} />
      <Route path="*" element={<Navigate to="/timer" />} />
    </Routes>
  );
}

export default App;