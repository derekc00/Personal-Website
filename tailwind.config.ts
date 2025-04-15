import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/providers/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./mdx-components.tsx",
  ],
  darkMode: ["class", "class"], // Enable class-based dark mode
  theme: {
  	extend: {
  		transitionProperty: {
  			colors: 'background-color, border-color, color, fill, stroke'
  		},
  		keyframes: {
  			tagAppear: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(4px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		animation: {
  			tagAppear: 'tagAppear 0.2s ease-out forwards'
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					color: 'var(--tw-prose-body)',
  					a: {
  						color: 'var(--tw-prose-links)',
  						'&:hover': {
  							color: 'var(--tw-prose-links-hover)'
  						}
  					},
  					pre: {
  						backgroundColor: 'transparent',
  						padding: '1rem',
  						borderRadius: '0.5rem',
  						overflowX: 'auto'
  					},
  					code: {
  						backgroundColor: 'var(--tw-prose-code-bg)',
  						padding: '0.2em 0.4em',
  						borderRadius: '0.25rem',
  						fontWeight: '400'
  					}
  				}
  			},
  			dark: {
  				css: {
  					color: 'var(--tw-prose-invert-body)',
  					h1: {
  						color: 'var(--tw-prose-invert-headings)'
  					},
  					h2: {
  						color: 'var(--tw-prose-invert-headings)'
  					},
  					h3: {
  						color: 'var(--tw-prose-invert-headings)'
  					},
  					h4: {
  						color: 'var(--tw-prose-invert-headings)'
  					},
  					h5: {
  						color: 'var(--tw-prose-invert-headings)'
  					},
  					h6: {
  						color: 'var(--tw-prose-invert-headings)'
  					},
  					p: {
  						color: 'var(--tw-prose-invert-body)'
  					},
  					li: {
  						color: 'var(--tw-prose-invert-body)'
  					},
  					strong: {
  						color: 'var(--tw-prose-invert-headings)'
  					},
  					code: {
  						color: 'var(--tw-prose-invert-body)'
  					},
  					a: {
  						color: 'var(--tw-prose-invert-links)',
  						'&:hover': {
  							color: 'var(--tw-prose-invert-links-hover)'
  						}
  					},
  					pre: {
  						backgroundColor: 'transparent'
  					}
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
} satisfies Config;
