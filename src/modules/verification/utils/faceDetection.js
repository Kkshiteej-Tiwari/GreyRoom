/**
 * ============================================================================
 * FACE DETECTION & GENDER CLASSIFICATION - faceDetection.js
 * ============================================================================
 * 
 * PURPOSE:
 * This module provides browser-based machine learning capabilities for
 * face detection and gender classification using the face-api.js library.
 * 
 * KEY FEATURES:
 * - All ML inference runs locally in the browser (no server required)
 * - Uses TinyFaceDetector for lightweight, fast face detection
 * - Classifies gender with confidence scores
 * - Provides age estimation as a bonus feature
 * 
 * PRIVACY ARCHITECTURE ("DELETE-AFTER-VERIFY"):
 * - Video frames are processed entirely in browser memory
 * - NO image data is ever sent to any server
 * - NO face embeddings or biometric data is stored
 * - Only the classification result (gender, confidence) is retained
 * - Temporary canvas data is cleared immediately after processing
 * 
 * TECHNICAL DETAILS:
 * - Models: TinyFaceDetector + AgeGenderNet
 * - Model source: jsDelivr CDN (cached by browser)
 * - Input: Video element, Image element, or Canvas
 * - Output: { gender: 'male'|'female', confidence: 0-100, age: number }
 * 
 * ============================================================================
 */

// Module-level variables for singleton pattern
let faceapi = null;           // face-api.js library reference
let modelsLoaded = false;     // Flag to track if ML models are ready

// CDN URL for face-api.js pre-trained models
// Using jsDelivr for reliable, fast model delivery
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

/**
 * Dynamically imports the face-api.js library.
 * 
 * WHY DYNAMIC IMPORT?
 * - face-api.js requires browser APIs (canvas, WebGL)
 * - Dynamic import ensures it only loads on client-side
 * - Prevents Next.js SSR errors
 * - Library is cached after first load
 * 
 * @returns {Promise<Object>} The face-api.js module
 */
export async function loadFaceApi() {
  // Return cached reference if already loaded
  if (faceapi) return faceapi;
  
  // Dynamic import for client-side only execution
  const faceApiModule = await import('@vladmandic/face-api');
  faceapi = faceApiModule;
  return faceapi;
}

/**
 * Loads the required ML models for face detection and gender classification.
 * 
 * MODELS LOADED:
 * 1. TinyFaceDetector - Lightweight face detection model (~190KB)
 *    - Fast inference suitable for real-time video
 *    - Lower accuracy than SSD but much faster
 * 
 * 2. AgeGenderNet - Age and gender classification model (~420KB)
 *    - Classifies detected faces as male/female
 *    - Provides age estimation
 *    - Returns confidence scores
 * 
 * Models are loaded from CDN and cached by the browser for subsequent visits.
 * 
 * @param {Function} onProgress - Optional callback for progress updates
 * @returns {Promise<boolean>} true if models loaded successfully
 * @throws {Error} If model loading fails
 */
export async function loadModels(onProgress) {
  // Skip if models already loaded (singleton pattern)
  if (modelsLoaded) return true;

  try {
    // First, ensure face-api.js library is loaded
    const api = await loadFaceApi();
    
    // Load face detection model
    onProgress?.('Loading face detection model...');
    await api.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    
    // Load gender/age classification model
    onProgress?.('Loading gender classification model...');
    await api.nets.ageGenderNet.loadFromUri(MODEL_URL);
    
    // Mark models as ready
    modelsLoaded = true;
    onProgress?.('Models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face-api models:', error);
    throw new Error('Failed to load verification models. Please check your connection.');
  }
}

/**
 * Checks if ML models are loaded and ready for inference.
 * 
 * @returns {boolean} true if models are ready
 */
export function areModelsLoaded() {
  return modelsLoaded;
}

/**
 * Detects a face and classifies gender from a media element.
 * 
 * PRIVACY GUARANTEE:
 * This function processes the input entirely in browser memory.
 * No data is sent to any server. The input image/video is NOT stored.
 * 
 * DETECTION PARAMETERS:
 * - inputSize: 416 (balance between accuracy and speed)
 * - scoreThreshold: 0.5 (minimum confidence to detect a face)
 * 
 * @param {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement} input - Media source
 * @returns {Promise<Object|null>} Detection result or null if no face found
 *   - gender: 'male' or 'female'
 *   - confidence: 0-100 (percentage)
 *   - age: estimated age (rounded)
 *   - faceScore: face detection confidence (0-100)
 * @throws {Error} If models not loaded or processing fails
 */
export async function detectGender(input) {
  // Ensure models are loaded before attempting detection
  if (!modelsLoaded) {
    throw new Error('Models not loaded. Call loadModels() first.');
  }

  const api = await loadFaceApi();

  try {
    // Run face detection with gender and age classification
    // TinyFaceDetectorOptions configures the detection sensitivity
    const detection = await api
      .detectSingleFace(input, new api.TinyFaceDetectorOptions({
        inputSize: 416,        // Input image size (larger = more accurate, slower)
        scoreThreshold: 0.5,   // Minimum confidence threshold for face detection
      }))
      .withAgeAndGender();     // Chain gender/age classification

    // Return null if no face was detected
    if (!detection) {
      return null;
    }

    // Return only the classification results (NOT the image data)
    return {
      gender: detection.gender,                              // 'male' or 'female'
      confidence: Math.round(detection.genderProbability * 100),  // Convert to percentage
      age: Math.round(detection.age),                        // Estimated age
      faceScore: Math.round(detection.detection.score * 100), // Face detection confidence
    };
  } catch (error) {
    console.error('Gender detection error:', error);
    throw new Error('Failed to process image. Please try again.');
  }
}

/**
 * Verifies gender from a live video stream by capturing the current frame.
 * 
 * PROCESS:
 * 1. Create temporary canvas element
 * 2. Draw current video frame to canvas
 * 3. Run ML inference on canvas
 * 4. IMMEDIATELY clear and destroy canvas (privacy)
 * 5. Return only classification result
 * 
 * PRIVACY MEASURES:
 * - Canvas is created in memory only
 * - Canvas data is explicitly cleared after use
 * - Canvas dimensions are set to 0 to release memory
 * - No reference to the image data is retained
 * 
 * @param {HTMLVideoElement} videoElement - Video element with active camera stream
 * @returns {Promise<Object|null>} Detection result or null
 * @throws {Error} If video stream is not ready
 */
export async function verifyGenderFromVideo(videoElement) {
  // Validate video element is ready
  // readyState >= 2 means enough data is available for current frame
  if (!videoElement || videoElement.readyState < 2) {
    throw new Error('Video stream not ready');
  }

  // Create a temporary canvas to capture the current video frame
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  // Draw the current video frame onto the canvas
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);

  // Process the captured frame through ML inference
  const result = await detectGender(canvas);

  // ========== PRIVACY: CLEAR ALL IMAGE DATA ==========
  // Clear the canvas content
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Set dimensions to 0 to release memory
  canvas.width = 0;
  canvas.height = 0;
  // Canvas will be garbage collected, no image data retained
  // ===================================================

  return result;
}

/**
 * ============================================================================
 * DEFAULT EXPORT - Bundled verification functions
 * ============================================================================
 */
export default {
  loadFaceApi,           // Load face-api.js library
  loadModels,            // Load ML models from CDN
  areModelsLoaded,       // Check if models ready
  detectGender,          // Classify gender from media element
  verifyGenderFromVideo, // Classify from live video stream
};
