import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Question banks ─────────────────────────────────────────── */

const NETWORKING_QUESTIONS = [
  { id: 1, category: 'Behavioral', difficulty: 'Easy',   question: "Tell me about yourself — walk me through your background and why you're interested in investment banking.",                         timeLimit: 120 },
  { id: 2, category: 'Behavioral', difficulty: 'Easy',   question: "Why investment banking specifically? What draws you to this over other areas of finance?",                                         timeLimit: 90  },
  { id: 3, category: 'Behavioral', difficulty: 'Easy',   question: "Walk me through your resume, highlighting the experiences most relevant to a career in banking.",                                  timeLimit: 120 },
  { id: 4, category: 'Behavioral', difficulty: 'Medium', question: "What's a recent deal or transaction you've been following? What makes it interesting to you?",                                     timeLimit: 90  },
  { id: 5, category: 'Behavioral', difficulty: 'Easy',   question: "Tell me about a challenging team project. What was your specific role and what did you take away from it?",                       timeLimit: 90  },
  { id: 6, category: 'Behavioral', difficulty: 'Easy',   question: "Where do you see yourself in five to ten years? What's your long-term goal in finance?",                                          timeLimit: 60  },
  { id: 7, category: 'Behavioral', difficulty: 'Medium', question: "Why this firm specifically? What do you know about our culture, deal flow, or recent transactions?",                               timeLimit: 90  },
  { id: 8, category: 'Behavioral', difficulty: 'Medium', question: "Describe a time you had to persuade someone without formal authority. How did you approach it and what was the outcome?",         timeLimit: 90  },
];

const FIRSTROUND_QUESTIONS = [
  { id:  1, category: 'Behavioral', difficulty: 'Easy',   question: "Tell me about yourself — why investment banking, and why this firm?",                                                              timeLimit: 120 },
  { id:  2, category: 'Behavioral', difficulty: 'Medium', question: "Walk me through a project that required strong analytical skills under a tight deadline.",                                         timeLimit: 90  },
  { id:  3, category: 'Behavioral', difficulty: 'Medium', question: "Describe a situation where you disagreed with a teammate or manager. How did you handle it?",                                     timeLimit: 90  },
  { id:  4, category: 'Accounting', difficulty: 'Easy',   question: "Walk me through the three financial statements and explain how they connect to each other.",                                       timeLimit: 90  },
  { id:  5, category: 'Valuation',  difficulty: 'Easy',   question: "What is enterprise value and how does it differ from equity value? Walk me through the bridge.",                                  timeLimit: 90  },
  { id:  6, category: 'Valuation',  difficulty: 'Medium', question: "Name the three main valuation methodologies and walk me through when you would use each one.",                                    timeLimit: 90  },
  { id:  7, category: 'Accounting', difficulty: 'Medium', question: "Walk me through what happens to all three financial statements if accounts receivable increases by $50.",                          timeLimit: 90  },
  { id:  8, category: 'Valuation',  difficulty: 'Medium', question: "Walk me through a basic DCF analysis — the key steps and most important inputs.",                                                 timeLimit: 120 },
  { id:  9, category: 'Behavioral', difficulty: 'Medium', question: "Tell me about a company or deal in the news that caught your attention recently and why.",                                        timeLimit: 90  },
  { id: 10, category: 'M&A',        difficulty: 'Medium', question: "At a high level, walk me through how an M&A process works from initial mandate to close.",                                        timeLimit: 120 },
];

