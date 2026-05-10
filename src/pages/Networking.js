import React, { useState } from 'react';

const CALL_TYPES      = ['Coffee Chat', 'Phone Call', 'Video Call', 'In-Person', 'Email Follow-up'];
const OUT_PURPOSES    = ['Introduction / Networking', 'Coffee Chat Request', 'Thank You Note', 'Application Follow-up', 'Referral Request', 'Other'];
const OUT_STATUSES    = ['Pending', 'Responded', 'Meeting Scheduled', 'No Response'];
const FOLLOW_UP_DAYS  = 7;

const FOLLOW_UP_OPTIONS = [
  { label: '24 hours',  value: '24h', days: 1 },
  { label: '48 hours',  value: '48h', days: 2 },
  { label: '1 week',    value: '1w',  days: 7 },
];

const BLANK_CALL = { bank: '', contact: '', role: '', date: '', type: 'Coffee Chat', notes: '', followUpInterval: '24h' };
const BLANK_OUT  = { bank: '', contact: '', role: '', emailDate: '', purpose: 'Introduction / Networking', notes: '' };

// Adds N days to a YYYY-MM-DD string (or today) without timezone drift
function addDays(dateStr, n) {
  const base = dateStr ? dateStr.split('-').map(Number) : (() => {
    const t = new Date(); return [t.getFullYear(), t.getMonth() + 1, t.getDate()];
  })();
  const d = new Date(base[0], base[1] - 1, base[2] + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}
function fmtDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1]} ${+day}, ${y}`;
}

export default function Networking() {
  const [calls,    setCalls]    = useState(() => load('pd-calls'));
  const [outreach, setOutreach] = useState(() => load('pd-outreach'));
  const [tab,      setTab]      = useState('outreach'); // 'outreach' | 'calls'

  const [showCallModal, setShowCallModal]       = useState(false);
  const [showOutModal,  setShowOutModal]         = useState(false);
  const [callForm,      setCallForm]             = useState(BLANK_CALL);
  const [outForm,       setOutForm]              = useState(BLANK_OUT);
  const [callErr,       setCallErr]              = useState({});
  const [outErr,        setOutErr]               = useState({});
  const [expandedBanks, setExpanded]             = useState({});
  const [selectedCall,  setSelectedCall]         = useState(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const banks   = [...new Set(calls.map(c => c.bank))].sort();
  const byBank  = banks.reduce((acc, b) => {
    acc[b] = calls.filter(c => c.bank === b).sort((a, z) => z.date.localeCompare(a.date));
    return acc;
  }, {});

  const overdue       = outreach.filter(o => o.status === 'Pending' && daysSince(o.emailDate) >= FOLLOW_UP_DAYS);
  const sortedOut     = [...outreach].sort((a, b) => b.emailDate.localeCompare(a.emailDate));

  // ── Handlers: calls ──────────────────────────────────────────────────────
  const toggleBank  = b => setExpanded(p => ({ ...p, [b]: !p[b] }));
  const setC        = f => e => setCallForm(p => ({ ...p, [f]: e.target.value }));

  const saveCall = () => {
    const e = {};
    if (!callForm.bank.trim())    e.bank    = 'Required';
    if (!callForm.contact.trim()) e.contact = 'Required';
    if (!callForm.date)           e.date    = 'Required';
    if (Object.keys(e).length)    { setCallErr(e); return; }
    const intervalDays = FOLLOW_UP_OPTIONS.find(o => o.value === callForm.followUpInterval)?.days ?? 1;
    const followUp = addDays(callForm.date, intervalDays);
    const newCall = { ...callForm, id: `${Date.now()}`, bank: callForm.bank.trim(), followUp };
    const updated = [newCall, ...calls];
    setCalls(updated); save('pd-calls', updated);
    setShowCallModal(false); setCallForm(BLANK_CALL); setCallErr({});
    setExpanded(p => ({ ...p, [newCall.bank]: true }));
  };

  const deleteCall = id => {
    const updated = calls.filter(c => c.id !== id);
    setCalls(updated); save('pd-calls', updated);
    if (selectedCall?.id === id) setSelectedCall(null);
  };

  // ── Handlers: outreach ───────────────────────────────────────────────────
  const setO = f => e => setOutForm(p => ({ ...p, [f]: e.target.value }));

  const saveOutreach = () => {
    const e = {};
    if (!outForm.bank.trim())    e.bank      = 'Required';
    if (!outForm.contact.trim()) e.contact   = 'Required';
    if (!outForm.emailDate)      e.emailDate = 'Required';
    if (Object.keys(e).length)   { setOutErr(e); return; }
    const newOut = { ...outForm, id: `${Date.now()}`, bank: outForm.bank.trim(), status: 'Pending' };
    const updated = [newOut, ...outreach];
    setOutreach(updated); save('pd-outreach', updated);
    setShowOutModal(false); setOutForm(BLANK_OUT); setOutErr({});
  };

  const updateStatus = (id, status) => {
    const updated = outreach.map(o => o.id === id ? { ...o, status } : o);
    setOutreach(updated); save('pd-outreach', updated);
  };

  const deleteOutreach = id => {
    const updated = outreach.filter(o => o.id !== id);
    setOutreach(updated); save('pd-outreach', updated);
  };

  // Pre-fill the call form from an outreach entry, flip to Call Log, open modal
  const logCallFromOutreach = o => {
    setCallForm({ ...BLANK_CALL, bank: o.bank, contact: o.contact, role: o.role });
    setTab('calls');
    setShowCallModal(true);
  };

  const statusCls = s =>
    s === 'Responded' || s === 'Meeting Scheduled' ? 'status-green' :
    s === 'No Response' ? 'status-red' : 'status-gold';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page-content">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="net-header">
        <div className="net-header-left">
          <h1 className="page-title">Networking</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {calls.length} call{calls.length !== 1 ? 's' : ''} · {outreach.length} outreach · {banks.length} firm{banks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="net-header-btns">
          {tab === 'outreach' ? (
            <button className="log-btn" onClick={() => setShowOutModal(true)}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Log Outreach
            </button>
          ) : (
            <button className="log-btn" onClick={() => setShowCallModal(true)}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Log New Call
            </button>
          )}
        </div>
      </div>

      {/* ── Follow-up Alert Strip ───────────────────────────────────────── */}
      {overdue.length > 0 && (
        <div className="followup-strip">
          <div className="followup-strip-head">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
              <path d="M8 2a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-5.5A.75.75 0 018 2zM8 13a1 1 0 100-2 1 1 0 000 2z" fill="#c9a84c"/>
              <circle cx="8" cy="8" r="6.5" stroke="#c9a84c" strokeWidth="1.3"/>
            </svg>
            <span className="followup-strip-title">
              {overdue.length} contact{overdue.length !== 1 ? 's' : ''} need{overdue.length === 1 ? 's' : ''} a follow-up
              <span className="followup-strip-sub"> · no response after {FOLLOW_UP_DAYS}+ days</span>
            </span>
          </div>
          <div className="followup-list">
            {overdue.map(o => (
              <div key={o.id} className="followup-item">
                <div className="followup-item-left">
                  <span className="followup-name">{o.contact}</span>
                  <span className="followup-dot">·</span>
                  <span className="followup-bank">{o.bank}</span>
                  <span className="followup-days-pill">{daysSince(o.emailDate)}d ago</span>
                </div>
                <div className="followup-item-actions">
                  <button className="followup-btn responded" onClick={() => updateStatus(o.id, 'Responded')}>
                    Got Response ✓
                  </button>
                  <button className="followup-btn dismiss" onClick={() => updateStatus(o.id, 'No Response')}>
                    Mark No Response
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="net-tabs">
        <button className={`net-tab${tab === 'outreach' ? ' active' : ''}`} onClick={() => setTab('outreach')}>
          Outreach Log
          {outreach.length > 0 && <span className="net-tab-count">{outreach.length}</span>}
          {overdue.length > 0 && <span className="net-tab-alert">{overdue.length}</span>}
        </button>
        <button className={`net-tab${tab === 'calls' ? ' active' : ''}`} onClick={() => setTab('calls')}>
          Call Log
          {calls.length > 0 && <span className="net-tab-count">{calls.length}</span>}
        </button>
      </div>

      {/* ── Call Log ───────────────────────────────────────────────────── */}
      {tab === 'calls' && (
        calls.length === 0 ? (
          <div className="empty-net">
            <div className="empty-net-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="6" r="3.5" stroke="#c9a84c" strokeWidth="1.5"/>
                <circle cx="4.5" cy="18.5" r="3.5" stroke="#c9a84c" strokeWidth="1.5"/>
                <circle cx="19.5" cy="18.5" r="3.5" stroke="#c9a84c" strokeWidth="1.5"/>
                <path d="M12 9.5V14M12 14l-5.5 2.5M12 14l5.5 2.5" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="empty-net-title">No calls logged yet</h2>
            <p className="empty-net-desc">Log your first coffee chat, phone call, or meeting.</p>
            <button className="log-btn" onClick={() => setShowCallModal(true)} style={{ marginTop: 8 }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Log First Call
            </button>
          </div>
        ) : (
          <div className="bank-list">
            {banks.map(bank => {
              const bc = byBank[bank];
              const open = expandedBanks[bank];
              return (
                <div key={bank} className="bank-folder">
                  <div className="bank-folder-header" onClick={() => toggleBank(bank)}>
                    <div className="bank-folder-left">
                      <div className="bank-icon">{bank.slice(0,2).toUpperCase()}</div>
                      <div>
                        <div className="bank-folder-name">{bank}</div>
                        <div className="bank-folder-count">
                          {bc.length} call{bc.length !== 1 ? 's' : ''}
                          {bc[0]?.date ? ` · Last: ${fmtDate(bc[0].date)}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className={`bank-chevron${open ? ' open' : ''}`}>▼</span>
                  </div>
                  {open && (
                    <div className="bank-calls">
                      <div className="call-row call-row-header">
                        <span>Contact</span><span>Date</span><span>Type</span><span>Follow-up</span>
                      </div>
                      {bc.map(call => (
                        <React.Fragment key={call.id}>
                          <div
                            className={`call-row${selectedCall?.id === call.id ? ' selected' : ''}`}
                            onClick={() => setSelectedCall(selectedCall?.id === call.id ? null : call)}
                          >
                            <div>
                              <div className="call-contact">{call.contact}</div>
                              {call.role && <div className="call-role">{call.role}</div>}
                            </div>
                            <div className="call-date">{fmtDate(call.date)}</div>
                            <span className="call-type-badge">{call.type}</span>
                            <div className="call-date">
                              {call.followUp ? fmtDate(call.followUp) : <span style={{color:'var(--text-dim)'}}>—</span>}
                            </div>
                          </div>
                          {selectedCall?.id === call.id && (
                            <div className="call-notes-expanded">
                              {call.notes
                                ? <p className="call-notes-text">{call.notes}</p>
                                : <p className="call-notes-text" style={{color:'var(--text-dim)',fontStyle:'italic'}}>No notes recorded.</p>
                              }
                              <button className="delete-call-btn" onClick={e => { e.stopPropagation(); deleteCall(call.id); }}>
                                Delete entry
                              </button>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Outreach Log ───────────────────────────────────────────────── */}
      {tab === 'outreach' && (
        outreach.length === 0 ? (
          <div className="empty-net">
            <div className="empty-net-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 8l9 6 9-6" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="2" y="5" width="20" height="14" rx="3" stroke="#c9a84c" strokeWidth="1.5"/>
              </svg>
            </div>
            <h2 className="empty-net-title">No outreach logged yet</h2>
            <p className="empty-net-desc">
              Track your cold emails. We'll flag anyone who hasn't responded in {FOLLOW_UP_DAYS} days.
            </p>
            <button className="log-btn" onClick={() => setShowOutModal(true)} style={{ marginTop: 8 }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Log First Outreach
            </button>
          </div>
        ) : (
          <div className="outreach-table">
            <div className="outreach-row outreach-row-header">
              <span>Contact</span>
              <span>Bank</span>
              <span>Date Sent</span>
              <span>Purpose</span>
              <span>Status</span>
              <span>Action</span>
              <span></span>
            </div>
            {sortedOut.map(o => {
              const days    = daysSince(o.emailDate);
              const isOver  = o.status === 'Pending' && days >= FOLLOW_UP_DAYS;
              return (
                <div key={o.id} className={`outreach-row${isOver ? ' overdue' : ''}`}>
                  <div>
                    <div className="call-contact">{o.contact}</div>
                    {o.role && <div className="call-role">{o.role}</div>}
                  </div>
                  <div className="call-date">{o.bank}</div>
                  <div className="call-date">{fmtDate(o.emailDate)}</div>
                  <div className="outreach-purpose">{o.purpose}</div>
                  <div>
                    <select
                      className={`status-select ${statusCls(o.status)}`}
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                    >
                      {OUT_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    {(o.status === 'Responded' || o.status === 'Meeting Scheduled') ? (
                      <button
                        className="log-call-inline-btn"
                        onClick={e => { e.stopPropagation(); logCallFromOutreach(o); }}
                      >
                        Log Call →
                      </button>
                    ) : o.status === 'Pending' ? (
                      <span className={`age-badge${isOver ? ' overdue' : ''}`}>{days}d</span>
                    ) : (
                      <span className="age-badge">—</span>
                    )}
                  </div>
                  <button
                    className="outreach-delete-btn"
                    title="Delete entry"
                    onClick={e => { e.stopPropagation(); deleteOutreach(o.id); }}
                  >×</button>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Log Call Modal ─────────────────────────────────────────────── */}
      {showCallModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCallModal(false)}>
          <div className="modal-box">
            <div className="modal-title">Log New Call</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Bank / Firm *</label>
                <input className={`form-input${callErr.bank ? ' input-error' : ''}`} placeholder="e.g. Goldman Sachs" value={callForm.bank} onChange={setC('bank')} />
                {callErr.bank && <span className="form-error">{callErr.bank}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Contact Name *</label>
                <input className={`form-input${callErr.contact ? ' input-error' : ''}`} placeholder="e.g. John Smith" value={callForm.contact} onChange={setC('contact')} />
                {callErr.contact && <span className="form-error">{callErr.contact}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Title / Role</label>
                <input className="form-input" placeholder="e.g. Associate, TMT" value={callForm.role} onChange={setC('role')} />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className={`form-input${callErr.date ? ' input-error' : ''}`} value={callForm.date} onChange={setC('date')} />
                {callErr.date && <span className="form-error">{callErr.date}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Call Type</label>
                <select className="form-select form-input" value={callForm.type} onChange={setC('type')}>
                  {CALL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Thank you note follow-up</label>
                <select className="form-select form-input" value={callForm.followUpInterval} onChange={setC('followUpInterval')}>
                  {FOLLOW_UP_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group full">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" placeholder="Key takeaways, topics discussed, action items..." value={callForm.notes} onChange={setC('notes')} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowCallModal(false)}>Cancel</button>
              <button className="save-btn" onClick={saveCall}>Save Call</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Log Outreach Modal ─────────────────────────────────────────── */}
      {showOutModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowOutModal(false)}>
          <div className="modal-box">
            <div className="modal-title">Log Outreach</div>
            <p className="modal-sub">We'll remind you to follow up if you don't hear back within {FOLLOW_UP_DAYS} days.</p>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Bank / Firm *</label>
                <input className={`form-input${outErr.bank ? ' input-error' : ''}`} placeholder="e.g. Morgan Stanley" value={outForm.bank} onChange={setO('bank')} />
                {outErr.bank && <span className="form-error">{outErr.bank}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Contact Name *</label>
                <input className={`form-input${outErr.contact ? ' input-error' : ''}`} placeholder="e.g. Sarah Johnson" value={outForm.contact} onChange={setO('contact')} />
                {outErr.contact && <span className="form-error">{outErr.contact}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Title / Role</label>
                <input className="form-input" placeholder="e.g. VP, Healthcare" value={outForm.role} onChange={setO('role')} />
              </div>
              <div className="form-group">
                <label className="form-label">Date Sent *</label>
                <input type="date" className={`form-input${outErr.emailDate ? ' input-error' : ''}`} value={outForm.emailDate} onChange={setO('emailDate')} />
                {outErr.emailDate && <span className="form-error">{outErr.emailDate}</span>}
              </div>
              <div className="form-group full">
                <label className="form-label">Purpose</label>
                <select className="form-select form-input" value={outForm.purpose} onChange={setO('purpose')}>
                  {OUT_PURPOSES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group full">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" placeholder="Subject line, personal connection, key talking points..." value={outForm.notes} onChange={setO('notes')} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowOutModal(false)}>Cancel</button>
              <button className="save-btn" onClick={saveOutreach}>Log Outreach</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
