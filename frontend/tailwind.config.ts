import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontSize: {
        base: '14px' // Minimum font size for industrial usability
      },
      minHeight: {
        touch: '44px' // Minimum touch target size
      },
      minWidth: {
        touch: '44px' // Minimum touch target size
      }
    }
  },
  plugins: []
};

export default config;
