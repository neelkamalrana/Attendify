import React, { useState } from 'react';

const AddUser = () => {
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
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8, background: '#f9f9fb' }}>
      <h2 style={{ color: '#2d72d9', marginBottom: 8 }}>Attendify</h2>
      <h3 style={{ marginTop: 0 }}>Add New User</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="User Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input type="file" accept="image/*" onChange={handleFileChange} required />
        </div>
        <button type="submit" disabled={loading} style={{ background: '#2d72d9', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
          {loading ? 'Uploading...' : 'Add User'}
        </button>
      </form>
      {result && <div style={{ color: 'green', marginTop: 16 }}>{result}</div>}
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </div>
  );
};

export default AddUser; 