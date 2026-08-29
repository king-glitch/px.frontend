import React from "react";
import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { usePrefersReducedMotion } from "./hooks";

export type AvatarSlot = "body" | "head" | "glasses" | "accessory" | "skin";

export const AVAILABLE_COSMETICS: Record<AvatarSlot, string[]> = {
	body: ["rabbit_default"],
	head: [
		"top_hat",
		"wizard_hat",
		"golden_crown",
		"party_hat",
		"viking_helm",
		"pirate_hat",
		"chef_toque",
		"head_sprout",
		"halo",
		"devil_horns",
		"cyber_headset",
	],
	glasses: [
		"pixel_shades",
		"vr_visor",
		"classic_glasses",
		"monocle",
		"eye_patch",
		"blush",
		"sleep_mask",
	],
	accessory: [
		"bell_collar",
		"bow_tie",
		"gold_chain",
		"scarf",
		"cape",
		"backpack",
		"guitar",
	],
	skin: [
		"obsidian",
		"ghost_white",
		"cyber_neon",
		"golden_rabbit",
		"sakura_pink",
		"crimson_shadow",
		"emerald_jade",
		"royal_purple",
	],
};

// ---------------------------------------------------------------------------
// Discrete 8-bit Stepped Bobbing Keyframes
// ---------------------------------------------------------------------------
const pixelBob = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-0.6px); }
`;

// ---------------------------------------------------------------------------
// Exact 13x13 Pixel Rabbit Matrix (100% identical to attachment)
// ' ' = transparent
// '#' = rabbit body pixel
// 'E' = white eye cutout
// 'N' = white nose cutout
// ---------------------------------------------------------------------------
const RABBIT_GRID: string[] = [
	"   ##   ##   ",
	"  #### ####  ",
	"  #### ####  ",
	"  #### ####  ",
	"  #### ####  ",
	"  #### ####  ",
	"  #########  ",
	" ########### ",
	"####E###E####",
	"####E###E####",
	"######N######",
	" ########### ",
	"  #########  ",
];

const SKIN_PALETTES: Record<string, { body: string; eye: string }> = {
	obsidian: { body: "#111111", eye: "#FFFFFF" },
	ghost_white: { body: "#F8FAFC", eye: "#0F172A" },
	cyber_neon: { body: "#06B6D4", eye: "#FFFFFF" },
	golden_rabbit: { body: "#F59E0B", eye: "#78350F" },
	sakura_pink: { body: "#F472B6", eye: "#FFFFFF" },
	crimson_shadow: { body: "#991B1B", eye: "#FEE2E2" },
	emerald_jade: { body: "#059669", eye: "#D1FAE5" },
	royal_purple: { body: "#7C3AED", eye: "#EDE9FE" },
};

export interface HeroAvatarProps {
	seed?: string;
	size?: number;
	color?: string;
	animated?: boolean;
	slots?: Partial<Record<AvatarSlot, string>>;
	equipped?: Partial<Record<AvatarSlot, string>>;
}

export const HeroAvatar: React.FC<HeroAvatarProps> = ({
	size = 64,
	color,
	animated = false,
	slots,
	equipped,
}) => {
	const activeSlots = slots || equipped || {};
	const reducedMotion = usePrefersReducedMotion();
	const shouldAnimate = animated && !reducedMotion;

	const skinId = activeSlots.skin || "obsidian";
	const skinConfig = SKIN_PALETTES[skinId] || SKIN_PALETTES.obsidian;

	const bodyColor = color || skinConfig.body;
	const eyeColor = skinConfig.eye;

	const headSlot = activeSlots.head;
	const glassesSlot = activeSlots.glasses;
	const accessorySlot = activeSlots.accessory;

	// 13x13 grid centered inside 19x19 coordinate frame
	const ox = 3;
	const oy = 3;

	return (
		<Box
			as="span"
			display="inline-flex"
			alignItems="center"
			justifyContent="center"
			lineHeight={0}
			boxSize={`${size}px`}
			position="relative"
			flexShrink={0}
		>
			<svg
				viewBox="0 0 19 19"
				width={size}
				height={size}
				shapeRendering="crispEdges"
				role="img"
				aria-label="Pixel rabbit avatar"
				style={{ display: "block", overflow: "visible" }}
			>
				{/* 8-bit Animated Sprite Group */}
				<Box
					as="g"
					animation={
						shouldAnimate
							? `${pixelBob} 1.6s steps(2) infinite`
							: undefined
					}
					style={{ transformOrigin: "9.5px 9.5px" }}
				>
					{/* Fixed 13x13 Solid Black Rabbit Matrix with balanced canvas margin */}
					{RABBIT_GRID.map((row, y) =>
						row.split("").map((char, x) => {
							if (char === " ") return null;

							const px = ox + x;
							const py = oy + y;

							if (char === "#") {
								return (
									<rect
										key={`${x}-${y}`}
										x={px}
										y={py}
										width="1"
										height="1"
										fill={bodyColor}
									/>
								);
							}

							if (char === "E" || char === "N") {
								return (
									<rect
										key={`${x}-${y}`}
										x={px}
										y={py}
										width="1"
										height="1"
										fill={eyeColor}
									/>
								);
							}

							return null;
						}),
					)}

					{/* ----------------------------------------------------------- */}
					{/* 1. Headwear & Hats (11 Items) */}
					{/* ----------------------------------------------------------- */}

					{/* Classic Top Hat */}
					{headSlot === "top_hat" && (
						<g id="hat-top-hat">
							<rect
								x={ox + 2}
								y={oy + 5}
								width="9"
								height="1"
								fill="#18181B"
							/>
							<rect
								x={ox + 4}
								y={oy + 2}
								width="5"
								height="3"
								fill="#18181B"
							/>
							<rect
								x={ox + 4}
								y={oy + 4}
								width="5"
								height="1"
								fill="#E11D48"
							/>
						</g>
					)}

					{/* Arcane Wizard Hat */}
					{headSlot === "wizard_hat" && (
						<g id="hat-wizard-hat">
							<rect
								x={ox + 2}
								y={oy + 5}
								width="9"
								height="1"
								fill="#3B82F6"
							/>
							<rect
								x={ox + 4}
								y={oy + 3}
								width="5"
								height="2"
								fill="#3B82F6"
							/>
							<rect
								x={ox + 5}
								y={oy + 0}
								width="3"
								height="3"
								fill="#2563EB"
							/>
							<rect
								x={ox + 6}
								y={oy + 2}
								width="1"
								height="1"
								fill="#FBBF24"
							/>
						</g>
					)}

					{/* Royal Golden Crown */}
					{headSlot === "golden_crown" && (
						<g id="hat-golden-crown">
							<rect
								x={ox + 3}
								y={oy + 4}
								width="7"
								height="2"
								fill="#F59E0B"
							/>
							<rect
								x={ox + 3}
								y={oy + 2}
								width="1"
								height="2"
								fill="#F59E0B"
							/>
							<rect
								x={ox + 6}
								y={oy + 2}
								width="1"
								height="2"
								fill="#F59E0B"
							/>
							<rect
								x={ox + 9}
								y={oy + 2}
								width="1"
								height="2"
								fill="#F59E0B"
							/>
							<rect
								x={ox + 6}
								y={oy + 4}
								width="1"
								height="1"
								fill="#EF4444"
							/>
						</g>
					)}

					{/* Party Cone Hat */}
					{headSlot === "party_hat" && (
						<g id="hat-party-hat">
							<rect
								x={ox + 4}
								y={oy + 2}
								width="5"
								height="4"
								fill="#EC4899"
							/>
							<rect
								x={ox + 6}
								y={oy - 0.2}
								width="1"
								height="2.2"
								fill="#FBBF24"
							/>
							<rect
								x={ox + 4}
								y={oy + 4}
								width="5"
								height="1"
								fill="#FBBF24"
							/>
						</g>
					)}

					{/* Viking Helm */}
					{headSlot === "viking_helm" && (
						<g id="hat-viking-helm">
							<rect
								x={ox + 3}
								y={oy + 4}
								width="7"
								height="2"
								fill="#71717A"
							/>
							<rect
								x={ox + 1}
								y={oy + 2}
								width="2"
								height="3"
								fill="#FEF3C7"
							/>
							<rect
								x={ox + 10}
								y={oy + 2}
								width="2"
								height="3"
								fill="#FEF3C7"
							/>
						</g>
					)}

					{/* Pirate Tricorn */}
					{headSlot === "pirate_hat" && (
						<g id="hat-pirate-hat">
							<rect
								x={ox + 1}
								y={oy + 3}
								width="11"
								height="3"
								fill="#18181B"
							/>
							<rect
								x={ox + 1}
								y={oy + 5}
								width="11"
								height="1"
								fill="#F59E0B"
							/>
							<rect
								x={ox + 6}
								y={oy + 4}
								width="1"
								height="1"
								fill="#FFFFFF"
							/>
						</g>
					)}

					{/* Chef Toque */}
					{headSlot === "chef_toque" && (
						<g id="hat-chef-toque">
							<rect
								x={ox + 3}
								y={oy + 5}
								width="7"
								height="1"
								fill="#CBD5E1"
							/>
							<rect
								x={ox + 2}
								y={oy + 1}
								width="9"
								height="4"
								fill="#FFFFFF"
							/>
						</g>
					)}

					{/* Head Sprout */}
					{headSlot === "head_sprout" && (
						<g id="hat-head-sprout">
							<rect
								x={ox + 6}
								y={oy + 4}
								width="0.8"
								height="2"
								fill="#15803D"
							/>
							<rect
								x={ox + 4.8}
								y={oy + 3.5}
								width="1.6"
								height="0.8"
								fill="#22C55E"
							/>
							<rect
								x={ox + 6.6}
								y={oy + 3.2}
								width="1.6"
								height="0.8"
								fill="#4ADE80"
							/>
						</g>
					)}

					{/* Angel Halo */}
					{headSlot === "halo" && (
						<g id="hat-angel-halo">
							<rect
								x={ox + 3}
								y={oy - 1.2}
								width="7"
								height="0.6"
								fill="#FEF08A"
							/>
						</g>
					)}

					{/* Devil Horns */}
					{headSlot === "devil_horns" && (
						<g id="hat-devil-horns">
							<rect
								x={ox + 1}
								y={oy + 3}
								width="2"
								height="3"
								fill="#DC2626"
							/>
							<rect
								x={ox + 10}
								y={oy + 3}
								width="2"
								height="3"
								fill="#DC2626"
							/>
						</g>
					)}

					{/* Cyber DJ Headset */}
					{headSlot === "cyber_headset" && (
						<g id="hat-cyber-headset">
							<rect
								x={ox + 2}
								y={oy + 5}
								width="9"
								height="1"
								fill="#06B6D4"
							/>
							<rect
								x={ox + 0}
								y={oy + 6}
								width="2"
								height="4"
								fill="#0891B2"
							/>
							<rect
								x={ox + 11}
								y={oy + 6}
								width="2"
								height="4"
								fill="#0891B2"
							/>
						</g>
					)}

					{/* ----------------------------------------------------------- */}
					{/* 2. Glasses & Eyewear (7 Items) */}
					{/* ----------------------------------------------------------- */}

					{/* Pixel Shades */}
					{glassesSlot === "pixel_shades" && (
						<g id="glasses-pixel-shades">
							<rect
								x={ox + 3}
								y={oy + 8}
								width="3"
								height="2"
								fill="#18181B"
							/>
							<rect
								x={ox + 7}
								y={oy + 8}
								width="3"
								height="2"
								fill="#18181B"
							/>
							<rect
								x={ox + 6}
								y={oy + 8}
								width="1"
								height="1"
								fill="#18181B"
							/>
							<rect
								x={ox + 3}
								y={oy + 8}
								width="1"
								height="1"
								fill="#FFFFFF"
							/>
						</g>
					)}

					{/* VR Visor */}
					{glassesSlot === "vr_visor" && (
						<g id="glasses-vr-visor">
							<rect
								x={ox + 1}
								y={oy + 8}
								width="11"
								height="2"
								fill="#06B6D4"
							/>
							<rect
								x={ox + 2}
								y={oy + 8.5}
								width="9"
								height="1"
								fill="#67E8F9"
							/>
						</g>
					)}

					{/* Classic Specs */}
					{glassesSlot === "classic_glasses" && (
						<g id="glasses-classic">
							<rect
								x={ox + 3}
								y={oy + 7.5}
								width="3"
								height="3"
								fill="none"
								stroke="#71717A"
								strokeWidth="0.6"
							/>
							<rect
								x={ox + 7}
								y={oy + 7.5}
								width="3"
								height="3"
								fill="none"
								stroke="#71717A"
								strokeWidth="0.6"
							/>
							<rect
								x={ox + 6}
								y={oy + 8}
								width="1"
								height="0.6"
								fill="#71717A"
							/>
						</g>
					)}

					{/* Monocle */}
					{glassesSlot === "monocle" && (
						<g id="glasses-monocle">
							<rect
								x={ox + 7}
								y={oy + 7.5}
								width="3"
								height="3"
								fill="none"
								stroke="#F59E0B"
								strokeWidth="0.6"
							/>
							<rect
								x={ox + 10}
								y={oy + 9}
								width="0.6"
								height="3"
								fill="#F59E0B"
							/>
						</g>
					)}

					{/* Eye Patch */}
					{glassesSlot === "eye_patch" && (
						<g id="glasses-eye-patch">
							<rect
								x={ox + 3}
								y={oy + 7.5}
								width="3"
								height="3"
								fill="#18181B"
							/>
							<rect
								x={ox + 0}
								y={oy + 7}
								width="13"
								height="0.6"
								fill="#27272A"
							/>
						</g>
					)}

					{/* Anime Blush */}
					{glassesSlot === "blush" && (
						<g id="glasses-blush">
							<rect
								x={ox + 2}
								y={oy + 10}
								width="2"
								height="1"
								fill="#F472B6"
								opacity="0.85"
							/>
							<rect
								x={ox + 9}
								y={oy + 10}
								width="2"
								height="1"
								fill="#F472B6"
								opacity="0.85"
							/>
						</g>
					)}

					{/* Night Sleep Mask */}
					{glassesSlot === "sleep_mask" && (
						<g id="glasses-sleep-mask">
							<rect
								x={ox + 2}
								y={oy + 7.5}
								width="9"
								height="3"
								fill="#6366F1"
							/>
							<rect
								x={ox + 5}
								y={oy + 8.5}
								width="3"
								height="1"
								fill="#FFFFFF"
							/>
						</g>
					)}

					{/* ----------------------------------------------------------- */}
					{/* 3. Neck & Body Accessories (7 Items) */}
					{/* ----------------------------------------------------------- */}

					{/* Bell Collar */}
					{accessorySlot === "bell_collar" && (
						<g id="acc-bell-collar">
							<rect
								x={ox + 2}
								y={oy + 11}
								width="9"
								height="0.8"
								fill="#E11D48"
							/>
							<rect
								x={ox + 6}
								y={oy + 11}
								width="1"
								height="1"
								fill="#FBBF24"
							/>
						</g>
					)}

					{/* Dapper Bowtie */}
					{accessorySlot === "bow_tie" && (
						<g id="acc-bow-tie">
							<rect
								x={ox + 5}
								y={oy + 11}
								width="3"
								height="1.5"
								fill="#DC2626"
							/>
							<rect
								x={ox + 6}
								y={oy + 11.2}
								width="1"
								height="1"
								fill="#991B1B"
							/>
						</g>
					)}

					{/* 24k Gold Chain */}
					{accessorySlot === "gold_chain" && (
						<g id="acc-gold-chain">
							<rect
								x={ox + 3}
								y={oy + 11}
								width="7"
								height="1"
								fill="#F59E0B"
							/>
							<rect
								x={ox + 6}
								y={oy + 12}
								width="1.2"
								height="1.2"
								fill="#FBBF24"
							/>
						</g>
					)}

					{/* Winter Scarf */}
					{accessorySlot === "scarf" && (
						<g id="acc-scarf">
							<rect
								x={ox + 2}
								y={oy + 10.5}
								width="9"
								height="1.5"
								fill="#059669"
							/>
							<rect
								x={ox + 8}
								y={oy + 12}
								width="2"
								height="3"
								fill="#047857"
							/>
						</g>
					)}

					{/* Hero Cape */}
					{accessorySlot === "cape" && (
						<g id="acc-cape">
							<rect
								x={ox + 0.5}
								y={oy + 8}
								width="2"
								height="6"
								fill="#B91C1C"
							/>
							<rect
								x={ox + 10.5}
								y={oy + 8}
								width="2"
								height="6"
								fill="#B91C1C"
							/>
						</g>
					)}

					{/* Adventure Backpack */}
					{accessorySlot === "backpack" && (
						<g id="acc-backpack">
							<rect
								x={ox + 11.5}
								y={oy + 7}
								width="2.5"
								height="5"
								fill="#854D0E"
							/>
							<rect
								x={ox + 2}
								y={oy + 8}
								width="1"
								height="4"
								fill="#713F12"
							/>
						</g>
					)}

					{/* Electric Guitar */}
					{accessorySlot === "guitar" && (
						<g id="acc-guitar">
							<rect
								x={ox + 11.5}
								y={oy + 8}
								width="3"
								height="4"
								fill="#E11D48"
							/>
							<rect
								x={ox + 11}
								y={oy + 4}
								width="1"
								height="4"
								fill="#FBBF24"
							/>
						</g>
					)}
				</Box>
			</svg>
		</Box>
	);
};

export default HeroAvatar;
