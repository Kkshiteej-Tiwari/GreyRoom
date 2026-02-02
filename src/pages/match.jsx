import { useSocket } from 'context/SocketContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { appConfig } from 'config/config';
import { getUserData, getRemainingMatches, incrementMatchCount } from 'utils/deviceId';
import { isUserVerified, getVerifiedGender } from 'modules/verification';
import MiniGames from 'components/MiniGames';

export default function MatchPage() {
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  const [status, setStatus] = useState('idle'); // idle, searching, matched
  const [genderFilter, setGenderFilter] = useState('any');
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [remainingMatches, setRemainingMatches] = useState(5);
  const [queuePosition, setQueuePosition] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [userGender, setUserGender] = useState(null);

  // Check authentication and verification
  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      router.push('/');
      return;
    }

    // Check verification status
    const verified = isUserVerified();
    setIsVerified(verified);
    
    if (verified) {
      setUserGender(getVerifiedGender());
    }

    if (socket) {
      // Re-register with verified gender
      const gender = getVerifiedGender() || userData.gender || 'unspecified';
      
      socket.emit('auth:register', {
        deviceId: userData.deviceId,
        nickname: userData.nickname,
        bio: userData.bio,
        gender: gender,
      });

      // Get platform stats
      socket.emit('platform:stats');
      socket.on('platform:stats', (stats) => {
        setOnlineCount(stats.online || 0);
      });

      // Listen for match found
      socket.on('match:found', (data) => {
        setStatus('matched');
        setPartnerInfo(data.partner);
        incrementMatchCount();
        // Navigate to chat with session ID
        router.push(`/chat/${data.sessionId}`);
      });

      // Listen for queue status updates
      socket.on('queue:status', (data) => {
        if (data.inQueue) {
          setQueuePosition(data.position);
        }
      });

      // Poll stats
      const statsInterval = setInterval(() => {
        socket.emit('platform:stats');
      }, 5000);

      return () => {
        clearInterval(statsInterval);
        socket.off('match:found');
        socket.off('queue:status');
        socket.off('platform:stats');
      };
    }
  }, [socket]);

  useEffect(() => {
    setRemainingMatches(getRemainingMatches());
  }, []);

  const handleStartSearch = () => {
    if (!socket) return;

    setStatus('searching');
    socket.emit('queue:join', { preferredGender: genderFilter });

    // Update remaining matches if using specific filter
    if (genderFilter !== 'any') {
      setRemainingMatches(getRemainingMatches());
    }
  };

  const handleCancelSearch = () => {
    if (!socket) return;

    setStatus('idle');
    socket.emit('queue:leave');
  };

  const handleLogout = () => {
    if (socket) {
      socket.emit('auth:logout');
    }
    localStorage.clear();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-grey-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Greyroom" className="w-10 h-10 rounded-xl" />
            <span className="font-semibold text-grey-800">{appConfig.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-grey-500">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              {onlineCount} online
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-grey-500 hover:text-grey-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Idle State */}
          {status === 'idle' && (
            <div className="bg-grey-50 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-grey-800 text-center mb-2">
                Find a Stranger
              </h2>
              <p className="text-grey-500 text-center mb-8">
                Connect with someone new anonymously
              </p>

              {/* Gender Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-grey-700 mb-3">
                  Who do you want to chat with?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['any', 'male', 'female'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setGenderFilter(option)}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                        genderFilter === option
                          ? 'bg-primary text-white'
                          : 'bg-white border border-grey-200 text-grey-700 hover:border-grey-300'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
                {genderFilter !== 'any' && (
                  <p className="text-xs text-grey-500 mt-2">
                    {remainingMatches} specific matches remaining today
                  </p>
                )}
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartSearch}
                disabled={genderFilter !== 'any' && remainingMatches <= 0}
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Matching
              </button>

              {genderFilter !== 'any' && remainingMatches <= 0 && (
                <p className="text-xs text-red-500 text-center mt-3">
                  Daily limit reached. Use "Any" filter or wait until tomorrow.
                </p>
              )}
            </div>
          )}

          {/* Searching State */}
          {status === 'searching' && (
            <div className="space-y-4">
              <div className="bg-grey-50 rounded-2xl p-8 shadow-sm text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="absolute inset-0 border-4 border-grey-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h2 className="text-xl font-semibold text-grey-800 mb-2">
                    Looking for a stranger...
                  </h2>
                  <p className="text-grey-500 text-sm">
                    {queuePosition ? `Position in queue: ${queuePosition}` : 'Please wait'}
                  </p>
                </div>

                <button
                  onClick={handleCancelSearch}
                  className="bg-grey-200 hover:bg-grey-300 text-grey-700 font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Mini Games while waiting */}
              <MiniGames />
            </div>
          )}

          {/* Matched State (brief transition) */}
          {status === 'matched' && (
            <div className="bg-grey-50 rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-grey-800 mb-2">
                Match Found!
              </h2>
              <p className="text-grey-500">
                Connecting you with {partnerInfo?.nickname || 'a stranger'}...
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