const TECHNICAL_QUESTIONS = {
  easy: [
    { id: 1, category: 'Accounting', difficulty: 'Easy', question: "Walk me through the three financial statements. How are they connected to each other?",                                             timeLimit: 90  },
    { id: 2, category: 'Accounting', difficulty: 'Easy', question: "What is EBITDA and why is it commonly used as a proxy for operating performance?",                                                  timeLimit: 60  },
    { id: 3, category: 'Valuation',  difficulty: 'Easy', question: "What is the difference between enterprise value and equity value? How do you bridge between the two?",                              timeLimit: 90  },
    { id: 4, category: 'Accounting', difficulty: 'Easy', question: "If net income increases by $100, walk me through the full impact on the cash flow statement.",                                      timeLimit: 90  },
    { id: 5, category: 'Accounting', difficulty: 'Easy', question: "What happens on the cash flow statement if accounts payable increases by $100?",                                                    timeLimit: 60  },
    { id: 6, category: 'Valuation',  difficulty: 'Easy', question: "Name four common valuation multiples and explain what each one is measuring.",                                                      timeLimit: 90  },
    { id: 7, category: 'Accounting', difficulty: 'Easy', question: "Walk me through what happens to all three financial statements if depreciation increases by $20 (assume 40% tax rate).",            timeLimit: 90  },
    { id: 8, category: 'Accounting', difficulty: 'Easy', question: "What is working capital and how does an increase in working capital affect a company's free cash flow?",                            timeLimit: 60  },
  ],
  medium: [
    { id: 1, category: 'Valuation',  difficulty: 'Medium', question: "Walk me through a DCF analysis from start to finish, including how you arrive at a terminal value.",                              timeLimit: 150 },
    { id: 2, category: 'Valuation',  difficulty: 'Medium', question: "How do you calculate WACC? Walk me through each component and what drives it.",                                                   timeLimit: 120 },
    { id: 3, category: 'M&A',        difficulty: 'Medium', question: "What are synergies in an M&A deal? What's the difference between revenue and cost synergies?",                                    timeLimit: 90  },
    { id: 4, category: 'Accounting', difficulty: 'Medium', question: "Walk me through how a $100 increase in depreciation flows through all three financial statements (40% tax rate).",                timeLimit: 90  },
    { id: 5, category: 'Accounting', difficulty: 'Medium', question: "What is goodwill? When does it arise on the balance sheet and how is it treated post-acquisition?",                               timeLimit: 90  },
    { id: 6, category: 'LBO',        difficulty: 'Medium', question: "Explain how a leveraged buyout works. What are the main return drivers for a private equity sponsor?",                           timeLimit: 120 },
    { id: 7, category: 'M&A',        difficulty: 'Medium', question: "Walk me through an accretion/dilution analysis. What makes a deal accretive versus dilutive to EPS?",                            timeLimit: 120 },
    { id: 8, category: 'Valuation',  difficulty: 'Medium', question: "When would you use precedent transactions versus comparable companies? What are the pros and cons of each?",                     timeLimit: 90  },
  ],
  hard: [
    { id: 1, category: 'Valuation',  difficulty: 'Hard', question: "How would you value a company with negative EBITDA and no clear path to near-term profitability? Walk me through your approach.",  timeLimit: 150 },
    { id: 2, category: 'LBO',        difficulty: 'Hard', question: "How would you structure an LBO for a company with highly cyclical cash flows? What risks do you flag for the sponsor?",             timeLimit: 150 },
    { id: 3, category: 'M&A',        difficulty: 'Hard', question: "Walk me through a full merger model from purchase price to pro forma EPS. How do you determine accretion or dilution?",            timeLimit: 180 },
    { id: 4, category: 'M&A',        difficulty: 'Hard', question: "What's the difference between a 338(h)(10) election and a straight asset sale? When would a buyer prefer each structure?",         timeLimit: 120 },
    { id: 5, category: 'Valuation',  difficulty: 'Hard', question: "You're running a DCF on a company with a rapidly changing capital structure. How does this complicate WACC and what do you do?",   timeLimit: 150 },
    { id: 6, category: 'LBO',        difficulty: 'Hard', question: "A PE firm buys at 10x EBITDA with 60% leverage. EBITDA grows 20% over five years and they exit at 10x. Walk me through the IRR.", timeLimit: 150 },
    { id: 7, category: 'M&A',        difficulty: 'Hard', question: "How does choosing between a stock deal and an all-cash deal affect the acquirer's EPS accretion/dilution analysis?",               timeLimit: 120 },
    { id: 8, category: 'Accounting', difficulty: 'Hard', question: "Walk me through how deferred revenue on a target's balance sheet affects DCF valuation in an M&A context.",                       timeLimit: 120 },
  ],
};

/* ─── Type + difficulty metadata ────────────────────────────── */

