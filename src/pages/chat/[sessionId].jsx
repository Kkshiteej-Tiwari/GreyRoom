import { useSocket } from 'context/SocketContext';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { appConfig, animations } from 'config/config';
import { getUserData } from 'utils/deviceId';

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

  // Check authentication and setup listeners
  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      router.push('/');
      return;
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-grey-100 px-6 py-4 bg-white">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-grey-200 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-grey-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-grey-800">
                {partnerInfo?.nickname || 'Stranger'}
              </p>
              <p className="text-xs text-grey-500">
                {chatEnded ? 'Disconnected' : isPartnerTyping ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 text-grey-400 hover:text-red-500 transition-colors"
              title="Report"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </button>
            <button
              onClick={handleLeaveChat}
              className="p-2 text-grey-400 hover:text-grey-600 transition-colors"
              title="Leave Chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 bg-grey-50"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {/* System message at start */}
          <div className="text-center py-4">
            <p className="text-sm text-grey-500 bg-white px-4 py-2 rounded-full inline-block">
              You're now chatting with a stranger. Say hi!
            </p>
          </div>

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
                    <p className="text-sm text-grey-500">{message.content}</p>
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
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.isOwn
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-white text-grey-800 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-grey-400'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {isPartnerTyping && !chatEnded && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-grey-400 rounded-full typing-dot"></span>
                  <span className="w-2 h-2 bg-grey-400 rounded-full typing-dot"></span>
                  <span className="w-2 h-2 bg-grey-400 rounded-full typing-dot"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t border-grey-100 bg-white p-4">
        <div className="max-w-2xl mx-auto">
          {chatEnded ? (
            <div className="flex gap-3">
              <button
                onClick={handleNextMatch}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Find New Match
              </button>
            </div>
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
                className="flex-1 bg-grey-100 rounded-xl px-4 py-3 text-grey-800 placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-colors"
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-primary hover:bg-primary-dark text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </footer>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-semibold text-grey-800 mb-4">Report User</h3>
            <p className="text-grey-600 text-sm mb-4">
              Why are you reporting this user?
            </p>
            <div className="space-y-2">
              {['Inappropriate content', 'Harassment', 'Spam', 'Other'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleReport(reason)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-grey-50 hover:bg-grey-100 text-grey-700 transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowReportModal(false)}
              className="w-full mt-4 py-3 text-grey-500 hover:text-grey-700"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
