
import { NextFunction, Response } from 'express';
import UAParser from 'ua-parser-js';
import { AuthedRequest } from '../types';

export function detectDevice(req: AuthedRequest, _res: Response, next: NextFunction) {
  const parsed = new UAParser(req.get('user-agent') || '').getResult();
  const type = parsed.device.type;

  req.device = {
    isMobile: type === 'mobile' || type === 'tablet',
    os: parsed.os.name || 'Unknown',
    browser: parsed.browser.name || 'Unknown',
  };

  next();
}
