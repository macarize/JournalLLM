import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function JournalListPage({ userId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchJournals();
    }
    // eslint-disable-next-line
  }, [userId]);

  const fetchJournals = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:8000/journals/${userId}`);
      const data = await res.json();
      setJournals(data.journals || []);
    } catch (err) {
      console.error(err);
      alert('Error fetching journals');
    }
  };

  const createJournal = async () => {
    if (!userId) {
      alert('No user logged in.');
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/journals/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title,
          content
        })
      });
      const data = await res.json();
      alert(data.message);
      setTitle('');
      setContent('');
      fetchJournals();
    } catch (err) {
      console.error(err);
      alert('Error creating journal');
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>My Journals</h2>
      <div>
        <label>Title: </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Journal Title"
        />
      </div>
      <div>
        <label>Content: </label>
        <textarea
          rows="4"
          cols="50"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What's on your mind?"
        />
      </div>
      <button onClick={createJournal}>Create Journal</button>

      <hr />
      <h3>Existing Journals</h3>
      <ul>
        {journals.map(j => (
          <li key={j.id}>
            <Link to={`/journals/${j.id}`}>{j.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JournalListPage;
