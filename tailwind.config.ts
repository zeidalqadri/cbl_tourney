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
        'cbl-blue': '#003B73',
        'cbl-orange': '#FF6B35',
        'cbl-light': '#F7F9FC',
      },
    },
  },
  plugins: [],
}
export default config