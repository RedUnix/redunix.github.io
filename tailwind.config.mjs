/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: ['class', '[data-theme="dark"]'],
	theme: {
		extend: {
			colors: {
				// Mapping CSS variables defined in global.css
				bg: 'var(--color-bg)',
				surface: 'var(--color-surface)',
				text: 'var(--color-text)',
				dim: 'var(--color-dim)',
				accent: 'var(--color-accent)',
				error: 'var(--color-error)',
				success: 'var(--color-success)',
				link: 'var(--color-link)',
			},
			fontFamily: {
				mono: ['"JetBrains Mono"', 'monospace'],
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-in-out',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
			},
		},
	},
	plugins: [typography],
};
