/**
 * Face Detection & Gender Classification Utility
 * 
 * Uses face-api.js for browser-based ML inference.
 * No server communication - all processing happens locally.
 */

let faceapi = null;
let modelsLoaded = false;

// Model URLs - using jsDelivr CDN for face-api models
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

/**
 * Dynamically import face-api.js (for Next.js compatibility)
 */
export async function loadFaceApi() {
  if (faceapi) return faceapi;
  
  // Dynamic import for client-side only
  const faceApiModule = await import('@vladmandic/face-api');
  faceapi = faceApiModule;
  return faceapi;
}

/**
 * Load the required ML models for face detection and gender classification
 * Models are loaded from CDN and cached by the browser
 */
export async function loadModels(onProgress) {
  if (modelsLoaded) return true;

  try {
    const api = await loadFaceApi();
    
    onProgress?.('Loading face detection model...');
    await api.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    
    onProgress?.('Loading gender classification model...');
    await api.nets.ageGenderNet.loadFromUri(MODEL_URL);
    
    modelsLoaded = true;
    onProgress?.('Models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face-api models:', error);
    throw new Error('Failed to load verification models. Please check your connection.');
  }
}

/**
 * Check if models are loaded
 */
export function areModelsLoaded() {
  return modelsLoaded;
}

/**
 * Detect face and classify gender from a video element or image
 * 
 * @param {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement} input - Media element
 * @returns {Promise<{gender: string, confidence: number, age: number} | null>}
 * 
 * PRIVACY: The input is processed in memory only.
 * No data is sent to any server.
 */
export async function detectGender(input) {
  if (!modelsLoaded) {
    throw new Error('Models not loaded. Call loadModels() first.');
  }

  const api = await loadFaceApi();

  try {
    // Detect face with gender and age
    const detection = await api
      .detectSingleFace(input, new api.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.5,
      }))
      .withAgeAndGender();

    if (!detection) {
      return null; // No face detected
    }

    return {
      gender: detection.gender, // 'male' or 'female'
      confidence: Math.round(detection.genderProbability * 100),
      age: Math.round(detection.age),
      faceScore: Math.round(detection.detection.score * 100),
    };
  } catch (error) {
    console.error('Gender detection error:', error);
    throw new Error('Failed to process image. Please try again.');
  }
}

/**
 * Verify gender from a video stream (captures current frame)
 * 
 * @param {HTMLVideoElement} videoElement - The video element with camera stream
 * @returns {Promise<{gender: string, confidence: number} | null>}
 */
export async function verifyGenderFromVideo(videoElement) {
  if (!videoElement || videoElement.readyState < 2) {
    throw new Error('Video stream not ready');
  }

  // Create a temporary canvas to capture the frame
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);

  // Process the captured frame
  const result = await detectGender(canvas);

  // Clear the canvas data (privacy)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 0;
  canvas.height = 0;

  return result;
}

export default {
  loadFaceApi,
  loadModels,
  areModelsLoaded,
  detectGender,
  verifyGenderFromVideo,
};
