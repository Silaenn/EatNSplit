import { useRef } from "react";
import { getNoteId } from "../constants/notes";

const BLACK_KEY_POSITIONS = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12];

export default function Piano({
  noteData,
  whiteKeyIndices,
  blackKeyIndices,
  activeNoteIds,
  octave,
  onNoteStart,
  onNoteEnd,
  onNoteHover,
}) {
  const whiteKeyCount = whiteKeyIndices.length;
  const blackWidthPct = 65 / whiteKeyCount;
  const blackOffsetPct = blackWidthPct / 2;

  const touchToNoteMap = useRef(new Map());

  function getKeyIndex(element) {
    const el = element.closest("[data-note-index]");
    return el ? Number(el.dataset.noteIndex) : null;
  }

  function handleTouchStart(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const idx = getKeyIndex(touch.target);
      if (idx === null) continue;
      touchToNoteMap.current.set(touch.identifier, idx);
      onNoteStart(idx);
    }
  }

  function handleTouchMove(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const idx = getKeyIndex(el);
      if (idx === null) continue;

      const prevIdx = touchToNoteMap.current.get(touch.identifier);
      if (prevIdx === idx) continue;

      if (prevIdx !== undefined) {
        onNoteEnd(prevIdx);
      }
      touchToNoteMap.current.set(touch.identifier, idx);
      onNoteStart(idx);
    }
  }

  function handleTouchEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const idx = touchToNoteMap.current.get(touch.identifier);
      if (idx === undefined) continue;
      touchToNoteMap.current.delete(touch.identifier);
      onNoteEnd(idx);
    }
  }

  return (
    <div className="piano-wrapper">
      <div className="piano">
        <div className="piano-keys"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {whiteKeyIndices.map((idx) => {
            const note = noteData[idx % 12];
            const noteId = getNoteId(idx, octave);
            const isActive = activeNoteIds.has(noteId);

            return (
              <div
                key={noteId}
                data-note-index={idx}
                className={`key white ${isActive ? "active" : ""}`}
                onMouseDown={() => onNoteStart(idx)}
                onMouseUp={() => onNoteEnd(idx)}
                onMouseEnter={() => onNoteHover(idx)}
                onMouseLeave={() => onNoteEnd(idx)}
                onContextMenu={(e) => e.preventDefault()}
              >
                <span className="key-label">{note.name}</span>
              </div>
            );
          })}

          {blackKeyIndices.map((idx, i) => {
            const note = noteData[idx % 12];
            const noteId = getNoteId(idx, octave);
            const isActive = activeNoteIds.has(noteId);
            const pos = BLACK_KEY_POSITIONS[i];
            const left = ((pos + 1) / whiteKeyCount) * 100 - blackOffsetPct;

            return (
              <div
                key={noteId}
                data-note-index={idx}
                className={`key black ${isActive ? "active" : ""}`}
                style={{ left: `${left}%`, width: `${blackWidthPct}%` }}
                onMouseDown={() => onNoteStart(idx)}
                onMouseUp={() => onNoteEnd(idx)}
                onMouseEnter={() => onNoteHover(idx)}
                onMouseLeave={() => onNoteEnd(idx)}
                onContextMenu={(e) => e.preventDefault()}
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
