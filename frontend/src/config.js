// API Configuration
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_CASINO_API;
  console.log('VITE_CASINO_API:', envUrl); // Debug log
  
  if (envUrl && envUrl !== 'undefined') {
    return envUrl;
  }
  
  // Fallback to production backend if no env var or if undefined
  return 'https://casinogames.onrender.com';
};

export const API_BASE_URL = getApiUrl();

// Make it available globally for backward compatibility
if (typeof window !== 'undefined') {
  window.CASINO_API = API_BASE_URL;
  console.log('Final API_BASE_URL:', API_BASE_URL); // Debug log
}
