import { useState, useEffect } from "react";

const BREAKPOINT = 520;

export default function RotateOverlay() {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    function checkWidth() {
      setIsNarrow(window.innerWidth < BREAKPOINT);
    }

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  if (!isNarrow) return null;

  return (
    <div className="rotate-overlay">
      <div className="rotate-content">
        <div className="rotate-phone">
          <div className="rotate-phone-screen" />
        </div>
        <p className="rotate-text">Rotate your device</p>
        <p className="rotate-sub">Landscape mode recommended for piano</p>
      </div>
    </div>
  );
}
