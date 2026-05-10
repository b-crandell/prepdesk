import React from 'react';
import { Link } from 'react-router-dom';

const MODES = [
  {
    to: '/interview',
    label: 'AI Powered',
    title: 'Mock Interview',
    desc: 'Record your answer to real IB questions and get instant AI feedback on content, structure, and delivery.',
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
    desc: 'Sharpen your technical knowledge with multiple-choice questions across valuation, M&A, LBO, and markets.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="18" height="18" rx="4" stroke="#c9a84c" strokeWidth="1.6"/>
        <path d="M7 8h8M7 11.5h5M7 15h3" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    status: 'Soon',
  },
  {
    to: '/calendar',
    label: 'Recruiting',
    title: 'Deadline Tracker',
    desc: 'Never miss an application window. Track recruiting timelines, superdays, and offer deadlines in one place.',
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
    desc: 'Log banker coffees, track follow-ups, and manage your relationship pipeline from first email to offer.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="5" r="3" stroke="#c9a84c" strokeWidth="1.6"/>
        <circle cx="4" cy="17" r="3" stroke="#c9a84c" strokeWidth="1.6"/>
        <circle cx="18" cy="17" r="3" stroke="#c9a84c" strokeWidth="1.6"/>
        <path d="M11 8v5M11 13L5.5 16M11 13l4.5 2"
          stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    status: 'Soon',
  },
];

export default function Home() {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-content">
      <div className="home-greeting">{greeting}.</div>
      <h1 className="page-title">What are we working on?</h1>
      <p className="page-subtitle">Your IB recruiting command center — pick a mode to get started.</p>

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
