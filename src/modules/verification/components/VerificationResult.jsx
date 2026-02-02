/**
 * Verification Result Component
 * 
 * Displays the gender classification result.
 */

import { motion } from 'framer-motion';

export default function VerificationResult({ result, onContinue, onRetry }) {
  const isHighConfidence = result.confidence >= 70;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center p-8"
    >
      {/* Result Icon */}
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
        isHighConfidence ? 'bg-green-100' : 'bg-yellow-100'
      }`}>
        {isHighConfidence ? (
          <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-12 h-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      </div>

      {/* Result Text */}
      <h2 className="text-2xl font-bold text-grey-800 mb-2">
        {isHighConfidence ? 'Verification Complete!' : 'Low Confidence'}
      </h2>

      {/* Gender Result */}
      <div className="bg-grey-50 rounded-xl px-6 py-4 mb-4 text-center">
        <p className="text-grey-500 text-sm mb-1">Detected Gender</p>
        <p className="text-2xl font-semibold text-grey-800 capitalize">
          {result.gender}
        </p>
        <p className="text-grey-400 text-sm mt-1">
          Confidence: {result.confidence}%
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 max-w-xs">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-green-700 text-xs">
            Your image was processed locally and has been deleted. Only the result is stored.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full max-w-xs">
        {!isHighConfidence && (
          <button
            onClick={onRetry}
            className="flex-1 bg-grey-200 hover:bg-grey-300 text-grey-700 font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Retry
          </button>
        )}
        <button
          onClick={onContinue}
          className={`flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-xl transition-colors ${
            isHighConfidence ? 'w-full' : ''
          }`}
        >
          {isHighConfidence ? 'Continue' : 'Accept Anyway'}
        </button>
      </div>
    </motion.div>
  );
}
