import { useState } from "react";
import { getDeviceFingerprint } from "../lib/device";

export function useDevice() {
  const [fingerprint] = useState(() => getDeviceFingerprint());
  return { fingerprint };
}
