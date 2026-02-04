/**
 * ============================================================================
 * VERIFICATION STORAGE UTILITY - verificationStorage.js
 * ============================================================================
 * 
 * PURPOSE:
 * This module handles storing and retrieving gender verification results.
 * It implements the "Delete-After-Verify" pattern where ONLY classification
 * results are stored - NEVER any image or biometric data.
 * 
 * PRIVACY ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  STORED (in localStorage):          NOT STORED:                │
 * │  ✅ gender ('male'/'female')         ❌ Video frames           │
 * │  ✅ confidence (0-100%)              ❌ Face images            │
 * │  ✅ timestamp                        ❌ Face embeddings        │
 * │  ✅ deviceId                         ❌ Biometric data         │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * VERIFICATION VALIDITY:
 * - Results are valid for 24 hours from verification time
 * - After expiration, user must re-verify
 * - This prevents stale verification from being used indefinitely
 * 
 * ============================================================================
 */

import { appConfig } from 'config/config';

// localStorage key for verification data
const VERIFICATION_KEY = 'greyroom_verification';

/**
 * TypeScript-style documentation for verification result structure.
 * 
 * @typedef {Object} VerificationResult
 * @property {string} gender - Classification result: 'male' or 'female'
 * @property {number} confidence - ML model confidence as percentage (0-100)
 * @property {string} verifiedAt - ISO 8601 timestamp of verification
 * @property {string} deviceId - Device fingerprint for correlation
 */

/**
 * Stores the verification result in localStorage.
 * 
 * CRITICAL PRIVACY NOTE:
 * This function ONLY stores the classification result.
 * The image/video data that was used for verification is NEVER stored.
 * By the time this function is called, the image data has already been
 * discarded by the faceDetection module.
 * 
 * DATA STORED:
 * - gender: The ML classification result ('male' or 'female')
 * - confidence: How confident the ML model was (e.g., 87%)
 * - verifiedAt: When the verification occurred
 * - deviceId: Links verification to the device (for freemium limits)
 * 
 * Also updates the user profile data with verified gender.
 * 
 * @param {Object} result - The verification result from ML inference
 * @param {string} result.gender - 'male' or 'female'
 * @param {number} result.confidence - Confidence percentage (0-100)
 * @param {string} deviceId - The user's device fingerprint
 * @returns {Object} The stored verification data object
 */
export function storeVerificationResult(result, deviceId) {
  // Guard against server-side rendering
  if (typeof window === 'undefined') return;

  // Create verification record with ONLY classification data
  const verificationData = {
    gender: result.gender,              // ✅ Classification only
    confidence: result.confidence,       // ✅ Confidence score
    verifiedAt: new Date().toISOString(), // ✅ Timestamp
    deviceId: deviceId,                   // ✅ Device correlation
    // ❌ NO image data
    // ❌ NO face embeddings  
    // ❌ NO biometric data
  };

  // Store verification result
  localStorage.setItem(VERIFICATION_KEY, JSON.stringify(verificationData));
  
  // Also update the user's profile with verified gender
  // This allows the matching system to use verified gender
  const userData = localStorage.getItem(appConfig.userDataKey);
  if (userData) {
    const parsed = JSON.parse(userData);
    parsed.gender = result.gender;    // Update gender from verification
    parsed.verified = true;            // Mark as verified
    localStorage.setItem(appConfig.userDataKey, JSON.stringify(parsed));
  }

  return verificationData;
}

/**
 * Retrieves the stored verification result from localStorage.
 * 
 * @returns {VerificationResult|null} The verification data, or null if:
 *   - No verification exists
 *   - Running server-side
 *   - Data is corrupted/unparseable
 */
export function getVerificationResult() {
  if (typeof window === 'undefined') return null;

  const data = localStorage.getItem(VERIFICATION_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    // Handle corrupted data gracefully
    return null;
  }
}

/**
 * Checks if the user has completed gender verification.
 * 
 * A user is considered verified if:
 * - A verification result exists in localStorage
 * - The result contains a gender classification
 * 
 * Note: This doesn't check if verification is still VALID (not expired).
 * Use isVerificationValid() to check expiration.
 * 
 * @returns {boolean} true if user has a verification result
 */
export function isUserVerified() {
  const result = getVerificationResult();
  return result !== null && result.gender !== undefined;
}

/**
 * Gets the user's verified gender classification.
 * 
 * @returns {string|null} 'male', 'female', or null if not verified
 */
export function getVerifiedGender() {
  const result = getVerificationResult();
  return result?.gender || null;
}

/**
 * Clears all verification data from localStorage.
 * 
 * USE CASES:
 * - User requests to clear their data
 * - Testing/development
 * - Logout functionality
 * - Forcing re-verification
 */
export function clearVerification() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VERIFICATION_KEY);
}

/**
 * Checks if the verification is still valid (within 24-hour window).
 * 
 * EXPIRATION POLICY:
 * - Verifications are valid for 24 hours from completion
 * - After 24 hours, users must re-verify
 * - This prevents indefinite use of stale verifications
 * - Helps ensure accuracy as appearance may change over time
 * 
 * @returns {boolean} true if verification exists and is within 24 hours
 */
export function isVerificationValid() {
  const result = getVerificationResult();
  
  // No result or no timestamp means invalid
  if (!result || !result.verifiedAt) return false;

  // Calculate time since verification
  const verifiedTime = new Date(result.verifiedAt).getTime();
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Valid if less than 24 hours have passed
  return (now - verifiedTime) < twentyFourHours;
}

/**
 * ============================================================================
 * DEFAULT EXPORT - Bundled storage functions
 * ============================================================================
 */
export default {
  storeVerificationResult,  // Save verification result
  getVerificationResult,    // Retrieve verification data
  isUserVerified,           // Check if verified
  getVerifiedGender,        // Get verified gender
  clearVerification,        // Clear verification data
  isVerificationValid,      // Check if within 24-hour window
};
