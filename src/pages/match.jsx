/**
 * ============================================================================
 * MATCH PAGE - match.jsx
 * ============================================================================
 * 
 * PURPOSE:
 * The matching queue page where users wait to be paired with strangers.
 * Users can select their gender filter preference and wait in the queue.
 * 
 * FEATURES:
 * - Gender filter selection (Anyone/Male/Female)
 * - Real-time queue position display
 * - Live online user count
 * - Interactive mini-games while waiting
 * - Animated background and UI elements
 * 
 * USER FLOW:
 * 1. User arrives from index.jsx after setup
 * 2. User selects gender preference (limited daily for specific genders)
 * 3. User clicks "Find Someone" to join queue
 * 4. While waiting: shows queue position, online count, mini-games
 * 5. On match found: automatically redirects to chat/[sessionId]
 * 
 * SOCKET EVENTS:
 * - Emits: auth:register, platform:stats, queue:join, queue:leave, auth:logout
 * - Listens: platform:stats, match:found, queue:status
 * 
 * STATE:
 * - status: 'idle' | 'searching' | 'matched' - Current matching state
 * - genderFilter: 'any' | 'male' | 'female' - Selected preference
 * - queuePosition: Position in queue
 * - onlineCount: Total users online
 * - isVerified: Whether user completed gender verification
 * 
 * ============================================================================
 */

import { useSocket } from 'context/SocketContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { appConfig } from 'config/config';
import { getUserData, getRemainingMatches, incrementMatchCount } from 'utils/deviceId';
import { isUserVerified, getVerifiedGender } from 'modules/verification';
import MiniGames from 'components/MiniGames';

