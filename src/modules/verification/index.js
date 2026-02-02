/**
 * Gender Verification Module
 * 
 * This module handles AI-based gender verification using face-api.js
 * All processing happens in the browser - images are NEVER uploaded or stored.
 * 
 * Privacy Compliance:
 * - Camera capture only (gallery disabled)
 * - Image processed in browser memory
 * - Only classification result stored
 * - Image immediately discarded after classification
 */

export { default as CameraCapture } from './components/CameraCapture';
export { default as VerificationFlow } from './components/VerificationFlow';
export { default as VerificationResult } from './components/VerificationResult';
export * from './utils/faceDetection';
export * from './utils/verificationStorage';
