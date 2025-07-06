import React, { useState } from 'react';
import ScreenshotUpload from './components/ScreenshotUpload';
import AddUser from './components/AddUser';
import AttendanceDashboard from './components/AttendanceDashboard';

const NAV = {
  upload: 'Upload Screenshot',
  add: 'Add User',
  dashboard: 'Attendance Dashboard',
};

function App() {
  const [page, setPage] = useState('upload');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f4f6fa', minHeight: '100vh' }}>
      <header style={{ background: '#2d72d9', color: '#fff', padding: '1rem 0', marginBottom: 24, boxShadow: '0 2px 8px #0001' }}>
        <h1 style={{ textAlign: 'center', margin: 0, fontWeight: 700, letterSpacing: 1 }}>Attendify</h1>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
          {Object.entries(NAV).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPage(key)}
              style={{
                background: page === key ? '#fff' : 'transparent',
                color: page === key ? '#2d72d9' : '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: page === key ? '0 2px 8px #0001' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {page === 'upload' && <ScreenshotUpload />}
        {page === 'add' && <AddUser />}
        {page === 'dashboard' && <AttendanceDashboard />}
      </main>
      <footer style={{ textAlign: 'center', color: '#888', marginTop: 40, padding: 16 }}>
        &copy; {new Date().getFullYear()} Attendify
      </footer>
    </div>
  );
}

export default App;
