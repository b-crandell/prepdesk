import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  {
    to: '/',
    end: true,
    label: 'Home',
    icon: (active) => (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <path d="M2 7.8L9 2l7 5.8V16a1 1 0 01-1 1H3a1 1 0 01-1-1V7.8z"
          stroke={active ? '#c9a84c' : 'currentColor'} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6.5 17v-6h5v6" stroke={active ? '#c9a84c' : 'currentColor'}
          strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/interview',
    label: 'Mock Interview',
    icon: (active) => (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <rect x="6" y="1" width="6" height="9" rx="3"
          stroke={active ? '#c9a84c' : 'currentColor'} strokeWidth="1.5"/>
        <path d="M3 9a6 6 0 0012 0"
          stroke={active ? '#c9a84c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 15v2M6.5 17h5"
          stroke={active ? '#c9a84c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/quiz',
    label: 'Quick Quiz',
    icon: (active) => (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="3"
          stroke={active ? '#c9a84c' : 'currentColor'} strokeWidth="1.5"/>
        <path d="M6 6.5h6M6 9.5h4M6 12.5h3"
          stroke={active ? '#c9a84c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/calendar',
    label: 'Calendar',
    icon: (active) => (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="12" rx="2"
          stroke={active ? '#c9a84c' : 'currentColor'} strokeWidth="1.5"/>
        <path d="M6 2v3M12 2v3M2 8h14"
          stroke={active ? '#c9a84c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="6.5" cy="12" r="1" fill={active ? '#c9a84c' : 'currentColor'}/>
        <circle cx="11.5" cy="12" r="1" fill={active ? '#c9a84c' : 'currentColor'}/>
      </svg>
    ),
  },
  {
    to: '/networking',
    label: 'Networking',
    icon: (active) => (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="4" r="2.5" stroke={active ? '#c9a84c' : 'currentColor'} strokeWidth="1.5"/>
        <circle cx="3.5" cy="14" r="2.5" stroke={active ? '#c9a84c' : 'currentColor'} strokeWidth="1.5"/>
        <circle cx="14.5" cy="14" r="2.5" stroke={active ? '#c9a84c' : 'currentColor'} strokeWidth="1.5"/>
        <path d="M9 6.5v3.5M9 10l-3.5 2M9 10l3.5 2"
          stroke={active ? '#c9a84c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function Layout() {
  return (
    <div className="layout">
      <nav className="side-nav">
        <div className="side-nav-brand">
          <span className="side-nav-brand-text">PrepDesk</span>
          <span className="side-nav-brand-tag">IB</span>
        </div>

        <div className="nav-items">
          {NAV_ITEMS.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  {icon(isActive)}
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="side-nav-footer">
          <span className="terminal-hint">_ PrepDesk v0.1</span>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
