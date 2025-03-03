import React, { useState, useEffect } from 'react';

function BotPage() {
  const [userId, setUserId] = useState('');
  const [botName, setBotName] = useState('');
  const [botPrompt, setBotPrompt] = useState('');
  const [bots, setBots] = useState([]);

  const createBot = async () => {
    // POST -> @bot_router.post("/")
    if (!userId) {
      alert('Please specify userId.');
      return;
    }
    const numericUserId = parseInt(userId, 10);
    if (Number.isNaN(numericUserId)) {
      alert('User ID must be a number.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/bots/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: numericUserId,
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
    // GET -> @bot_router.get("/{user_id}")
    if (!userId) return;
    const numericUserId = parseInt(userId, 10);
    if (Number.isNaN(numericUserId)) {
      alert('User ID must be a number.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/bots/${numericUserId}`);
      const data = await response.json();
      setBots(data.bots || []);
    } catch (error) {
      console.error(error);
      alert('Error fetching bots');
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
      <input
        value={userId}
        onChange={e => setUserId(e.target.value)}
        placeholder="Numeric user ID"
      />
      <br/>

      <label>Bot Name: </label>
      <input
        value={botName}
        onChange={e => setBotName(e.target.value)}
        placeholder="e.g. Supportive Bot"
      />
      <br/>

      <label>Bot Prompt: </label>
      <textarea
        rows="3"
        cols="50"
        value={botPrompt}
        onChange={e => setBotPrompt(e.target.value)}
        placeholder="Explain this bot's personality or style"
      />
      <br/>
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
