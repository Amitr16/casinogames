// API Configuration
export const API_BASE_URL = import.meta.env.VITE_CASINO_API || 'http://localhost:8888';

// Make it available globally for backward compatibility
if (typeof window !== 'undefined') {
  window.CASINO_API = API_BASE_URL;
}
