import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import JournalPage from './components/JournalPage';
import BotPage from './components/BotPage';
import CommentPage from './components/CommentPage';

function App() {
  return (
    <Router>
      <nav style={{margin: 10}}>
        <Link to="/signup" style={{marginRight: 10}}>Signup</Link>
        <Link to="/login" style={{marginRight: 10}}>Login</Link>
        <Link to="/journals" style={{marginRight: 10}}>Journal</Link>
        <Link to="/bots" style={{marginRight: 10}}>Bots</Link>
        <Link to="/comments">Comments</Link>
      </nav>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/journals" element={<JournalPage />} />
        <Route path="/bots" element={<BotPage />} />
        <Route path="/comments" element={<CommentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
