import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PillButton from './PillButton';

export default function Navigation({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 glass-nav ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpeg" 
              alt="GreyRoom" 
              className="w-10 h-10 rounded-xl shadow-sm"
            />
            <span className="text-xl font-semibold text-text-primary">GreyRoom</span>
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-text-muted hover:text-text-primary transition-colors">
              Features
            </a>
            <a href="#benefits" className="text-text-muted hover:text-text-primary transition-colors">
              Benefits
            </a>
            <a href="#about" className="text-text-muted hover:text-text-primary transition-colors">
              About
            </a>
          </div>

          {/* CTA */}
          <PillButton onClick={onGetStarted} className="hidden sm:flex">
            Get Started
          </PillButton>

          {/* Mobile menu button */}
          <button className="sm:hidden p-2 text-text-primary" onClick={onGetStarted}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
