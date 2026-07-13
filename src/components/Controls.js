import { Circle, Play, Square, Trash } from "@phosphor-icons/react";

export default function Controls({
  isRecording,
  isPlaying,
  recordedCount,
  octave,
  onRecord,
  onPlay,
  onStop,
  onClear,
  onOctaveChange,
}) {
  return (
    <div className="controls">
      <div className="controls-row">
        <button
          className={`ctrl-btn record ${isRecording ? "active" : ""}`}
          onClick={onRecord}
          disabled={isPlaying}
        >
          <Circle weight="fill" />
          {isRecording ? "Stop Rec" : "Record"}
        </button>

        <button
          className="ctrl-btn play"
          onClick={onPlay}
          disabled={isPlaying || recordedCount === 0 || isRecording}
        >
          <Play weight="fill" />
          Play
        </button>

        <button
          className="ctrl-btn stop"
          onClick={onStop}
          disabled={!isPlaying || isRecording}
        >
          <Square weight="fill" />
          Stop
        </button>

        <button
          className="ctrl-btn clear"
          onClick={onClear}
          disabled={(recordedCount === 0 && !isRecording) || isRecording}
        >
          <Trash weight="regular" />
          Clear
        </button>
      </div>

      <div className="octave-controls">
        <span className="octave-label">Octave</span>
        <div className="octave-buttons">
          <button
            className="octave-btn"
            onClick={() => onOctaveChange(-1)}
            disabled={octave <= 2 || isPlaying}
          >
            &minus;
          </button>
          <span className="octave-display">{octave}</span>
          <button
            className="octave-btn"
            onClick={() => onOctaveChange(1)}
            disabled={octave >= 7 || isPlaying}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
