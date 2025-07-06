import React, { useEffect, useState } from 'react';

const IMAGE_BASE = 'http://127.0.0.1:5000/static/images/';

const UserList = () => {
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
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8, background: '#f9f9fb' }}>
      <h2 style={{ color: '#2d72d9', marginBottom: 8 }}>Attendify</h2>
      <h3 style={{ marginTop: 0 }}>User List</h3>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {users.length === 0 ? (
            <div>No users found.</div>
          ) : (
            users.map((user, idx) => (
              <div key={idx} style={{ width: 140, textAlign: 'center', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 16 }}>
                <div style={{ width: 80, height: 80, margin: '0 auto 8px', borderRadius: '50%', overflow: 'hidden', background: '#e0e7ef' }}>
                  <img
                    src={user.image_filename ? `/images/${user.image_filename}` : 'https://via.placeholder.com/80'}
                    alt={user.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ fontWeight: 600 }}>{user.name}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserList; 