/**
 * ============================================================================
 * HOME PAGE - index.jsx
 * ============================================================================
 * 
 * PURPOSE:
 * The main entry point for GreyRoom. This page handles:
 * 1. Landing page display with features and statistics
 * 2. User onboarding flow (nickname → bio → verification → match)
 * 3. Returning user session restoration
 * 
 * USER FLOW:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Landing Page (showLanding=true)                                        │
 * │       ↓ "Get Started" click                                             │
 * │  Welcome Screen (step='welcome')                                        │
 * │       ↓ "Continue" click                                                │
 * │  Nickname Input (step='nickname')                                       │
 * │       ↓ Submit nickname                                                 │
 * │  Bio Input (step='bio')                                                 │
 * │       ↓ Submit bio                                                      │
 * │  Registration with Socket Server                                        │
 * │       ↓ Success                                                         │
 * │  Redirect to /verify (gender verification)                              │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * RETURNING USERS:
 * - If user data exists in localStorage, they're automatically re-registered
 * - Redirects to /verify if not verified, or /match if verified
 * 
 * STATE:
 * - showLanding: Whether to show the landing page
 * - step: Current setup step ('welcome' | 'nickname' | 'bio')
 * - nickname: User's chosen display name
 * - bio: User's optional bio text
 * - hasClickedGetStarted: Prevents auto-redirect until user engages
 * 
 * SOCKET EVENTS:
 * - Emits: auth:register
 * - Listens: auth:register (for response)
 * 
 * ============================================================================
 */

import { useSocket } from 'context/SocketContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { appConfig } from 'config/config';
import { getDeviceId, saveUserData, getUserData } from 'utils/deviceId';
import { isUserVerified } from 'modules/verification';
import LandingPage from 'components/landing/LandingPage';

