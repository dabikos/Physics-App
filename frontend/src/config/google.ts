// Google OAuth configuration
// Web Client ID from Google Cloud Console -> APIs & Services -> Credentials
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '350204143409-igma4h4vfh3bgkpbi1t3e8o9q7rvdbf8.apps.googleusercontent.com';

// Backend URL for OAuth callback (Google redirects here, then backend redirects back to app)
const apiBase = (
  process.env.EXPO_PUBLIC_API_URL ||
  'https://physics-app-production-2585.up.railway.app'
).replace(/\/+$/, '');

export const GOOGLE_REDIRECT_URI = `${apiBase}/api/auth/google/callback`;
