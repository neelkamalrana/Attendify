import React, { useState } from 'react';

const AddUser = ({ colors }) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', file);
    try {
      const response = await fetch('http://127.0.0.1:5000/add_user', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data.message);
        setName('');
        setFile(null);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 0, borderRadius: 10, boxShadow: '0 2px 12px #0003', background: colors.card, color: colors.text }}>
      <div style={{ background: colors.header, color: colors.accent, borderTopLeftRadius: 10, borderTopRightRadius: 10, padding: '1.2rem 1rem 1rem 1rem', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 24 }}>Attendify</h2>
        <h3 style={{ margin: 0, color: colors.text, fontWeight: 400 }}>Add New User</h3>
      </div>
      <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="text"
          placeholder="User Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: '100%', padding: 8, borderRadius: 4, border: `1px solid ${colors.header}`, background: colors.background, color: colors.text }}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} required style={{ background: colors.background, color: colors.text, border: `1px solid ${colors.header}`, borderRadius: 4, padding: 8 }} />
        <button type="submit" disabled={loading} style={{ background: colors.accent, color: colors.background, border: 'none', borderRadius: 4, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
          {loading ? 'Uploading...' : 'Add User'}
        </button>
      </form>
      {result && <div style={{ color: '#4caf50', margin: '0 24px 16px 24px' }}>{result}</div>}
      {error && <div style={{ color: '#ff5252', margin: '0 24px 16px 24px' }}>{error}</div>}
    </div>
  );
};

export default AddUser; 