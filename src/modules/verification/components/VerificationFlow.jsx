/**
 * Verification Flow Component
 * 
 * Main component that orchestrates the entire verification process:
 * 1. Load ML models
 * 2. Camera capture
 * 3. Gender detection
 * 4. Result display
 * 
 * Privacy: All processing happens in-browser. No data sent to server.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from './CameraCapture';
import VerificationResult from './VerificationResult';
import { loadModels, verifyGenderFromVideo, areModelsLoaded } from '../utils/faceDetection';
import { storeVerificationResult, isUserVerified, getVerificationResult } from '../utils/verificationStorage';
import { getDeviceId } from 'utils/deviceId';

export default function VerificationFlow({ onComplete, onSkip }) {
  const [step, setStep] = useState('loading'); // loading, camera, processing, result, error
  const [loadingProgress, setLoadingProgress] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);

  // Check if already verified
  useEffect(() => {
    const existingResult = getVerificationResult();
    if (existingResult && isUserVerified()) {
      setResult(existingResult);
      setStep('result');
      return;
    }

    // Load models
    loadModelsAsync();
  }, []);

  const loadModelsAsync = async () => {
    try {
      setStep('loading');
      await loadModels((progress) => setLoadingProgress(progress));
      setStep('camera');
    } catch (err) {
      setError(err.message);
      setStep('error');
    }
  };

  // Handle camera capture
  const handleCapture = async (videoElement) => {
    if (!areModelsLoaded()) {
      setError('Models not ready. Please wait.');
      return;
    }

    setStep('processing');
    setAttempts(prev => prev + 1);

    try {
      const detection = await verifyGenderFromVideo(videoElement);

      if (!detection) {
        setError('No face detected. Please position your face clearly in the frame.');
        setStep('camera');
        return;
      }

      // Store result (only classification, not image)
      const deviceId = getDeviceId();
      const storedResult = storeVerificationResult(detection, deviceId);

      setResult(storedResult);
      setStep('result');
    } catch (err) {
      setError(err.message);
      setStep('camera');
    }
  };

  // Handle errors from camera component
  const handleCameraError = (errorMessage) => {
    setError(errorMessage);
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setResult(null);
    setStep('camera');
  };

  // Handle continue after verification
  const handleContinue = () => {
    onComplete?.(result);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {/* Loading Models */}
        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-grey-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-grey-800 mb-2">Preparing Verification</h2>
            <p className="text-grey-500 text-sm">{loadingProgress || 'Loading AI models...'}</p>
          </motion.div>
        )}

        {/* Camera Capture */}
        {step === 'camera' && (
          <motion.div
            key="camera"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-grey-800 mb-2">Verify Your Identity</h2>
              <p className="text-grey-500">Take a selfie to verify your gender</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <CameraCapture
              onCapture={handleCapture}
              onError={handleCameraError}
              isProcessing={false}
            />

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

        {/* Processing */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold text-grey-800 mb-2">Analyzing...</h2>
            <p className="text-grey-500 text-sm">This only takes a moment</p>
          </motion.div>
        )}

        {/* Result */}
        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md"
          >
            <VerificationResult
              result={result}
              onContinue={handleContinue}
              onRetry={handleRetry}
            />
          </motion.div>
        )}

        {/* Error State */}
        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-grey-800 mb-2">Something went wrong</h2>
            <p className="text-grey-500 text-sm mb-4">{error}</p>
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
