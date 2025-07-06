import React, { useState } from 'react';
import ScreenshotUpload from './components/ScreenshotUpload';
import AddUser from './components/AddUser';
import AttendanceDashboard from './components/AttendanceDashboard';
import UserList from './components/UserList';

// Modern dark color scheme
const COLORS = {
  background: '#181f2a', // deep blue
  header: '#22304a',    // slightly lighter blue
  accent: '#ffb347',    // modern orange
  card: '#232c3b',      // card background
  text: '#f4f6fa',      // light text
  navActive: '#26c6da', // teal accent
};

const NAV = {
  upload: 'Upload Screenshot',
  add: 'Add User',
  dashboard: 'Attendance Dashboard',
  users: 'User List',
};

function App() {
  const [page, setPage] = useState('upload');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: COLORS.background, minHeight: '100vh', width: '100vw', color: COLORS.text }}>
      <header style={{ background: COLORS.header, color: COLORS.text, padding: '1rem 0', marginBottom: 24, boxShadow: '0 2px 8px #0002' }}>
        <h1 style={{ textAlign: 'center', margin: 0, fontWeight: 700, letterSpacing: 1, color: COLORS.accent }}>Attendify</h1>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
          {Object.entries(NAV).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              style={{
                background: page === key ? COLORS.navActive : 'transparent',
                color: page === key ? COLORS.background : COLORS.text,
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: page === key ? '0 2px 8px #0002' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '70vh', width: '100%' }}>
        <div style={{ flex: 1, maxWidth: 900 }}>
          {page === 'upload' && <ScreenshotUpload colors={COLORS} />}
          {page === 'add' && <AddUser colors={COLORS} />}
          {page === 'dashboard' && <AttendanceDashboard colors={COLORS} />}
          {page === 'users' && <UserList colors={COLORS} />}
        </div>
      </main>
      <footer style={{ textAlign: 'center', color: COLORS.text, marginTop: 40, padding: 16, opacity: 0.7 }}>
        &copy; {new Date().getFullYear()} Attendify
      </footer>
    </div>
  );
}

export default App;
