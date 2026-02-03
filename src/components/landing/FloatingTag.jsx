import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function FloatingTag({ icon, text, className, delay = 0 }) {
  return (
    <motion.div
      className={clsx('floating-tag', className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.32, 
        delay,
        ease: [0.2, 0.9, 0.2, 1] 
      }}
    >
      <div className="w-9 h-9 rounded-full bg-cta flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="text-sm font-medium text-text-primary truncate">{text}</span>
    </motion.div>
  );
}
