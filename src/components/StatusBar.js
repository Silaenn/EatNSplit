export default function StatusBar({
  activeNotes,
  isRecording,
  isPlaying,
  recordedCount,
  recordingDuration,
  octave,
}) {
  const noteList =
    activeNotes.size > 0 ? Array.from(activeNotes).join(" ") : "\u2014";

  function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}s`;
  }

  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-label">Octave</span>
        <span className="status-value">{octave}</span>
      </div>

      <div className="status-item">
        <span className="status-label">Notes</span>
        <span className="status-value note-display">{noteList}</span>
      </div>

      <div className="status-item">
        <span className="status-label">Status</span>
        <span className={`status-value status-indicator ${isRecording ? "recording" : ""} ${isPlaying ? "playing" : ""}`}>
          {isRecording && `Recording ${formatDuration(recordingDuration)}`}
          {isPlaying && "Playing"}
          {!isRecording && !isPlaying && "Ready"}
        </span>
      </div>

      <div className="status-item">
        <span className="status-label">Recorded</span>
        <span className="status-value">{recordedCount} notes</span>
      </div>
    </div>
  );
}
