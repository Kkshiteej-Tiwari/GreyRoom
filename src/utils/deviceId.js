import { appConfig } from 'config/config';

/**
 * Device Fingerprinting Utility
 * Generates and manages unique device IDs stored locally
 * No PII is collected - only a random UUID is generated
 */

// Generate a unique device ID
export function generateDeviceId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `gr_${timestamp}_${randomPart}${randomPart2}`;
}

// Get or create device ID from localStorage
export function getDeviceId() {
  if (typeof window === 'undefined') return null;
  
  let deviceId = localStorage.getItem(appConfig.deviceIdKey);
  
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(appConfig.deviceIdKey, deviceId);
  }
  
  return deviceId;
}

// Get stored user data
export function getUserData() {
  if (typeof window === 'undefined') return null;
  
  const data = localStorage.getItem(appConfig.userDataKey);
  return data ? JSON.parse(data) : null;
}

// Save user data locally
export function saveUserData(userData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(appConfig.userDataKey, JSON.stringify(userData));
}

// Clear user data (logout)
export function clearUserData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(appConfig.userDataKey);
}

// Get daily match count for freemium limits
export function getMatchCount() {
  if (typeof window === 'undefined') return 0;
  
  const lastReset = localStorage.getItem(appConfig.lastResetKey);
  const today = new Date().toDateString();
  
  // Reset count if it's a new day
  if (lastReset !== today) {
    localStorage.setItem(appConfig.lastResetKey, today);
    localStorage.setItem(appConfig.matchCountKey, '0');
    return 0;
  }
  
  return parseInt(localStorage.getItem(appConfig.matchCountKey) || '0', 10);
}

// Increment match count
export function incrementMatchCount() {
  if (typeof window === 'undefined') return;
  const currentCount = getMatchCount();
  localStorage.setItem(appConfig.matchCountKey, String(currentCount + 1));
}

// Check if user can use specific gender filter
export function canUseGenderFilter() {
  return getMatchCount() < appConfig.maxDailyMatches;
}

// Get remaining specific matches
export function getRemainingMatches() {
  return Math.max(0, appConfig.maxDailyMatches - getMatchCount());
}

export default {
  generateDeviceId,
  getDeviceId,
  getUserData,
  saveUserData,
  clearUserData,
  getMatchCount,
  incrementMatchCount,
  canUseGenderFilter,
  getRemainingMatches,
};
