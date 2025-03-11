import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BASE_URL from '../config';

function JournalDetailPage({ userId }) {
  const { journalId } = useParams();
  const [journal, setJournal] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch the journal + comments when userId or journalId changes
  useEffect(() => {
    if (userId && journalId) {
      fetchJournalDetail();
    }
    // eslint-disable-next-line
  }, [userId, journalId]);

  // 1. Load the journal detail and existing comments
  const fetchJournalDetail = async () => {
    if (!userId || !journalId) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/journals/${userId}/detail/${journalId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to fetch journal detail');
      }

      const data = await res.json();
      setJournal(data.journal);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Fetch error:', err);
      alert(err.message || 'Error fetching journal detail');
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate new bot comments
  const generateComments = async () => {
    if (!userId || !journalId) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/comments/journal_comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          journal_id: parseInt(journalId, 10)
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to generate comments');
      }

      const data = await res.json();
      alert(data.message);

      // Refresh to see new comments
      fetchJournalDetail();
    } catch (err) {
      console.error('Generate error:', err);
      alert(err.message || 'Error generating comments');
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete a specific comment
const deleteComment = async (commentId) => {
  if (!window.confirm('Are you sure you want to delete this comment?')) return;

  setLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/comments/${userId}/comment/${commentId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const errorData = await res.json(); 
      throw new Error(errorData.detail || 'Failed to delete comment');
    }

    const data = await res.json();
    alert(data.message);

    setComments((prevComments) => prevComments.filter((c) => c.id !== commentId));
  } catch (err) {
    console.error('Delete error:', err);
    alert(err.message || 'Error deleting comment');
  }
};


  if (!journal) {
    return (
      <div style={{ margin: 20 }}>
        <h2>Journal Detail</h2>
        <p>Loading or no journal selected...</p>
      </div>
    );
  }

  return (
    <div style={{ margin: 20 }}>
      <h2>Journal Detail</h2>
      <h3>{journal.title}</h3>
      <p>{journal.content}</p>

      <hr />

      {/* Generate Bot Comments Button */}
      <button
        onClick={generateComments}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px',
        }}
      >
        {loading ? 'Generating...' : 'Generate Bot Comments'}
      </button>

      <hr />

      {/* Existing Comments */}
      <h4>Existing Comments</h4>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {comments.map((c) => (
            <li
              key={c.comment_id}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                marginBottom: '10px',
                borderRadius: '5px',
                backgroundColor: '#fafafa',
              }}
            >
              <strong>
                Comment #{c.id} (Bot: {c.bot_name}):
              </strong>{' '}
              {c.comment}
              <button
                onClick={() => deleteComment(c.id)}
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
          ))}
        </ul>
      )}
    </div>
  );
}

export default JournalDetailPage;
