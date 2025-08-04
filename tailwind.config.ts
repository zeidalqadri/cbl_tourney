import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Original colors
        'cbl-blue': '#003B73',
        'cbl-light': '#F7F9FC',
        
        // Logo-inspired colors
        'mss-turquoise': '#40E0D0',
        'cbl-orange': '#D2691E',
        'cbl-charcoal': '#4A4A4A',
        
        // Extended palette
        'live-pulse': '#40E0D0',
        'score-burst': '#FF6B35',
        'card-dark': '#3A3A3A',
        'text-muted': '#B0B0B0',
        'winner-gold': '#FFD700',
      },
      backgroundImage: {
        'gradient-live': 'linear-gradient(45deg, #40E0D0, #20B2AA)',
        'gradient-score': 'linear-gradient(45deg, #FF6B35, #D2691E)',
        'gradient-winner': 'linear-gradient(135deg, #FFD700, #FFA500)',
      },
      animation: {
        'pulse-live': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'score-pop': 'scorePop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-ball': 'bounceBall 1s ease-in-out infinite',
      },
      keyframes: {
        scorePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceBall: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config