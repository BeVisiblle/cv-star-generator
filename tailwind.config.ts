import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				'soft-blue': 'hsl(214, 84%, 56%)',
				'soft-gray': 'hsl(214, 20%, 97%)'
			},
			backgroundImage: {
				'hero-gradient': 'linear-gradient(135deg, hsl(var(--hero-gradient-from)), hsl(var(--hero-gradient-to)))',
				'subtle-gradient': 'linear-gradient(to bottom right, hsl(var(--subtle-gradient-from)), hsl(var(--subtle-gradient-to)))',
				'card-hover': 'linear-gradient(to bottom right, hsl(214, 50%, 99%), hsl(0, 0%, 100%))'
			},
			borderRadius: {
				lg: '1rem',
				xl: '1.25rem',
				'2xl': '1.5rem',
				'3xl': '2rem',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
				'soft-lg': '0 4px 16px -4px rgba(0, 0, 0, 0.1)',
				'soft-xl': '0 8px 24px -6px rgba(0, 0, 0, 0.12)',
				'soft-hover': '0 8px 32px -8px rgba(214, 84%, 56%, 0.15)'
			},
			spacing: {
				'safe': 'env(safe-area-inset-bottom)',
				'nav-bottom': '56px'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			fontFamily: {
				sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
