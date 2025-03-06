import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function JournalDetailPage({ userId }) {
  const { journalId } = useParams();
  const [journal, setJournal] = useState(null);
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState(''); // text for generating new comments

  useEffect(() => {
    if (userId && journalId) {
      fetchJournalDetail();
    }
    // eslint-disable-next-line
  }, [userId, journalId]);

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

  const generateComments = async () => {
    if (!userId || !journalId) return;
    try {
      const res = await fetch('http://localhost:8000/comments/journal_comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          journal_id: parseInt(journalId, 10),
          new_journal_text: newText
        })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
        // The new comments come in data.comments
        // We can re-fetch the journal detail or just add them
        fetchJournalDetail();
      }
    } catch (err) {
      console.error(err);
      alert('Error generating comments');
    }
  };

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
        // remove it from local state
        setComments(comments.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting comment');
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

      <h4>Generate Comments from Your Bots</h4>
      <textarea
        rows="3"
        cols="50"
        value={newText}
        onChange={e => setNewText(e.target.value)}
        placeholder="What new text do you want the bots to comment on?"
      />
      <br />
      <button onClick={generateComments}>Generate Bot Comments</button>

      <hr />
      <h4>Existing Comments</h4>
      {comments.length === 0 && <p>No comments yet.</p>}
      <ul>
        {comments.map((c) => (
          <li key={c.id}>
            <strong>Comment #{c.id} (Bot ID: {c.bot_id}):</strong> {c.comment}
            <button onClick={() => deleteComment(c.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JournalDetailPage;