export default function Home() {
  // ========================================================================
  // HOOKS & STATE
  // ========================================================================
  
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  
  // UI state
  const [showLanding, setShowLanding] = useState(true);  // Show landing vs setup
  const [step, setStep] = useState('welcome');            // Setup wizard step
  
  // Form state
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  
  // Status state
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Prevents auto-redirect until user clicks "Get Started"
  const [hasClickedGetStarted, setHasClickedGetStarted] = useState(false);

  // ========================================================================
  // RETURNING USER HANDLING
  // ========================================================================

  /**
   * Effect: Check for existing session ONLY after user clicks Get Started
   * This prevents unexpected redirects when users just visit the landing page.
   */
  useEffect(() => {
    // Only check for existing session after user engagement
    if (!socket || !isConnected || !hasClickedGetStarted) return;
    
    const existingUser = getUserData();
    if (existingUser) {
      // Re-register with existing data
      socket.emit('auth:register', {
        deviceId: getDeviceId(),
        nickname: existingUser.nickname,
        bio: existingUser.bio,
        gender: existingUser.gender,
      });

      // Handle registration response
      const handleRegister = (response) => {
        if (response.success) {
          // Route based on verification status
          if (!isUserVerified()) {
            router.push('/verify');  // Needs gender verification
          } else {
            router.push('/match');   // Ready to match
          }
        }
      };

      socket.on('auth:register', handleRegister);
      return () => socket.off('auth:register', handleRegister);
    }
  }, [socket, isConnected, hasClickedGetStarted]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  /**
   * Handles "Get Started" button click from landing page.
   * Hides landing page and shows setup wizard.
   */
  const handleGetStarted = () => {
    setHasClickedGetStarted(true);
    setShowLanding(false);
  };

  /**
   * Handles back navigation to landing page.
   * Resets all setup state.
   */
  const handleBackToLanding = () => {
    setShowLanding(true);
    setHasClickedGetStarted(false);
    setStep('welcome');
    setNickname('');
    setBio('');
    setError(null);
  };

  /**
   * Advances from welcome screen to nickname input.
   */
  const handleStart = () => {
    setStep('nickname');
  };

  /**
   * Validates and submits the nickname.
   * Advances to bio input if valid.
   */
  const handleNicknameSubmit = (e) => {
    e.preventDefault();
    
    // Validation: required field
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }
    
    // Validation: length constraints
    if (nickname.length < 2 || nickname.length > 20) {
      setError('Nickname must be 2-20 characters');
      return;
    }

    setError(null);
    setStep('bio');
  };

  const handleBioSubmit = (e) => {
    e.preventDefault();
    
    if (!socket || !isConnected) {
      setError('Not connected to server. Please wait...');
      return;
    }

    setIsLoading(true);
    setError(null);

    const deviceId = getDeviceId();
    
    // Remove old listener first
    socket.off('auth:register');
    
    socket.emit('auth:register', {
      deviceId,
      nickname: nickname.trim(),
      bio: bio.trim(),
      gender: 'unspecified', // Will be set after verification
    });

    socket.once('auth:register', (response) => {
      setIsLoading(false);
      
      if (response.success) {
        saveUserData({
          nickname: nickname.trim(),
          bio: bio.trim(),
          deviceId,
        });
        // Go to verification page instead of match
        router.push('/verify');
      } else {
        setError(response.error || 'Registration failed');
      }
    });
  };

  // Show landing page first
  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Gradients */}
      <motion.div 
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-green/30 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent-blue/30 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          y: [0, -50, 0],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-accent-green/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Left Side - Floating Feature Tags */}
      <div className="hidden lg:block absolute left-8 xl:left-16 top-1/2 -translate-y-1/2 z-10">
        <div className="space-y-4">
          {[
            { icon: (<svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>), text: 'Secure', delay: 0 },
            { icon: (<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), text: 'Global', delay: 0.2 },
            { icon: (<svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>), text: 'Real-time', delay: 0.4 },
          ].map((tag, i) => (
            <motion.div
              key={i}
              className="glass px-4 py-3 rounded-card flex items-center gap-2 shadow-soft"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
              transition={{ 
                opacity: { delay: 0.5 + tag.delay, duration: 0.5 },
                x: { delay: 0.5 + tag.delay, duration: 0.5 },
                y: { delay: 1 + tag.delay, duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {tag.icon}
              <span className="text-text-primary font-medium text-sm">{tag.text}</span>
            </motion.div>
          ))}
        </div>
        
        {/* Testimonial bubble */}
        <motion.div
          className="glass px-5 py-4 rounded-mobile mt-8 max-w-[200px] shadow-soft"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center text-white text-sm">
              A
            </div>
            <div>
              <p className="text-text-primary text-xs font-medium">Alex</p>
              <div className="flex text-yellow-500 text-xs">★★★★★</div>
            </div>
          </div>
          <p className="text-text-muted text-xs italic">"Love the anonymity!"</p>
        </motion.div>
      </div>

      {/* Right Side - Floating Mobile Card & Tags */}
      <div className="hidden lg:block absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 z-10">
        {/* Mobile phone mockup */}
        <motion.div
          className="relative w-[180px] h-[360px] rounded-[36px] bg-panel border-2 border-grey-200 shadow-elevated overflow-hidden"
          initial={{ opacity: 0, x: 30, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 5, y: [0, -10, 0] }}
          transition={{ 
            opacity: { delay: 0.3, duration: 0.6 },
            x: { delay: 0.3, duration: 0.6 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {/* Phone screen content */}
          <div className="absolute inset-2 rounded-[28px] bg-gradient-to-br from-accent-green/40 to-accent-blue/40 flex items-center justify-center">
            <motion.div
              className="w-16 h-16 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-soft"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg className="w-8 h-8 text-grey-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </motion.div>
          </div>
          {/* Bottom pill */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-cta text-white text-xs px-4 py-2 rounded-full shadow-cta">
            Say Hello
          </div>
        </motion.div>

        {/* Feature tags */}
        <div className="mt-6 space-y-3">
          {[
            { icon: (<svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>), text: 'Video Chat', delay: 0.6 },
            { icon: (<svg className="w-5 h-5 text-grey-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), text: 'Anonymous', delay: 0.8 },
          ].map((tag, i) => (
            <motion.div
              key={i}
              className="glass px-4 py-3 rounded-card flex items-center gap-2 shadow-soft"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
              transition={{ 
                opacity: { delay: 0.5 + tag.delay, duration: 0.5 },
                x: { delay: 0.5 + tag.delay, duration: 0.5 },
                y: { delay: 1 + tag.delay, duration: 3.5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <span className="text-xl">{tag.icon}</span>
              <span className="text-text-primary font-medium text-sm">{tag.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Connection count */}
        <motion.div
          className="glass px-5 py-4 rounded-mobile mt-4 text-center shadow-soft"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.p 
            className="text-2xl font-bold text-text-primary"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            1M+
          </motion.p>
          <p className="text-text-muted text-xs">Connections</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo & Branding */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="/logo.jpeg" 
                alt="Greyroom" 
                className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-soft"
              />
            </motion.div>
            <h1 className="text-3xl font-bold text-text-primary">{appConfig.name}</h1>
            <p className="text-text-muted mt-2">{appConfig.tagline}</p>
          </motion.div>

          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {['welcome', 'nickname', 'bio'].map((s, i) => (
              <motion.div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === s ? 'w-8 bg-cta' : 
                  ['welcome', 'nickname', 'bio'].indexOf(step) > i ? 'w-2 bg-accent-green' : 'w-2 bg-grey-200'
                }`}
                animate={{ scale: step === s ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.2, 1, 0.3, 1] }}
                className="glass rounded-mobile p-8"
              >
                <div className="text-center mb-6">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 rounded-full icon-gradient flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg className="w-8 h-8 text-grey-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </motion.div>
                  <h2 className="text-2xl font-semibold text-text-primary mb-2">
                    Welcome to GreyRoom
                  </h2>
                  <p className="text-text-muted">
                    Connect with strangers anonymously and safely
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    { icon: (<svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>), text: 'Anonymous identity - no personal info needed' },
                    { icon: (<svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>), text: 'Real-time 1-on-1 video chat' },
                    { icon: (<svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), text: 'Ephemeral messages - nothing is stored' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-surface rounded-card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      whileHover={{ x: 5, backgroundColor: '#E9FFE9' }}
                    >
                      {item.icon}
                      <span className="text-text-primary text-sm">{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    onClick={handleBackToLanding}
                    className="flex-1 bg-surface hover:bg-grey-200 text-text-primary font-medium py-3.5 px-6 rounded-pill transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    onClick={handleStart}
                    className="flex-1 bg-cta text-white font-medium py-3.5 px-6 rounded-pill shadow-cta"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'nickname' && (
              <motion.div
                key="nickname"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.2, 1, 0.3, 1] }}
                className="glass rounded-mobile p-8"
              >
                <div className="text-center mb-6">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 rounded-full icon-gradient flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <svg className="w-8 h-8 text-grey-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </motion.div>
                  <h2 className="text-2xl font-semibold text-text-primary mb-2">
                    Choose a Nickname
                  </h2>
                  <p className="text-text-muted text-sm">
                    This is how others will see you
                  </p>
                </div>

                {error && (
                  <motion.div 
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-card mb-4 text-sm flex items-center gap-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span>⚠️</span>
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleNicknameSubmit}>
                  <motion.div
                    className="relative mb-6"
                    whileFocus={{ scale: 1.01 }}
                  >
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Enter nickname..."
                      maxLength={20}
                      className="w-full bg-surface border-2 border-transparent rounded-card px-5 py-4 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-green focus:bg-white transition-all text-lg"
                      autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                      {nickname.length}/20
                    </span>
                  </motion.div>
                  
                  <div className="flex gap-3">
                    <motion.button
                      type="button"
                      onClick={() => setStep('welcome')}
                      className="flex-1 bg-surface hover:bg-grey-200 text-text-primary font-medium py-3.5 px-6 rounded-pill transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ← Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="flex-1 bg-cta text-white font-medium py-3.5 px-6 rounded-pill shadow-cta"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Next →
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'bio' && (
              <motion.div
                key="bio"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.2, 1, 0.3, 1] }}
                className="glass rounded-mobile p-8"
              >
                <div className="text-center mb-6">
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 rounded-full icon-gradient flex items-center justify-center"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg className="w-8 h-8 text-grey-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </motion.div>
                  <h2 className="text-2xl font-semibold text-text-primary mb-2">
                    Add a Short Bio
                  </h2>
                  <p className="text-text-muted text-sm">
                    Optional - tell others about yourself
                  </p>
                </div>

                {error && (
                  <motion.div 
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-card mb-4 text-sm flex items-center gap-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span>⚠️</span>
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleBioSubmit}>
                  <motion.div className="relative mb-6">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="A few words about yourself..."
                      maxLength={100}
                      rows={3}
                      className="w-full bg-surface border-2 border-transparent rounded-card px-5 py-4 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-green focus:bg-white transition-all text-lg resize-none"
                    />
                    <span className="absolute right-4 bottom-4 text-text-muted text-sm">
                      {bio.length}/100
                    </span>
                  </motion.div>
                  
                  <div className="flex gap-3">
                    <motion.button
                      type="button"
                      onClick={() => setStep('nickname')}
                      className="flex-1 bg-surface hover:bg-grey-200 text-text-primary font-medium py-3.5 px-6 rounded-pill transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ← Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-cta text-white font-medium py-3.5 px-6 rounded-pill shadow-cta disabled:opacity-50 flex items-center justify-center gap-2"
                      whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -2 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <motion.div 
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Loading...
                        </>
                      ) : (
                        <>Start Chatting 🚀</>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connection Status */}
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className={`inline-flex items-center text-sm px-4 py-2 rounded-full ${
              isConnected ? 'bg-accent-green/50 text-green-700' : 'bg-grey-100 text-grey-400'
            }`}>
              <motion.span 
                className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-grey-300'}`}
                animate={isConnected ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {isConnected ? 'Connected to server' : 'Connecting...'}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

