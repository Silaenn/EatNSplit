import { useState, useRef, useCallback, useEffect } from "react";
import {
  KEYBOARD_MAP,
  OCTAVE,
  getNoteId,
  getFrequency,
} from "../constants/notes";

const AUDIO = {
  ATTACK: 0.005,
  RELEASE: 0.12,
  VOLUME: 0.3,
};

const RECORDING_INTERVAL_MS = 100;
const PLAYBACK_BUFFER_MS = 150;

export function usePiano() {
  const [octave, setOctave] = useState(OCTAVE.DEFAULT);
  const [activeNoteIds, setActiveNoteIds] = useState(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const ctx = useRef(null);
  const oscillators = useRef(new Map());
  const octaveRef = useRef(OCTAVE.DEFAULT);
  const isRecordingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const recordedRef = useRef([]);
  const recordingStartedAt = useRef(0);
  const playbackTimers = useRef([]);
  const isMouseDown = useRef(false);
  const durationTimer = useRef(null);

  useEffect(() => { octaveRef.current = octave; }, [octave]);
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { recordedRef.current = recordedNotes; }, [recordedNotes]);

  function getContext() {
    if (!ctx.current) {
      ctx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx.current;
  }

  const noteOn = useCallback((noteIndex, force = false) => {
    if (!force && isPlayingRef.current) return;
    if (oscillators.current.has(noteIndex)) return;

    const audio = getContext();
    if (audio.state === "suspended") audio.resume();

    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;
    const noteId = getNoteId(noteIndex, octaveRef.current);
    const freq = getFrequency(noteIndex);

    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(AUDIO.VOLUME, now + AUDIO.ATTACK);

    osc.connect(gain).connect(audio.destination);
    osc.start();

    oscillators.current.set(noteIndex, { osc, gain, noteId });
    setActiveNoteIds((prev) => new Set(prev).add(noteId));

    if (isRecordingRef.current) {
      setRecordedNotes((prev) => [
        ...prev,
        { type: "on", noteIndex, time: Date.now() - recordingStartedAt.current },
      ]);
    }
  }, []);

  const noteOff = useCallback((noteIndex) => {
    const entry = oscillators.current.get(noteIndex);
    if (!entry) return;

    const { osc, gain, noteId } = entry;
    const audio = ctx.current;

    if (audio && audio.state !== "closed") {
      try {
        const now = audio.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(AUDIO.VOLUME, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + AUDIO.RELEASE);
      } catch {}
    }

    setTimeout(() => { try { osc.stop(); } catch {} }, 150);
    oscillators.current.delete(noteIndex);

    setActiveNoteIds((prev) => {
      const next = new Set(prev);
      next.delete(noteId);
      return next;
    });

    if (isRecordingRef.current) {
      setRecordedNotes((prev) => [
        ...prev,
        { type: "off", noteIndex, time: Date.now() - recordingStartedAt.current },
      ]);
    }
  }, []);

  const silenceAll = useCallback(() => {
    for (const [index] of oscillators.current) {
      noteOff(index);
    }
  }, [noteOff]);

  const handleNoteStart = useCallback((noteIndex) => {
    isMouseDown.current = true;
    noteOn(noteIndex);
  }, [noteOn]);

  const handleNoteEnd = useCallback((noteIndex) => {
    noteOff(noteIndex);
  }, [noteOff]);

  const handleNoteHover = useCallback((noteIndex) => {
    if (isMouseDown.current) noteOn(noteIndex);
  }, [noteOn]);

  const shiftOctave = useCallback((direction) => {
    silenceAll();
    isMouseDown.current = false;
    setOctave((prev) => {
      const next = prev + direction;
      return next < OCTAVE.MIN || next > OCTAVE.MAX ? prev : next;
    });
  }, [silenceAll]);

  const pressedNoteIndices = useRef(new Map());

  useEffect(() => {
    function onKeyDown(e) {
      if (e.repeat) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        shiftOctave(e.key === "ArrowLeft" ? -1 : 1);
        return;
      }
      const index = KEYBOARD_MAP[e.key.toLowerCase()];
      if (index === undefined) return;
      e.preventDefault();
      const offset = e.shiftKey ? 12 : 0;
      const noteIdx = index + offset;
      pressedNoteIndices.current.set(e.key.toLowerCase(), noteIdx);
      noteOn(noteIdx);
    }

    function onKeyUp(e) {
      const key = e.key.toLowerCase();
      const noteIdx = pressedNoteIndices.current.get(key);
      if (noteIdx === undefined) return;
      pressedNoteIndices.current.delete(key);
      e.preventDefault();
      noteOff(noteIdx);
    }

    function onBlur() {
      for (const noteIdx of pressedNoteIndices.current.values()) {
        noteOff(noteIdx);
      }
      pressedNoteIndices.current.clear();
    }

    function onGlobalMouseUp() {
      isMouseDown.current = false;
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("mouseup", onGlobalMouseUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("mouseup", onGlobalMouseUp);
    };
  }, [noteOn, noteOff, shiftOctave]);

  useEffect(() => {
    if (!isRecording) {
      setRecordingDuration(0);
      return;
    }
    durationTimer.current = setInterval(() => {
      setRecordingDuration(Date.now() - recordingStartedAt.current);
    }, RECORDING_INTERVAL_MS);
    return () => clearInterval(durationTimer.current);
  }, [isRecording]);

  const handleRecord = useCallback(() => {
    if (isRecordingRef.current) {
      setIsRecording(false);
      return;
    }
    setRecordedNotes([]);
    recordingStartedAt.current = Date.now();
    setIsRecording(true);
  }, []);

  const handlePlay = useCallback(() => {
    const events = recordedRef.current;
    if (events.length === 0 || isPlayingRef.current) return;

    setIsPlaying(true);

    playbackTimers.current = events.map(({ type, noteIndex, time }) =>
      setTimeout(() => {
        if (type === "on") noteOn(noteIndex, true);
        else noteOff(noteIndex);
      }, time)
    );

    const lastEnd = (events.at(-1)?.time ?? 0) + PLAYBACK_BUFFER_MS;
    setTimeout(() => setIsPlaying(false), lastEnd);
  }, [noteOn, noteOff]);

  const handleStop = useCallback(() => {
    playbackTimers.current.forEach(clearTimeout);
    playbackTimers.current = [];
    silenceAll();
    setIsPlaying(false);
  }, [silenceAll]);

  const handleClear = useCallback(() => {
    handleStop();
    setRecordedNotes([]);
    setIsRecording(false);
    setRecordingDuration(0);
  }, [handleStop]);

  useEffect(() => {
    return () => {
      silenceAll();
      playbackTimers.current.forEach(clearTimeout);
      ctx.current?.close();
    };
  }, [silenceAll]);

  return {
    octave,
    activeNoteIds,
    isRecording,
    isPlaying,
    recordedNotesCount: recordedNotes.length,
    recordingDuration,
    handleNoteStart,
    handleNoteEnd,
    handleNoteHover,
    handleRecord,
    handlePlay,
    handleStop,
    handleClear,
    shiftOctave,
  };
}
