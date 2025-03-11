import React, { useState } from 'react';
import BASE_URL from '../config';

function Login({ setUserId }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      alert(data.message);
      setUserId(data.user_id);

      // Optionally clear the form after login
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>Login</h2>
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
        onClick={handleLogin}
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
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}

export default Login;