export function getDeviceFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillText("epic-agent-fingerprint", 10, 10);
  }
  return [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    canvas.toDataURL(),
  ].join("|");
}
