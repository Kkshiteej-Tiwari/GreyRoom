import { useSocket } from 'context/SocketContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { appConfig } from 'config/config';
import { getDeviceId, saveUserData, getUserData } from 'utils/deviceId';
import { isUserVerified } from 'modules/verification';

export default function Home() {
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  
  const [step, setStep] = useState('welcome'); // welcome, nickname, bio
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    const existingUser = getUserData();
    if (existingUser) {
      // Re-register with existing data
      socket.emit('auth:register', {
        deviceId: getDeviceId(),
        nickname: existingUser.nickname,
        bio: existingUser.bio,
        gender: existingUser.gender,
      });

      const handleRegister = (response) => {
        if (response.success) {
          // Check if user needs verification
          if (!isUserVerified()) {
            router.push('/verify');
          } else {
            router.push('/match');
          }
        }
      };

      socket.on('auth:register', handleRegister);
      return () => socket.off('auth:register', handleRegister);
    }
  }, [socket, isConnected]);

  const handleStart = () => {
    setStep('nickname');
  };

  const handleNicknameSubmit = (e) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }
    
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo.jpeg" 
            alt="Greyroom" 
            className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg"
          />
          <h1 className="text-3xl font-bold text-grey-800">{appConfig.name}</h1>
          <p className="text-grey-500 mt-2">{appConfig.tagline}</p>
        </div>

        {/* Welcome Step */}
        {step === 'welcome' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-grey-50 rounded-2xl p-8 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-grey-800 text-center mb-4">
              Welcome to Greyroom
            </h2>
            <p className="text-grey-600 text-center mb-6">
              Connect with strangers anonymously and safely. No email or phone required.
            </p>
            <ul className="text-grey-600 text-sm space-y-2 mb-6">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Anonymous identity - no personal info needed
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Real-time 1-on-1 chat with strangers
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Ephemeral messages - nothing is stored
              </li>
            </ul>
            <button
              onClick={handleStart}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Get Started
            </button>
          </motion.div>
        )}

        {/* Nickname Step */}
        {step === 'nickname' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-grey-50 rounded-2xl p-8 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-grey-800 text-center mb-2">
              Choose a Nickname
            </h2>
            <p className="text-grey-500 text-center mb-6 text-sm">
              This is how others will see you
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleNicknameSubmit}>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter nickname..."
                maxLength={20}
                className="w-full bg-white border border-grey-200 rounded-xl px-4 py-3 text-grey-800 placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('welcome')}
                  className="flex-1 bg-grey-200 hover:bg-grey-300 text-grey-700 font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Next
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Bio Step */}
        {step === 'bio' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-grey-50 rounded-2xl p-8 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-grey-800 text-center mb-2">
              Add a Short Bio
            </h2>
            <p className="text-grey-500 text-center mb-6 text-sm">
              Optional - tell others a bit about yourself
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleBioSubmit}>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A few words about yourself... (optional)"
                maxLength={100}
                rows={3}
                className="w-full bg-white border border-grey-200 rounded-xl px-4 py-3 text-grey-800 placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4 resize-none"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('nickname')}
                  className="flex-1 bg-grey-200 hover:bg-grey-300 text-grey-700 font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Start Chatting'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Connection Status */}
        <div className="text-center mt-6">
          <span className={`inline-flex items-center text-sm ${isConnected ? 'text-green-600' : 'text-grey-400'}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-grey-300'}`}></span>
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
