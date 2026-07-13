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
          {isRecording ? "Stop Rec" : "Record"}
        </button>

        <button
          className="ctrl-btn play"
          onClick={onPlay}
          disabled={isPlaying || recordedCount === 0}
        >
          Play
        </button>

        <button
          className="ctrl-btn stop"
          onClick={onStop}
          disabled={!isPlaying && !isRecording}
        >
          Stop
        </button>

        <button
          className="ctrl-btn clear"
          onClick={onClear}
          disabled={recordedCount === 0 && !isRecording}
        >
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
            -
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
