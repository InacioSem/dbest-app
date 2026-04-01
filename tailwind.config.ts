import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './client/**/*.{ts,tsx}',
    './client/app/**/*.{ts,tsx}',
    './client/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0a0a1a',
          deep: '#1a0a2e',
          purple: '#7c3aed',
          'purple-light': '#a78bfa',
          amber: '#f59e0b',
          'amber-light': '#fbbf24',
        },
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
