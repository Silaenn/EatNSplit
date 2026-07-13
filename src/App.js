import { useState, useRef, useCallback, useEffect } from "react";
import Piano from "./components/Piano";
import StatusBar from "./components/StatusBar";
import Controls from "./components/Controls";

const NOTE_DATA = [
  { name: "C", freq: 261.63, type: "white" },
  { name: "C#", freq: 277.18, type: "black" },
  { name: "D", freq: 293.66, type: "white" },
  { name: "D#", freq: 311.13, type: "black" },
  { name: "E", freq: 329.63, type: "white" },
  { name: "F", freq: 349.23, type: "white" },
  { name: "F#", freq: 369.99, type: "black" },
  { name: "G", freq: 392.0, type: "white" },
  { name: "G#", freq: 415.3, type: "black" },
  { name: "A", freq: 440.0, type: "white" },
  { name: "A#", freq: 466.16, type: "black" },
  { name: "B", freq: 493.88, type: "white" },
];

const KEYBOARD_MAP = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
};

const WHITE_KEY_INDICES = NOTE_DATA.map((n, i) => (n.type === "white" ? i : -1)).filter((i) => i >= 0);
const BLACK_KEY_INDICES = NOTE_DATA.map((n, i) => (n.type === "black" ? i : -1)).filter((i) => i >= 0);

function getNoteId(noteIndex, octave) {
  const note = NOTE_DATA[noteIndex % 12];
  return `${note.name}${octave + Math.floor(noteIndex / 12)}`;
}

export default function App() {
  const [octave, setOctave] = useState(4);
  const [activeNoteIds, setActiveNoteIds] = useState(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const octaveRef = useRef(4);
  const isRecordingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const audioCtx = useRef(null);
  const oscillators = useRef({});
  const recordStart = useRef(0);
  const playbackTimers = useRef([]);
  const mouseDownRef = useRef(false);
  const recordingTimerRef = useRef(null);

  useEffect(() => {
    octaveRef.current = octave;
  }, [octave]);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  function getContext() {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx.current;
  }

  const startNote = useCallback((noteIndex, force = false) => {
    if (!force && isPlayingRef.current) return;
    if (oscillators.current[noteIndex]) return;

    const ctx = getContext();
    if (ctx.state === "suspended") ctx.resume();

    const note = NOTE_DATA[noteIndex % 12];
    const freq = note.freq * Math.pow(2, Math.floor(noteIndex / 12));
    const noteId = getNoteId(noteIndex, octaveRef.current);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.005);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    oscillators.current[noteIndex] = { osc, gain, noteId };
    setActiveNoteIds((prev) => new Set(prev).add(noteId));

    if (isRecordingRef.current) {
      setRecordedData((prev) => [
        ...prev,
        { noteIndex, time: Date.now() - recordStart.current },
      ]);
    }
  }, []);

  const stopNote = useCallback((noteIndex) => {
    const entry = oscillators.current[noteIndex];
    if (!entry) return;

    const { osc, gain, noteId } = entry;
    const ctx = audioCtx.current;

    if (ctx && ctx.state !== "closed") {
      try {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      } catch {}
    }

    setTimeout(() => {
      try {
        osc.stop();
      } catch {}
    }, 100);

    delete oscillators.current[noteIndex];
    setActiveNoteIds((prev) => {
      const next = new Set(prev);
      next.delete(noteId);
      return next;
    });
  }, []);

  const stopAllNotes = useCallback(() => {
    Object.keys(oscillators.current).forEach((idx) => stopNote(Number(idx)));
  }, [stopNote]);

  const handleNoteStart = useCallback((noteIndex) => {
    mouseDownRef.current = true;
    startNote(noteIndex);
  }, [startNote]);

  const handleNoteEnd = useCallback((noteIndex) => {
    mouseDownRef.current = false;
    stopNote(noteIndex);
  }, [stopNote]);

  const handleNoteHover = useCallback((noteIndex) => {
    if (mouseDownRef.current) {
      startNote(noteIndex);
    }
  }, [startNote]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const noteIndex = KEYBOARD_MAP[key];
      if (noteIndex !== undefined) {
        e.preventDefault();
        startNote(noteIndex);
      }
    }

    function handleKeyUp(e) {
      const key = e.key.toLowerCase();
      const noteIndex = KEYBOARD_MAP[key];
      if (noteIndex !== undefined) {
        e.preventDefault();
        stopNote(noteIndex);
      }
    }

    function handleGlobalMouseUp() {
      mouseDownRef.current = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [startNote, stopNote]);

  useEffect(() => {
    return () => {
      stopAllNotes();
      playbackTimers.current.forEach(clearTimeout);
      if (audioCtx.current) audioCtx.current.close();
    };
  }, [stopAllNotes]);

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(Date.now() - recordStart.current);
      }, 100);
    } else {
      clearInterval(recordingTimerRef.current);
      setRecordingDuration(0);
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [isRecording]);

  function handleOctaveChange(dir) {
    stopAllNotes();
    setOctave((prev) => Math.max(2, Math.min(7, prev + dir)));
  }

  function handleRecord() {
    if (isRecording) {
      setIsRecording(false);
      recordStart.current = 0;
      return;
    }
    setRecordedData([]);
    recordStart.current = Date.now();
    setIsRecording(true);
  }

  function handlePlay() {
    if (recordedData.length === 0 || isPlaying) return;
    setIsPlaying(true);

    const timers = recordedData.map(({ noteIndex, time }) =>
      setTimeout(() => {
        startNote(noteIndex, true);
        setTimeout(() => stopNote(noteIndex), 350);
      }, time)
    );

    playbackTimers.current = timers;

    const totalTime = (recordedData.at(-1)?.time || 0) + 500;
    setTimeout(() => setIsPlaying(false), totalTime);
  }

  function handleStop() {
    playbackTimers.current.forEach(clearTimeout);
    playbackTimers.current = [];
    stopAllNotes();
    setIsPlaying(false);
  }

  function handleClear() {
    handleStop();
    setRecordedData([]);
    setIsRecording(false);
    setRecordingDuration(0);
  }

  return (
    <div className="app">
      <h1 className="app-title">Interactive Piano</h1>

      <StatusBar
        activeNotes={activeNoteIds}
        isRecording={isRecording}
        isPlaying={isPlaying}
        recordedCount={recordedData.length}
        recordingDuration={recordingDuration}
        octave={octave}
      />

      <Piano
        noteData={NOTE_DATA}
        whiteKeyIndices={WHITE_KEY_INDICES}
        blackKeyIndices={BLACK_KEY_INDICES}
        activeNoteIds={activeNoteIds}
        octave={octave}
        isPlaying={isPlaying}
        onNoteStart={handleNoteStart}
        onNoteEnd={handleNoteEnd}
        onNoteHover={handleNoteHover}
      />

      <Controls
        isRecording={isRecording}
        isPlaying={isPlaying}
        recordedCount={recordedData.length}
        octave={octave}
        onRecord={handleRecord}
        onPlay={handlePlay}
        onStop={handleStop}
        onClear={handleClear}
        onOctaveChange={handleOctaveChange}
      />

      <p className="keyboard-hint">
        Keyboard: A=&#399; W=C&#9839; S=D E=D&#9839; D=E F=F T=F&#9839; G=G
        Y=G&#9839; H=A U=A&#9839; J=B K=C
      </p>
    </div>
  );
}
