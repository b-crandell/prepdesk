import React, { useState, useEffect, useRef, useCallback } from 'react';

const QUESTIONS = [
  { id: 1, category: 'Valuation', difficulty: 'Hard',   question: 'Walk me through a DCF analysis for a mature consumer goods company. What discount rate would you use and why?', timeLimit: 120 },
  { id: 2, category: 'M&A',       difficulty: 'Medium', question: 'What are the key differences between an accretion/dilution analysis and a DCF? When would you use each?', timeLimit: 90 },
  { id: 3, category: 'LBO',       difficulty: 'Hard',   question: 'How would you structure an LBO model for a $500M EBITDA company at 8x entry multiple? What drives returns for the PE sponsor?', timeLimit: 150 },
  { id: 4, category: 'Markets',   difficulty: 'Easy',   question: "Walk me through what happens to a bond's price when interest rates rise, and how that affects a bank's balance sheet.", timeLimit: 60 },
];

const WAVEFORM_HEIGHTS = [45,72,28,88,55,38,95,62,42,80,32,70,52,90,25,65,48,85,35,75,58,40,100,30,68,50,82,22,60,78,44,92];

function Waveform({ isActive }) {
  return (
    <div className="waveform">
      {WAVEFORM_HEIGHTS.map((h, i) => (
        <div key={i} className={`waveform-bar ${isActive ? 'active' : ''}`}
          style={{ '--h': `${h}px`, animationDelay: `${((i * 0.047) % 0.65).toFixed(3)}s`, animationDuration: `${(0.32 + (i % 7) * 0.06).toFixed(2)}s` }} />
      ))}
    </div>
  );
}

