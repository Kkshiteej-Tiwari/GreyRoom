import { motion } from "framer-motion";
import Navigation from "./Navigation";
import PillButton from "./PillButton";
import TickerBar from "./TickerBar";
import GlassCard from "./GlassCard";
import HighlightText from "./HighlightText";

export default function LandingPage({ onGetStarted }) {
  // Word flip animation for headline
  const headlineWords = ["Empower", "Connections", "with GreyRoom"];

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
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      title: "Anonymous & Secure",
      description:
        "No personal information required. Your identity stays private with end-to-end encryption.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Instant Connection",
      description:
        "Get matched with someone new in seconds. Real-time video chat with zero setup.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Ephemeral Chats",
      description:
        "Nothing is stored. Once you disconnect, the conversation disappears forever.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Face Verification",
      description:
        "AI-powered face detection ensures real human connections, no bots allowed.",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <Navigation onGetStarted={onGetStarted} />

      {/* Hero Section */}
      <section className="pt-[80px] sm:pt-[100px] lg:pt-[120px] pb-12 sm:pb-16 lg:pb-24 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="max-w-[720px] text-center lg:text-left">
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
                className="text-base sm:text-lg text-text-muted mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.8,
                  ease: [0.2, 1, 0.3, 1],
                }}
              >
                Instant, real-time video connections with strangers worldwide.
                Anonymous, secure, and completely ephemeral.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1, ease: [0.2, 1, 0.3, 1] }}
              >
                <PillButton onClick={onGetStarted}>Try Out</PillButton>
                <PillButton
                  variant="ghost"
                  onClick={() =>
                    document
                      .getElementById("benefits")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Learn More
                </PillButton>
              </motion.div>

              {/* Mobile Stats - Visible only on mobile */}
              <motion.div
                className="flex md:hidden justify-center gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 1.2,
                  ease: [0.2, 1, 0.3, 1],
                }}
              >
                <div className="px-4 py-3 bg-white rounded-2xl shadow-md border border-grey-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-green/30 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        10K+
                      </p>
                      <p className="text-[10px] text-text-muted">Users</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-white rounded-2xl shadow-md border border-grey-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent-blue/30 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        100%
                      </p>
                      <p className="text-[10px] text-text-muted">Anonymous</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right - Hero Visual */}
            <div className="relative h-[500px] lg:h-[600px] hidden md:block">
              {/* Main centered device mockup */}
              <motion.div
                className="absolute right-8 top-0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                  ease: [0.2, 1, 0.3, 1],
                }}
              >
                {/* Device frame */}
                <motion.div
                  className="relative w-[280px] h-[520px] rounded-[40px] bg-gradient-to-br from-grey-100 to-grey-200 p-3 shadow-2xl"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {/* Screen */}
                  <div className="relative w-full h-full rounded-[32px] bg-gradient-to-br from-accent-green/20 via-white to-accent-blue/20 overflow-hidden">
                    {/* Status bar */}
                    <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-center">
                      <div className="w-20 h-5 bg-black rounded-full" />
                    </div>

                    {/* Video feed placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-green/40 to-accent-blue/40 flex items-center justify-center backdrop-blur-sm"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <svg
                          className="w-12 h-12 text-grey-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </motion.div>
                    </div>

                    {/* Live indicator */}
                    <motion.div
                      className="absolute top-12 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-500"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-xs font-medium text-grey-700">
                        Live
                      </span>
                    </motion.div>

                    {/* Connection status */}
                    <motion.div
                      className="absolute top-12 right-4 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.4 }}
                    >
                      <span className="text-xs font-medium text-grey-700">
                        🔒 Secure
                      </span>
                    </motion.div>

                    {/* User avatars indicator */}
                    <motion.div
                      className="absolute bottom-20 inset-x-0 flex flex-col items-center justify-center gap-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.6 }}
                    >
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white" />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white" />
                      </div>
                      <span className="text-xs text-grey-600 font-medium">
                        Connecting...
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating stats cards */}
              <motion.div
                className="absolute top-4 left-0 px-4 py-3 bg-white rounded-2xl shadow-lg border border-grey-100"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.8 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-accent-green"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-text-primary">10K+</p>
                    <p className="text-xs text-text-muted">Active Users</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-[340px] left-8 px-4 py-3 bg-white rounded-2xl shadow-lg border border-grey-100"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 2 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-accent-blue"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-text-primary">100%</p>
                    <p className="text-xs text-text-muted">Anonymous</p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative gradient circles */}
              <div className="absolute top-20 right-40 w-48 h-48 bg-accent-green/30 rounded-full blur-3xl" />
              <div className="absolute bottom-32 left-16 w-40 h-40 bg-accent-blue/30 rounded-full blur-3xl" />
              <div className="absolute top-1/2 right-16 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Bar */}
      <TickerBar />

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-12 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-12 bg-surface"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-10 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.2, 1, 0.3, 1] }}
          >
            <h2 className="text-2xl sm:text-4xl lg:text-section font-display text-text-primary mb-3 sm:mb-4">
              Our <HighlightText>Benefits</HighlightText>
            </h2>
            <p className="text-text-muted text-sm sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
              Experience the future of anonymous video chat with features
              designed for privacy and connection.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => (
              <GlassCard key={index} className="flex gap-3 sm:gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cta flex items-center justify-center flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-1 sm:mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-text-muted text-sm sm:text-base">
                    {benefit.description}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section
        id="features"
        className="py-12 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.2, 1, 0.3, 1] }}
              className="text-center lg:text-left"
            >
              <h2 className="text-2xl sm:text-4xl lg:text-section font-display text-text-primary mb-4 sm:mb-6">
                Elevate Your <HighlightText>Connections</HighlightText>
              </h2>
              <p className="text-text-muted text-sm sm:text-lg mb-6 sm:mb-8">
                GreyRoom uses advanced face verification to ensure every
                connection is with a real person. No bots, no fake profiles—just
                genuine human interaction in a safe environment.
              </p>
              <ul className="space-y-3 sm:space-y-4 inline-block text-left">
                {[
                  "AI-powered face detection",
                  "Gender verification system",
                  "Smart matching algorithm",
                  "Real-time video quality",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-text-primary text-sm sm:text-base"
                  >
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent-green flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
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
              <div className="bg-panel rounded-3xl sm:rounded-mobile p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-green/20 to-accent-blue/20" />
                <div className="relative z-10 text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full icon-gradient flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-grey-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-text-primary mb-2">
                    Ready to Connect?
                  </h3>
                  <p className="text-text-muted mb-6">
                    Join thousands of users making genuine connections.
                  </p>
                  <PillButton onClick={onGetStarted}>Start Now</PillButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-12 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-12 bg-surface relative overflow-hidden"
      >
        {/* Decorative animated background elements */}
        <motion.div
          className="absolute top-10 left-10 w-32 sm:w-64 h-32 sm:h-64 bg-accent-green/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-40 sm:w-80 h-40 sm:h-80 bg-accent-blue/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-10 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.2, 1, 0.3, 1] }}
          >
            <h2 className="text-2xl sm:text-4xl lg:text-section font-display text-text-primary mb-3 sm:mb-4">
              About <HighlightText>GreyRoom</HighlightText>
            </h2>
            <p className="text-text-muted text-sm sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
              We believe in meaningful connections without compromising privacy.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-10 sm:mb-16">
            {/* Stats Cards */}
            {[
              {
                number: "100K+",
                label: "Active Users",
                icon: (
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-violet-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
              },
              {
                number: "1M+",
                label: "Connections Made",
                icon: (
                  <svg
                    className="w-8 h-8 text-violet-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                ),
              },
              {
                number: "99.9%",
                label: "Uptime",
                icon: (
                  <svg
                    className="w-8 h-8 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="glass rounded-card p-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.2, 1, 0.3, 1],
                }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.div
                  className="flex justify-center mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
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
                <h3 className="text-2xl font-semibold text-text-primary mb-4">
                  Our Mission
                </h3>
                <p className="text-text-muted mb-6">
                  GreyRoom was created to provide a safe, anonymous space for
                  people to connect with others around the world. We prioritize
                  privacy above all else—no data collection, no tracking, just
                  genuine human interaction.
                </p>
                <p className="text-text-muted">
                  Our advanced face verification ensures every user is a real
                  person, creating a trusted community while maintaining
                  complete anonymity.
                </p>
              </div>
              <div className="relative">
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  {[
                    {
                      icon: (
                        <svg
                          className="w-4 h-4 text-amber-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      ),
                      label: "Privacy First",
                    },
                    {
                      icon: (
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ),
                      label: "Global Community",
                    },
                    {
                      icon: (
                        <svg
                          className="w-4 h-4 text-amber-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      ),
                      label: "Real-time",
                    },
                    {
                      icon: (
                        <svg
                          className="w-4 h-4 text-amber-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      ),
                      label: "Human Verified",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="bg-surface rounded-card p-4 text-center flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.icon}
                      <span className="text-text-primary font-medium">
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-12 bg-cta text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/logo.jpeg"
                alt="GreyRoom"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl"
              />
              <span className="text-lg sm:text-xl font-semibold">GreyRoom</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-sm sm:text-base">
              <a
                href="#features"
                className="text-white/70 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-white/70 hover:text-white transition-colors"
              >
                Benefits
              </a>
              <a
                href="#about"
                className="text-white/70 hover:text-white transition-colors"
              >
                About
              </a>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-center sm:text-left">
            <p className="text-white/60 text-xs sm:text-sm">
              © 2026 GreyRoom. Connect anonymously, securely.
            </p>
            <p className="text-white/40 text-xs sm:text-sm">
              Built with privacy in mind
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
