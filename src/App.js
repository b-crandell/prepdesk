import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// ─── Data ────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 1,
    category: 'Valuation',
    difficulty: 'Hard',
    question:
      'Walk me through a DCF analysis for a mature consumer goods company. What discount rate would you use and why?',
    timeLimit: 120,
  },
  {
    id: 2,
    category: 'M&A',
    difficulty: 'Medium',
    question:
      'What are the key differences between an accretion/dilution analysis and a DCF? When would you use each?',
    timeLimit: 90,
  },
  {
    id: 3,
    category: 'LBO',
    difficulty: 'Hard',
    question:
      'How would you structure an LBO model for a $500M EBITDA company at 8x entry multiple? What drives returns for the PE sponsor?',
    timeLimit: 150,
  },
  {
    id: 4,
    category: 'Markets',
    difficulty: 'Easy',
    question:
      'Walk me through what happens to a bond\'s price when interest rates rise, and how that affects a bank\'s balance sheet.',
    timeLimit: 60,
  },
];

const WAVEFORM_HEIGHTS = [
  45, 72, 28, 88, 55, 38, 95, 62, 42, 80, 32, 70, 52, 90, 25, 65,
  48, 85, 35, 75, 58, 40, 100, 30, 68, 50, 82, 22, 60, 78, 44, 92,
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Waveform({ isActive }) {
  return (
    <div className="waveform">
      {WAVEFORM_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className={`waveform-bar ${isActive ? 'active' : ''}`}
          style={{
            '--h': `${h}px`,
            animationDelay: `${((i * 0.047) % 0.65).toFixed(3)}s`,
            animationDuration: `${(0.32 + (i % 7) * 0.06).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
}

function ScoreRing({ score, label, delay = 0 }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="score-ring-container" style={{ animationDelay: `${delay}s` }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1a1a1a" strokeWidth="4" />
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke="#c9a84c"
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          className="score-arc"
        />
        <text
          x="36" y="41"
          textAnchor="middle"
          fill="#fff"
          fontSize="14"
          fontFamily="DM Sans, sans-serif"
          fontWeight="700"
        >
          {score}
        </text>
      </svg>
      <span className="score-ring-label">{label}</span>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState(0);        // 0=question 1=recording 2=feedback
  const [qIndex, setQIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [micError, setMicError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const timerRef = useRef(null);
  const touchStartY = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const q = QUESTIONS[qIndex];

  // Keyboard + mouse wheel navigation for desktop
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (e.code === 'ArrowDown') {
          if (screen === 0) goTo(1);
          else if (screen === 1) stopRecording();
          else if (screen === 2) nextQuestion();
        } else {
          if (screen > 0) goTo(screen - 1);
        }
      }
    };

    let wheelLocked = false;
    const onWheel = (e) => {
      if (wheelLocked || transitioning) return;
      wheelLocked = true;
      setTimeout(() => { wheelLocked = false; }, 800);
      if (e.deltaY > 0) {
        // scroll down — advance
        if (screen === 0) goTo(1);
        else if (screen === 1) stopRecording();
        else if (screen === 2) nextQuestion();
      } else {
        // scroll up — go back (only if not recording)
        if (screen === 1 && !isRecording) goTo(0);
        else if (screen === 2) goTo(1);
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, transitioning, isRecording]);

  // Timer + auto-stop at time limit
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t + 1 >= q.timeLimit) {
            stopRecording();
            return t + 1;
          }
          return t + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const goTo = useCallback(
    (next) => {
      if (transitioning) return;
      setTransitioning(true);
      setTimeout(() => {
        setScreen(next);
        setTransitioning(false);
      }, 280);
    },
    [transitioning],
  );

  const analyzeTranscript = async (transcript, question, category) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, question, category }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
      }
    } catch {
      // falls back to placeholder scores
    }
    setIsAnalyzing(false);
  };

  const startRecording = async () => {
    setMicError(null);
    setAudioUrl(null);
    setFeedback(null);
    setTimer(0);
    transcriptRef.current = '';

    // Start speech recognition for transcription
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (e) => {
        let t = '';
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + ' ';
        transcriptRef.current = t.trim();
      };
      recognition.start();
      recognitionRef.current = recognition;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4']
        .find((t) => MediaRecorder.isTypeSupported(t)) || '';

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('[PrepDesk] Mic error:', err);
      setMicError('Microphone access denied. Click "Allow" when your browser asks for permission.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    goTo(2);
    // Small delay to let speech recognition finalize transcript
    setTimeout(() => {
      analyzeTranscript(transcriptRef.current, q.question, q.category);
    }, 500);
  };

  const nextQuestion = () => {
    setQIndex((i) => (i + 1) % QUESTIONS.length);
    setTimer(0);
    setIsPlaying(false);
    setAudioUrl(null);
    setMicError(null);
    setFeedback(null);
    goTo(0);
  };

  // Touch swipe
  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;
    if (Math.abs(delta) < 48) return;
    if (delta > 0) {
      if (screen === 1) stopRecording();
      else if (screen === 2) nextQuestion();
    }
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const scores = feedback?.scores || { Content: 85, Structure: 78, Clarity: 91, Confidence: 72 };
  const overall = feedback?.overall || Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 4);
  const insight = feedback?.insight || 'Strong technical foundation on WACC components. Consider leading with the conclusion — interviewers want the answer before the methodology in a time-pressured setting.';

  const screenClass = (i) =>
    screen === i ? 'active' : screen > i ? 'above' : 'below';

  return (
    <div
      className={`app ${transitioning ? 'transitioning' : ''}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="app-frame">
      {/* Nav dots */}
      <div className="nav-dots">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`nav-dot ${screen === i ? 'active' : ''}`} />
        ))}
      </div>

      {/* ── Screen 0: Question ─────────────────────────────── */}
      <div className={`screen screen-question ${screenClass(0)}`}>
        <div className="screen-inner">
          <div className="brand">
            <span className="brand-text">PrepDesk</span>
            <span className="brand-tag">IB</span>
          </div>

          <div className="flashcard">
            <div className="flashcard-header">
              <span className="category-badge">{q.category}</span>
              <span className={`difficulty-badge diff-${q.difficulty.toLowerCase()}`}>
                {q.difficulty}
              </span>
            </div>

            <div className="question-number">
              Question {q.id} of {QUESTIONS.length}
            </div>

            <p className="question-text">{q.question}</p>

            <div className="time-limit">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#c9a84c" strokeWidth="1.4" />
                <path d="M8 4.5V8l2 1.2" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {q.timeLimit / 60} min suggested
            </div>
          </div>

          <button className="cta-button" onClick={() => goTo(1)}>
            <span>Begin Answer</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3a7 7 0 100 14A7 7 0 0010 3zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM8 7l5 3-5 3V7z" fill="#000"/>
            </svg>
          </button>

          <div className="swipe-hint">
            <div className="swipe-arrow" />
            Swipe up to answer
          </div>
        </div>
      </div>

      {/* ── Screen 1: Recording ────────────────────────────── */}
      <div className={`screen screen-recording ${screenClass(1)}`}>
        <div className="screen-inner">
          <div className="recording-header">
            <div className="rec-indicator" style={{ opacity: isRecording ? 1 : 0 }}>
              <span className="rec-dot" />
              REC
            </div>
            <div className="timer-display">{fmt(timer)}</div>
          </div>

          <div className="question-pill">
            {q.question.length > 72 ? q.question.slice(0, 72) + '…' : q.question}
          </div>

          <div className="waveform-container">
            <Waveform isActive={isRecording} />
          </div>

          <div className="time-limit-bar">
            <div
              className="time-limit-fill"
              style={{ width: `${Math.min((timer / q.timeLimit) * 100, 100)}%` }}
            />
          </div>
          <div className="time-limit-labels">
            <span>0:00</span>
            <span>{fmt(q.timeLimit)}</span>
          </div>

          {isRecording ? (
            <button className="stop-button" onClick={stopRecording}>
              <div className="stop-icon" />
              Stop &amp; Analyze
            </button>
          ) : (
            <button className="cta-button" onClick={startRecording}>
              <span>Start Recording</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" fill="#000" />
                <circle cx="10" cy="10" r="3.5" fill="#c9a84c" />
              </svg>
            </button>
          )}

          {micError && <div className="mic-error">{micError}</div>}

          <div className="swipe-hint">
            <div className="swipe-arrow" />
            Swipe up to finish
          </div>
        </div>
      </div>

      {/* ── Screen 2: Feedback ─────────────────────────────── */}
      <div className={`screen screen-feedback ${screenClass(2)}`}>
        <div className="screen-inner">
          <div className="feedback-header">
            <span className="feedback-title">AI Feedback</span>
            <div className="overall-score">
              {isAnalyzing ? (
                <span className="analyzing-label">Analyzing…</span>
              ) : (
                <>
                  <span className="overall-number">{overall}</span>
                  <span className="overall-label">/100</span>
                </>
              )}
            </div>
          </div>

          {/* Audio replay */}
          <audio
            ref={audioRef}
            src={audioUrl || undefined}
            onEnded={() => setIsPlaying(false)}
            style={{ display: 'none' }}
          />
          <div className="video-replay" onClick={() => {
            const audio = audioRef.current;
            if (!audio || !audioUrl) return;
            if (isPlaying) {
              audio.pause();
              audio.currentTime = 0;
              setIsPlaying(false);
            } else {
              audio.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          }}>
            <div className="video-placeholder">
              <div className={`play-btn ${isPlaying ? 'playing' : ''}`}>
                {isPlaying ? (
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                    <rect x="6"  y="5" width="4" height="16" rx="1.5" fill="#c9a84c" />
                    <rect x="16" y="5" width="4" height="16" rx="1.5" fill="#c9a84c" />
                  </svg>
                ) : (
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                    <path d="M8 5.5l14 7.5-14 7.5V5.5z" fill="#c9a84c" />
                  </svg>
                )}
              </div>
              <span className="video-duration">{fmt(timer)}</span>
            </div>
            <div className="video-label">
              {audioUrl ? 'Your recording — click to replay' : 'No recording captured'}
            </div>
          </div>

          {/* Score breakdown */}
          <div className="score-grid">
            {Object.entries(scores).map(([label, score], i) => (
              <ScoreRing key={label} score={score} label={label} delay={i * 0.1} />
            ))}
          </div>

          {/* AI insight */}
          <div className="ai-insight">
            <div className="ai-insight-header">
              <span className="ai-badge">AI</span>
              <span className="ai-insight-label">Key Insight</span>
            </div>
            <p className="ai-insight-text">
              {isAnalyzing ? 'Analyzing your response…' : insight}
            </p>
          </div>

          <button className="next-button" onClick={nextQuestion}>
            Next Question
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="#000"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
      </div> {/* app-frame */}
    </div>
  );
}
