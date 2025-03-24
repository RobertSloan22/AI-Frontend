/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
const animate = require("tailwindcss-animate");

export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontSize: {
				'xs': '0.875rem',     // 14px
				'sm': '1rem',         // 16px
				'base': '1.125rem',   // 18px
				'lg': '1.25rem',      // 20px
				'xl': '1.5rem',       // 24px
				'2xl': '1.875rem',    // 30px
				'3xl': '2.25rem',     // 36px
				'4xl': '3rem',        // 48px
				'5xl': '4rem',        // 64px
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
				none: "0",
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					1: "hsl(var(--chart-1))",
					2: "hsl(var(--chart-2))",
					3: "hsl(var(--chart-3))",
					4: "hsl(var(--chart-4))",
					5: "hsl(var(--chart-5))",
				},
				blue: {
					500: '#3B82F6',
					600: '#2563EB',
				},
				green: {
					500: '#22C55E',
					600: '#16A34A',
				},
				purple: {
					500: '#A855F7',
					600: '#9333EA',
				},
				yellow: {
					500: '#EAB308',
					600: '#CA8A04',
				},
				indigo: {
					500: '#6366F1',
					600: '#4F46E5',
				},
				teal: {
					500: '#14B8A6',
					600: '#0D9488',
				},
				red: {
					500: '#EF4444',
					600: '#DC2626',
				},
			},
			animation: {
				'fade-in': 'fadeIn 0.3s ease-in-out',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
			},
		},
	},
	plugins: [animate],
};
