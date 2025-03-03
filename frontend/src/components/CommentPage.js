import React, { useState } from 'react';

function CommentPage() {
  const [userId, setUserId] = useState('');
  const [newJournalText, setNewJournalText] = useState('');
  const [comments, setComments] = useState([]);

  const getComments = async () => {
    // POST -> @comment_router.post("/")
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
      const response = await fetch('http://localhost:8000/comments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: numericUserId,
          new_journal_text: newJournalText
        })
      });
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error(error);
      alert('Error fetching comments');
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <h2>Comments from Bots</h2>
      <div>
        <label>User ID: </label>
        <input
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="Numeric user ID"
        />
      </div>
      <div>
        <textarea
          rows="4"
          cols="50"
          placeholder="New journal entry text..."
          value={newJournalText}
          onChange={e => setNewJournalText(e.target.value)}
        />
      </div>
      <button onClick={getComments}>Get Bot Comments</button>

      <h3>Bot Replies</h3>
      <ul>
        {comments.map((c, index) => (
          <li key={index}>
            <strong>{c.bot_name}:</strong> {c.comment}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CommentPage;
