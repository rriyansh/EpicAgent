
import { useState, useEffect } from 'react';
import { detectDevice, DeviceInfo } from '../lib/device';

export function useDevice(): DeviceInfo {
  const [device, setDevice] = useState<DeviceInfo>(() => detectDevice());

  useEffect(() => {
    function onResize() {
      setDevice(detectDevice());
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return device;
}