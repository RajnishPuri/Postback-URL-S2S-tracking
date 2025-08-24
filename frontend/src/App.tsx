import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AffiliateSelector from './components/AffiliateSelector';
import Dashboard from './components/Dashboard';
import PostbackUrl from './components/PostbackUrl';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <header className="App-header">
          <h1>Postback URL System</h1>
          <p>Affiliate Marketing S2S Tracking MVP</p>
        </header>
        <main className="App-main">
          <Routes>
            <Route path="/" element={<AffiliateSelector />} />
            <Route path="/dashboard/:affiliateId" element={<Dashboard />} />
            <Route path="/postback-url/:affiliateId" element={<PostbackUrl />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
