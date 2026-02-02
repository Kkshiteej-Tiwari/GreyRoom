/**
 * Camera Capture Component
 * 
 * Provides camera-only capture functionality.
 * Gallery/file uploads are strictly DISABLED to prevent catfishing.
 * 
 * Privacy Features:
 * - Only allows live camera capture
 * - No file input or gallery access
 * - Video stream is local only
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function CameraCapture({ onCapture, onError, isProcessing }) {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // Front camera by default
  const streamRef = useRef(null);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      // Check if running in browser
      if (typeof window === 'undefined') {
        console.error('Not running in browser environment');
        return;
      }

      // Check if mediaDevices API is available
      if (!navigator?.mediaDevices?.getUserMedia) {
        setHasPermission(false);
        onError?.('Camera access is not supported in this browser or context. Please use HTTPS or a modern browser.');
        return;
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setHasPermission(false);
      
      if (error.name === 'NotAllowedError') {
        onError?.('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        onError?.('No camera found. Please connect a camera.');
      } else {
        onError?.('Failed to access camera. Please try again.');
      }
    }
  }, [facingMode, onError]);

  // Initialize camera on mount
  useEffect(() => {
    startCamera();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  // Handle capture button click
  const handleCapture = () => {
    if (!videoRef.current || !isCameraReady || isProcessing) return;
    onCapture?.(videoRef.current);
  };

  // Switch between front and back camera
  const switchCamera = async () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Render permission denied state
  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-grey-50 rounded-2xl">
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

  return (
    <div className="flex flex-col items-center">
      {/* Camera Preview */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-grey-900 rounded-2xl overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />

        {/* Loading overlay */}
        {!isCameraReady && (
          <div className="absolute inset-0 bg-grey-900 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">Starting camera...</p>
            </div>
          </div>
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">Analyzing...</p>
            </div>
          </div>
        )}

        {/* Face guide overlay */}
        {isCameraReady && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-64 border-2 border-white/50 rounded-full"></div>
          </div>
        )}

        {/* Camera switch button */}
        <button
          onClick={switchCamera}
          disabled={isProcessing}
          className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors disabled:opacity-50"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Instructions */}
      <p className="text-grey-600 text-sm text-center mb-4">
        Position your face within the oval and ensure good lighting
      </p>

      {/* Capture Button */}
      <motion.button
        onClick={handleCapture}
        disabled={!isCameraReady || isProcessing}
        whileTap={{ scale: 0.95 }}
        className="w-20 h-20 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <div className="w-16 h-16 border-4 border-white rounded-full"></div>
      </motion.button>

      {/* Privacy notice */}
      <p className="text-grey-400 text-xs text-center mt-4 max-w-xs">
        🔒 Your image is processed locally and never uploaded or stored.
      </p>
    </div>
  );
}
