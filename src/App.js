import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Scanner from './pages/Scanner';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'YOUR_APPS_SCRIPT_URL_HERE';

function App() {
  const [theme, setTheme] = useState('light');
  const [currentTeacher, setCurrentTeacher] = useState(null);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Load teacher info
    const teacher = localStorage.getItem('currentTeacher');
    if (teacher) {
      setCurrentTeacher(JSON.parse(teacher));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleTeacherLogin = (teacher) => {
    setCurrentTeacher(teacher);
    localStorage.setItem('currentTeacher', JSON.stringify(teacher));
  };

  return (
    <Router>
      <div className="App">
        <Navbar 
          theme={theme} 
          toggleTheme={toggleTheme}
          currentTeacher={currentTeacher}
        />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Navigate to="/scanner" replace />} />
            <Route 
              path="/scanner" 
              element={
                <Scanner 
                  currentTeacher={currentTeacher}
                  onTeacherLogin={handleTeacherLogin}
                />
              } 
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
