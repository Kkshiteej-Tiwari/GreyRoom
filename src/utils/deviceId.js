/**
 * ============================================================================
 * DEVICE ID UTILITY - deviceId.js
 * ============================================================================
 * 
 * PURPOSE:
 * This module handles device fingerprinting and user session management without
 * requiring traditional login credentials. It enables anonymous user identification
 * through locally stored unique device IDs.
 * 
 * KEY FEATURES:
 * - Generates unique device fingerprints using timestamp + random strings
 * - Persists device ID in localStorage for session continuity
 * - Manages user profile data (nickname, bio, gender)
 * - Implements freemium daily match limits for gender-specific filtering
 * 
 * PRIVACY NOTE:
 * No personally identifiable information (PII) is collected.
 * All data is stored locally in the user's browser localStorage.
 * 
 * ============================================================================
 */

import { appConfig } from 'config/config';

/**
 * Generates a unique device ID using timestamp and random strings.
 * 
 * FORMAT: gr_<timestamp_base36>_<random1><random2>
 * EXAMPLE: gr_m0x5k2p_8f3h2k9m1n4p7q2w5e8r
 * 
 * The "gr_" prefix identifies this as a GreyRoom device ID.
 * Timestamp is encoded in base36 for compactness.
 * Random parts ensure uniqueness even for simultaneous generations.
 * 
 * @returns {string} A unique device identifier string
 */
export function generateDeviceId() {
  // Convert current timestamp to base36 for compact representation
  const timestamp = Date.now().toString(36);
  
  // Generate two random strings for additional uniqueness
  // substring(2, 15) removes the "0." prefix from Math.random()
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  
  // Combine with "gr_" prefix (GreyRoom identifier)
  return `gr_${timestamp}_${randomPart}${randomPart2}`;
}

/**
 * Retrieves or creates a persistent device ID from localStorage.
 * 
 * This function implements a "get or create" pattern:
 * - If a device ID exists, it returns the existing one
 * - If no device ID exists, it generates a new one and stores it
 * 
 * This ensures the same device ID persists across page refreshes
 * and browser sessions, enabling consistent user identification.
 * 
 * @returns {string|null} The device ID, or null if running server-side
 */
export function getDeviceId() {
  // Guard against server-side rendering (SSR) where window is undefined
  if (typeof window === 'undefined') return null;
  
  // Try to retrieve existing device ID from localStorage
  let deviceId = localStorage.getItem(appConfig.deviceIdKey);
  
  // If no device ID exists, generate and store a new one
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(appConfig.deviceIdKey, deviceId);
  }
  
  return deviceId;
}

/**
 * Retrieves stored user profile data from localStorage.
 * 
 * User data structure:
 * {
 *   nickname: string,     // User's display name
 *   bio: string,          // Optional user bio
 *   gender: string,       // 'male', 'female', or 'unspecified'
 *   verified: boolean     // Whether gender verification completed
 * }
 * 
 * @returns {Object|null} Parsed user data object, or null if not found/SSR
 */
export function getUserData() {
  // Guard against server-side rendering
  if (typeof window === 'undefined') return null;
  
  const data = localStorage.getItem(appConfig.userDataKey);
  // Parse JSON data, return null if not found
  return data ? JSON.parse(data) : null;
}

/**
 * Saves user profile data to localStorage.
 * 
 * This persists user information locally, allowing the app to
 * remember the user's nickname and preferences across sessions.
 * 
 * @param {Object} userData - User profile object to store
 */
export function saveUserData(userData) {
  // Guard against server-side rendering
  if (typeof window === 'undefined') return;
  localStorage.setItem(appConfig.userDataKey, JSON.stringify(userData));
}

/**
 * Clears all stored user data (logout functionality).
 * 
 * Note: This only clears user profile data, NOT the device ID.
 * The device ID persists to prevent abuse (e.g., creating infinite accounts).
 */
export function clearUserData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(appConfig.userDataKey);
}

/**
 * Gets the current daily match count for freemium limiting.
 * 
 * FREEMIUM MODEL:
 * Users have a limited number of gender-specific matches per day.
 * This function tracks usage and resets the count at midnight.
 * 
 * The count is automatically reset when the day changes, allowing
 * users to start fresh each day without manual intervention.
 * 
 * @returns {number} Current match count (0 if new day or SSR)
 */
export function getMatchCount() {
  if (typeof window === 'undefined') return 0;
  
  // Get the date of the last reset
  const lastReset = localStorage.getItem(appConfig.lastResetKey);
  const today = new Date().toDateString();
  
  // If it's a new day, reset the counter to 0
  if (lastReset !== today) {
    localStorage.setItem(appConfig.lastResetKey, today);
    localStorage.setItem(appConfig.matchCountKey, '0');
    return 0;
  }
  
  // Return current count, defaulting to 0 if not set
  return parseInt(localStorage.getItem(appConfig.matchCountKey) || '0', 10);
}

/**
 * Increments the daily match count by 1.
 * 
 * Called when a user successfully matches with a gender-specific filter.
 * This tracks usage against the daily freemium limit.
 */
export function incrementMatchCount() {
  if (typeof window === 'undefined') return;
  const currentCount = getMatchCount();
  localStorage.setItem(appConfig.matchCountKey, String(currentCount + 1));
}

/**
 * Checks if the user can still use gender-specific filtering today.
 * 
 * @returns {boolean} true if under daily limit, false if limit reached
 */
export function canUseGenderFilter() {
  return getMatchCount() < appConfig.maxDailyMatches;
}

/**
 * Calculates remaining gender-specific matches for today.
 * 
 * Useful for displaying to users how many matches they have left.
 * 
 * @returns {number} Number of remaining matches (minimum 0)
 */
export function getRemainingMatches() {
  return Math.max(0, appConfig.maxDailyMatches - getMatchCount());
}

/**
 * ============================================================================
 * DEFAULT EXPORT - Bundled utility functions
 * ============================================================================
 * 
 * Exports all device management functions as a single object for
 * convenient importing: import deviceId from 'utils/deviceId'
 */
export default {
  generateDeviceId,      // Create new unique device ID
  getDeviceId,           // Get/create persistent device ID
  getUserData,           // Retrieve user profile
  saveUserData,          // Store user profile
  clearUserData,         // Clear user data (logout)
  getMatchCount,         // Get daily match usage
  incrementMatchCount,   // Track match usage
  canUseGenderFilter,    // Check freemium limit
  getRemainingMatches,   // Get remaining daily matches
};
