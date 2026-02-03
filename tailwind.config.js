/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'grey': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        'primary': '#3b82f6',
        'primary-dark': '#2563eb',
        // Landing page design tokens
        'surface': '#F6F7F7',
        'panel': '#F2F6F5',
        'text-primary': '#0B0C0D',
        'text-muted': '#7A7E80',
        'cta': '#0B0C0D',
        'accent-green': '#DFF8D6',
        'accent-blue': '#D6F0FF',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['96px', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '600' }],
        'hero-md': ['64px', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '600' }],
        'hero-sm': ['36px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'section': ['48px', { lineHeight: '1.1', fontWeight: '500' }],
      },
      borderRadius: {
        'card': '18px',
        'mobile': '36px',
        'pill': '22px',
      },
      boxShadow: {
        'soft': '0 18px 36px rgba(11, 16, 20, 0.06)',
        'soft-sm': '0 8px 20px rgba(11, 16, 20, 0.04)',
        'glass': '0 20px 40px rgba(0, 0, 0, 0.05)',
        'elevated': '0 26px 56px rgba(11, 16, 20, 0.08)',
        'cta': '0 6px 18px rgba(11, 16, 20, 0.12)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out 1s infinite',
        'float-slow': 'float 5s ease-in-out 0.5s infinite',
        'word-flip': 'wordFlip 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards',
        'marquee': 'marquee 20s linear infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.2, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 1.2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        wordFlip: {
          '0%': { transform: 'rotateX(-90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0)', opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.2, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
