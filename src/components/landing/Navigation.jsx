import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PillButton from "./PillButton";

export default function Navigation({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking a link
  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 glass-nav ${scrolled ? "scrolled" : ""}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-[64px] sm:h-[72px]">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/logo.jpeg"
                alt="GreyRoom"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-sm"
              />
              <span className="text-lg sm:text-xl font-semibold text-text-primary">
                GreyRoom
              </span>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                Benefits
              </a>
              <a
                href="#about"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                About
              </a>
            </div>

            {/* CTA - Desktop */}
            <PillButton onClick={onGetStarted} className="hidden md:flex">
              Get Started
            </PillButton>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className="absolute top-[64px] left-0 right-0 bg-white shadow-lg border-t border-grey-100"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-4 py-4 space-y-1">
                <a
                  href="#features"
                  onClick={(e) => handleNavClick(e, "#features")}
                  className="block px-4 py-3 text-text-primary font-medium rounded-xl hover:bg-surface transition-colors"
                >
                  Features
                </a>
                <a
                  href="#benefits"
                  onClick={(e) => handleNavClick(e, "#benefits")}
                  className="block px-4 py-3 text-text-primary font-medium rounded-xl hover:bg-surface transition-colors"
                >
                  Benefits
                </a>
                <a
                  href="#about"
                  onClick={(e) => handleNavClick(e, "#about")}
                  className="block px-4 py-3 text-text-primary font-medium rounded-xl hover:bg-surface transition-colors"
                >
                  About
                </a>
                <div className="pt-2">
                  <PillButton
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onGetStarted();
                    }}
                    className="w-full justify-center"
                  >
                    Get Started
                  </PillButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
