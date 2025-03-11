import React, { useState } from 'react';
import BASE_URL from '../config';

function CommentPage() {
  const [userId, setUserId] = useState('');
  const [newJournalText, setNewJournalText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const getComments = async () => {
    if (!userId) {
      alert('Please specify userId.');
      return;
    }

    const numericUserId = parseInt(userId, 10);
    if (Number.isNaN(numericUserId)) {
      alert('User ID must be a number.');
      return;
    }

    if (!newJournalText.trim()) {
      alert('Please enter journal text.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/comments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: numericUserId,
          new_journal_text: newJournalText
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get comments');
      }

      const data = await response.json();
      setComments(data.comments || []);
      alert('Comments fetched successfully.');
    } catch (error) {
      console.error('Error fetching comments:', error);
      alert(error.message || 'Error fetching comments');
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete comment');
      }

      const data = await response.json();
      alert(data.message);

      // Remove from local state
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error.message || 'Error deleting comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>Comments from Bots</h2>

      {/* User ID Input */}
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Numeric user ID"
          disabled={loading}
          style={{
            padding: '8px',
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: '10px',
          }}
        />
      </div>

      {/* New Journal Text */}
      <div style={{ marginBottom: 10 }}>
        <textarea
          rows="4"
          placeholder="New journal entry text..."
          value={newJournalText}
          onChange={(e) => setNewJournalText(e.target.value)}
          disabled={loading}
          style={{
            padding: '8px',
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: '10px',
          }}
        />
      </div>

      {/* Fetch Comments Button */}
      <button
        onClick={getComments}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          marginBottom: '20px',
        }}
      >
        {loading ? 'Fetching...' : 'Get Bot Comments'}
      </button>

      <h3>Bot Replies</h3>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {comments.map((c) => (
            <li
              key={c.comment_id}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                marginBottom: '10px',
                borderRadius: '5px',
                backgroundColor: '#fafafa',
              }}
            >
              <strong>{c.bot_name}:</strong> {c.comment}
              <button
                onClick={() => deleteComment(c.comment_id)}
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

export default CommentPage;
