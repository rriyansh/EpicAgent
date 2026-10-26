
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  os: string;
  browser: string;
  screenWidth: number;
}

export function detectDevice(): DeviceInfo {
  const ua = navigator.userAgent;
  const mobileRegex = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const tabletRegex = /iPad|Android(?!.*Mobile)/i;

  const isMobileUA = mobileRegex.test(ua);
  const isTabletUA = tabletRegex.test(ua);
  const isSmallScreen = window.innerWidth < 768;
  const isMobile = (isMobileUA && !isTabletUA) || isSmallScreen;
  const isTablet = isTabletUA && !isMobile;

  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    os,
    browser,
    screenWidth: window.innerWidth,
  };
}