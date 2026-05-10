import React, { useState } from 'react';
import { QUESTIONS, SECTIONS } from '../data/questions';

export default function Quiz() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [qIndex, setQIndex]         = useState(0);
  const [selected, setSelected]     = useState(null);   // chosen option index
  const [showExpl, setShowExpl]     = useState(false);
  const [correct, setCorrect]       = useState(0);
  const [answered, setAnswered]     = useState(0);
  const [complete, setComplete]     = useState(false);

  const sectionQs = QUESTIONS.filter((q) => q.section === activeSection);
  const q         = sectionQs[qIndex];
  const total     = sectionQs.length;
  const pct       = (qIndex / total) * 100;
  const section   = SECTIONS.find((s) => s.id === activeSection);

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExpl(true);
    setAnswered((a) => a + 1);
    if (idx === q.answer) setCorrect((c) => c + 1);
  };

  const handleNext = () => {
    if (qIndex + 1 >= total) { setComplete(true); return; }
    setQIndex((i) => i + 1);
    setSelected(null);
    setShowExpl(false);
  };

  const handleSection = (id) => {
    setActiveSection(id);
    setQIndex(0); setSelected(null); setShowExpl(false);
    setCorrect(0); setAnswered(0); setComplete(false);
  };

  const handleRestart = () => {
    setQIndex(0); setSelected(null); setShowExpl(false);
    setCorrect(0); setAnswered(0); setComplete(false);
  };

  const scoreColor = (pctVal) => {
    if (pctVal >= 80) return '#4ade80';
    if (pctVal >= 60) return '#c9a84c';
    return '#ef4444';
  };

  return (
    <div className="page-content">
      <h1 className="page-title">Quick Quiz</h1>
      <p className="page-subtitle">Select a section and test your technical knowledge.</p>

      {/* Section tabs */}
      <div className="quiz-sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSection(s.id)}
            className={`quiz-tab${activeSection === s.id ? ' active' : ''}`}
          >
            {s.label}
            <span className="quiz-tab-count">{QUESTIONS.filter((q) => q.section === s.id).length}</span>
          </button>
        ))}
      </div>

      {complete ? (
        /* ── Results screen ─────────────────────────── */
        <div className="quiz-complete">
          <div
            className="quiz-score-ring"
            style={{ color: scoreColor(Math.round((correct / total) * 100)) }}
          >
            {Math.round((correct / total) * 100)}
          </div>
          <h2 className="quiz-complete-title">Section Complete</h2>
          <p className="quiz-complete-sub">{correct} / {total} correct — {section?.label}</p>
          <div className="quiz-complete-actions">
            <button className="quiz-restart-btn" onClick={handleRestart}>Try Again</button>
            {SECTIONS.indexOf(section) < SECTIONS.length - 1 && (
              <button
                className="quiz-next-section-btn"
                onClick={() => handleSection(SECTIONS[SECTIONS.indexOf(section) + 1].id)}
              >
                Next Section →
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── Question screen ────────────────────────── */
        <>
          <div className="quiz-progress-row">
            <span className="quiz-progress-label">Question {qIndex + 1} of {total}</span>
            <span
              className="quiz-progress-score"
              style={{ color: answered > 0 ? scoreColor(Math.round((correct / answered) * 100)) : 'var(--text-dim)' }}
            >
              {answered > 0 ? `${Math.round((correct / answered) * 100)}% correct` : '—'}
            </span>
          </div>
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${pct}%` }} />
          </div>

          <div className="quiz-card">
            <div className="quiz-meta">
              <span className="quiz-section-badge">{section?.label}</span>
              <span className={`quiz-diff diff-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
            </div>

            <p className="quiz-question-text">{q.question}</p>

            <div className="quiz-options">
              {q.options.map((opt, i) => {
                let cls = 'quiz-option';
                if (selected !== null) {
                  if (i === q.answer)      cls += ' correct';
                  else if (i === selected) cls += ' incorrect';
                  else                     cls += ' dimmed';
                }
                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => handleSelect(i)}
                    disabled={selected !== null}
                  >
                    <span className="quiz-opt-letter">{['A','B','C','D'][i]}</span>
                    <span className="quiz-opt-text">{opt}</span>
                  </button>
                );
              })}
            </div>

            {showExpl && (
              <div className={`quiz-explanation ${selected === q.answer ? 'expl-correct' : 'expl-incorrect'}`}>
                <div className="expl-header">
                  {selected === q.answer ? '✓ Correct' : `✗ Incorrect — Answer: ${['A','B','C','D'][q.answer]}`}
                </div>
                <p className="expl-text">{q.explanation}</p>
                <button className="quiz-next-btn" onClick={handleNext}>
                  {qIndex + 1 >= total ? 'See Results →' : 'Next Question →'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
