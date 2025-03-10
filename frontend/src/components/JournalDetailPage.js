import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function JournalDetailPage({ userId }) {
  const { journalId } = useParams();
  const [journal, setJournal] = useState(null);
  const [comments, setComments] = useState([]);

  // Fetch the journal + its comments whenever userId or journalId changes
  useEffect(() => {
    if (userId && journalId) {
      fetchJournalDetail();
    }
    // eslint-disable-next-line
  }, [userId, journalId]);

  // 1. Load the journal detail (title + content) and existing comments
  const fetchJournalDetail = async () => {
    try {
      const res = await fetch(`http://localhost:8000/journals/${userId}/detail/${journalId}`);
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setJournal(data.journal);
        setComments(data.comments);
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching journal detail');
    }
  };

  // 2. Generate new bot comments (the server uses the journal content itself)
  const generateComments = async () => {
    if (!userId || !journalId) return;
    try {
      const res = await fetch('http://localhost:8000/comments/journal_comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          journal_id: parseInt(journalId, 10)
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        // Refresh to see new comments
        fetchJournalDetail();
      }
    } catch (err) {
      console.error(err);
      alert('Error generating comments');
    }
  };

  // 3. Delete a specific comment from DB, then remove from local state
  const deleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await fetch(`http://localhost:8000/comments/${userId}/comment/${commentId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        setComments(comments.filter((c) => c.comment_id !== commentId));
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting comment');
    }
  };

  // If we haven't loaded the journal yet, show a placeholder
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
      <button onClick={generateComments}>Generate Bot Comments</button>

      <hr />
      <h4>Existing Comments</h4>
      {comments.length === 0 && <p>No comments yet.</p>}
      <ul>
        {comments.map((c) => (
          <li key={c.comment_id}>
            <strong>
              Comment #{c.id} (Bot: {c.bot_name}):
            </strong>{' '}
            {c.comment}{' '}
            <button onClick={() => deleteComment(c.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JournalDetailPage;
