import React, { useState } from 'react';

const ScreenshotUpload = () => {
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
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data);
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
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Upload Meeting Screenshot</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} required />
        <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {result && (
        <div style={{ marginTop: 16 }}>
          <h4>Recognized Users:</h4>
          {result.recognized && result.recognized.length > 0 ? (
            <ul>
              {result.recognized.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : (
            <p>No users recognized.</p>
          )}
          <div style={{ color: 'green' }}>{result.message}</div>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </div>
  );
};

export default ScreenshotUpload; 