const KEY = "epicagent.sound";

let ctx: AudioContext | null = null;

export function soundOn() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSound(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
}

function audio() {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0) {
  const ac = audio();
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(amp);
  amp.connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export function play(name: "hello" | "tap" | "send" | "reply") {
  if (!soundOn()) return;
  try {
    if (name === "hello") {
      tone(523, 0.16, "sine", 0.07);
      tone(659, 0.18, "sine", 0.06, 0.1);
      tone(784, 0.26, "sine", 0.05, 0.2);
    } else if (name === "tap") {
      tone(740, 0.07, "triangle", 0.035);
    } else if (name === "send") {
      tone(620, 0.08, "sine", 0.05);
      tone(880, 0.1, "sine", 0.04, 0.05);
    } else {
      tone(392, 0.12, "sine", 0.04);
      tone(523, 0.18, "sine", 0.035, 0.09);
    }
  } catch {
    /* autoplay or audio unsupported */
  }
}
