import React, { useState } from 'react';
import BASE_URL from '../config';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
      }

      const data = await response.json();
      alert(`Signup successful! User ID: ${data.user_id}`);

      // Optionally clear the form after signup
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Signup error:', error);
      alert(error.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>Signup</h2>
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          style={{
            padding: '8px',
            marginBottom: '10px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          style={{
            padding: '8px',
            marginBottom: '10px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <button
        onClick={handleSignup}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
        }}
      >
        {loading ? 'Signing up...' : 'Signup'}
      </button>
    </div>
  );
}

export default Signup;
