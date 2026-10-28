import { DeviceInfo } from '../types';

export function detectDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  
  let os = 'unknown';
  let browser = 'unknown';
  let isMobile = false;
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    os = 'iOS';
    isMobile = true;
  } else if (/android/.test(userAgent)) {
    os = 'Android';
    isMobile = true;
  } else if (/windows/.test(userAgent)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/.test(userAgent)) {
    os = 'macOS';
  } else if (/linux/.test(userAgent)) {
    os = 'Linux';
  }
  
  if (/chrome/.test(userAgent) && !/edge/.test(userAgent)) {
    browser = 'Chrome';
  } else if (/firefox/.test(userAgent)) {
    browser = 'Firefox';
  } else if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
    browser = 'Safari';
  } else if (/edge/.test(userAgent)) {
    browser = 'Edge';
  } else if (/opera/.test(userAgent)) {
    browser = 'Opera';
  }
  
  return { isMobile, os, browser };
}
