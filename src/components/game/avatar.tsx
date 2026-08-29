import React from "react";
import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { usePrefersReducedMotion } from "./hooks";

export type AvatarSlot = "body" | "head" | "hair" | "outfit" | "accessory";

interface SlotVariant {
	id: string;
	label: string;
	render: React.ReactNode;
}

// The whole avatar is drawn in one ink. Every fill and stroke resolves to
// currentColor, so the wrapper's `color` decides the hue and the portrait
// stays legible on either theme ground without a second palette.
const INK = "currentColor";

const BODY_VARIANTS: SlotVariant[] = [
	{
		id: "slim",
		label: "Slim",
		render: (
			<path
				d="M28 100 C28 82 38 74 50 74 C62 74 72 82 72 100 Z"
				fill={INK}
				opacity={0.9}
			/>
		),
	},
	{
		id: "broad",
		label: "Broad",
		render: (
			<path
				d="M20 100 C20 80 34 72 50 72 C66 72 80 80 80 100 Z"
				fill={INK}
				opacity={0.9}
			/>
		),
	},
	{
		id: "stout",
		label: "Stout",
		render: (
			<path
				d="M24 100 C22 84 34 76 50 76 C66 76 78 84 76 100 Z"
				fill={INK}
				opacity={0.9}
			/>
		),
	},
];

const OUTFIT_VARIANTS: SlotVariant[] = [
	{
		id: "plain",
		label: "Plain",
		render: (
			<path
				d="M42 76 L50 88 L58 76"
				fill="none"
				stroke={INK}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
				opacity={0.35}
			/>
		),
	},
	{
		id: "vest",
		label: "Vest",
		render: (
			<g fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round">
				<path d="M42 75 L46 100" opacity={0.35} />
				<path d="M58 75 L54 100" opacity={0.35} />
			</g>
		),
	},
	{
		id: "coat",
		label: "Field Coat",
		render: (
			<g>
				<path
					d="M38 78 L50 90 L62 78 L66 84 L54 96 L50 100 L46 96 L34 84 Z"
					fill={INK}
					opacity={0.25}
				/>
				<path
					d="M50 90 L50 100"
					stroke={INK}
					strokeWidth={2}
					strokeLinecap="round"
					opacity={0.5}
				/>
			</g>
		),
	},
	{
		id: "mantle",
		label: "Ash Mantle",
		render: (
			<g>
				<path
					d="M22 96 C26 78 36 70 50 70 C64 70 74 78 78 96 L70 96 C68 82 60 76 50 76 C40 76 32 82 30 96 Z"
					fill={INK}
					opacity={0.3}
				/>
				<circle cx="50" cy="80" r="3" fill={INK} opacity={0.6} />
			</g>
		),
	},
];

const HAIR_VARIANTS: SlotVariant[] = [
	{
		id: "crop",
		label: "Crop",
		render: (
			<path
				d="M34 42 C34 26 44 20 50 20 C56 20 66 26 66 42 C62 34 56 31 50 31 C44 31 38 34 34 42 Z"
				fill={INK}
			/>
		),
	},
	{
		id: "long",
		label: "Long",
		render: (
			<path
				d="M32 44 C30 26 42 18 50 18 C58 18 70 26 68 44 L68 66 L63 66 L63 40 C58 33 54 31 50 31 C46 31 42 33 37 40 L37 66 L32 66 Z"
				fill={INK}
			/>
		),
	},
	{
		id: "tied",
		label: "Tied",
		render: (
			<g fill={INK}>
				<path d="M34 42 C34 26 44 20 50 20 C56 20 66 26 66 42 C62 34 56 31 50 31 C44 31 38 34 34 42 Z" />
				<path d="M64 34 C72 36 74 46 70 54 C69 46 66 40 63 37 Z" />
			</g>
		),
	},
	{
		id: "cowl",
		label: "Ink Cowl",
		render: (
			<path
				d="M28 62 C24 34 36 16 50 16 C64 16 76 34 72 62 L65 62 C68 40 60 28 50 28 C40 28 32 40 35 62 Z"
				fill={INK}
			/>
		),
	},
];

const HEAD_VARIANTS: SlotVariant[] = [
	{ id: "bare", label: "Bare", render: null },
	{
		id: "band",
		label: "Band",
		render: (
			<path
				d="M35 40 L65 40"
				stroke={INK}
				strokeWidth={3}
				strokeLinecap="round"
				opacity={0.55}
			/>
		),
	},
	{
		id: "visor",
		label: "Visor",
		render: (
			<path d="M34 42 L66 42 L66 50 L34 50 Z" fill={INK} opacity={0.85} />
		),
	},
	{
		id: "circlet",
		label: "Circlet",
		render: (
			<g>
				<path
					d="M34 36 C40 32 60 32 66 36"
					fill="none"
					stroke={INK}
					strokeWidth={2.5}
					strokeLinecap="round"
				/>
				<circle cx="50" cy="32" r="2.5" fill={INK} />
			</g>
		),
	},
];

