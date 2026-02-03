import { useSocket } from 'context/SocketContext';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { appConfig, animations } from 'config/config';
import { getUserData } from 'utils/deviceId';

// Chat themes configuration
const chatThemes = {
  light: {
    name: 'Light',
    icon: '☀️',
    bg: 'bg-white',
    chatBg: 'bg-surface',
    ownMsg: 'bg-cta text-white',
    partnerMsg: 'bg-white text-text-primary shadow-soft',
    headerBg: 'glass-nav',
    inputBg: 'bg-surface',
  },
  dark: {
    name: 'Dark',
    icon: '🌙',
    bg: 'bg-grey-900',
    chatBg: 'bg-grey-800',
    ownMsg: 'bg-cta text-white',
    partnerMsg: 'bg-grey-700 text-white',
    headerBg: 'bg-grey-900/90 backdrop-blur-lg',
    inputBg: 'bg-grey-700',
  },
  ocean: {
    name: 'Ocean',
    icon: '🌊',
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-100',
    chatBg: 'bg-blue-50/50',
    ownMsg: 'bg-blue-600 text-white',
    partnerMsg: 'bg-white text-grey-800 shadow-soft',
    headerBg: 'bg-white/70 backdrop-blur-lg',
    inputBg: 'bg-white',
  },
  sunset: {
    name: 'Sunset',
    icon: '🌅',
    bg: 'bg-gradient-to-br from-orange-50 to-rose-100',
    chatBg: 'bg-orange-50/50',
    ownMsg: 'bg-gradient-to-r from-orange-500 to-rose-500 text-white',
    partnerMsg: 'bg-white text-grey-800 shadow-soft',
    headerBg: 'bg-white/70 backdrop-blur-lg',
    inputBg: 'bg-white',
  },
  forest: {
    name: 'Forest',
    icon: '🌲',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
    chatBg: 'bg-green-50/50',
    ownMsg: 'bg-emerald-600 text-white',
    partnerMsg: 'bg-white text-grey-800 shadow-soft',
    headerBg: 'bg-white/70 backdrop-blur-lg',
    inputBg: 'bg-white',
  },
};

