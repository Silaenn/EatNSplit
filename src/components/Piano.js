import { useRef } from "react";
import { getNoteId, BLACK_KEY_POSITIONS } from "../constants/notes";

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

  function toggleKeyActive(idx, active) {
    const el = document.querySelector(`[data-note-index="${idx}"]`);
    if (el) el.classList.toggle("active", active);
  }

  function handleTouchStart(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const el = touch.target.closest("[data-note-index]");
      const idx = el ? Number(el.dataset.noteIndex) : null;
      if (idx === null) continue;
      toggleKeyActive(idx, true);
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
        toggleKeyActive(prevIdx, false);
        onNoteEnd(prevIdx);
      }
      toggleKeyActive(idx, true);
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
      toggleKeyActive(idx, false);
      onNoteEnd(idx);
    }
  }

  function handleTouchCancel() {
    for (const [, idx] of touchToNoteMap.current) {
      toggleKeyActive(idx, false);
      onNoteEnd(idx);
    }
    touchToNoteMap.current.clear();
  }

  return (
    <div className="piano-wrapper">
      <div className="piano">
        <div className="piano-keys"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
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