function ScoreRing({ score, label, delay = 0 }) {
  const r = 28, circ = 2 * Math.PI * r, offset = circ - (score / 100) * circ;
  return (
    <div className="score-ring-container" style={{ animationDelay: `${delay}s` }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1a1a1a" strokeWidth="4" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="#c9a84c" strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 36 36)" className="score-arc" />
        <text x="36" y="41" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="DM Sans, sans-serif" fontWeight="700">{score}</text>
      </svg>
      <span className="score-ring-label">{label}</span>
    </div>
  );
}

const STEPS = ['Question', 'Record', 'Feedback'];

export default function MockInterview() {
  const [step,        setStep]        = useState(0);
  const [qIndex,      setQIndex]      = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timer,       setTimer]       = useState(0);
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [audioUrl,    setAudioUrl]    = useState(null);
  const [micError,    setMicError]    = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback,    setFeedback]    = useState(null);

  const timerRef        = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef  = useRef([]);
  const audioRef        = useRef(null);
  const recognitionRef  = useRef(null);
  const transcriptRef   = useRef('');
  const q = QUESTIONS[qIndex];

  // Space bar shortcut
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
      e.preventDefault();
      if (step === 0) setStep(1);
      else if (step === 1 && isRecording) stopRecording();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isRecording]);

  // Timer + auto-stop
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer(t => { if (t + 1 >= q.timeLimit) { stopRecording(); return t + 1; } return t + 1; });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const analyzeTranscript = useCallback(async (transcript, question, category) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, question, category }),
      });
      if (res.ok) setFeedback(await res.json());
    } catch { /* falls back to placeholder */ }
    setIsAnalyzing(false);
  }, []);

  const startRecording = async () => {
    setMicError(null); setAudioUrl(null); setFeedback(null); setTimer(0);
    transcriptRef.current = '';
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
      rec.onresult = (e) => {
        let t = '';
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + ' ';
        transcriptRef.current = t.trim();
      };
      rec.start();
      recognitionRef.current = rec;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ['audio/webm;codecs=opus','audio/webm','audio/ogg','audio/mp4'].find(t => MediaRecorder.isTypeSupported(t)) || '';
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        setAudioUrl(URL.createObjectURL(new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' })));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setIsRecording(true);
    } catch {
      setMicError('Microphone access denied. Click "Allow" when your browser asks for permission.');
    }
  };

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    setIsRecording(false);
    setStep(2);
    setTimeout(() => analyzeTranscript(transcriptRef.current, q.question, q.category), 500);
  }, [q, analyzeTranscript]);

  const nextQuestion = () => {
    setQIndex(i => (i + 1) % QUESTIONS.length);
    setTimer(0); setIsPlaying(false); setAudioUrl(null); setMicError(null); setFeedback(null);
    setStep(0);
  };

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  const scores  = feedback?.scores  || { Content: 85, Structure: 78, Clarity: 91, Confidence: 72 };
  const overall = feedback?.overall || Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 4);
  const insight = feedback?.insight || 'Strong technical foundation. Consider leading with the conclusion — interviewers want the answer before the methodology.';

  return (
    <div className="interview-desktop">

      {/* ── Step indicator ───────────────────────────────────────────────── */}
      <div className="iv-steps">
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div className={`iv-step${step === i ? ' active' : step > i ? ' done' : ''}`}>
              <div className="iv-step-num">{step > i ? '✓' : i + 1}</div>
              <span className="iv-step-label">{label}</span>
            </div>
            {i < 2 && <div className={`iv-step-line${step > i ? ' done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── Step 0: Question ─────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="iv-question-screen">
          <div className="iv-question-card">
            <div className="flashcard-header">
              <span className="category-badge">{q.category}</span>
              <span className={`difficulty-badge diff-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
              <span className="question-number" style={{ marginLeft: 'auto' }}>
                Question {q.id} of {QUESTIONS.length}
              </span>
            </div>
            <p className="iv-question-text">{q.question}</p>
            <div className="time-limit">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#c9a84c" strokeWidth="1.4" />
                <path d="M8 4.5V8l2 1.2" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {q.timeLimit / 60} min suggested
            </div>
          </div>

          <div className="iv-question-actions">
            <button className="cta-button iv-begin-btn" onClick={() => setStep(1)}>
              Begin Answer
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 3a7 7 0 100 14A7 7 0 0010 3zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM8 7l5 3-5 3V7z" fill="#000"/>
              </svg>
            </button>
            <button className="iv-skip-btn" onClick={nextQuestion}>Skip question →</button>
            <span className="iv-kb-hint">or press Space</span>
          </div>
        </div>
      )}

      {/* ── Step 1: Recording ────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="iv-record-screen">
          {/* Left: question context + waveform */}
          <div className="iv-record-left">
            <div className="iv-record-q-label">Answering</div>
            <p className="iv-record-q-text">{q.question}</p>
            <div className="waveform-container" style={{ flex: 1 }}>
              <Waveform isActive={isRecording} />
            </div>
            {isRecording && <div className="iv-kb-hint" style={{ textAlign: 'center' }}>Press Space to stop</div>}
          </div>

          {/* Right: controls */}
          <div className="iv-record-right">
            <div className="recording-header">
              <div className="rec-indicator" style={{ opacity: isRecording ? 1 : 0 }}>
                <span className="rec-dot" />REC
              </div>
              <div className="timer-display">{fmt(timer)}</div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <div className="time-limit-bar">
                <div className="time-limit-fill" style={{ width: `${Math.min((timer / q.timeLimit) * 100, 100)}%` }} />
              </div>
              <div className="time-limit-labels"><span>0:00</span><span>{fmt(q.timeLimit)}</span></div>
            </div>

            {isRecording ? (
              <button className="stop-button" onClick={stopRecording}>
                <div className="stop-icon" />Stop &amp; Analyze
              </button>
            ) : (
              <button className="cta-button" onClick={startRecording}>
                <span>Start Recording</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" fill="#000"/><circle cx="10" cy="10" r="3.5" fill="#c9a84c"/>
                </svg>
              </button>
            )}

            {micError && <div className="mic-error">{micError}</div>}

            <button className="iv-back-btn" onClick={() => setStep(0)}>← Back to question</button>
          </div>
        </div>
      )}

      {/* ── Step 2: Feedback ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="iv-feedback-screen">
          {/* Left: score header + playback + question reference */}
          <div className="iv-feedback-left">
            <div className="feedback-header">
              <span className="feedback-title">AI Feedback</span>
              <div className="overall-score">
                {isAnalyzing
                  ? <span className="analyzing-label">Analyzing…</span>
                  : <><span className="overall-number">{overall}</span><span className="overall-label">/100</span></>
                }
              </div>
            </div>

            <audio ref={audioRef} src={audioUrl || undefined} onEnded={() => setIsPlaying(false)} style={{ display: 'none' }} />
            <div className="video-replay" onClick={() => {
              const audio = audioRef.current;
              if (!audio || !audioUrl) return;
              if (isPlaying) { audio.pause(); audio.currentTime = 0; setIsPlaying(false); }
              else { audio.play().then(() => setIsPlaying(true)).catch(() => {}); }
            }}>
              <div className="video-placeholder">
                <div className={`play-btn ${isPlaying ? 'playing' : ''}`}>
                  {isPlaying ? (
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                      <rect x="6" y="5" width="4" height="16" rx="1.5" fill="#c9a84c"/>
                      <rect x="16" y="5" width="4" height="16" rx="1.5" fill="#c9a84c"/>
                    </svg>
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                      <path d="M8 5.5l14 7.5-14 7.5V5.5z" fill="#c9a84c"/>
                    </svg>
                  )}
                </div>
                <span className="video-duration">{fmt(timer)}</span>
              </div>
              <div className="video-label">{audioUrl ? 'Your recording — click to replay' : 'No recording captured'}</div>
            </div>

            <div className="iv-question-ref">
              <div className="iv-question-ref-label">Question</div>
              <p className="iv-question-ref-text">{q.question}</p>
            </div>
          </div>

          {/* Right: scores + insight + next */}
          <div className="iv-feedback-right">
            <div className="iv-scores-grid">
              {Object.entries(scores).map(([label, score], i) => (
                <ScoreRing key={label} score={score} label={label} delay={i * 0.1} />
              ))}
            </div>

            <div className="ai-insight">
              <div className="ai-insight-header">
                <span className="ai-badge">AI</span>
                <span className="ai-insight-label">Key Insight</span>
              </div>
              <p className="ai-insight-text">{isAnalyzing ? 'Analyzing your response…' : insight}</p>
            </div>

            <button className="next-button" onClick={nextQuestion}>
              Next Question
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
