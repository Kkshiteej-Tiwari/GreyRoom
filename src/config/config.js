/* ============================================
   GREYROOM CONFIGURATION
   Controlled Anonymity Chat Platform
============================================ */

export const appConfig = {
  // Branding
  name: "Greyroom",
  tagline: "Controlled Anonymity",
  description: "Anonymous chat with privacy and safety",
  
  // Avatar Generation
  avatarAPI: "https://api.dicebear.com/7.x/avataaars/svg?seed=",
  
  // Chat Settings
  maxMessageLength: 1000,
  
  // Matching Settings
  matchCooldownMs: 3000, // 3 second cooldown between matches
  maxDailyMatches: 5,    // Freemium limit for specific gender filter
  
  // Device ID Settings
  deviceIdKey: "greyroom_device_id",
  userDataKey: "greyroom_user_data",
  matchCountKey: "greyroom_match_count",
  lastResetKey: "greyroom_last_reset",
};

// Animation presets for chat messages
export const animations = {
  ownMessage: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 },
  },
  receivedMessage: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.2 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
};

export default appConfig;
