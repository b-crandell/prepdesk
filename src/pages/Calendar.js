import React from 'react';

export default function Calendar() {
  return (
    <div className="page-content">
      <h1 className="page-title">Deadline Tracker</h1>
      <p className="page-subtitle">Recruiting timelines and application windows.</p>
      <div className="coming-soon">
        <span className="coming-soon-badge">Coming Soon</span>
        <h2 className="coming-soon-title">Calendar</h2>
        <p className="coming-soon-desc">
          Track application deadlines, superday invites, and offer expirations across every firm on your list.
        </p>
      </div>
    </div>
  );
}
