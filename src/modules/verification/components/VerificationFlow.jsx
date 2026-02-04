/**
 * ============================================================================
 * VERIFICATION FLOW COMPONENT - VerificationFlow.jsx
 * ============================================================================
 * 
 * PURPOSE:
 * This is the main orchestration component for the gender verification process.
 * It manages the entire verification flow from model loading to result display.
 * 
 * VERIFICATION FLOW STEPS:
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  1. LOADING     → Load ML models from CDN                               │
 * │  2. CAMERA      → Display camera capture interface                      │
 * │  3. PROCESSING  → Run ML inference on captured frame                    │
 * │  4. RESULT      → Show classification result with confidence            │
 * │  5. ERROR       → Handle any errors gracefully                          │
 * └──────────────────────────────────────────────────────────────────────────┘
 * 
 * PRIVACY GUARANTEE:
 * - All processing happens entirely in the browser
 * - No image data is ever sent to any server
 * - Only the classification result (gender, confidence) is stored
 * - Video frames are discarded immediately after ML inference
 * 
 * PROPS:
 * - onComplete(result): Called when verification succeeds with result data
 * - onSkip: Optional callback to skip verification (with limited features)
 * 
 * STATE MACHINE:
 * loading → camera ⇄ processing → result
 *              ↓          ↓
 *           error ←───────┘
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from './CameraCapture';
import VerificationResult from './VerificationResult';
import { loadModels, verifyGenderFromVideo, areModelsLoaded } from '../utils/faceDetection';
import { storeVerificationResult, isUserVerified, getVerificationResult } from '../utils/verificationStorage';
import { getDeviceId } from 'utils/deviceId';

export default function VerificationFlow({ onComplete, onSkip }) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  /**
   * Current step in the verification flow
   * Possible values: 'loading' | 'camera' | 'processing' | 'result' | 'error'
   */
  const [step, setStep] = useState('loading');
  
  /** Loading progress message (e.g., "Loading face detection model...") */
  const [loadingProgress, setLoadingProgress] = useState('');
  
  /** Error message to display in error state */
  const [error, setError] = useState(null);
  
  /** Verification result from ML inference */
  const [result, setResult] = useState(null);
  
  /** Number of verification attempts (used to limit skip option) */
  const [attempts, setAttempts] = useState(0);

  // ========================================================================
  // INITIALIZATION
  // ========================================================================
  
  /**
   * On component mount:
   * 1. Check if user is already verified (skip if so)
   * 2. Load ML models if not verified
   */
  useEffect(() => {
    // Check for existing valid verification
    const existingResult = getVerificationResult();
    if (existingResult && isUserVerified()) {
      // User is already verified - show result directly
      setResult(existingResult);
      setStep('result');
      return;
    }

    // No existing verification - start loading models
    loadModelsAsync();
  }, []);

  /**
   * Loads ML models asynchronously with progress updates.
   * Transitions to camera step on success, error step on failure.
   */
  const loadModelsAsync = async () => {
    try {
      setStep('loading');
      // Load models with progress callback for UI updates
      await loadModels((progress) => setLoadingProgress(progress));
      // Models loaded successfully - show camera
      setStep('camera');
    } catch (err) {
      // Model loading failed - show error
      setError(err.message);
      setStep('error');
    }
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  /**
   * Handles the capture button click from CameraCapture component.
   * 
   * PROCESS:
   * 1. Validate models are loaded
   * 2. Show processing state
   * 3. Run ML inference on video frame
   * 4. Store result (classification only, NOT image)
   * 5. Show result or error
   * 
   * @param {HTMLVideoElement} videoElement - The video element with camera stream
   */
  const handleCapture = async (videoElement) => {
    // Safety check - models must be loaded
    if (!areModelsLoaded()) {
      setError('Models not ready. Please wait.');
      return;
    }

    // Transition to processing state
    setStep('processing');
    setAttempts(prev => prev + 1);

    try {
      // Run ML inference on the current video frame
      // This function clears all image data after processing (privacy)
      const detection = await verifyGenderFromVideo(videoElement);

      // Handle case where no face was detected
      if (!detection) {
        setError('No face detected. Please position your face clearly in the frame.');
        setStep('camera');
        return;
      }

      // Store ONLY the classification result (not the image!)
      const deviceId = getDeviceId();
      const storedResult = storeVerificationResult(detection, deviceId);

      // Show success result
      setResult(storedResult);
      setStep('result');
    } catch (err) {
      // Handle inference errors - return to camera
      setError(err.message);
      setStep('camera');
    }
  };

  /**
   * Handles errors from the CameraCapture component.
   * @param {string} errorMessage - The error message to display
   */
  const handleCameraError = (errorMessage) => {
    setError(errorMessage);
  };

  /**
   * Handles retry button click - resets to camera state.
   */
  const handleRetry = () => {
    setError(null);
    setResult(null);
    setStep('camera');
  };

  /**
   * Handles continue button after successful verification.
   * Calls the parent's onComplete callback with the result.
   */
  const handleContinue = () => {
    onComplete?.(result);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* AnimatePresence enables exit animations when switching steps */}
      <AnimatePresence mode="wait">
        {/* ================================================================
            STEP 1: LOADING MODELS
            Shows spinner while ML models are being loaded from CDN
            ================================================================ */}
        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            {/* Loading spinner */}
            <div className="w-16 h-16 border-4 border-grey-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-grey-800 mb-2">Preparing Verification</h2>
            {/* Show current loading progress or default message */}
            <p className="text-grey-500 text-sm">{loadingProgress || 'Loading AI models...'}</p>
          </motion.div>
        )}

        {/* ================================================================
            STEP 2: CAMERA CAPTURE
            Displays camera interface for user to take selfie
            ================================================================ */}
        {step === 'camera' && (
          <motion.div
            key="camera"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            {/* Header text */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-grey-800 mb-2">Verify Your Identity</h2>
              <p className="text-grey-500">Take a selfie to verify your gender</p>
            </div>

            {/* Error message (if any from previous attempt) */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Camera capture component */}
            <CameraCapture
              onCapture={handleCapture}
              onError={handleCameraError}
              isProcessing={false}
            />

            {/* Skip option - only shown for first 3 attempts */}
            {onSkip && attempts < 3 && (
              <button
                onClick={onSkip}
                className="w-full mt-4 text-grey-500 hover:text-grey-700 text-sm"
              >
                Skip verification (limited features)
              </button>
            )}
          </motion.div>
        )}

        {/* ================================================================
            STEP 3: PROCESSING
            Shows while ML inference is running on captured frame
            ================================================================ */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            {/* Animated processing indicator */}
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold text-grey-800 mb-2">Analyzing...</h2>
            <p className="text-grey-500 text-sm">This only takes a moment</p>
          </motion.div>
        )}

        {/* ================================================================
            STEP 4: RESULT
            Shows verification result with gender and confidence
            ================================================================ */}
        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md"
          >
            {/* Verification result display component */}
            <VerificationResult
              result={result}
              onContinue={handleContinue}
              onRetry={handleRetry}
            />
          </motion.div>
        )}

        {/* ================================================================
            STEP 5: ERROR STATE
            Shows when something goes wrong (model loading, camera, etc.)
            ================================================================ */}
        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center max-w-md"
          >
            {/* Error icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-grey-800 mb-2">Something went wrong</h2>
            <p className="text-grey-500 text-sm mb-4">{error}</p>
            {/* Retry button */}
            <button
              onClick={loadModelsAsync}
              className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