const INTERVIEW_TYPES = [
  {
    id: 'networking',
    label: 'Networking Prep',
    duration: '15–20 min',
    desc: 'Coffee chats and informational interviews. Practice your story, show genuine curiosity, and leave a lasting impression.',
    tags: ['Story', 'Fit', 'Behavioral'],
    count: NETWORKING_QUESTIONS.length,
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="6" r="3.5" stroke="#c9a84c" strokeWidth="1.6"/>
        <circle cx="5.5" cy="20" r="3" stroke="#c9a84c" strokeWidth="1.6"/>
        <circle cx="20.5" cy="20" r="3" stroke="#c9a84c" strokeWidth="1.6"/>
        <path d="M13 9.5v5.5M13 15l-6 3.5M13 15l6 3.5" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'firstround',
    label: 'First Round',
    duration: '30 min',
    desc: 'A realistic mix of behavioral and foundational technical questions — just like your actual first-round screen.',
    tags: ['Behavioral', 'Technical', 'Mixed'],
    count: FIRSTROUND_QUESTIONS.length,
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="3" y="3" width="20" height="20" rx="5" stroke="#c9a84c" strokeWidth="1.6"/>
        <path d="M8 10h10M8 13.5h7M8 17h4" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'technical',
    label: 'Full Technical',
    duration: '45–60 min',
    desc: 'Deep-dive technical questions across valuation, accounting, M&A, and LBO. You choose the difficulty.',
    tags: ['Valuation', 'Accounting', 'LBO', 'M&A'],
    count: 8,
    hasDifficulty: true,
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M13 2.5L3 8l10 5.5 10-5.5L13 2.5z" stroke="#c9a84c" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M3 18.5l10 5.5 10-5.5M3 13l10 5.5 10-5.5" stroke="#c9a84c" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',   desc: 'Financial statement fundamentals, core valuation concepts, and basic accounting. Good for first-time preppers.' },
  { id: 'medium', label: 'Medium', desc: 'DCF, WACC, M&A mechanics, LBO fundamentals, and intermediate accounting transactions.' },
  { id: 'hard',   label: 'Hard',   desc: 'Complex deal structures, full merger models, advanced LBO return analysis, and technical edge cases.' },
];

/* ─── Helpers ────────────────────────────────────────────────── */

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

/* ─── Self-review questions ──────────────────────────────────── */

const BEHAVIORAL_REVIEW = [
  { id: 'clear',      group: 'Delivery',   q: 'Is your speech clear and easy to understand?' },
  { id: 'pace',       group: 'Delivery',   q: 'Is your pace comfortable — not rushing or dragging?' },
  { id: 'confident',  group: 'Delivery',   q: 'Do you sound confident throughout?' },
  { id: 'smooth',     group: 'Delivery',   q: 'Delivery felt smooth — no awkward pauses or volume drops?' },
  { id: 'addresses',  group: 'Content',    q: 'Does your answer directly address the question?' },
  { id: 'star',       group: 'Content',    q: 'Did you follow a clear structure (situation → action → result)?' },
  { id: 'concrete',   group: 'Content',    q: 'Did you use a specific, concrete example?' },
  { id: 'conclusion', group: 'Structure',  q: 'Did you lead with your main point first?' },
  { id: 'flow',       group: 'Structure',  q: 'Is there a clear, logical flow to your answer?' },
];

const TECHNICAL_REVIEW = [
  { id: 'clear',      group: 'Delivery',   q: 'Is your speech clear and easy to understand?' },
  { id: 'pace',       group: 'Delivery',   q: 'Is your pace comfortable — not rushing or dragging?' },
  { id: 'confident',  group: 'Delivery',   q: 'Do you sound confident throughout?' },
  { id: 'smooth',     group: 'Delivery',   q: 'Delivery felt smooth — no awkward pauses or volume drops?' },
  { id: 'addresses',  group: 'Content',    q: 'Does your answer directly address the question?' },
  { id: 'logic',      group: 'Content',    q: 'Did you walk through your logic step by step?' },
  { id: 'accurate',   group: 'Content',    q: 'Did you get the key concepts right?' },
  { id: 'conclusion', group: 'Structure',  q: 'Did you lead with your conclusion before the detail?' },
  { id: 'why',        group: 'Structure',  q: 'Did you explain the "why," not just the "what"?' },
];

const SR_GROUPS = ['Delivery', 'Content', 'Structure'];

/* ─── Filler word detection ──────────────────────────────────── */

// Multi-word fillers must come first so they're matched before their parts
const FILLER_WORDS = [
  'you know', 'i mean', 'kind of', 'sort of',
  'um', 'uh', 'uhh', 'umm', 'hmm', 'hm', 'mhm',
  'like', 'basically', 'literally', 'right',
];

function analyzeFillers(transcript) {
  if (!transcript) return { counts: {}, total: 0, fillerIndices: new Set() };

  const words       = transcript.trim().split(/\s+/).filter(Boolean);
  const clean       = words.map(w => w.toLowerCase().replace(/[.,!?;:'"()-]+/g, ''));
  const fillerIndices = new Set();
  const counts      = {};

  // Sort longest first so multi-word phrases match before single words
  const sorted = [...FILLER_WORDS].sort((a, b) => b.split(' ').length - a.split(' ').length);

  sorted.forEach(filler => {
    const fw = filler.split(' ');
    if (fw.length === 1) {
      clean.forEach((w, i) => {
        if (w === filler && !fillerIndices.has(i)) {
          fillerIndices.add(i);
          counts[filler] = (counts[filler] || 0) + 1;
        }
      });
    } else {
      for (let i = 0; i <= clean.length - fw.length; i++) {
        if (fw.every((fw_w, j) => clean[i + j] === fw_w) &&
            !fw.some((_, j) => fillerIndices.has(i + j))) {
          for (let j = 0; j < fw.length; j++) fillerIndices.add(i + j);
          counts[filler] = (counts[filler] || 0) + 1;
        }
      }
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { counts, total, fillerIndices };
}

function fillerSeverity(total) {
  if (total === 0)  return 'filler-none';
  if (total <= 3)   return 'filler-low';
  if (total <= 7)   return 'filler-mid';
  return 'filler-high';
}

function wpmInfo(wpm) {
  if (wpm === 0)   return { label: '—',             cls: 'wpm-none'  };
  if (wpm < 110)   return { label: 'Too Slow',      cls: 'wpm-slow'  };
  if (wpm <= 130)  return { label: 'Good Pace',     cls: 'wpm-good'  };
  if (wpm <= 160)  return { label: 'Ideal Pace',    cls: 'wpm-ideal' };
  if (wpm <= 180)  return { label: 'Slightly Fast', cls: 'wpm-fast'  };
  return           { label: 'Too Fast',     cls: 'wpm-vfast' };
}

/* ─── Transcript display ─────────────────────────────────────── */

/* Word-highlighted transcript — highlights current word during playback.
   Uses phrase timestamps when available (Path 1), falls back to uniform
   proportion when not. Filler words are highlighted orange at rest. */
function TranscriptDisplay({ text, currentTime, duration, isPlaying, wordTimestamps, fillerIndices, flaggedMoments }) {
  if (!text) return (
    <p className="iv-transcript-empty">
      No transcript captured — make sure your browser allows microphone access and supports speech recognition.
    </p>
  );

  const words = text.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  let activeIdx = -1;
  if (isPlaying) {
    if (wordTimestamps && wordTimestamps.length > 0) {
      for (let i = 0; i < Math.min(wordTimestamps.length, totalWords); i++) {
        if (wordTimestamps[i].time <= currentTime) activeIdx = i;
        else break;
      }
    } else if (duration > 0) {
      activeIdx = Math.min(Math.floor((currentTime / duration) * totalWords), totalWords - 1);
    }
  }

  return (
    <p className="iv-transcript-text">
      {words.map((word, i) => {
        const isFiller  = fillerIndices?.has(i);
        const isFlagged = wordTimestamps?.[i] && flaggedMoments?.length > 0 &&
          flaggedMoments.some(ft => Math.abs(wordTimestamps[i].time - ft) < 0.8);
        const cls =
          i === activeIdx ? 'iv-word current'
          : i < activeIdx ? 'iv-word spoken'
          : isFlagged     ? 'iv-word flagged'
          : isFiller      ? 'iv-word filler'
          : 'iv-word';
        return <span key={i} className={cls}>{word}{' '}</span>;
      })}
    </p>
  );
}

const fmtTime  = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
const fmtLimit = s => {
  if (s < 60) return `${s}s`;
  if (s % 60 === 0) return `${s / 60} min`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2,'0')} min`;
};
const wordCount = str => (str || '').trim().split(/\s+/).filter(Boolean).length;

const STEPS = ['Question', 'Record', 'Feedback'];

/* ─── Component ─────────────────────────────────────────────── */

export default function MockInterview() {
  const [mode,            setMode]            = useState(null);
  const [difficulty,      setDifficulty]      = useState(null);
  const [pendingDiff,     setPendingDiff]     = useState('medium');
  const [step,            setStep]            = useState(0);
  const [qIndex,          setQIndex]          = useState(0);
  const [isRecording,     setIsRecording]     = useState(false);
  const [timer,           setTimer]           = useState(0);
  const [isPlaying,       setIsPlaying]       = useState(false);
  const [audioUrl,        setAudioUrl]        = useState(null);
  const [micError,        setMicError]        = useState(null);
  const [isAnalyzing,     setIsAnalyzing]     = useState(false);
  const [feedback,        setFeedback]        = useState(null);
  const [transcript,       setTranscript]       = useState('');
  const [wordTimestamps,   setWordTimestamps]   = useState([]);
  const [fillerData,       setFillerData]       = useState(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [selfReview,       setSelfReview]       = useState({});
  const [selfNote,         setSelfNote]         = useState('');
  const [flaggedMoments,   setFlaggedMoments]   = useState([]);
  const [replayCount,      setReplayCount]      = useState(0);
  const [prevRecording,    setPrevRecording]    = useState(null);
  const [prevIsPlaying,    setPrevIsPlaying]    = useState(false);

  const timerRef           = useRef(null);
  const mediaRecorderRef   = useRef(null);
  const audioChunksRef     = useRef([]);
  const audioRef           = useRef(null);
  const recognitionRef     = useRef(null);
  const transcriptRef      = useRef('');
  const recordingStartRef  = useRef(0);   // performance.now() when mic opened
  const wordTimestampsRef  = useRef([]);  // accumulates {word, time} during recording
  const lastPhraseEndRef   = useRef(0);   // elapsed seconds at end of last final phrase
  const prevAudioRef       = useRef(null);

  const questions = mode === 'networking' ? NETWORKING_QUESTIONS
                  : mode === 'firstround' ? FIRSTROUND_QUESTIONS
                  : (mode === 'technical' && difficulty) ? TECHNICAL_QUESTIONS[difficulty]
                  : [];

  const q = questions[qIndex] || NETWORKING_QUESTIONS[0];

  /* Space bar shortcut */
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
      if (!mode || (mode === 'technical' && !difficulty)) return;
      e.preventDefault();
      if (step === 0) setStep(1);
      else if (step === 1 && isRecording) stopRecording();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isRecording, mode, difficulty]);

  /* Timer + auto-stop */
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

  const analyzeTranscript = useCallback(async (text, question, category) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text, question, category }),
      });
      if (res.ok) setFeedback(await res.json());
    } catch { /* falls back to placeholder */ }
    setIsAnalyzing(false);
  }, []);

  const startRecording = async () => {
    setMicError(null); setAudioUrl(null); setFeedback(null);
    setTimer(0); setTranscript(''); setWordTimestamps([]); setFillerData(null); setAudioCurrentTime(0); setSelfReview({});
    setSelfNote(''); setFlaggedMoments([]); setReplayCount(0);
    transcriptRef.current    = '';
    wordTimestampsRef.current = [];
    lastPhraseEndRef.current  = 0;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
      rec.onresult = (e) => {
        // Rebuild full transcript from all results (existing live-display logic)
        let t = '';
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + ' ';
        transcriptRef.current = t.trim();
        setTranscript(t.trim());

        // Capture phrase-level timestamps for new *final* results only
        const now = (performance.now() - recordingStartRef.current) / 1000;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            const phraseWords = e.results[i][0].transcript.trim().split(/\s+/).filter(Boolean);
            const phraseStart = lastPhraseEndRef.current;
            const phraseDur   = Math.max(now - phraseStart, 0.05);
            // Distribute words evenly across the phrase window
            phraseWords.forEach((word, idx) => {
              wordTimestampsRef.current.push({
                word,
                time: phraseStart + (idx / phraseWords.length) * phraseDur,
              });
            });
            lastPhraseEndRef.current = now;
          }
        }
      };
      rec.start();
      recognitionRef.current  = rec;
      recordingStartRef.current = performance.now(); // mark start after rec.start()
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
    const finalTranscript = transcriptRef.current;
    setTranscript(finalTranscript);
    setWordTimestamps([...wordTimestampsRef.current]);
    setFillerData(analyzeFillers(finalTranscript));
    setTimeout(() => analyzeTranscript(finalTranscript, q.question, q.category), 500);
  }, [q, analyzeTranscript]);

  const nextQuestion = () => {
    // Save review history to localStorage
    if (transcript && timer > 0) {
      const reviewQuestions = q.category === 'Behavioral' ? BEHAVIORAL_REVIEW : TECHNICAL_REVIEW;
      const groupScores = SR_GROUPS.map(group => ({
        group,
        nos: reviewQuestions.filter(item => item.group === group && selfReview[item.id] === false).length,
        total: reviewQuestions.filter(item => item.group === group).length,
      }));
      const entry = {
        date: new Date().toISOString(),
        question: q.question,
        category: q.category,
        mode,
        groupScores,
        note: selfNote,
        wpm,
        fillerCount: fillerData?.total || 0,
      };
      try {
        const history = JSON.parse(localStorage.getItem('pd-review-history') || '[]');
        localStorage.setItem('pd-review-history', JSON.stringify([...history, entry]));
      } catch {}
    }
    setQIndex(i => (i + 1) % questions.length);
    setTimer(0); setIsPlaying(false); setAudioUrl(null); setMicError(null);
    setFeedback(null); setTranscript(''); setWordTimestamps([]); setFillerData(null); setAudioCurrentTime(0); setSelfReview({});
    setSelfNote(''); setFlaggedMoments([]); setReplayCount(0);
    setPrevRecording(null); setPrevIsPlaying(false);
    wordTimestampsRef.current = []; lastPhraseEndRef.current = 0;
    setStep(0);
  };

  const resetToLobby = () => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    clearInterval(timerRef.current);
    setMode(null); setDifficulty(null); setPendingDiff('medium');
    setStep(0); setQIndex(0); setIsRecording(false); setTimer(0);
    setIsPlaying(false); setAudioUrl(null); setMicError(null);
    setFeedback(null); setTranscript(''); setWordTimestamps([]); setFillerData(null); setAudioCurrentTime(0); setSelfReview({});
    setSelfNote(''); setFlaggedMoments([]); setReplayCount(0);
    setPrevRecording(null); setPrevIsPlaying(false);
    wordTimestampsRef.current = []; lastPhraseEndRef.current = 0;
    setIsAnalyzing(false);
  };

  const insight = feedback?.insight || 'Strong technical foundation. Consider leading with the conclusion — interviewers want the answer before the methodology.';
  const wpm     = (transcript && timer > 0) ? Math.round((wordCount(transcript) / timer) * 60) : 0;
  const wpmData = wpmInfo(wpm);
  const toggleReview = (id, val) =>
    setSelfReview(prev => ({ ...prev, [id]: prev[id] === val ? null : val }));

  const reviewQuestions = q.category === 'Behavioral' ? BEHAVIORAL_REVIEW : TECHNICAL_REVIEW;
  const weakestGroup = SR_GROUPS
    .map(group => ({
      group,
      nos: reviewQuestions.filter(item => item.group === group && selfReview[item.id] === false).length,
      total: reviewQuestions.filter(item => item.group === group).length,
    }))
    .filter(g => g.nos > 0)
    .sort((a, b) => b.nos - a.nos)[0] || null;

  const retryQuestion = () => {
    setPrevRecording({ audioUrl, transcript, timer, wordTimestamps });
    setPrevIsPlaying(false);
    setStep(1);
    setTimer(0); setIsPlaying(false); setAudioUrl(null); setMicError(null);
    setFeedback(null); setTranscript(''); setWordTimestamps([]); setFillerData(null);
    setAudioCurrentTime(0); setSelfReview({}); setSelfNote(''); setFlaggedMoments([]); setReplayCount(0);
    wordTimestampsRef.current = []; lastPhraseEndRef.current = 0;
  };

  const activeType = INTERVIEW_TYPES.find(t => t.id === mode);

  /* ── Lobby ───────────────────────────────────────────────────── */
  if (!mode) {
    return (
      <div className="interview-desktop">
        <div className="iv-lobby">
          <div className="iv-lobby-header">
            <h2 className="iv-lobby-title">Choose Your Format</h2>
            <p className="iv-lobby-sub">Select the interview type that matches where you are in the recruiting process.</p>
          </div>
          <div className="iv-type-grid">
            {INTERVIEW_TYPES.map(type => (
              <button
                key={type.id}
                className="iv-type-card"
                onClick={() => {
                  if (type.hasDifficulty) { setMode('technical'); }
                  else { setMode(type.id); setQIndex(0); setStep(0); }
                }}
              >
                <div className="iv-type-card-top">
                  <div className="iv-type-icon">{type.icon}</div>
                  <span className="iv-duration-badge">{type.duration}</span>
                </div>
                <div className="iv-type-name">{type.label}</div>
                <p className="iv-type-desc">{type.desc}</p>
                <div className="iv-type-footer">
                  <div className="iv-type-tags">
                    {type.tags.map(tag => <span key={tag} className="iv-tag">{tag}</span>)}
                  </div>
                  <span className="iv-type-arrow">
                    {type.hasDifficulty ? 'Select difficulty →' : `${type.count} questions →`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Difficulty selection ─────────────────────────────────────── */
  if (mode === 'technical' && !difficulty) {
    return (
      <div className="interview-desktop">
        <div className="iv-diff-screen">
          <div className="iv-diff-header">
            <button className="iv-back-link" onClick={() => setMode(null)}>← Back to formats</button>
            <h2 className="iv-lobby-title">Select Difficulty</h2>
            <p className="iv-lobby-sub">Full Technical · {TECHNICAL_QUESTIONS[pendingDiff].length} questions · Valuation, Accounting, M&amp;A, LBO</p>
          </div>
          <div className="iv-diff-grid">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                className={`iv-diff-card${pendingDiff === d.id ? ' selected' : ''}`}
                onClick={() => setPendingDiff(d.id)}
              >
                <span className={`iv-diff-label diff-${d.id}`}>{d.label}</span>
                <p className="iv-diff-desc">{d.desc}</p>
                {pendingDiff === d.id && <div className="iv-diff-check">✓</div>}
              </button>
            ))}
          </div>
          <button
            className="cta-button iv-diff-start"
            onClick={() => { setDifficulty(pendingDiff); setQIndex(0); setStep(0); }}
          >
            Start Interview
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 3a7 7 0 100 14A7 7 0 0010 3zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM8 7l5 3-5 3V7z" fill="#000"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  /* ── Interview flow (steps 0–2) ──────────────────────────────── */
  return (
    <div className="interview-desktop">

      {/* Top bar: format context + step indicator */}
      <div className="iv-topbar">
        <div className="iv-topbar-left">
          <button className="iv-back-link" onClick={resetToLobby}>← Change format</button>
          <div className="iv-format-badges">
            <span className="iv-active-badge">{activeType?.label}</span>
            {difficulty && (
              <span className={`difficulty-badge diff-${difficulty}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
            )}
          </div>
        </div>
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
      </div>

      {/* ── Step 0: Question ───────────────────────────────────────── */}
      {step === 0 && (
        <div className="iv-question-screen">
          <div className="iv-question-card">
            <div className="flashcard-header">
              <span className="category-badge">{q.category}</span>
              <span className={`difficulty-badge diff-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
              <span className="question-number" style={{ marginLeft: 'auto' }}>
                Question {qIndex + 1} of {questions.length}
              </span>
            </div>
            <p className="iv-question-text">{q.question}</p>
            <div className="time-limit">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#c9a84c" strokeWidth="1.4" />
                <path d="M8 4.5V8l2 1.2" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {fmtLimit(q.timeLimit)} suggested
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

      {/* ── Step 1: Recording ──────────────────────────────────────── */}
      {step === 1 && (
        <div className="iv-record-screen">
          {/* Left: question + waveform + live transcript */}
          <div className="iv-record-left">
            <div className="iv-record-q-label">Answering</div>
            <p className="iv-record-q-text">{q.question}</p>
            <div className="waveform-container">
              <Waveform isActive={isRecording} />
            </div>
            {/* Live transcript panel */}
            <div className="iv-live-transcript">
              <div className="iv-live-transcript-header">
                {isRecording && <span className="iv-live-dot" />}
                <span className="iv-live-transcript-label">
                  {isRecording ? 'Live transcript' : 'Transcript preview'}
                </span>
                {transcript && (
                  <span className="iv-live-word-count">{wordCount(transcript)} words</span>
                )}
              </div>
              <div className="iv-live-transcript-body">
                {transcript
                  ? <p className="iv-live-transcript-text">{transcript}</p>
                  : <p className="iv-live-transcript-placeholder">
                      {isRecording
                        ? 'Start speaking — your words will appear here…'
                        : 'Recording not started yet.'}
                    </p>
                }
              </div>
            </div>
          </div>

          {/* Right: controls */}
          <div className="iv-record-right">
            <div className="recording-header">
              <div className="rec-indicator" style={{ opacity: isRecording ? 1 : 0 }}>
                <span className="rec-dot" />REC
              </div>
              <div className="timer-display">{fmtTime(timer)}</div>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <div className="time-limit-bar">
                <div className="time-limit-fill" style={{ width: `${Math.min((timer / q.timeLimit) * 100, 100)}%` }} />
              </div>
              <div className="time-limit-labels"><span>0:00</span><span>{fmtTime(q.timeLimit)}</span></div>
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
            {isRecording && <div className="iv-kb-hint" style={{ textAlign: 'center' }}>Press Space to stop</div>}
            <button className="iv-back-btn" onClick={() => setStep(0)}>← Back to question</button>
          </div>
        </div>
      )}

      {/* ── Step 2: Feedback ───────────────────────────────────────── */}
      {step === 2 && (
        <div className="iv-feedback-screen">
          {/* Left: score header + audio player + transcript */}
          <div className="iv-feedback-left">
            {prevRecording && (
              <div className="iv-prev-recording">
                <div className="iv-prev-header">
                  <span className="iv-prev-label">Previous Attempt</span>
                  <span className="iv-prev-duration">{fmtTime(prevRecording.timer)}</span>
                </div>
                <audio
                  ref={prevAudioRef}
                  src={prevRecording.audioUrl}
                  onEnded={() => setPrevIsPlaying(false)}
                />
                <div className="iv-prev-player" onClick={() => {
                  const a = prevAudioRef.current;
                  if (!a) return;
                  if (prevIsPlaying) { a.pause(); setPrevIsPlaying(false); }
                  else { a.currentTime = 0; a.play().then(() => setPrevIsPlaying(true)).catch(() => {}); }
                }}>
                  <div className={`iv-prev-play-btn${prevIsPlaying ? ' playing' : ''}`}>
                    {prevIsPlaying ? (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="2" width="3" height="12" rx="1" fill="#c9a84c"/>
                        <rect x="10" y="2" width="3" height="12" rx="1" fill="#c9a84c"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M4 2.5l10 5.5-10 5.5V2.5z" fill="#c9a84c"/>
                      </svg>
                    )}
                  </div>
                  <span className="iv-prev-play-label">{prevIsPlaying ? 'Playing…' : 'Play previous attempt'}</span>
                </div>
              </div>
            )}
            <div className="feedback-header">
              <span className="feedback-title">Review Your Answer</span>
            </div>

            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              src={audioUrl || undefined}
              onEnded={() => { setIsPlaying(false); setAudioCurrentTime(0); }}
              onTimeUpdate={(e) => setAudioCurrentTime(e.target.currentTime)}
              style={{ display: 'none' }}
            />

            {/* Compact audio player */}
            <div className="iv-audio-player" onClick={() => {
              const audio = audioRef.current;
              if (!audio || !audioUrl) return;
              if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
              } else {
                audio.currentTime = 0;
                setAudioCurrentTime(0);
                audio.play().then(() => { setReplayCount(c => c + 1); setIsPlaying(true); }).catch(() => {});
              }
            }}>
              <div className={`iv-audio-play-btn${isPlaying ? ' playing' : ''}`}>
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="2" width="3" height="12" rx="1" fill="#c9a84c"/>
                    <rect x="10" y="2" width="3" height="12" rx="1" fill="#c9a84c"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 2.5l10 5.5-10 5.5V2.5z" fill="#c9a84c"/>
                  </svg>
                )}
              </div>
              <div className="iv-audio-progress-wrap">
                <div className="iv-audio-progress-bar">
                  <div
                    className="iv-audio-progress-fill"
                    style={{ width: timer > 0 ? `${(audioCurrentTime / timer) * 100}%` : '0%' }}
                  />
                </div>
                <div className="iv-audio-times">
                  <span>{fmtTime(Math.round(audioCurrentTime))}</span>
                  <span>{fmtTime(timer)}</span>
                </div>
              </div>
              {replayCount > 0 && (
                <span className="iv-replay-count">Replayed {replayCount}×</span>
              )}
              {!audioUrl && <span className="iv-audio-unavail">No recording</span>}
            </div>

            <div className="iv-flag-row">
              <button
                className="iv-flag-btn"
                onClick={() => setFlaggedMoments(prev => [...prev, audioCurrentTime])}
                disabled={!isPlaying}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 1v12M2 1h8l-2 3.5 2 3.5H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Flag this moment
              </button>
              {flaggedMoments.length > 0 && (
                <span className="iv-flag-count">{flaggedMoments.length} flagged</span>
              )}
            </div>

            {/* Transcript panel */}
            <div className="iv-transcript-panel">
              <div className="iv-transcript-header">
                <span className="iv-transcript-title">Your Answer</span>
                {transcript && (
                  <span className="iv-transcript-meta">
                    {wordCount(transcript)} words · {fmtTime(timer)}
                    {isPlaying && <span className="iv-transcript-playing"> · Playing</span>}
                  </span>
                )}
              </div>
              <div className="iv-transcript-scroll">
                <TranscriptDisplay
                  text={transcript}
                  currentTime={audioCurrentTime}
                  duration={timer}
                  isPlaying={isPlaying}
                  wordTimestamps={wordTimestamps}
                  fillerIndices={fillerData?.fillerIndices}
                  flaggedMoments={flaggedMoments}
                />
              </div>
            </div>

            {/* Question reference */}
            <div className="iv-question-ref">
              <div className="iv-question-ref-label">Question</div>
              <p className="iv-question-ref-text">{q.question}</p>
            </div>
          </div>

          {/* Right: self-review + wpm + filler + coach tip + next */}
          <div className="iv-feedback-right">

            {/* Self-review checklist */}
            <div className="iv-self-review">
              <div className="iv-sr-header">
                <span className="iv-sr-title">Self-Review</span>
                <span className="iv-sr-hint">Listen back and check off what you notice</span>
              </div>
              {SR_GROUPS.map(group => (
                <div key={group} className="iv-sr-group">
                  <div className="iv-sr-group-label">{group}</div>
                  {reviewQuestions.filter(item => item.group === group).map(({ id, q: rq }) => (
                    <div key={id} className="iv-sr-item">
                      <span className="iv-sr-question">{rq}</span>
                      <div className="iv-sr-btns">
                        <button
                          className={`iv-sr-btn iv-sr-yes${selfReview[id] === true ? ' selected' : ''}`}
                          onClick={() => toggleReview(id, true)}
                        >Yes</button>
                        <button
                          className={`iv-sr-btn iv-sr-no${selfReview[id] === false ? ' selected' : ''}`}
                          onClick={() => toggleReview(id, false)}
                        >No</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {weakestGroup && (
                <div className="iv-sr-summary">
                  Biggest opportunity: <strong>{weakestGroup.group}</strong>
                  <span className="iv-sr-summary-count">({weakestGroup.nos}/{weakestGroup.total} flagged)</span>
                </div>
              )}
              <div className="iv-sr-note-wrap">
                <label className="iv-sr-note-label">What would I do differently?</label>
                <textarea
                  className="iv-sr-note"
                  value={selfNote}
                  onChange={e => setSelfNote(e.target.value)}
                  placeholder="One thing I'd change next time…"
                  rows={2}
                />
              </div>
            </div>

            <button className="iv-retry-btn" onClick={retryQuestion}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M2 8a6 6 0 1 0 1.5-3.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2 3.5V8h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Re-record this question
            </button>

            {/* WPM gauge */}
            {transcript && timer > 0 && (
              <div className="iv-wpm-panel">
                <div className="iv-wpm-header">
                  <span className="iv-wpm-title">Speaking Pace</span>
                  <span className={`iv-wpm-badge ${wpmData.cls}`}>{wpmData.label}</span>
                </div>
                <div className="iv-wpm-number-row">
                  <span className="iv-wpm-number">{wpm}</span>
                  <span className="iv-wpm-unit">wpm</span>
                </div>
                <div className="iv-wpm-track-wrap">
                  <div className="iv-wpm-track">
                    <div className="iv-wpm-zone wpm-zone-slow" />
                    <div className="iv-wpm-zone wpm-zone-ideal" />
                    <div className="iv-wpm-zone wpm-zone-fast" />
                    <div className="iv-wpm-needle" style={{ left: `${Math.min((wpm / 220) * 100, 99)}%` }} />
                  </div>
                  <div className="iv-wpm-zone-labels">
                    <span>Slow</span>
                    <span>Ideal</span>
                    <span>Fast</span>
                  </div>
                </div>
                <p className="iv-wpm-tip">Target: 110–160 words per minute</p>
              </div>
            )}

            {/* Filler word panel */}
            {fillerData && (
              <div className="iv-filler-panel">
                <div className="iv-filler-header">
                  <span className="iv-filler-title">Filler Words</span>
                  <span className={`iv-filler-total ${fillerSeverity(fillerData.total)}`}>
                    {fillerData.total === 0 ? 'None' : `${fillerData.total} detected`}
                  </span>
                </div>
                {fillerData.total === 0 ? (
                  <p className="iv-filler-clean">Clean delivery — no filler words detected.</p>
                ) : (
                  <div className="iv-filler-breakdown">
                    {Object.entries(fillerData.counts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([word, count]) => (
                        <div key={word} className="iv-filler-item">
                          <span className="iv-filler-word">"{word}"</span>
                          <span className="iv-filler-bar-wrap">
                            <span
                              className="iv-filler-bar"
                              style={{ width: `${Math.min((count / fillerData.total) * 100, 100)}%` }}
                            />
                          </span>
                          <span className="iv-filler-count">{count}×</span>
                        </div>
                      ))}
                    <p className="iv-filler-tip">
                      Highlighted in orange in your transcript above.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="ai-insight">
              <div className="ai-insight-header">
                <span className="ai-badge">AI</span>
                <span className="ai-insight-label">Coach Tip</span>
              </div>
              <p className="ai-insight-text">{isAnalyzing ? 'Generating coaching tip…' : insight}</p>
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
