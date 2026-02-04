/**
 * ============================================================================
 * CAMERA CAPTURE COMPONENT - CameraCapture.jsx
 * ============================================================================
 * 
 * PURPOSE:
 * Provides camera capture functionality for gender verification.
 * Displays live video preview and allows users to take a selfie.
 * 
 * ANTI-CATFISHING MEASURES:
 * - ONLY allows live camera capture (no gallery/file uploads)
 * - No file input element is provided
 * - Users must take a real-time photo to verify
 * 
 * PRIVACY FEATURES:
 * - Video stream stays local (never sent to server)
 * - Camera stops when component unmounts
 * - Clear privacy notice displayed to users
 * 
 * FEATURES:
 * - Front/back camera switching (for mobile devices)
 * - Camera permission handling with error states
 * - Face guide overlay for better positioning
 * - Processing overlay during ML inference
 * 
 * PROPS:
 * - onCapture(videoElement): Called when user clicks capture button
 * - onError(message): Called when camera errors occur
 * - isProcessing: Boolean to show processing overlay
 * 
 * ============================================================================
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function CameraCapture({ onCapture, onError, isProcessing }) {
  // ========================================================================
  // STATE AND REFS
  // ========================================================================
  
  /** Ref to the video element for capturing frames */
  const videoRef = useRef(null);
  
  /** Ref to store the MediaStream for cleanup */
  const streamRef = useRef(null);
  
  /** Camera permission state: null (loading), true (granted), false (denied) */
  const [hasPermission, setHasPermission] = useState(null);
  
  /** Whether the camera stream is active and video is playing */
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  /** Camera facing mode: 'user' (front) or 'environment' (back) */
  const [facingMode, setFacingMode] = useState('user');

  // ========================================================================
  // CAMERA MANAGEMENT
  // ========================================================================

  /**
   * Starts the camera stream with specified facing mode.
   * 
   * This function:
   * 1. Validates browser environment and API availability
   * 2. Stops any existing stream (prevents memory leaks)
   * 3. Requests camera access with specified constraints
   * 4. Attaches stream to video element
   * 5. Handles various error scenarios
   */
  const startCamera = useCallback(async () => {
    try {
      // Guard against server-side rendering
      if (typeof window === 'undefined') {
        console.error('Not running in browser environment');
        return;
      }

      // Check if mediaDevices API is available
      // This may fail on HTTP (non-HTTPS) connections or old browsers
      if (!navigator?.mediaDevices?.getUserMedia) {
        setHasPermission(false);
        onError?.('Camera access is not supported in this browser or context. Please use HTTPS or a modern browser.');
        return;
      }

      // Stop any existing stream to prevent multiple streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Define camera constraints
      const constraints = {
        video: {
          facingMode: facingMode,    // 'user' for front, 'environment' for back
          width: { ideal: 640 },      // Requested width (browser may adjust)
          height: { ideal: 480 },     // Requested height
        },
        audio: false,                 // No audio needed for verification
      };

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setHasPermission(false);
      
      // Provide user-friendly error messages
      if (error.name === 'NotAllowedError') {
        onError?.('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        onError?.('No camera found. Please connect a camera.');
      } else {
        onError?.('Failed to access camera. Please try again.');
      }
    }
  }, [facingMode, onError]);

  // ========================================================================
  // LIFECYCLE
  // ========================================================================

  /**
   * Initialize camera on mount and cleanup on unmount.
   * Re-runs when facingMode changes (camera switch).
   */
  useEffect(() => {
    startCamera();

    // Cleanup function - stop all tracks when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  /**
   * Handles the capture button click.
   * Passes the video element to parent for ML processing.
   */
  const handleCapture = () => {
    // Prevent capture if camera not ready or already processing
    if (!videoRef.current || !isCameraReady || isProcessing) return;
    // Pass video element to parent - parent will handle frame capture
    onCapture?.(videoRef.current);
  };

  /**
   * Switches between front and back camera.
   * Triggers re-initialization via useEffect dependency.
   */
  const switchCamera = async () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // ========================================================================
  // RENDER - PERMISSION DENIED STATE
  // ========================================================================

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-grey-50 rounded-2xl">
        {/* Error icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-grey-800 mb-2">Camera Access Required</h3>
        <p className="text-grey-600 text-center text-sm mb-4">
          Please allow camera access to verify your identity.
        </p>
        <button
          onClick={startCamera}
          className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ========================================================================
  // RENDER - MAIN CAMERA UI
  // ========================================================================

  return (
    <div className="flex flex-col items-center">
      {/* ================================================================
          CAMERA PREVIEW CONTAINER
          ================================================================ */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-grey-900 rounded-2xl overflow-hidden mb-4">
        {/* Video element - hidden until camera ready */}
        <video
          ref={videoRef}
          autoPlay
          playsInline        // Required for iOS Safari
          muted              // Required for autoplay
          className="w-full h-full object-cover"
          // Mirror front camera for natural selfie experience
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />

        {/* Loading overlay - shown while camera is starting */}
        {!isCameraReady && (
          <div className="absolute inset-0 bg-grey-900 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">Starting camera...</p>
            </div>
          </div>
        )}

        {/* Processing overlay - shown during ML inference */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">Analyzing...</p>
            </div>
          </div>
        )}

        {/* Face guide overlay - helps user position face correctly */}
        {isCameraReady && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-64 border-2 border-white/50 rounded-full"></div>
          </div>
        )}

        {/* Camera switch button (front/back) */}
        <button
          onClick={switchCamera}
          disabled={isProcessing}
          className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors disabled:opacity-50"
        >
          {/* Camera flip icon */}
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* ================================================================
          INSTRUCTIONS TEXT
          ================================================================ */}
      <p className="text-grey-600 text-sm text-center mb-4">
        Position your face within the oval and ensure good lighting
      </p>

      {/* ================================================================
          CAPTURE BUTTON
          Large circular button for taking the selfie
          ================================================================ */}
      <motion.button
        onClick={handleCapture}
        disabled={!isCameraReady || isProcessing}
        whileTap={{ scale: 0.95 }}
        className="w-20 h-20 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {/* Inner ring design (like a camera shutter) */}
        <div className="w-16 h-16 border-4 border-white rounded-full"></div>
      </motion.button>

      {/* ================================================================
          PRIVACY NOTICE
          Reassures users about local processing
          ================================================================ */}
      <p className="text-grey-400 text-xs text-center mt-4 max-w-xs flex items-center justify-center gap-1">
        {/* Lock icon */}
        <svg className="w-4 h-4 text-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        Your image is processed locally and never uploaded or stored.
      </p>
    </div>
  );
}
