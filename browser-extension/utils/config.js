/**
 * Configuration constants for EnrollMate Browser Extension
 */

// ============================================================================
// TEST MODE CONFIGURATION
// ============================================================================
// Set to true for testing without live API endpoints or when testing locally
// Set to false for production use with real backend
export const TEST_MODE = true; // ← Change to false when backend is ready

// When TEST_MODE is true:
// - Uses mock data for course extraction (no actual scraping)
// - Skips real API calls for authentication
// - Uses sample semesters instead of fetching from backend
// - Allows testing on any page without content script restrictions

// API Configuration
export const ENROLLMATE_API_URL = TEST_MODE
  ? 'http://localhost:3000' // Local development
  : 'https://enrollmate.com'; // Production

// Supabase Configuration (if using Supabase for auth)
// TODO: Add Supabase credentials if needed
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Extension Configuration
export const EXTENSION_NAME = 'EnrollMate Course Extractor';
export const EXTENSION_VERSION = '0.1.0';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'enrollmate_auth_token',
  USER_EMAIL: 'enrollmate_user_email',
  USER_ID: 'enrollmate_user_id',
  CURRENT_SEMESTER_ID: 'enrollmate_current_semester_id',
  SEMESTERS: 'enrollmate_semesters',
  PREFERENCES: 'enrollmate_preferences'
};

// UI Configuration
export const UI_CONFIG = {
  POPUP_WIDTH: 400,
  POPUP_HEIGHT: 500,
  DEFAULT_THEME: 'light',
  ANIMATION_DURATION: 300
};

// Colors (matching EnrollMate design)
export const COLORS = {
  PRIMARY_GREEN: '#8BC34A',
  DARK_GREEN: '#7CB342',
  SECONDARY_GREEN: '#9ACD32',
  BACKGROUND_LIGHT: '#f5f5f5',
  TEXT_DARK: '#333',
  TEXT_LIGHT: '#666',
  BORDER_LIGHT: '#e0e0e0',
  SUCCESS: '#4caf50',
  ERROR: '#d32f2f',
  WARNING: '#ff9800'
};

// API Timeouts
export const TIMEOUTS = {
  FETCH_DEFAULT: 30000, // 30 seconds
  AUTH: 10000, // 10 seconds
  UPLOAD_COURSES: 60000 // 60 seconds
};

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 8000, // 8 seconds
  BACKOFF_MULTIPLIER: 2
};
