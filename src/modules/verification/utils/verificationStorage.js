/**
 * Verification Storage Utility
 * 
 * Handles storing and retrieving verification results.
 * ONLY stores the classification result - NEVER the image.
 */

import { appConfig } from 'config/config';

const VERIFICATION_KEY = 'greyroom_verification';

/**
 * Verification result structure
 * @typedef {Object} VerificationResult
 * @property {string} gender - 'male' or 'female'
 * @property {number} confidence - Confidence percentage (0-100)
 * @property {string} verifiedAt - ISO timestamp
 * @property {string} deviceId - Device fingerprint
 */

/**
 * Store verification result
 * Only stores the classification result, NEVER the image
 * 
 * @param {Object} result - Verification result
 * @param {string} result.gender - 'male' or 'female'
 * @param {number} result.confidence - Confidence percentage
 * @param {string} deviceId - Device fingerprint
 */
export function storeVerificationResult(result, deviceId) {
  if (typeof window === 'undefined') return;

  const verificationData = {
    gender: result.gender,
    confidence: result.confidence,
    verifiedAt: new Date().toISOString(),
    deviceId: deviceId,
  };

  localStorage.setItem(VERIFICATION_KEY, JSON.stringify(verificationData));
  
  // Also update user data with gender
  const userData = localStorage.getItem(appConfig.userDataKey);
  if (userData) {
    const parsed = JSON.parse(userData);
    parsed.gender = result.gender;
    parsed.verified = true;
    localStorage.setItem(appConfig.userDataKey, JSON.stringify(parsed));
  }

  return verificationData;
}

/**
 * Get stored verification result
 * @returns {VerificationResult | null}
 */
export function getVerificationResult() {
  if (typeof window === 'undefined') return null;

  const data = localStorage.getItem(VERIFICATION_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Check if user is verified
 * @returns {boolean}
 */
export function isUserVerified() {
  const result = getVerificationResult();
  return result !== null && result.gender !== undefined;
}

/**
 * Get verified gender
 * @returns {string | null} - 'male', 'female', or null if not verified
 */
export function getVerifiedGender() {
  const result = getVerificationResult();
  return result?.gender || null;
}

/**
 * Clear verification (for testing/logout)
 */
export function clearVerification() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VERIFICATION_KEY);
}

/**
 * Check if verification is still valid (within 24 hours)
 * @returns {boolean}
 */
export function isVerificationValid() {
  const result = getVerificationResult();
  if (!result || !result.verifiedAt) return false;

  const verifiedTime = new Date(result.verifiedAt).getTime();
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  return (now - verifiedTime) < twentyFourHours;
}

export default {
  storeVerificationResult,
  getVerificationResult,
  isUserVerified,
  getVerifiedGender,
  clearVerification,
  isVerificationValid,
};
