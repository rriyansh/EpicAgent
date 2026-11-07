import { useState } from "react";
import { play, setSound, soundOn } from "../lib/sound";

export default function SoundToggle() {
  const [on, setOn] = useState(soundOn);

  return (
    <button
      type="button"
      className="sound-btn"
      aria-pressed={on}
      onClick={() => {
        const next = !on;
        setSound(next);
        setOn(next);
        if (next) play("tap");
      }}
    >
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}
