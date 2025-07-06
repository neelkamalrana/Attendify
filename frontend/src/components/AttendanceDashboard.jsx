import React, { useEffect, useState } from 'react';

const getCurrentMonth = () => {
  const now = new Date();
  return now.toISOString().slice(0, 7); // 'YYYY-MM'
};
const getCurrentISOWeek = () => {
  const now = new Date();
  const year = now.getFullYear();
  const week = Math.ceil(((now - new Date(year, 0, 1)) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7);
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

const AttendanceDashboard = ({ colors }) => {
  const [attendance, setAttendance] = useState([]);
  const [user, setUser] = useState('');
  const [month, setMonth] = useState(getCurrentMonth());
  const [week, setWeek] = useState(getCurrentISOWeek());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState([]);
  const [summaryType, setSummaryType] = useState('month');

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

  const fetchSummary = async () => {
    setError(null);
    let url = 'http://127.0.0.1:5000/attendance/summary?';
    if (summaryType === 'month') {
      url += `period=month&value=${month}`;
    } else {
      url += `period=week&value=${week}`;
    }
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
      } else {
        setSummary([]);
        setError(data.error || 'Failed to fetch summary');
      }
    } catch (err) {
      setSummary([]);
      setError('Network error');
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line
  }, [user, month]);

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line
  }, [summaryType, month, week]);

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 0, borderRadius: 10, boxShadow: '0 2px 12px #0003', background: colors.card, color: colors.text }}>
      <div style={{ background: colors.header, color: colors.accent, borderTopLeftRadius: 10, borderTopRightRadius: 10, padding: '1.2rem 1rem 1rem 1rem', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 24 }}>Attendify</h2>
        <h3 style={{ margin: 0, color: colors.text, fontWeight: 400 }}>Attendance Dashboard</h3>
      </div>
      {/* Summary Section */}
      <div style={{ margin: '24px 24px 0 24px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 600, color: colors.accent }}>Summary:</span>
          <button
            onClick={() => setSummaryType('month')}
            style={{ background: summaryType === 'month' ? colors.accent : colors.header, color: summaryType === 'month' ? colors.background : colors.text, border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Monthly
          </button>
          <button
            onClick={() => setSummaryType('week')}
            style={{ background: summaryType === 'week' ? colors.accent : colors.header, color: summaryType === 'week' ? colors.background : colors.text, border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Weekly
          </button>
          {summaryType === 'month' ? (
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              style={{ marginLeft: 12, padding: 6, borderRadius: 4, border: `1px solid ${colors.header}`, background: colors.background, color: colors.text }}
            />
          ) : (
            <input
              type="text"
              value={week}
              onChange={e => setWeek(e.target.value)}
              placeholder="YYYY-Www"
              style={{ marginLeft: 12, padding: 6, borderRadius: 4, border: `1px solid ${colors.header}`, background: colors.background, color: colors.text, width: 110 }}
            />
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          {summary.length === 0 ? (
            <div style={{ color: colors.text, opacity: 0.7 }}>No summary data.</div>
          ) : (
            summary.map((user, idx) => (
              <div key={idx} style={{ background: colors.header, color: colors.accent, borderRadius: 8, boxShadow: '0 2px 8px #0002', padding: '18px 24px', minWidth: 140, textAlign: 'center', flex: '1 0 120px' }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: colors.accent, margin: '8px 0' }}>{user.present_days}</div>
                <div style={{ color: colors.text, fontWeight: 400, fontSize: 13 }}>{summaryType === 'month' ? 'Days Present (Month)' : 'Days Present (Week)'}</div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Filter and Table Section */}
      <div style={{ display: 'flex', gap: 12, margin: '0 24px 16px 24px' }}>
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