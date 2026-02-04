/**
 * ============================================================================
 * GREYROOM CONFIGURATION - config.js
 * ============================================================================
 * 
 * PURPOSE:
 * Centralized configuration file for the GreyRoom application.
 * All app-wide settings, constants, and configurations are defined here.
 * 
 * SECTIONS:
 * 1. Branding - App name, tagline, description
 * 2. API Settings - External service configurations
 * 3. Chat Settings - Message length limits
 * 4. Matching Settings - Queue and matching parameters
 * 5. Feature Flags - Enable/disable features
 * 6. Storage Keys - localStorage key names
 * 7. Animation Presets - Framer Motion configurations
 * 
 * ============================================================================
 */

/**
 * Main Application Configuration
 * 
 * This object contains all configurable values for the application.
 * Modify these values to customize the app's behavior.
 */
export const appConfig = {
  // ========================================================================
  // BRANDING
  // ========================================================================
  
  /** Application name displayed throughout the UI */
  name: "Greyroom",
  
  /** Tagline shown on landing page */
  tagline: "Controlled Anonymity",
  
  /** Meta description for SEO */
  description: "Anonymous chat with privacy and safety",
  
  // ========================================================================
  // EXTERNAL API SETTINGS
  // ========================================================================
  
  /**
   * DiceBear Avatar API
   * 
   * Used to generate random avatars for users.
   * The seed parameter creates consistent avatars for the same input.
   * 
   * Usage: `${avatarAPI}${username}` generates avatar for that username
   */
  avatarAPI: "https://api.dicebear.com/7.x/avataaars/svg?seed=",
  
  // ========================================================================
  // CHAT SETTINGS
  // ========================================================================
  
  /**
   * Maximum allowed message length in characters.
   * Messages exceeding this length should be truncated or rejected.
   */
  maxMessageLength: 1000,
  
  // ========================================================================
  // MATCHING SETTINGS
  // ========================================================================
  
  /**
   * Cooldown period between matches in milliseconds.
   * Prevents rapid-fire matching to reduce server load.
   * 3000ms = 3 seconds between match attempts
   */
  matchCooldownMs: 3000,
  
  /**
   * FREEMIUM LIMIT: Maximum daily matches with gender filter
   * 
   * Free users can only use gender-specific matching N times per day.
   * "Any" gender matching is unlimited.
   * This encourages premium upgrades while keeping the app free to use.
   */
  maxDailyMatches: 5,
  
  // ========================================================================
  // FEATURE FLAGS
  // ========================================================================
  
  /**
   * Enable GPT-5.2-Codex AI features for all clients.
   * When enabled, AI-powered features become available.
   */
  enableGPT52Codex: true,
  
  // ========================================================================
  // LOCAL STORAGE KEYS
  // ========================================================================
  // These keys are used to store data in the browser's localStorage.
  // Changing these will reset all user data (use with caution).
  
  /** Key for storing the unique device identifier */
  deviceIdKey: "greyroom_device_id",
  
  /** Key for storing user profile data (nickname, bio, gender) */
  userDataKey: "greyroom_user_data",
  
  /** Key for tracking daily gender-filtered match count */
  matchCountKey: "greyroom_match_count",
  
  /** Key for storing the last date match count was reset */
  lastResetKey: "greyroom_last_reset",
};

/**
 * Animation Presets for Framer Motion
 * 
 * Pre-configured animation objects for consistent animations throughout the app.
 * These follow the Framer Motion API with initial, animate, exit, and transition.
 * 
 * USAGE:
 * import { animations } from 'config/config';
 * <motion.div {...animations.ownMessage}>Content</motion.div>
 */
export const animations = {
  /**
   * Animation for messages sent by the current user.
   * Slides in from the right with fade-in effect.
   */
  ownMessage: {
    initial: { opacity: 0, x: 20 },     // Start invisible, 20px to the right
    animate: { opacity: 1, x: 0 },       // Fade in and slide to position
    exit: { opacity: 0, x: -20 },        // Fade out and slide left when removed
    transition: { duration: 0.2 },        // 200ms animation duration
  },
  
  /**
   * Animation for messages received from other users.
   * Slides in from the left with fade-in effect.
   */
  receivedMessage: {
    initial: { opacity: 0, x: -20 },    // Start invisible, 20px to the left
    animate: { opacity: 1, x: 0 },       // Fade in and slide to position
    exit: { opacity: 0, x: 20 },         // Fade out and slide right when removed
    transition: { duration: 0.2 },        // 200ms animation duration
  },
  
  /**
   * Simple fade-in animation.
   * Useful for general content that should appear smoothly.
   */
  fadeIn: {
    initial: { opacity: 0 },             // Start invisible
    animate: { opacity: 1 },             // Fade to visible
    transition: { duration: 0.3 },        // 300ms animation duration
  },
};

// Default export for convenient importing
export default appConfig;
