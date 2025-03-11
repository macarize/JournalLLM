import React, { useState, useEffect } from 'react';
import BASE_URL from '../config';

function BotPage({ userId }) {
  const [botName, setBotName] = useState('');
  const [botPrompt, setBotPrompt] = useState('');
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchBots();
    }
  }, [userId]);

  // 1. Fetch bots for the logged-in user
  const fetchBots = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/bots/${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch bots');
      }

      const data = await response.json();
      setBots(data.bots || []);
    } catch (error) {
      console.error('Fetch error:', error);
      alert(error.message || 'Error fetching bots');
    } finally {
      setLoading(false);
    }
  };

  // 2. Create a new bot
  const createBot = async () => {
    if (!userId) {
      alert('Please log in first.');
      return;
    }

    if (!botName.trim() || !botPrompt.trim()) {
      alert('Please fill out both the bot name and prompt.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/bots/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          bot_name: botName,
          bot_prompt: botPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create bot');
      }

      const data = await response.json();
      alert(data.message);

      // Clear the form
      setBotName('');
      setBotPrompt('');

      // Refresh the list
      fetchBots();
    } catch (error) {
      console.error('Create error:', error);
      alert(error.message || 'Error creating bot');
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete a bot
  const deleteBot = async (botId) => {
    if (!window.confirm('Are you sure you want to delete this bot?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/bots/${botId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete bot');
      }

      const data = await response.json();
      alert(data.message);

      // Remove from local state
      setBots((prev) => prev.filter((b) => b.id !== botId));
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Error deleting bot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>My Bots</h2>

      {/* Create Bot Form */}
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={botName}
          onChange={(e) => setBotName(e.target.value)}
          placeholder="Bot Name"
          disabled={loading}
          style={{
            padding: '8px',
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: '10px',
          }}
        />
        <textarea
          rows="3"
          value={botPrompt}
          onChange={(e) => setBotPrompt(e.target.value)}
          placeholder="You are a supportive bot, always encouraging..."
          disabled={loading}
          style={{
            padding: '8px',
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: '10px',
          }}
        />
        <button
          onClick={createBot}
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
          {loading ? 'Creating...' : 'Create Bot'}
        </button>
      </div>

      <hr />

      {/* Existing Bots */}
      <h3>Existing Bots</h3>
      {loading ? (
        <p>Loading bots...</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {bots.length === 0 ? (
            <p>No bots created yet.</p>
          ) : (
            bots.map((b) => (
              <li
                key={b.id}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  marginBottom: '10px',
                  borderRadius: '5px',
                  backgroundColor: '#fafafa',
                }}
              >
                <strong>{b.bot_name}:</strong> {b.bot_prompt}
                <button
                  onClick={() => deleteBot(b.id)}
                  disabled={loading}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    float: 'right',
                    marginLeft: '10px',
                  }}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default BotPage;
