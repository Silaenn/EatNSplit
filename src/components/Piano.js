import { getNoteId } from "../constants/notes";

const BLACK_KEY_POSITIONS = [0, 1, 3, 4, 5];
const EXTRA_KEY_INDEX = 12;

export default function Piano({
  noteData,
  whiteKeyIndices,
  blackKeyIndices,
  activeNoteIds,
  octave,
  isPlaying,
  onNoteStart,
  onNoteEnd,
  onNoteHover,
}) {
  const whiteKeyCount = whiteKeyIndices.length;
  const blackWidthRatio = 4.5;

  return (
    <div className="piano-wrapper">
      <div className="piano">
        <div className="piano-keys">
          {whiteKeyIndices.map((idx) => {
            const isExtraKey = idx === EXTRA_KEY_INDEX;
            const note = isExtraKey ? { name: "C" } : noteData[idx];
            const noteId = getNoteId(idx, octave);
            const isActive = activeNoteIds.has(noteId);

            return (
              <div
                key={noteId}
                className={`key white ${isActive ? "active" : ""}`}
                onMouseDown={() => onNoteStart(idx)}
                onMouseUp={() => onNoteEnd(idx)}
                onMouseEnter={() => onNoteHover(idx)}
                onMouseLeave={() => onNoteEnd(idx)}
              >
                <span className="key-label">{note.name}</span>
              </div>
            );
          })}

          {blackKeyIndices.map((idx, i) => {
            const note = noteData[idx];
            const noteId = getNoteId(idx, octave);
            const isActive = activeNoteIds.has(noteId);
            const pos = BLACK_KEY_POSITIONS[i];
            const left = ((pos + 1) / whiteKeyCount) * 100 - blackWidthRatio;

            return (
              <div
                key={noteId}
                className={`key black ${isActive ? "active" : ""}`}
                style={{ left: `${left}%` }}
                onMouseDown={() => onNoteStart(idx)}
                onMouseUp={() => onNoteEnd(idx)}
                onMouseEnter={() => onNoteHover(idx)}
                onMouseLeave={() => onNoteEnd(idx)}
              >
                <span className="key-label">
                  {note.name.replace("#", "\u266F")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
