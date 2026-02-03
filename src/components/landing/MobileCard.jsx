import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function MobileCard({ 
  image, 
  ctaText = 'Say Hello', 
  ctaIcon,
  animationDelay = 0,
  floatDuration = 4,
  className,
}) {
  return (
    <motion.div
      className={clsx('mobile-card transition-all duration-300', className)}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.7, 
        delay: animationDelay,
        ease: [0.2, 1, 0.3, 1] 
      }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {/* Video/Image placeholder */}
      <div className="absolute inset-0">
        {image ? (
          <img 
            src={image} 
            alt="Video chat" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent-green/30 to-accent-blue/30 flex items-center justify-center">
            <motion.div 
              className="w-20 h-20 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg className="w-8 h-8 text-grey-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </motion.div>
          </div>
        )}
      </div>
      
      {/* Animated gradient overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Bottom CTA pill */}
      <motion.div 
        className="bottom-pill"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {ctaIcon && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ctaIcon} />
          </svg>
        )}
        <span>{ctaText}</span>
      </motion.div>
    </motion.div>
  );
}


