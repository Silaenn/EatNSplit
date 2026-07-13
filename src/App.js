import { usePiano } from "./hooks/usePiano";
import Piano from "./components/Piano";
import StatusBar from "./components/StatusBar";
import Controls from "./components/Controls";
import {
  NOTE_DATA,
  WHITE_KEY_INDICES,
  BLACK_KEY_INDICES,
} from "./constants/notes";

export default function App() {
  const piano = usePiano();

  return (
    <div className="app">
      <h1 className="app-title">Interactive Piano</h1>

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
        Keyboard: A=C W=C&#9839; S=D E=D&#9839; D=E F=F T=F&#9839; G=G
        Y=G&#9839; H=A U=A&#9839; J=B K=C
      </p>
    </div>
  );
}
