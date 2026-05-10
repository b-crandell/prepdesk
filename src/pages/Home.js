import React from 'react';
import { Link } from 'react-router-dom';

const STATS = [
  { value: '47',   label: 'Questions Practiced', delta: '+12 this week' },
  { value: '82',   label: 'Avg Quiz Score',       delta: '↑ 4 pts vs last week' },
  { value: '4',    label: 'Day Streak',            delta: 'Keep it up' },
  { value: '12',   label: 'Coffees Logged',        delta: '3 follow-ups due' },
];

const MODES = [
  {
    to: '/interview',
    label: 'AI Powered',
    title: 'Mock Interview',
    desc: 'Answer real IB questions out loud. Get instant AI scores on content, structure, and delivery.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="7" y="1" width="8" height="11" rx="4" stroke="#c9a84c" strokeWidth="1.6"/>
        <path d="M3 11a8 8 0 0016 0" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M11 19v2M8 21h6" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    status: 'Live',
  },
  {
    to: '/quiz',
    label: 'Technical',
    title: 'Quick Quiz',
    desc: 'Multiple-choice questions across Valuation, Accounting, Deal Structure, and Math. 75 questions ready.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="18" height="18" rx="4" stroke="#c9a84c" strokeWidth="1.6"/>
        <path d="M7 8h8M7 11.5h5M7 15h3" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    status: 'Live',
  },
  {
    to: '/calendar',
    label: 'Recruiting',
    title: 'Deadline Tracker',
    desc: 'Track application windows, superday invites, and offer expirations across every firm on your list.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="4" width="18" height="16" rx="3" stroke="#c9a84c" strokeWidth="1.6"/>
        <path d="M7 2v3M15 2v3M2 10h18" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="8" cy="15" r="1.2" fill="#c9a84c"/>
        <circle cx="14" cy="15" r="1.2" fill="#c9a84c"/>
      </svg>
    ),
    status: 'Soon',
  },
  {
    to: '/networking',
    label: 'Contacts',
    title: 'Networking',
    desc: 'Log coffee chats, track follow-ups, and manage your banker pipeline organized by firm.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="5" r="3" stroke="#c9a84c" strokeWidth="1.6"/>
        <circle cx="4" cy="17" r="3" stroke="#c9a84c" strokeWidth="1.6"/>
        <circle cx="18" cy="17" r="3" stroke="#c9a84c" strokeWidth="1.6"/>
        <path d="M11 8v5M11 13L5.5 16M11 13l4.5 2"
          stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    status: 'Live',
  },
];

export default function Home() {
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-content">
      <div className="home-greeting">{greeting}.</div>
      <h1 className="page-title">Where are we today?</h1>

      {/* Stats bar */}
      <div className="stats-bar">
        {STATS.map(({ value, label, delta }) => (
          <div key={label} className="stat-card">
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-delta">{delta}</div>
          </div>
        ))}
      </div>

      <p className="page-subtitle">Pick a mode to keep building.</p>

      {/* Mode cards */}
      <div className="mode-grid">
        {MODES.map(({ to, label, title, desc, icon, status }) => (
          <Link key={to} to={to} className="mode-card">
            <div className="mode-card-icon">{icon}</div>
            <div>
              <div className="mode-card-label">
                {label}
                {status === 'Live' && <span className="mode-live-badge">● Live</span>}
                {status === 'Soon' && <span className="mode-soon-badge">Coming Soon</span>}
              </div>
              <div className="mode-card-title">{title}</div>
            </div>
            <p className="mode-card-desc">{desc}</p>
            <div className="mode-card-arrow">→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
