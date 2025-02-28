import React, { useState } from 'react';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      const response = await fetch('http://localhost:8000/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      alert(JSON.stringify(data));
    } catch (error) {
      console.error(error);
      alert('Error signing up');
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>Signup</h2>
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      /><br/>
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      /><br/>
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}

export default Signup;