export default function MatchPage() {
  // ========================================================================
  // HOOKS & STATE
  // ========================================================================
  
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  // Matching state machine: idle -> searching -> matched
  const [status, setStatus] = useState('idle');
  
  // Gender filter: 'any', 'male', or 'female'
  const [genderFilter, setGenderFilter] = useState('any');
  
  // Partner info when match is found
  const [partnerInfo, setPartnerInfo] = useState(null);
  
  // Freemium: remaining daily matches with gender filter
  const [remainingMatches, setRemainingMatches] = useState(5);
  
  // Current position in the matching queue
  const [queuePosition, setQueuePosition] = useState(null);
  
  // Total users currently online
  const [onlineCount, setOnlineCount] = useState(0);
  
  // Whether user has completed gender verification
  const [isVerified, setIsVerified] = useState(false);
  
  // User's verified gender (if verified)
  const [userGender, setUserGender] = useState(null);

  // ========================================================================
  // AUTHENTICATION & SOCKET SETUP
  // ========================================================================
  
  /**
   * Effect: Initialize page on mount
   * - Verify user is logged in (redirect if not)
   * - Check verification status
   * - Register with socket server
   * - Set up event listeners
   */
  useEffect(() => {
    // Check if user has completed setup
    const userData = getUserData();
    if (!userData) {
      router.push('/');  // Redirect to home if not logged in
      return;
    }

    // Check gender verification status
    const verified = isUserVerified();
    setIsVerified(verified);
    
    if (verified) {
      setUserGender(getVerifiedGender());
    }

    // Socket event setup
    if (socket) {
      // Re-register with server (includes verified gender)
      const gender = getVerifiedGender() || userData.gender || 'unspecified';
      
      socket.emit('auth:register', {
        deviceId: userData.deviceId,
        nickname: userData.nickname,
        bio: userData.bio,
        gender: gender,
      });

      // Request platform statistics
      socket.emit('platform:stats');
      socket.on('platform:stats', (stats) => {
        setOnlineCount(stats.online || 0);
      });

      // Handle match found event
      // This fires when the server pairs us with another user
      socket.on('match:found', (data) => {
        setStatus('matched');
        setPartnerInfo(data.partner);
        incrementMatchCount();  // Update freemium counter
        // Navigate to chat room with the session ID
        router.push(`/chat/${data.sessionId}`);
      });

      // Handle queue position updates
      socket.on('queue:status', (data) => {
        if (data.inQueue) {
          setQueuePosition(data.position);
        }
      });

      // Poll stats every 5 seconds for live count
      const statsInterval = setInterval(() => {
        socket.emit('platform:stats');
      }, 5000);

      // Cleanup on unmount
      return () => {
        clearInterval(statsInterval);
        socket.off('match:found');
        socket.off('queue:status');
        socket.off('platform:stats');
      };
    }
  }, [socket]);

  /**
   * Effect: Update remaining matches count on mount
   */
  useEffect(() => {
    setRemainingMatches(getRemainingMatches());
  }, []);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  /**
   * Starts searching for a match.
   * Joins the matching queue with selected gender preference.
   */
  const handleStartSearch = () => {
    if (!socket) return;

    setStatus('searching');
    socket.emit('queue:join', { preferredGender: genderFilter });

    // Update remaining matches display if using specific filter
    if (genderFilter !== 'any') {
      setRemainingMatches(getRemainingMatches());
    }
  };

  /**
   * Cancels the current search.
   * Removes user from the matching queue.
   */
  const handleCancelSearch = () => {
    if (!socket) return;

    setStatus('idle');
    socket.emit('queue:leave');
  };

  /**
   * Logs out the user.
   * Emits logout event, clears local storage, and redirects home.
   */
  const handleLogout = () => {
    if (socket) {
      socket.emit('auth:logout');
    }
    localStorage.clear();
    router.push('/');
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* ================================================================
          ANIMATED BACKGROUND GRADIENTS
          Creates a dynamic, organic feel while waiting for matches
          ================================================================ */}
      <motion.div 
        className="absolute top-[-30%] left-[-20%] w-[600px] h-[600px] bg-accent-green/25 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          opacity: [0.25, 0.4, 0.25]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-30%] right-[-20%] w-[700px] h-[700px] bg-accent-blue/25 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          y: [0, -30, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[50%] right-[30%] w-[250px] h-[250px] bg-accent-green/15 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.4, 1],
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* ================================================================
          HEADER NAVIGATION
          Shows logo, online count, and logout button
          ================================================================ */}
      <header className="relative z-20 glass-nav border-b border-white/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <img src="/logo.jpeg" alt="Greyroom" className="w-10 h-10 rounded-xl shadow-soft" />
            <span className="font-semibold text-text-primary">{appConfig.name}</span>
          </motion.div>
          
          {/* Online count and logout */}
          <div className="flex items-center gap-4">
            {/* Live online indicator */}
            <motion.div 
              className="glass px-4 py-2 rounded-full flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Pulsing green dot */}
              <motion.span 
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm text-text-primary font-medium">{onlineCount} online</span>
            </motion.div>
            
            {/* Logout button */}
            <motion.button
              onClick={handleLogout}
              className="text-sm text-text-muted hover:text-text-primary transition-colors px-4 py-2 rounded-full hover:bg-surface"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>
        </div>
      </header>

      {/* ================================================================
          LEFT SIDE DECORATIONS
          Feature badges that float on large screens
          ================================================================ */}
      <div className="hidden xl:block absolute left-12 top-1/2 -translate-y-1/2 z-10">
        <div className="space-y-4">
          {[
            { icon: (<svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>), text: 'Secure', delay: 0 },
            { icon: (<svg className="w-5 h-5 text-grey-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), text: 'Anonymous', delay: 0.2 },
            { icon: (<svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>), text: 'Real-time', delay: 0.4 },
          ].map((tag, i) => (
            <motion.div
              key={i}
              className="glass px-4 py-3 rounded-card flex items-center gap-2 shadow-soft"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
              transition={{ 
                opacity: { delay: 0.5 + tag.delay, duration: 0.5 },
                x: { delay: 0.5 + tag.delay, duration: 0.5 },
                y: { delay: 1.5 + tag.delay, duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {tag.icon}
              <span className="text-text-primary font-medium text-sm">{tag.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Side Decorations */}
      <div className="hidden xl:block absolute right-12 top-1/2 -translate-y-1/2 z-10">
        <motion.div
          className="glass px-6 py-5 rounded-mobile text-center shadow-soft mb-4"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.p 
            className="text-3xl font-bold text-text-primary"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {onlineCount}+
          </motion.p>
          <p className="text-text-muted text-sm">Users Online</p>
        </motion.div>
        
        <div className="space-y-3">
          {[
            { icon: (<svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>), text: 'Video Chat', delay: 0.8 },
            { icon: (<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), text: 'Worldwide', delay: 1 },
          ].map((tag, i) => (
            <motion.div
              key={i}
              className="glass px-4 py-3 rounded-card flex items-center gap-2 shadow-soft"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0, y: [0, 6, 0] }}
              transition={{ 
                opacity: { delay: 0.5 + tag.delay, duration: 0.5 },
                x: { delay: 0.5 + tag.delay, duration: 0.5 },
                y: { delay: 1.5 + tag.delay, duration: 3.5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {tag.icon}
              <span className="text-text-primary font-medium text-sm">{tag.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Idle State */}
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-mobile p-8"
              >
                <div className="text-center mb-6">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-4 rounded-full icon-gradient flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg className="w-10 h-10 text-grey-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </motion.div>
                  <h2 className="text-2xl font-semibold text-text-primary mb-2">
                    Find a Stranger
                  </h2>
                  <p className="text-text-muted">
                    Connect with someone new anonymously
                  </p>
                </div>

                {/* Gender Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-3">
                    Who do you want to chat with?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'any', label: 'Anyone' },
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => setGenderFilter(option.value)}
                        className={`py-4 px-4 rounded-card text-sm font-medium transition-all ${
                          genderFilter === option.value
                            ? 'bg-cta text-white shadow-cta'
                            : 'bg-surface text-text-primary hover:bg-grey-200'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                  {genderFilter !== 'any' && (
                    <p className="text-xs text-text-muted mt-3 text-center">
                      <span className="bg-accent-green/50 px-2 py-1 rounded-full">{remainingMatches}</span> specific matches remaining today
                    </p>
                  )}
                </div>

                {/* Start Button */}
                <motion.button
                  onClick={handleStartSearch}
                  disabled={genderFilter !== 'any' && remainingMatches <= 0}
                  className="w-full bg-cta text-white font-semibold py-4 px-6 rounded-pill shadow-cta transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Start Matching</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>

                {genderFilter !== 'any' && remainingMatches <= 0 && (
                  <p className="text-xs text-red-500 text-center mt-3">
                    Daily limit reached. Use "Anyone" filter or wait until tomorrow.
                  </p>
                )}
              </motion.div>
            )}

            {/* Searching State */}
            {status === 'searching' && (
              <motion.div
                key="searching"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="glass rounded-mobile p-8 text-center">
                  <div className="mb-6">
                    <motion.div 
                      className="w-20 h-20 mx-auto mb-4 relative"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute inset-0 rounded-full border-4 border-surface" />
                      <div className="absolute inset-0 rounded-full border-4 border-cta border-t-transparent" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-text-primary mb-2">
                      Looking for a stranger...
                    </h2>
                    <p className="text-text-muted text-sm">
                      {queuePosition ? (
                        <span className="bg-accent-green/50 px-3 py-1 rounded-full">Position: #{queuePosition}</span>
                      ) : 'Please wait'}
                    </p>
                  </div>

                  <motion.button
                    onClick={handleCancelSearch}
                    className="bg-surface hover:bg-grey-200 text-text-primary font-medium py-3 px-8 rounded-pill transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>

                {/* Mini Games while waiting */}
                <MiniGames />
              </motion.div>
            )}

            {/* Matched State (brief transition) */}
            {status === 'matched' && (
              <motion.div 
                key="matched"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-mobile p-8 text-center"
              >
                <motion.div 
                  className="w-20 h-20 bg-accent-green rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  Match Found!
                </h2>
                <p className="text-text-muted">
                  Connecting you with {partnerInfo?.nickname || 'a stranger'}...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}

