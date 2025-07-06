import React, { useEffect, useState } from 'react';

const AttendanceDashboard = () => {
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
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8, background: '#f9f9fb' }}>
      <h2 style={{ color: '#2d72d9', marginBottom: 8 }}>Attendify</h2>
      <h3 style={{ marginTop: 0 }}>Attendance Dashboard</h3>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Filter by user name"
          value={user}
          onChange={e => setUser(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button onClick={fetchAttendance} style={{ background: '#2d72d9', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#f0f4fa' }}>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Name</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Date</th>
              <th style={{ padding: 8, border: '1px solid #eee' }}>Present</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: 16 }}>No records found.</td></tr>
            ) : (
              attendance.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{row.name}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{row.date}</td>
                  <td style={{ padding: 8, border: '1px solid #eee' }}>{row.present ? '✔️' : '❌'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendanceDashboard; 