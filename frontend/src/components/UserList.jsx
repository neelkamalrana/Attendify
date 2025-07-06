import React, { useEffect, useState } from 'react';

const IMAGE_BASE = 'http://127.0.0.1:5000/static/images/';

const UserList = ({ colors }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://127.0.0.1:5000/users');
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
        } else {
          setError(data.error || 'Failed to fetch users');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 0, borderRadius: 10, boxShadow: '0 2px 12px #0003', background: colors.card, color: colors.text }}>
      <div style={{ background: colors.header, color: colors.accent, borderTopLeftRadius: 10, borderTopRightRadius: 10, padding: '1.2rem 1rem 1rem 1rem', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 24 }}>Attendify</h2>
        <h3 style={{ margin: 0, color: colors.text, fontWeight: 400 }}>User List</h3>
      </div>
      {loading ? (
        <div style={{ margin: '24px', color: colors.text }}>Loading...</div>
      ) : error ? (
        <div style={{ color: '#ff5252', margin: '24px' }}>{error}</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, margin: '24px' }}>
          {users.length === 0 ? (
            <div>No users found.</div>
          ) : (
            users.map((user, idx) => (
              <div key={idx} style={{ width: 140, textAlign: 'center', background: colors.background, borderRadius: 8, boxShadow: '0 2px 8px #0002', padding: 16 }}>
                <div style={{ width: 80, height: 80, margin: '0 auto 8px', borderRadius: '50%', overflow: 'hidden', background: colors.header }}>
                  <img
                    src={user.image_filename ? `/images/${user.image_filename}` : 'https://via.placeholder.com/80'}
                    alt={user.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontWeight: 600, color: colors.accent }}>{user.name}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserList; 