export default function ChatRoom() {
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const { sessionId } = router.query;
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');

  const theme = chatThemes[currentTheme];

  // Check authentication and setup listeners
  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      router.push('/');
      return;
    }

    // Load saved theme preference
    const savedTheme = localStorage.getItem('chatTheme');
    if (savedTheme && chatThemes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }

    if (socket && sessionId) {
      // Re-register user
      socket.emit('auth:register', {
        deviceId: userData.deviceId,
        nickname: userData.nickname,
        bio: userData.bio,
        gender: userData.gender || 'unspecified',
      });

      // Listen for messages
      socket.on('chat:message', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      // Listen for typing indicator
      socket.on('chat:typing', (data) => {
        setPartnerInfo((prev) => prev || { nickname: data.nickname });
        setIsPartnerTyping(true);
        setTimeout(() => setIsPartnerTyping(false), 2000);
      });

      // Listen for partner leaving
      socket.on('chat:partnerLeft', (data) => {
        setChatEnded(true);
        setMessages((prev) => [
          ...prev,
          { id: 'system-left', content: data.message, isSystem: true },
        ]);
      });

      return () => {
        socket.off('chat:message');
        socket.off('chat:typing');
        socket.off('chat:partnerLeft');
      };
    }
  }, [socket, sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Save theme preference
  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem('chatTheme', themeName);
    setShowThemeSelector(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !socket || chatEnded) return;

    socket.emit('chat:send', { message: inputValue.trim() });
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleTyping = () => {
    if (socket && !chatEnded) {
      socket.emit('chat:typing');
    }
  };

  const handleLeaveChat = () => {
    if (socket) {
      socket.emit('chat:leave');
    }
    router.push('/match');
  };

  const handleNextMatch = () => {
    if (socket) {
      socket.emit('chat:leave');
    }
    router.push('/match');
  };

  const handleReport = (reason) => {
    if (socket) {
      socket.emit('chat:report', { reason });
    }
    setShowReportModal(false);
    handleLeaveChat();
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col relative overflow-hidden transition-colors duration-500`}>
      {/* Animated Background Elements */}
      {currentTheme === 'light' && (
        <>
          <motion.div 
            className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-accent-green/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-blue/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Header */}
      <header className={`relative z-20 ${theme.headerBg} border-b border-white/20 px-4 lg:px-6 py-3 transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className={`w-10 h-10 ${currentTheme === 'dark' ? 'bg-grey-700' : 'bg-surface'} rounded-full flex items-center justify-center shadow-soft`}>
              <svg className={`w-5 h-5 ${currentTheme === 'dark' ? 'text-grey-400' : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className={`font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-text-primary'}`}>
                {partnerInfo?.nickname || 'Stranger'}
              </p>
              <p className={`text-xs ${currentTheme === 'dark' ? 'text-grey-400' : 'text-text-muted'}`}>
                {chatEnded ? '🔴 Disconnected' : isPartnerTyping ? '✍️ Typing...' : '🟢 Online'}
              </p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-2">
            {/* Theme Selector Button */}
            <motion.button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className={`p-2.5 rounded-full ${currentTheme === 'dark' ? 'bg-grey-700 text-grey-300' : 'bg-surface text-text-muted'} hover:scale-105 transition-all`}
              whileTap={{ scale: 0.95 }}
              title="Change Theme"
            >
              <span className="text-lg">{theme.icon}</span>
            </motion.button>
            
            <motion.button
              onClick={() => setShowReportModal(true)}
              className={`p-2.5 rounded-full ${currentTheme === 'dark' ? 'bg-grey-700 text-grey-300 hover:text-red-400' : 'bg-surface text-text-muted hover:text-red-500'} transition-all`}
              whileTap={{ scale: 0.95 }}
              title="Report"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </motion.button>
            
            <motion.button
              onClick={handleLeaveChat}
              className={`p-2.5 rounded-full ${currentTheme === 'dark' ? 'bg-grey-700 text-grey-300 hover:text-white' : 'bg-surface text-text-muted hover:text-text-primary'} transition-all`}
              whileTap={{ scale: 0.95 }}
              title="Leave Chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Theme Selector Dropdown */}
        <AnimatePresence>
          {showThemeSelector && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-4 top-full mt-2 glass rounded-card p-2 shadow-elevated z-50"
            >
              <p className="text-xs text-text-muted px-3 py-2 font-medium">Select Theme</p>
              <div className="grid grid-cols-5 gap-1">
                {Object.entries(chatThemes).map(([key, t]) => (
                  <motion.button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className={`p-3 rounded-card flex flex-col items-center gap-1 transition-all ${
                      currentTheme === key ? 'bg-cta/20 ring-2 ring-cta' : 'hover:bg-surface'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-xs text-text-primary">{t.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Left Side Decoration - Hidden on mobile */}
      <div className="hidden xl:flex absolute left-6 top-1/2 -translate-y-1/2 z-10 flex-col gap-4">
        <motion.div
          className="glass px-4 py-3 rounded-card shadow-soft"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0, y: [0, -5, 0] }}
          transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
        >
          <span className="text-lg">💬</span>
          <span className="text-text-primary font-medium text-sm ml-2">Live Chat</span>
        </motion.div>
        <motion.div
          className="glass px-4 py-3 rounded-card shadow-soft"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0, y: [0, 5, 0] }}
          transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
        >
          <span className="text-lg">🔒</span>
          <span className="text-text-primary font-medium text-sm ml-2">End-to-End</span>
        </motion.div>
      </div>

      {/* Right Side Decoration - Hidden on mobile */}
      <div className="hidden xl:flex absolute right-6 top-1/2 -translate-y-1/2 z-10 flex-col gap-4">
        <motion.div
          className="glass px-4 py-3 rounded-card shadow-soft text-center"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-2xl font-bold text-text-primary">{messages.length}</p>
          <p className="text-text-muted text-xs">Messages</p>
        </motion.div>
        <motion.div
          className="glass px-4 py-3 rounded-card shadow-soft"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0, y: [0, 5, 0] }}
          transition={{ y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" } }}
        >
          <span className="text-lg">✨</span>
          <span className="text-text-primary font-medium text-sm ml-2">Anonymous</span>
        </motion.div>
      </div>

      {/* Chat Messages */}
      <main 
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-4 lg:p-6 ${theme.chatBg} transition-colors duration-500`}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {/* System message at start */}
          <motion.div 
            className="text-center py-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className={`text-sm ${currentTheme === 'dark' ? 'bg-grey-700 text-grey-300' : 'bg-white text-text-muted'} px-6 py-3 rounded-full inline-block shadow-soft`}>
              ✨ You're now chatting with a stranger. Say hi!
            </p>
          </motion.div>

          <AnimatePresence>
            {messages.map((message) => {
              // System message
              if (message.isSystem) {
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-2"
                  >
                    <p className={`text-sm ${currentTheme === 'dark' ? 'text-grey-400' : 'text-text-muted'}`}>{message.content}</p>
                  </motion.div>
                );
              }

              // Regular message
              return (
                <motion.div
                  key={message.id}
                  {...(message.isOwn ? animations.ownMessage : animations.receivedMessage)}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.isOwn
                        ? `${theme.ownMsg} rounded-br-md`
                        : `${theme.partnerMsg} rounded-bl-md`
                    }`}
                    whileHover={{ scale: 1.01 }}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.isOwn 
                        ? 'text-white/70' 
                        : currentTheme === 'dark' ? 'text-grey-400' : 'text-text-muted'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isPartnerTyping && !chatEnded && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className={`${theme.partnerMsg} rounded-2xl px-5 py-3`}>
                  <div className="flex gap-1.5">
                    <motion.span 
                      className={`w-2 h-2 ${currentTheme === 'dark' ? 'bg-grey-400' : 'bg-text-muted'} rounded-full`}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span 
                      className={`w-2 h-2 ${currentTheme === 'dark' ? 'bg-grey-400' : 'bg-text-muted'} rounded-full`}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.span 
                      className={`w-2 h-2 ${currentTheme === 'dark' ? 'bg-grey-400' : 'bg-text-muted'} rounded-full`}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Input Area */}
      <footer className={`relative z-20 ${theme.headerBg} border-t border-white/20 p-4 transition-colors duration-500`}>
        <div className="max-w-2xl mx-auto">
          {chatEnded ? (
            <motion.button
              onClick={handleNextMatch}
              className="w-full bg-cta text-white font-semibold py-4 px-6 rounded-pill shadow-cta flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Find New Match</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
                maxLength={appConfig.maxMessageLength}
                className={`flex-1 ${theme.inputBg} rounded-pill px-5 py-3.5 ${
                  currentTheme === 'dark' ? 'text-white placeholder-grey-400' : 'text-text-primary placeholder-text-muted'
                } focus:outline-none focus:ring-2 focus:ring-cta transition-all`}
                autoFocus
              />
              <motion.button
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-cta text-white p-3.5 rounded-full shadow-cta transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </motion.button>
            </form>
          )}
        </div>
      </footer>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass rounded-mobile p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-text-primary mb-2">Report User</h3>
              <p className="text-text-muted text-sm mb-4">
                Why are you reporting this user?
              </p>
              <div className="space-y-2">
                {['Inappropriate content', 'Harassment', 'Spam', 'Other'].map((reason) => (
                  <motion.button
                    key={reason}
                    onClick={() => handleReport(reason)}
                    className="w-full text-left px-4 py-3 rounded-card bg-surface hover:bg-grey-200 text-text-primary transition-all flex items-center gap-3"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-red-500">⚠️</span>
                    {reason}
                  </motion.button>
                ))}
              </div>
              <motion.button
                onClick={() => setShowReportModal(false)}
                className="w-full mt-4 py-3 text-text-muted hover:text-text-primary transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

