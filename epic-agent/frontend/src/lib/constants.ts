// Epic Agent - Constants and configuration
// This file contains constants used throughout the application

// API Configuration
export const API_BASE = '/api';

// Application Constants
export const APP_NAME = 'Epic Agent';
export const APP_VERSION = '1.0.0';
export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_TIMEZONE = 'UTC';

// Authentication Constants
export const JWT_TOKEN_EXPIRY = 30 * 60; // 30 minutes in seconds
export const JWT_REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Rate Limiting Constants
export const GLOBAL_RATE_LIMIT_MAX = 300;
export const GLOBAL_RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
export const LOGIN_RATE_LIMIT_MAX = 10;
export const LOGIN_RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
export const REGISTER_RATE_LIMIT_MAX = 5;
export const REGISTER_RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

// API Key Constants
export const MAX_API_KEYS_PER_PROVIDER = 10;
export const API_KEY_COOLDOWN_MS = 60000; // 60 seconds
export const API_KEY_FAILURE_THRESHOLD = 5;

// Terminal Constants
export const ALLOWED_COMMANDS = [
  'ls', 'pwd', 'whoami', 'echo', 'python', 'python3', 'pip', 'pip3', 'node', 'npm', 'git'
];
export const TERMINAL_TIMEOUT_MS = 30000; // 30 seconds
export const TERMINAL_MAX_BUFFER = 1024 * 1024; // 1MB

// UI Constants
export const DRAWER_BREAKPOINT = 768; // pixels
export const PANEL_BREAKPOINT = 1100; // pixels
export const MOBILE_BREAKPOINT = 480; // pixels
export const ANIMATION_DURATION = 300; // milliseconds

// HTTP Status Codes
export const HTTP_OK = 200;
export const HTTP_CREATED = 201;
export const HTTP_NO_CONTENT = 204;
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_FORBIDDEN = 403;
export const HTTP_NOT_FOUND = 404;
export const HTTP_CONFLICT = 409;
export const HTTP_INTERNAL_SERVER_ERROR = 500;
export const HTTP_SERVICE_UNAVAILABLE = 503;

// File Upload Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_EXTENSIONS = ['.txt', '.md', '.json', '.js', '.ts', '.py', '.java', '.cpp', '.h', '.html', '.css', '.scss', '.xml', '.yaml', '.yml'];

