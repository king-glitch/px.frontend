import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
	theme: {
		tokens: {
			colors: {
				obsidian: { value: "#0C0E14" },
				ink: { value: "#1E1F24" },
				slate: { value: "#7E8494" },
				mist: { value: "#F1F3F9" },
				mint: {
					50: { value: "#F6FEEC" },
					100: { value: "#E9FCD2" },
					200: { value: "#D6F9AE" },
					300: { value: "#BEF47F" },
					400: { value: "#A3F788" },
					500: { value: "#98EE2C" },
					600: { value: "#7FC91F" },
					700: { value: "#63A017" },
					800: { value: "#4B7A14" },
					900: { value: "#3B5E14" },
					950: { value: "#1F3406" },
				},
				holo: {
					cyan: { value: "#A5F3FC" },
					lavender: { value: "#DDD6FE" },
					blush: { value: "#FBCFE8" },
					butter: { value: "#FEF08A" },
				},
			},
			radii: {
				pill: { value: "9999px" },
				squircle: { value: "32px" },
				card: { value: "22px" },
			},
			shadows: {
				glass: { value: "0 8px 32px rgba(15, 23, 42, 0.04)" },
				float: { value: "0 24px 64px rgba(15, 23, 42, 0.10)" },
			},
			blurs: {
				glass: { value: "20px" },
			},
		},
		semanticTokens: {
			colors: {
				bg: {
					DEFAULT: {
						value: { base: "#FFFFFF", _dark: "{colors.obsidian}" },
					},
					canvas: {
						value: { base: "#FFFFFF", _dark: "{colors.obsidian}" },
					},
					muted: {
						value: { base: "{colors.mist}", _dark: "#191B23" },
					},
					panel: {
						value: { base: "#FFFFFF", _dark: "#14161D" },
					},
					glass: {
						value: {
							base: "rgba(255, 255, 255, 0.72)",
							_dark: "rgba(20, 22, 30, 0.72)",
						},
					},
					solid: {
						value: { base: "{colors.ink}", _dark: "#FFFFFF" },
					},
				},
				fg: {
					DEFAULT: {
						value: { base: "{colors.obsidian}", _dark: "#F5F6FA" },
					},
					muted: {
						value: { base: "{colors.slate}", _dark: "#9AA0B0" },
					},
					inverted: {
						value: { base: "#FFFFFF", _dark: "{colors.obsidian}" },
					},
				},
				border: {
					DEFAULT: {
						value: {
							base: "rgba(15, 23, 42, 0.08)",
							_dark: "rgba(255, 255, 255, 0.10)",
						},
					},
					glass: {
						value: {
							base: "rgba(255, 255, 255, 0.40)",
							_dark: "rgba(255, 255, 255, 0.08)",
						},
					},
				},
				mint: {
					solid: { value: "{colors.mint.500}" },
					contrast: { value: "{colors.obsidian}" },
					fg: { value: "{colors.mint.700}" },
					muted: { value: "{colors.mint.100}" },
					subtle: { value: "{colors.mint.50}" },
					emphasized: { value: "{colors.mint.200}" },
					focusRing: { value: "{colors.mint.500}" },
				},
			},
		},
	},
	globalCss: {
		body: {
			bg: "bg.canvas",
			color: "fg",
		},
	},
});

export const system = createSystem(defaultConfig, config);

export const holoGradient =
	"linear-gradient(135deg, {colors.holo.cyan} 0%, {colors.holo.lavender} 38%, {colors.holo.blush} 68%, {colors.holo.butter} 100%)";
