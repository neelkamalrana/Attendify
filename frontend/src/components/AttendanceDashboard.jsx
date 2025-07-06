import React, { useEffect, useState } from 'react';

const AttendanceDashboard = ({ colors }) => {
  const [attendance, setAttendance] = useState([]);
  const [user, setUser] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    let url = 'http://127.0.0.1:5000/attendance';
    const params = [];
    if (user) params.push(`user=${encodeURIComponent(user)}`);
    if (month) params.push(`month=${month}`);
    if (params.length) url += '?' + params.join('&');
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setAttendance(data.attendance);
      } else {
        setError(data.error || 'Failed to fetch attendance');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line
  }, [user, month]);

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 0, borderRadius: 10, boxShadow: '0 2px 12px #0003', background: colors.card, color: colors.text }}>
      <div style={{ background: colors.header, color: colors.accent, borderTopLeftRadius: 10, borderTopRightRadius: 10, padding: '1.2rem 1rem 1rem 1rem', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 24 }}>Attendify</h2>
        <h3 style={{ margin: 0, color: colors.text, fontWeight: 400 }}>Attendance Dashboard</h3>
      </div>
      <div style={{ display: 'flex', gap: 12, margin: '24px 24px 16px 24px' }}>
        <input
          type="text"
          placeholder="Filter by user name"
          value={user}
          onChange={e => setUser(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: `1px solid ${colors.header}`, background: colors.background, color: colors.text }}
        />
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: `1px solid ${colors.header}`, background: colors.background, color: colors.text }}
        />
        <button onClick={fetchAttendance} style={{ background: colors.accent, color: colors.background, border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>
          Refresh
        </button>
      </div>
      {loading ? (
        <div style={{ margin: '0 24px', color: colors.text }}>Loading...</div>
      ) : error ? (
        <div style={{ color: '#ff5252', margin: '0 24px' }}>{error}</div>
      ) : (
        <div style={{ margin: '0 24px 24px 24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: colors.card, color: colors.text }}>
            <thead>
              <tr style={{ background: colors.header }}>
                <th style={{ padding: 8, border: `1px solid ${colors.background}` }}>Name</th>
                <th style={{ padding: 8, border: `1px solid ${colors.background}` }}>Date</th>
                <th style={{ padding: 8, border: `1px solid ${colors.background}` }}>Present</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 16 }}>No records found.</td></tr>
              ) : (
                attendance.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 8, border: `1px solid ${colors.background}` }}>{row.name}</td>
                    <td style={{ padding: 8, border: `1px solid ${colors.background}` }}>{row.date}</td>
                    <td style={{ padding: 8, border: `1px solid ${colors.background}` }}>{row.present ? <span style={{ color: '#4caf50' }}>✔️</span> : <span style={{ color: '#ff5252' }}>❌</span>}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard; 