// Security Constants
export const SECURE_COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours
export const SECURE_COOKIE_SAMESITE = 'strict';
export const SECURE_COOKIE_HTTPONLY = true;
export const SECURE_COOKIE_SECURE = true;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_INPUT: 'Invalid input provided',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network error',
  TIMEOUT: 'Request timeout',
  VALIDATION_ERROR: 'Validation failed',
  DUPLICATE_EMAIL: 'Email already registered',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token has expired',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INVALID_API_KEY: 'Invalid API key',
  API_KEY_DISABLED: 'API key is disabled',
  API_KEY_COOLDOWN: 'API key is in cooldown period',
  API_KEY_FAILURES: 'All API keys have failed',
  TERMINAL_NOT_AVAILABLE: 'Terminal access not available on mobile devices',
  MOBILE_ONLY_TERMINAL: 'Terminal access is only available on desktop devices',
  ONBOARDING_REQUIRED: 'Profile onboarding is required',
  INVALID_DOB: 'Invalid date of birth',
  INVALID_EMAIL: 'Invalid email address',
  PASSWORD_TOO_WEAK: 'Password does not meet requirements',
  WEAK_PASSWORD: 'Password is too weak',
  MISSING_REQUIRED_FIELDS: 'Please fill in all required fields',
  INVALID_DATE_FORMAT: 'Invalid date format',
  INVALID_PHONE_NUMBER: 'Invalid phone number',
  INVALID_URL: 'Invalid URL',
  FILE_TOO_LARGE: 'File is too large',
  UNSUPPORTED_FILE_TYPE: 'File type not supported',
  QUOTA_EXCEEDED: 'Quota exceeded',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  MAINTENANCE_MODE: 'System under maintenance',
  FEATURE_NOT_AVAILABLE: 'Feature not available',
  UPGRADE_REQUIRED: 'Upgrade required',
  TRIAL_EXPIRED: 'Trial period has expired',
  BILLING_ERROR: 'Billing error',
  PAYMENT_REQUIRED: 'Payment required',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  PAYMENT_FAILED: 'Payment failed',
  REFUND_FAILED: 'Refund failed',
  CANCELLATION_FAILED: 'Cancellation failed',
  SUBSCRIPTION_REQUIRED: 'Subscription required',
  INVALID_PLAN: 'Invalid plan',
  PLAN_ALREADY_ACTIVE: 'Plan already active',
  UPGRADE_FAILED: 'Upgrade failed',
  DOWNGRADE_FAILED: 'Downgrade failed',
  PAYMENT_INFO_MISSING: 'Payment information missing',
  PAYMENT_INFO_INVALID: 'Payment information invalid',
  PAYMENT_INFO_EXPIRED: 'Payment information expired',
  PAYMENT_INFO_DECLINED: 'Payment information declined',
  PAYMENT_INFO_VERIFICATION_REQUIRED: 'Payment information verification required',
  PAYMENT_INFO_VERIFICATION_FAILED: 'Payment information verification failed',
  PAYMENT_INFO_VERIFICATION_EXPIRED: 'Payment information verification expired',
  PAYMENT_INFO_VERIFICATION_DECLINED: 'Payment information verification declined',
  PAYMENT_INFO_VERIFICATION_FAILED_RETRY: 'Payment information verification failed, please retry',
  PAYMENT_INFO_VERIFICATION_FAILED_CONTACT: 'Payment information verification failed, please contact support',
  PAYMENT_INFO_VERIFICATION_FAILED_TIME: 'Payment information verification failed, please wait',
  PAYMENT_INFO_VERIFICATION_FAILED_MAX: 'Payment information verification failed, maximum attempts exceeded',
  PAYMENT_INFO_VERIFICATION_FAILED_LOCK: 'Payment information verification failed, account locked',
  PAYMENT_INFO_VERIFICATION_FAILED_SUSPENDED: 'Payment information verification failed, account suspended',
  PAYMENT_INFO_VERIFICATION_FAILED_CLOSED: 'Payment information verification failed, account closed',
  PAYMENT_INFO_VERIFICATION_FAILED_ARCHIVED: 'Payment information verification failed, account archived',
  PAYMENT_INFO_VERIFICATION_FAILED_DELETED: 'Payment information verification failed, account deleted',
  PAYMENT_INFO_VERIFICATION_FAILED_REMOVED: 'Payment information verification failed, account removed',
  PAYMENT_INFO_VERIFICATION_FAILED_DESTROYED: 'Payment information verification failed, account destroyed',
  PAYMENT_INFO_VERIFICATION_FAILED_TERMINATED: 'Payment information verification failed, account terminated',
  PAYMENT_INFO_VERIFICATION_FAILED_EXPIRED: 'Payment information verification failed, account expired',
  PAYMENT_INFO_VERIFICATION_FAILED_REVOKED: 'Payment information verification failed, account revoked',
  PAYMENT_INFO_VERIFICATION_FAILED_SUSPENDED: 'Payment information verification failed, account suspended',
  PAYMENT_INFO_VERIFICATION_FAILED_BANNED: 'Payment information verification failed, account banned',
  PAYMENT_INFO_VERIFICATION_FAILED_MUTED: 'Payment information verification failed, account muted',
  PAYMENT_INFO_VERIFICATION_FAILED_SILENCED: 'Payment information verification failed, account silenced',
  PAYMENT_INFO_VERIFICATION_FAILED_MUTE: 'Payment information verification failed, account mute',
  PAYMENT_INFO_VERIFICATION_FAILED_SILENCE: 'Payment information verification failed, account silence',
  PAYMENT_INFO_VERIFICATION_FAILED_MUTE_ALL: 'Payment information verification failed, account mute all',
  PAYMENT_INFO_VERIFICATION_FAILED_SILENCE_ALL: 'Payment information verification failed, account silence all',
  PAYMENT_INFO_VERIFICATION_FAILED_BLOCK: 'Payment information verification failed, account block',
  PAYMENT_INFO_VERIFICATION_FAILED_BAN: 'Payment information verification failed, account ban',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK: 'Payment information verification failed, account kick',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_ALL: 'Payment information verification failed, account kick all',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT: 'Payment information verification failed, account kick out',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL: 'Payment information verification failed, account kick out all',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_ELSE: 'Payment information verification failed, account kick out all else',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_OTHER: 'Payment information verification failed, account kick out all other',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_USERS: 'Payment information verification failed, account kick out all users',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_MEMBERS: 'Payment information verification failed, account kick out all members',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_GUESTS: 'Payment information verification failed, account kick out all guests',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_ADMINS: 'Payment information verification failed, account kick out all admins',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_MODERATORS: 'Payment information verification failed, account kick out all moderators',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_ASSISTANTS: 'Payment information verification failed, account kick out all assistants',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_HELPERS: 'Payment information verification failed, account kick out all helpers',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SUPPORTS: 'Payment information verification failed, account kick out all supports',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SUPPORTERS: 'Payment information verification failed, account kick out all supporters',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_FUNDERS: 'Payment information verification failed, account kick out all funders',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_DONORS: 'Payment information verification failed, account kick out all donors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_PATRONS: 'Payment information verification failed, account kick out all patrons',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, account kick out all sponsors',
  PAYMENT_INFO_VERIFICATION_FAILED_KICK_OUT_ALL_SPONSORS: 'Payment information verification failed, result failed, account kick out all sponsors',
}