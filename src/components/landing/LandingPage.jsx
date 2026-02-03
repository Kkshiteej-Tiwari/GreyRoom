import { motion } from 'framer-motion';
import Navigation from './Navigation';
import PillButton from './PillButton';
import MobileCard from './MobileCard';
import TickerBar from './TickerBar';
import GlassCard from './GlassCard';
import HighlightText from './HighlightText';
import FloatingTag from './FloatingTag';

export default function LandingPage({ onGetStarted }) {
  // Word flip animation for headline
  const headlineWords = ['Empower', 'Connections', 'with GreyRoom'];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      rotateX: -90,
      y: 20,
    },
    visible: { 
      opacity: 1, 
      rotateX: 0,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.2, 1, 0.3, 1],
      },
    },
  };

  const benefits = [
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Anonymous & Secure',
      description: 'No personal information required. Your identity stays private with end-to-end encryption.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Instant Connection',
      description: 'Get matched with someone new in seconds. Real-time video chat with zero setup.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Ephemeral Chats',
      description: 'Nothing is stored. Once you disconnect, the conversation disappears forever.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Face Verification',
      description: 'AI-powered face detection ensures real human connections, no bots allowed.',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <Navigation onGetStarted={onGetStarted} />

      {/* Hero Section */}
      <section className="pt-[120px] pb-16 lg:pb-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="max-w-[720px]">
              {/* Headline with word flip */}
              <motion.div
                className="perspective mb-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {headlineWords.map((word, index) => (
                  <motion.h1
                    key={index}
                    className="text-hero-sm md:text-hero-md xl:text-hero font-display text-text-primary word-flip-item block"
                    variants={wordVariants}
                  >
                    {index === 2 ? (
                      <>
                        with <HighlightText>GreyRoom</HighlightText>
                      </>
                    ) : (
                      word
                    )}
                  </motion.h1>
                ))}
              </motion.div>

              {/* Subtext */}
              <motion.p
                className="text-lg text-text-muted mb-8 max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: [0.2, 1, 0.3, 1] }}
              >
                Instant, real-time video connections with strangers worldwide. 
                Anonymous, secure, and completely ephemeral.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1, ease: [0.2, 1, 0.3, 1] }}
              >
                <PillButton onClick={onGetStarted}>
                  Try Out
                </PillButton>
                <PillButton variant="ghost" onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}>
                  Learn More
                </PillButton>
              </motion.div>
            </div>

            {/* Right - Floating Mobile Cards */}
            <div className="relative h-[500px] lg:h-[600px] hidden md:block">
              {/* Floating tags */}
              <FloatingTag
                icon={<svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                text="Video Chat"
                className="absolute top-8 left-0 z-20"
                delay={1.2}
              />
              <FloatingTag
                icon={<svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                text="Anonymous"
                className="absolute bottom-24 left-4 z-20"
                delay={1.4}
              />

              {/* Stacked mobile cards */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-[-60px]">
                <motion.div
                  className="relative z-10"
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MobileCard 
                    ctaText="Say Hello" 
                    animationDelay={0.2}
                  />
                </motion.div>
                
                <motion.div
                  className="absolute top-16 -left-20 z-0 opacity-80 scale-90"
                  animate={{ y: [8, -8, 8] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <MobileCard 
                    ctaText="Start Chat" 
                    animationDelay={0.4}
                  />
                </motion.div>

                <motion.div
                  className="absolute top-32 -left-40 z-0 opacity-60 scale-75"
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <MobileCard 
                    ctaText="Connect" 
                    animationDelay={0.6}
                  />
                </motion.div>
              </div>

              {/* Decorative gradient circles */}
              <div className="absolute top-20 right-20 w-32 h-32 bg-accent-green/40 rounded-full blur-3xl" />
              <div className="absolute bottom-20 left-20 w-40 h-40 bg-accent-blue/40 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Bar */}
      <TickerBar />

      {/* Benefits Section */}
      <section id="benefits" className="py-20 lg:py-32 px-6 lg:px-12 bg-surface">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.2, 1, 0.3, 1] }}
          >
            <h2 className="text-section font-display text-text-primary mb-4">
              Our <HighlightText>Benefits</HighlightText>
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Experience the future of anonymous video chat with features designed for privacy and connection.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <GlassCard key={index} className="flex gap-5">
                <div className="w-12 h-12 rounded-full bg-cta flex items-center justify-center flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-text-muted">
                    {benefit.description}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section id="features" className="py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.2, 1, 0.3, 1] }}
            >
              <h2 className="text-section font-display text-text-primary mb-6">
                Elevate Your <HighlightText>Connections</HighlightText>
              </h2>
              <p className="text-text-muted text-lg mb-8">
                GreyRoom uses advanced face verification to ensure every connection is with a real person. 
                No bots, no fake profiles—just genuine human interaction in a safe environment.
              </p>
              <ul className="space-y-4">
                {['AI-powered face detection', 'Gender verification system', 'Smart matching algorithm', 'Real-time video quality'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-text-primary">
                    <span className="w-6 h-6 rounded-full bg-accent-green flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.2, 1, 0.3, 1] }}
            >
              <div className="bg-panel rounded-mobile p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-green/20 to-accent-blue/20" />
                <div className="relative z-10 text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full icon-gradient flex items-center justify-center">
                    <svg className="w-12 h-12 text-grey-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-text-primary mb-2">Ready to Connect?</h3>
                  <p className="text-text-muted mb-6">Join thousands of users making genuine connections.</p>
                  <PillButton onClick={onGetStarted}>
                    Start Now
                  </PillButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 lg:py-32 px-6 lg:px-12 bg-surface relative overflow-hidden">
        {/* Decorative animated background elements */}
        <motion.div 
          className="absolute top-10 left-10 w-64 h-64 bg-accent-green/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-80 h-80 bg-accent-blue/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.2, 1, 0.3, 1] }}
          >
            <h2 className="text-section font-display text-text-primary mb-4">
              About <HighlightText>GreyRoom</HighlightText>
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              We believe in meaningful connections without compromising privacy.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Stats Cards */}
            {[
              { number: '100K+', label: 'Active Users', icon: '👥' },
              { number: '1M+', label: 'Connections Made', icon: '🔗' },
              { number: '99.9%', label: 'Uptime', icon: '⚡' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="glass rounded-card p-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.2, 1, 0.3, 1] }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.div 
                  className="text-4xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                >
                  {stat.icon}
                </motion.div>
                <motion.h3 
                  className="text-4xl font-bold text-text-primary mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  {stat.number}
                </motion.h3>
                <p className="text-text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="glass rounded-mobile p-8 lg:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.2, 1, 0.3, 1] }}
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-text-primary mb-4">Our Mission</h3>
                <p className="text-text-muted mb-6">
                  GreyRoom was created to provide a safe, anonymous space for people to connect 
                  with others around the world. We prioritize privacy above all else—no data 
                  collection, no tracking, just genuine human interaction.
                </p>
                <p className="text-text-muted">
                  Our advanced face verification ensures every user is a real person, 
                  creating a trusted community while maintaining complete anonymity.
                </p>
              </div>
              <div className="relative">
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  {['🔒 Privacy First', '🌍 Global Community', '⚡ Real-time', '🤝 Human Verified'].map((item, i) => (
                    <motion.div
                      key={i}
                      className="bg-surface rounded-card p-4 text-center"
                      whileHover={{ scale: 1.05, rotate: [-1, 1, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-text-primary font-medium">{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-cta text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="GreyRoom" className="w-10 h-10 rounded-xl" />
              <span className="text-xl font-semibold">GreyRoom</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#benefits" className="text-white/70 hover:text-white transition-colors">Benefits</a>
              <a href="#about" className="text-white/70 hover:text-white transition-colors">About</a>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              © 2026 GreyRoom. Connect anonymously, securely.
            </p>
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </motion.div>
              <motion.div 
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
