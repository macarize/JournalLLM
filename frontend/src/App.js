import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import Signup from './components/Signup';
import Login from './components/Login';
import JournalListPage from './components/JournalListPage';
import JournalDetailPage from './components/JournalDetailPage';
import BotPage from './components/BotPage';

/**
 * We maintain "global" state for userId in App for simplicity.
 * After login, store userId and pass it to child components.
 */
function App() {
  const [userId, setUserId] = useState(null);

  return (
    <Router>
      <nav style={{ margin: 10 }}>
        <Link to="/signup" style={{ marginRight: 10 }}>Signup</Link>
        <Link to="/login" style={{ marginRight: 10 }}>Login</Link>
        {userId && (
          <>
            <Link to="/journals" style={{ marginRight: 10 }}>My Journals</Link>
            <Link to="/bots">My Bots</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login setUserId={setUserId} />} />
        <Route
          path="/journals"
          element={<JournalListPage userId={userId} />}
        />
        <Route
          path="/journals/:journalId"
          element={<JournalDetailPage userId={userId} />}
        />
        <Route
          path="/bots"
          element={<BotPage userId={userId} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