const ACCESSORY_VARIANTS: SlotVariant[] = [
	{ id: "none", label: "None", render: null },
	{
		id: "pendant",
		label: "Pendant",
		render: (
			<g>
				<path
					d="M44 76 C46 84 54 84 56 76"
					fill="none"
					stroke={INK}
					strokeWidth={1.5}
					opacity={0.55}
				/>
				<circle cx="50" cy="84" r="2.5" fill={INK} opacity={0.8} />
			</g>
		),
	},
	{
		id: "satchel",
		label: "Satchel",
		render: (
			<g>
				<path
					d="M34 78 L66 92"
					stroke={INK}
					strokeWidth={2}
					opacity={0.45}
					strokeLinecap="round"
				/>
				<rect
					x="64"
					y="88"
					width="12"
					height="9"
					rx="2"
					fill={INK}
					opacity={0.7}
				/>
			</g>
		),
	},
	{
		id: "lantern",
		label: "Lantern",
		render: (
			<g>
				<path
					d="M78 70 L78 82"
					stroke={INK}
					strokeWidth={1.5}
					opacity={0.5}
					strokeLinecap="round"
				/>
				<path
					d="M73 82 L83 82 L81 94 L75 94 Z"
					fill={INK}
					opacity={0.75}
				/>
				<circle cx="78" cy="88" r="2" fill={INK} opacity={0.25} />
			</g>
		),
	},
];

const SLOTS: Record<AvatarSlot, SlotVariant[]> = {
	body: BODY_VARIANTS,
	outfit: OUTFIT_VARIANTS,
	head: HEAD_VARIANTS,
	hair: HAIR_VARIANTS,
	accessory: ACCESSORY_VARIANTS,
};

// Painter's order, not the slot enum's order: shoulders first, headwear over
// hair, carried items last.
const SLOT_ORDER: AvatarSlot[] = [
	"body",
	"outfit",
	"hair",
	"head",
	"accessory",
];

export const AVAILABLE_COSMETICS: Record<AvatarSlot, string[]> = {
	body: BODY_VARIANTS.map((variant) => variant.id),
	outfit: OUTFIT_VARIANTS.map((variant) => variant.id),
	head: HEAD_VARIANTS.map((variant) => variant.id),
	hair: HAIR_VARIANTS.map((variant) => variant.id),
	accessory: ACCESSORY_VARIANTS.map((variant) => variant.id),
};

export const COSMETIC_LABELS: Record<string, string> = Object.fromEntries(
	Object.entries(SLOTS).flatMap(([slot, variants]) =>
		variants.map((variant) => [`${slot}:${variant.id}`, variant.label]),
	),
);

/**
 * Splits the `slot` field a shop cosmetic carries ("head:visor") into the
 * avatar slot and the variant within it. The backend stores the pair in one
 * string so a cosmetic needs no second column.
 */
export function parseCosmeticSlot(
	slot: string,
): { slot: AvatarSlot; variant: string } | null {
	const [slotName, variant] = slot.split(":");
	if (!variant || !(slotName in SLOTS)) {
		return null;
	}

	return { slot: slotName as AvatarSlot, variant };
}

function seedToRandom(seed: string): () => number {
	let hash = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		hash ^= seed.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}

	return () => {
		hash += 0x6d2b79f5;
		let t = hash;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const breathe = keyframes({
	"0%, 100%": { transform: "translateY(0) scale(1)" },
	"50%": { transform: "translateY(-1.5px) scale(1.012)" },
});

export interface HeroAvatarProps {
	seed?: string;
	size?: number;
	/** Any Chakra color token. The whole portrait inherits it. */
	color?: string;
	animated?: boolean;
	slots?: Partial<Record<AvatarSlot, string>>;
	equipped?: Partial<Record<AvatarSlot, string>>;
}

export const HeroAvatar: React.FC<HeroAvatarProps> = ({
	seed = "hero",
	size = 64,
	color = "fg",
	animated = false,
	slots,
	equipped,
}) => {
	const reducedMotion = usePrefersReducedMotion();
	const shouldAnimate = animated && !reducedMotion;
	const active = slots ?? equipped ?? {};

	const layers = React.useMemo(
		() =>
			SLOT_ORDER.map((slot) => {
				const variants = SLOTS[slot];
				const chosen = active[slot]
					? variants.find((variant) => variant.id === active[slot])
					: undefined;

				if (chosen) {
					return { slot, variant: chosen };
				}

				const random = seedToRandom(`${seed}:${slot}`);
				return {
					slot,
					variant: variants[Math.floor(random() * variants.length)],
				};
			}),
		// The equipped map is rebuilt on every render by callers that spread
		// it inline, so key off its contents rather than its identity.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[seed, JSON.stringify(active)],
	);

	return (
		<Box
			color={color}
			width={`${size}px`}
			height={`${size}px`}
			animation={
				shouldAnimate ? `${breathe} 4s ease-in-out infinite` : undefined
			}
		>
			<svg
				viewBox="0 0 100 100"
				width="100%"
				height="100%"
				role="img"
				aria-label="Hero portrait"
			>
				{/* Fixed silhouette: every seed shares this neck and head, so the
				    variants read as one character in different gear. */}
				<path
					d="M45 58 L55 58 L55 78 L45 78 Z"
					fill={INK}
					opacity={0.55}
				/>
				<ellipse
					cx="50"
					cy="42"
					rx="16"
					ry="19"
					fill={INK}
					opacity={0.18}
				/>
				<ellipse
					cx="50"
					cy="42"
					rx="16"
					ry="19"
					fill="none"
					stroke={INK}
					strokeWidth={2}
				/>

				{layers.map(({ slot, variant }) => (
					<g key={slot}>{variant.render}</g>
				))}
			</svg>
		</Box>
	);
};

export default HeroAvatar;
