import aspectRatioPlugin from '@tailwindcss/aspect-ratio';
import formsPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';
import plugin from 'tailwindcss/plugin';

import { parseColorMatrix } from './tailwind/colors';

import type { Config } from 'tailwindcss';

const blackVariantPlugin = plugin(({ addVariant }) => {
  addVariant('black', '&:is(.dark.black *)');
});
const reducedMotionPlugin = plugin(({ addVariant }) => {
  addVariant('no-reduce-motion', '.no-reduce-motion &');
});

const config: Config = {
  content: ['./src/**/*.{html,js,ts,tsx}', './custom/instance/**/*.html', './index.html'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '581px',
      md: '768px',
      lg: '976px',
      xl: '1280px',
    },
    extend: {
      boxShadow: {
        '3xl': '0 25px 75px -15px rgba(0, 0, 0, 0.25)',
      },
      fontSize: {
        base: '0.9375rem',
      },
      fontFamily: {
        sans: [
          'nicolium i18n',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        mono: ['Roboto Mono', 'ui-monospace', 'monospace'],
      },
      spacing: {
        '4.5': '1.125rem',
      },
      colors: parseColorMatrix({
        // Define color matrix (of available colors)
        // Colors are configured at runtime with CSS variables in nicolium.json or frontend_configurations
        gray: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        primary: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        secondary: [100, 200, 300, 400, 500, 600],
        success: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        danger: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        accent: [300, 500],
        'gradient-start': true,
        'gradient-end': true,
        greentext: true,
      }),
      animation: {
        'text-overflow': 'text-overflow 8s linear infinite',
      },
      keyframes: {
        // https://stackoverflow.com/posts/78825869/revisions
        'text-overflow': {
          '10%, 90%': { transform: 'translate(0, 0)', left: '0%' },
          '40%, 60%': { transform: 'translate(-100%, 0)', left: '100%' },
        },
      },
    },
  },
  plugins: [
    aspectRatioPlugin,
    formsPlugin,
    typographyPlugin,
    blackVariantPlugin,
    reducedMotionPlugin,
  ],
};

export { config as default };
