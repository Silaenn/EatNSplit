export const NOTE_DATA = [
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

export const NOTES_PER_OCTAVE = 12;

export const KEYBOARD_MAP = {
  a: 0, w: 1, s: 2, e: 3, d: 4,
  f: 5, t: 6, g: 7, y: 8, h: 9,
  u: 10, j: 11, k: 12,
};

export const WHITE_KEY_INDICES = [
  0, 2, 4, 5, 7, 9, 11,
  12, 14, 16, 17, 19, 21, 23,
];

export const BLACK_KEY_INDICES = [
  1, 3, 6, 8, 10,
  13, 15, 18, 20, 22,
];

export const BLACK_KEY_POSITIONS = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];

export const OCTAVE = { MIN: 2, MAX: 7, DEFAULT: 4 };

export function getNoteName(noteIndex) {
  return NOTE_DATA[noteIndex % NOTES_PER_OCTAVE].name;
}

export function getNoteId(noteIndex, octave) {
  const name = getNoteName(noteIndex);
  const oct = octave + Math.floor(noteIndex / NOTES_PER_OCTAVE);
  return `${name}${oct}`;
}

export function getFrequency(noteIndex, baseOctave = OCTAVE.DEFAULT) {
  const note = NOTE_DATA[noteIndex % NOTES_PER_OCTAVE];
  const indexOctaveOffset = Math.floor(noteIndex / NOTES_PER_OCTAVE);
  const effectiveOctave = baseOctave + indexOctaveOffset;
  const octavesFromDefault = effectiveOctave - OCTAVE.DEFAULT;
  return note.freq * Math.pow(2, octavesFromDefault);
}

