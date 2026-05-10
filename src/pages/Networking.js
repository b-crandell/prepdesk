import React, { useState } from 'react';

const CALL_TYPES = ['Coffee Chat', 'Phone Call', 'Video Call', 'In-Person', 'Email Follow-up'];

const BLANK_FORM = {
  bank: '', contact: '', role: '', date: '', type: 'Coffee Chat', notes: '', followUp: '',
};

function initCalls() {
  try { return JSON.parse(localStorage.getItem('pd-calls') || '[]'); } catch { return []; }
}

export default function Networking() {
  const [calls, setCalls]             = useState(initCalls);
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState(BLANK_FORM);
  const [expandedBanks, setExpanded]  = useState({});
  const [selectedCall, setSelectedCall] = useState(null);
  const [errors, setErrors]           = useState({});

  // ── Derived ─────────────────────────────────────────────────────────────
  const banks = [...new Set(calls.map((c) => c.bank))].sort();
  const byBank = banks.reduce((acc, b) => {
    acc[b] = calls.filter((c) => c.bank === b).sort((a, z) => z.date.localeCompare(a.date));
    return acc;
  }, {});

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleBank = (bank) =>
    setExpanded((prev) => ({ ...prev, [bank]: !prev[bank] }));

  const openModal = () => { setForm(BLANK_FORM); setErrors({}); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.bank.trim())    e.bank    = 'Required';
    if (!form.contact.trim()) e.contact = 'Required';
    if (!form.date)           e.date    = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveCall = () => {
    if (!validate()) return;
    const newCall = { ...form, id: Date.now().toString(), bank: form.bank.trim() };
    const updated = [newCall, ...calls];
    setCalls(updated);
    localStorage.setItem('pd-calls', JSON.stringify(updated));
    setShowModal(false);
    // auto-expand the new bank
    setExpanded((prev) => ({ ...prev, [newCall.bank]: true }));
  };

  const deleteCall = (id) => {
    const updated = calls.filter((c) => c.id !== id);
    setCalls(updated);
    localStorage.setItem('pd-calls', JSON.stringify(updated));
    if (selectedCall?.id === id) setSelectedCall(null);
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1]} ${+day}, ${y}`;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page-content">
      {/* Header */}
      <div className="net-header">
        <div className="net-header-left">
          <h1 className="page-title">Networking</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {calls.length} call{calls.length !== 1 ? 's' : ''} logged across {banks.length} firm{banks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="log-btn" onClick={openModal}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Log New Call
        </button>
      </div>

      {/* Empty state */}
      {calls.length === 0 ? (
        <div className="empty-net">
          <div className="empty-net-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="6" r="3.5" stroke="#c9a84c" strokeWidth="1.5"/>
              <circle cx="4.5" cy="18.5" r="3.5" stroke="#c9a84c" strokeWidth="1.5"/>
              <circle cx="19.5" cy="18.5" r="3.5" stroke="#c9a84c" strokeWidth="1.5"/>
              <path d="M12 9.5V14M12 14l-5.5 2.5M12 14l5.5 2.5"
                stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="empty-net-title">No calls logged yet</h2>
          <p className="empty-net-desc">
            Start building your banker network. Log your first coffee chat, phone call, or email touchpoint.
          </p>
          <button className="log-btn" onClick={openModal} style={{ marginTop: 8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Log First Call
          </button>
        </div>
      ) : (
        /* Bank folders */
        <div className="bank-list">
          {banks.map((bank) => {
            const bankCalls = byBank[bank];
            const isOpen = expandedBanks[bank];
            return (
              <div key={bank} className="bank-folder">
                {/* Bank header */}
                <div className="bank-folder-header" onClick={() => toggleBank(bank)}>
                  <div className="bank-folder-left">
                    <div className="bank-icon">{bank.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div className="bank-folder-name">{bank}</div>
                      <div className="bank-folder-count">
                        {bankCalls.length} contact{bankCalls.length !== 1 ? 's' : ''}
                        {bankCalls[0]?.date ? ` · Last: ${fmtDate(bankCalls[0].date)}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className={`bank-chevron${isOpen ? ' open' : ''}`}>▼</span>
                </div>

                {/* Calls list */}
                {isOpen && (
                  <div className="bank-calls">
                    {/* Column headers */}
                    <div className="call-row call-row-header">
                      <span>Contact</span>
                      <span>Date</span>
                      <span>Type</span>
                      <span>Follow-up</span>
                    </div>

                    {bankCalls.map((call) => (
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

                        {/* Expanded notes */}
                        {selectedCall?.id === call.id && (
                          <div className="call-notes-expanded">
                            {call.notes ? (
                              <p className="call-notes-text">{call.notes}</p>
                            ) : (
                              <p className="call-notes-text" style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                                No notes recorded.
                              </p>
                            )}
                            <button
                              className="delete-call-btn"
                              onClick={(e) => { e.stopPropagation(); deleteCall(call.id); }}
                            >
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
      )}

      {/* ── Log New Call Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <div className="modal-title">Log New Call</div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Bank / Firm *</label>
                <input
                  className={`form-input${errors.bank ? ' input-error' : ''}`}
                  placeholder="e.g. Goldman Sachs"
                  value={form.bank}
                  onChange={set('bank')}
                />
                {errors.bank && <span className="form-error">{errors.bank}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Contact Name *</label>
                <input
                  className={`form-input${errors.contact ? ' input-error' : ''}`}
                  placeholder="e.g. John Smith"
                  value={form.contact}
                  onChange={set('contact')}
                />
                {errors.contact && <span className="form-error">{errors.contact}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Title / Role</label>
                <input
                  className="form-input"
                  placeholder="e.g. Associate, TMT"
                  value={form.role}
                  onChange={set('role')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className={`form-input${errors.date ? ' input-error' : ''}`}
                  value={form.date}
                  onChange={set('date')}
                />
                {errors.date && <span className="form-error">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Call Type</label>
                <select className="form-select form-input" value={form.type} onChange={set('type')}>
                  {CALL_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.followUp}
                  onChange={set('followUp')}
                />
              </div>

              <div className="form-group full">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  placeholder="Key takeaways, topics discussed, action items..."
                  value={form.notes}
                  onChange={set('notes')}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="save-btn" onClick={saveCall}>Save Call</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
