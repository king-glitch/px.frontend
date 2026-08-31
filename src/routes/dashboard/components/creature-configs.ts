import type React from "react";
import { keyframes } from "@emotion/react";

export const starfallHero = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
	"33%": {
		transform: "translate3d(8px, -14px, 0) scale(1.02) rotate(1.5deg)",
	},
	"66%": {
		transform: "translate3d(-8px, -20px, 0) scale(0.99) rotate(-1.5deg)",
	},
});

export const starfallDrift1 = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
	"50%": {
		transform: "translate3d(14px, -18px, 0) scale(1.03) rotate(3deg)",
	},
});

export const starfallDrift2 = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
	"50%": {
		transform: "translate3d(-12px, -15px, 0) scale(0.97) rotate(-2.5deg)",
	},
});

export const starfallDrift3 = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
	"50%": {
		transform: "translate3d(10px, -22px, 0) scale(1.04) rotate(2deg)",
	},
});

export const starfallDrift4 = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
	"50%": {
		transform: "translate3d(-14px, -20px, 0) scale(1.03) rotate(-2deg)",
	},
});

export interface FloatingCreatureConfig {
	id: string;
	name: string;
	src: string;
	layer: "back" | "front";
	depth: number;
	style: React.CSSProperties;
	boxSize: { base: string; lg: string; xl: string };
	animation: string;
	glowGradient: string;
	blur: string;
	opacity: number;
}

export const CREATURE_CONFIGS: FloatingCreatureConfig[] = [
	// 1. Kurelly - Top-Left (Mild Background Depth) -> Subtle lens blur (2.5px)
	{
		id: "kurelly",
		name: "Kurelly",
		src: "/images/creatures/kurelly.png",
		layer: "back",
		depth: 14,
		style: {
			left: "8%",
			top: "2%",
		},
		boxSize: {
			base: "110px",
			lg: "clamp(120px, 10vw, 160px)",
			xl: "clamp(140px, 11vw, 180px)",
		},
		animation: `${starfallDrift1} 16s ease-in-out infinite`,
		glowGradient:
			"radial-gradient(circle at 50% 50%, rgba(165, 243, 252, 0.7) 0%, rgba(221, 214, 254, 0.45) 45%, transparent 75%)",
		blur: "2.5px",
		opacity: 0.95,
	},

	// 2. Ocelly - Upper-Center (Distant Deep Background) -> Heavy atmospheric bokeh (7px)
	{
		id: "ocelly",
		name: "Ocelly",
		src: "/images/creatures/ocelly.png",
		layer: "back",
		depth: 18,
		style: {
			left: "44%",
			top: "-2%",
		},
		boxSize: {
			base: "100px",
			lg: "clamp(110px, 9vw, 150px)",
			xl: "clamp(130px, 10vw, 170px)",
		},
		animation: `${starfallDrift2} 18s ease-in-out infinite 1.5s`,
		glowGradient:
			"radial-gradient(circle at 50% 50%, rgba(254, 240, 138, 0.65) 0%, rgba(251, 207, 232, 0.4) 45%, transparent 75%)",
		blur: "7px",
		opacity: 0.7,
	},

	// 3. Pollelly - Mid-Left crossing near 'P' (In-Focus Plane) -> 100% Crisp & Sharp (0px blur)
	{
		id: "pollelly",
		name: "Pollelly",
		src: "/images/creatures/pollelly.png",
		layer: "front",
		depth: 32,
		style: {
			left: "14%",
			top: "42%",
		},
		boxSize: {
			base: "100px",
			lg: "clamp(110px, 9vw, 150px)",
			xl: "clamp(130px, 10vw, 170px)",
		},
		animation: `${starfallDrift3} 15s ease-in-out infinite 2.5s`,
		glowGradient:
			"radial-gradient(circle at 50% 50%, rgba(251, 207, 232, 0.7) 0%, rgba(221, 214, 254, 0.45) 45%, transparent 75%)",
		blur: "0px",
		opacity: 1,
	},

	// 4. Starelly - Center Hero companion crossing in front of 'X.O' (In-Focus Hero) -> 100% Crisp & Sharp (0px blur)
	{
		id: "starelly",
		name: "Starelly",
		src: "/images/creatures/starelly.png",
		layer: "front",
		depth: 46,
		style: {
			left: "50%",
			bottom: "0%",
		},
		boxSize: {
			base: "200px",
			lg: "clamp(240px, 19vw, 310px)",
			xl: "clamp(270px, 21vw, 350px)",
		},
		animation: `${starfallHero} 14s ease-in-out infinite`,
		glowGradient:
			"radial-gradient(circle at 50% 50%, rgba(221, 214, 254, 0.8) 0%, rgba(251, 207, 232, 0.5) 45%, transparent 75%)",
		blur: "0px",
		opacity: 1,
	},

	// 5. Yelly - Starfall right wing (Foreground Lens Edge) -> Foreground lens softness (4px)
	{
		id: "yelly",
		name: "Yelly",
		src: "/images/creatures/yelly.png",
		layer: "front",
		depth: 36,
		style: {
			right: "4%",
			top: "34%",
		},
		boxSize: {
			base: "110px",
			lg: "clamp(120px, 10vw, 160px)",
			xl: "clamp(140px, 11vw, 180px)",
		},
		animation: `${starfallDrift4} 17s ease-in-out infinite 1.2s`,
		glowGradient:
			"radial-gradient(circle at 50% 50%, rgba(163, 247, 136, 0.65) 0%, rgba(165, 243, 252, 0.45) 45%, transparent 75%)",
		blur: "4px",
		opacity: 0.9,
	},
];
