import React, { useState, useEffect } from 'react';

function JournalPage() {
  const [userId, setUserId] = useState('');
  const [content, setContent] = useState('');
  const [journals, setJournals] = useState([]);

  const createJournal = async () => {
    // For the POST endpoint:
    // @journal_router.post("/")
    if (!userId) {
      alert('Please specify a user ID (simulate login).');
      return;
    }
    const numericUserId = parseInt(userId, 10);
    if (Number.isNaN(numericUserId)) {
      alert('User ID must be a number.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/journals/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: numericUserId, content })
      });
      const data = await response.json();
      alert(JSON.stringify(data));
      setContent('');
      fetchJournals();
    } catch (error) {
      console.error(error);
      alert('Error creating journal');
    }
  };

  const fetchJournals = async () => {
    // For the GET endpoint:
    // @journal_router.get("/{user_id}")
    if (!userId) return;
    const numericUserId = parseInt(userId, 10);
    if (Number.isNaN(numericUserId)) {
      alert('User ID must be a number.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/journals/${numericUserId}`);
      const data = await response.json();
      setJournals(data.journals || []);
    } catch (error) {
      console.error(error);
      alert('Error fetching journals');
    }
  };

  useEffect(() => {
    // Whenever userId changes, fetch that user's journals
    fetchJournals();
    // eslint-disable-next-line
  }, [userId]);

  return (
    <div style={{ margin: 20 }}>
      <h2>Journal Page</h2>
      <div>
        <label>User ID: </label>
        <input
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="Enter a numeric user ID"
        />
      </div>
      <div>
        <textarea
          rows="4"
          cols="50"
          placeholder="Write your journal..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </div>
      <button onClick={createJournal}>Create Journal</button>

      <h3>Your Journals</h3>
      <ul>
        {journals.map(j => (
          <li key={j.id}>
            [ID: {j.id}] {j.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JournalPage;
