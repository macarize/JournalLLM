import React, { useState, useEffect } from 'react';

function BotPage({ userId }) {
  const [botName, setBotName] = useState('');
  const [botPrompt, setBotPrompt] = useState('');
  const [bots, setBots] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchBots();
    }
  }, [userId]);

  const fetchBots = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:8000/bots/${userId}`);
      const data = await response.json();
      setBots(data.bots || []);
    } catch (error) {
      console.error(error);
      alert('Error fetching bots');
    }
  };

  const createBot = async () => {
    if (!userId) {
      alert('Please log in first.');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/bots/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          bot_name: botName,
          bot_prompt: botPrompt
        })
      });
      const data = await response.json();
      alert(data.message);
      setBotName('');
      setBotPrompt('');
      fetchBots();
    } catch (error) {
      console.error(error);
      alert('Error creating bot');
    }
  };

  const deleteBot = async (botId) => {
    try {
      const response = await fetch(`http://localhost:8000/bots/${botId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        setBots(bots.filter(b => b.id !== botId));
      }
    } catch (error) {
      console.error(error);
      alert('Error deleting bot');
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>My Bots</h2>
      <div>
        <label>Bot Name: </label>
        <input
          value={botName}
          onChange={e => setBotName(e.target.value)}
          placeholder="SupportiveBot"
        />
      </div>
      <div>
        <label>Bot Prompt: </label>
        <textarea
          rows="3"
          cols="50"
          value={botPrompt}
          onChange={e => setBotPrompt(e.target.value)}
          placeholder="You are a supportive bot, always encouraging..."
        />
      </div>
      <button onClick={createBot}>Create Bot</button>

      <hr />
      <h3>Existing Bots</h3>
      <ul>
        {bots.map(b => (
          <li key={b.id}>
            [ID: {b.id}] <strong>{b.bot_name}</strong> - {b.bot_prompt}
            <button onClick={() => deleteBot(b.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BotPage;
