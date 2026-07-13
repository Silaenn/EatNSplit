import { usePiano } from "./hooks/usePiano";
import Piano from "./components/Piano";
import StatusBar from "./components/StatusBar";
import Controls from "./components/Controls";
import RotateOverlay from "./components/RotateOverlay";
import {
  NOTE_DATA,
  WHITE_KEY_INDICES,
  BLACK_KEY_INDICES,
} from "./constants/notes";

export default function App() {
  const piano = usePiano();

  return (
    <>
      <RotateOverlay />
      <div className="app">
      <div className="app-header">
        <div className="app-logo">&#9835;</div>
        <h1 className="app-title">Interactive Piano</h1>
      </div>

      <StatusBar
        activeNotes={piano.activeNoteIds}
        isRecording={piano.isRecording}
        isPlaying={piano.isPlaying}
        recordedCount={piano.recordedNotesCount}
        recordingDuration={piano.recordingDuration}
        octave={piano.octave}
      />

      <Piano
        noteData={NOTE_DATA}
        whiteKeyIndices={WHITE_KEY_INDICES}
        blackKeyIndices={BLACK_KEY_INDICES}
        activeNoteIds={piano.activeNoteIds}
        octave={piano.octave}
        isPlaying={piano.isPlaying}
        onNoteStart={piano.handleNoteStart}
        onNoteEnd={piano.handleNoteEnd}
        onNoteHover={piano.handleNoteHover}
      />

      <Controls
        isRecording={piano.isRecording}
        isPlaying={piano.isPlaying}
        recordedCount={piano.recordedNotesCount}
        octave={piano.octave}
        onRecord={piano.handleRecord}
        onPlay={piano.handlePlay}
        onStop={piano.handleStop}
        onClear={piano.handleClear}
        onOctaveChange={piano.shiftOctave}
      />

      <p className="keyboard-hint">
        Keys: A=C W=C# S=D E=D# D=E F=F T=F# G=G Y=G# H=A U=A# J=B K=C &nbsp;|&nbsp; Shift = 1 octave up &nbsp;|&nbsp; Octave: &larr; &rarr;
      </p>
      </div>
    </>
  );
}
