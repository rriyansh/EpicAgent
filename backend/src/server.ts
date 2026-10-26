import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { detectDevice } from './middleware/device';
import { errorHandler, notFound } from './middleware/error';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import keysRoutes from './routes/keys';
import agentRoutes from './routes/agent';
import systemRoutes from './routes/system';

const app = express();
app.disable('x-powered-by');

app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' }, contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false, hsts: process.env.NODE_ENV === 'production' ? undefined : false }));

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(origin => origin.trim());
app.use(cors({
  origin: (origin, callback) => !origin || allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error('Origin not allowed')),
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(detectDevice);

// Global rate limiter
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' },
}));

// Stricter auth limiter
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, try again later.' },
}));
app.use('/api/auth/register', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many registrations, try again later.' },
}));

app.get('/api/health', (_req, res) => res.json({ ok: true, time: Date.now() }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/keys', keysRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/system', systemRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '4000', 10);
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET || !process.env.ENCRYPTION_KEY)) {
  throw new Error('Production requires JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, and ENCRYPTION_KEY');
}
app.listen(PORT, () => {
  console.log(`\n⚡ Epic Agent backend ready on http://localhost:${PORT}`);
  if (!process.env.ENCRYPTION_KEY) {
    console.warn('⚠  ENCRYPTION_KEY not set — API keys stored with DEV key. Set it in .env.');
  }
});
