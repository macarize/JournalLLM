import React, { useState, useEffect } from 'react';

function BotPage() {
  const [userId, setUserId] = useState('');
  const [botName, setBotName] = useState('');
  const [botPrompt, setBotPrompt] = useState('');
  const [bots, setBots] = useState([]);

  const createBot = async () => {
    if (!userId) {
      alert('Please specify userId.');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/bots/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          bot_name: botName,
          bot_prompt: botPrompt
        })
      });
      const data = await response.json();
      alert(JSON.stringify(data));
      setBotName('');
      setBotPrompt('');
      fetchBots();
    } catch (error) {
      console.error(error);
      alert('Error creating bot');
    }
  };

  const fetchBots = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:8000/bots/${userId}`);
      const data = await response.json();
      setBots(data.bots || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBots();
    // eslint-disable-next-line
  }, [userId]);

  return (
    <div style={{ margin: 20 }}>
      <h2>Bot Page</h2>
      <label>User ID: </label>
      <input value={userId} onChange={e => setUserId(e.target.value)} /><br/>

      <label>Bot Name: </label>
      <input value={botName} onChange={e => setBotName(e.target.value)} /><br/>

      <label>Bot Prompt: </label>
      <textarea
        rows="3"
        cols="50"
        value={botPrompt}
        onChange={e => setBotPrompt(e.target.value)}
      /><br/>
      <button onClick={createBot}>Create Bot</button>

      <h3>Existing Bots</h3>
      <ul>
        {bots.map(b => (
          <li key={b.id}>
            [ID: {b.id}] Name: {b.bot_name}, Prompt: {b.bot_prompt}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BotPage;
