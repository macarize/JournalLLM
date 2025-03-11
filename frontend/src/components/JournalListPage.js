import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BASE_URL from '../config';

function JournalListPage({ userId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch journals when userId changes
  useEffect(() => {
    if (userId) {
      fetchJournals();
    }
    // eslint-disable-next-line
  }, [userId]);

  const fetchJournals = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/journals/${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch journals');
      }
      const data = await res.json();
      setJournals(data.journals || []);
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Error fetching journals');
    } finally {
      setLoading(false);
    }
  };

  const createJournal = async () => {
    if (!userId) {
      alert('No user logged in.');
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert('Please fill out both the title and content.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/journals/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title,
          content
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to create journal');
      }

      const data = await res.json();
      alert(data.message);

      // Clear the form
      setTitle('');
      setContent('');

      // Refresh the list
      fetchJournals();
    } catch (err) {
      console.error('Create error:', err);
      alert(err.message || 'Error creating journal');
    } finally {
      setLoading(false);
    }
  };

  const deleteJournal = async (journalId) => {
    if (!userId) {
      alert('No user logged in.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this journal?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/journals/${journalId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to delete journal');
      }

      const data = await res.json();
      alert(data.message);

      // Remove the journal from state
      setJournals((prev) => prev.filter((j) => j.id !== journalId));
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || 'Error deleting journal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>My Journals</h2>

      {/* Create Journal */}
      <div>
        <input
          type="text"
          placeholder="Journal Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          style={{
            padding: '8px',
            marginBottom: '10px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <textarea
          rows="4"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          style={{
            padding: '8px',
            marginBottom: '10px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={createJournal}
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
          {loading ? 'Creating...' : 'Create Journal'}
        </button>
      </div>

      <hr />

      {/* Existing Journals */}
      <h3>Existing Journals</h3>
      {loading ? (
        <p>Loading journals...</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {journals.map((journal) => (
            <li key={journal.id} style={{ marginBottom: '10px' }}>
              <Link
                to={`/journals/${journal.id}`}
                style={{
                  color: '#007bff',
                  textDecoration: 'none',
                  marginRight: '10px',
                }}
              >
                {journal.title}
              </Link>
              <button
                onClick={() => deleteJournal(journal.id)}
                disabled={loading}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginLeft: '10px',
                }}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default JournalListPage;
