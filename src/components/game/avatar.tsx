import React from "react";
import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { usePrefersReducedMotion } from "./hooks";

export type AvatarSlot = "body" | "head" | "hair" | "outfit" | "accessory";

// djb2 hash -> mulberry32 PRNG so the same seed always yields the same cat
function seedToRandom(seed: string): () => number {
	let hash = 5381;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash * 33) ^ seed.charCodeAt(i);
	}
	let state = hash >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

interface SlotVariant {
	id: string;
	render: (uniqueId: string) => React.ReactNode;
}

// ---------------------------------------------------------------------------
// むちねこ (Muchi Neko) Flat Minimalist Cat Body & Posture Variants
// ---------------------------------------------------------------------------

const BODY_VARIANTS: SlotVariant[] = [
	{
		id: "chubby_loaf",
		// Classic Plump Standing/Sitting Loaf (ふつう)
		render: (id) => (
			<g id="body-chubby-loaf">
				{/* Curled Tail */}
				<path
					d="M26 72 C14 74 12 56 22 52 C24 51 26 53 25 55 C18 58 18 69 28 68 Z"
					fill={`url(#cat-dark-grad-${id})`}
				/>
				{/* Plump Body Base */}
				<path
					d="M32 46 C22 54 18 68 20 78 C22 86 30 90 50 90 C70 90 78 86 80 78 C82 68 78 54 68 46 C60 40 40 40 32 46 Z"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				{/* Dark Bicolor Cow Patch on Back/Hip */}
				<path
					d="M20 76 C20 66 25 54 34 46 C24 56 22 70 26 84 C23 82 20 79 20 76 Z"
					fill={`url(#cat-dark-grad-${id})`}
				/>
				<path
					d="M66 52 C74 60 78 70 78 78 C76 84 72 88 64 89 C74 86 80 78 78 70 C76 60 72 54 66 52 Z"
					fill={`url(#cat-dark-grad-${id})`}
				/>
				{/* Tiny Cute Stubby Paws */}
				<ellipse
					cx="38"
					cy="88"
					rx="5"
					ry="3.5"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="1.6"
				/>
				<ellipse
					cx="62"
					cy="88"
					rx="5"
					ry="3.5"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="1.6"
				/>
				<line
					x1="38"
					y1="87"
					x2="38"
					y2="90"
					stroke="#111111"
					strokeWidth="1.2"
					strokeLinecap="round"
				/>
				<line
					x1="62"
					y1="87"
					x2="62"
					y2="90"
					stroke="#111111"
					strokeWidth="1.2"
					strokeLinecap="round"
				/>
			</g>
		),
	},
	{
		id: "leaping_pounce",
		// Mid-air Flying Loaf (跳ぶ - Flying Cat from Concept Art)
		render: (id) => (
			<g id="body-leaping-pounce">
				{/* Trailing Back Tail */}
				<path
					d="M22 54 C10 50 8 36 18 34 C20 33 21 36 19 37 C13 39 14 47 24 49 Z"
					fill={`url(#cat-dark-grad-${id})`}
				/>
				{/* Aerodynamic Flying Round Bean Body */}
				<path
					d="M26 56 C20 44 32 34 52 34 C72 34 84 44 80 58 C76 70 64 74 46 74 C28 74 24 64 26 56 Z"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				{/* Bicolor Back Saddle Patch */}
				<path
					d="M32 38 C42 34 58 34 68 40 C60 48 44 48 32 38 Z"
					fill={`url(#cat-dark-grad-${id})`}
				/>
				{/* Extended Back Leg Paws */}
				<ellipse
					cx="22"
					cy="64"
					rx="4.5"
					ry="3"
					transform="rotate(-20 22 64)"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="1.6"
				/>
				<ellipse
					cx="30"
					cy="70"
					rx="4.5"
					ry="3"
					transform="rotate(-10 30 70)"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="1.6"
				/>
				{/* Extended Front Paws */}
				<ellipse
					cx="76"
					cy="62"
					rx="4.5"
					ry="3"
					transform="rotate(20 76 62)"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="1.6"
				/>
				<ellipse
					cx="68"
					cy="70"
					rx="4.5"
					ry="3"
					transform="rotate(10 68 70)"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="1.6"
				/>
			</g>
		),
	},
	{
		id: "rotund_chonk",
		// Ultra Plump / Chonky Bean Cat (重い - Very Round Cat)
		render: (id) => (
			<g id="body-rotund-chonk">
				{/* Cute Tip-curled Tail */}
				<path
					d="M22 68 C12 66 12 50 20 48 C22 47 23 50 21 51 C16 53 16 62 24 63 Z"
					fill={`url(#cat-dark-grad-${id})`}
				/>
				{/* Huge Round Squishy Silhouette */}
				<path
					d="M28 50 C16 60 14 78 22 86 C30 94 70 94 78 86 C86 78 84 60 72 50 C62 42 38 42 28 50 Z"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				{/* Dark Bicolor Flank Patch */}
				<path
					d="M18 74 C16 64 22 54 30 48 C22 56 18 68 22 80 C20 78 18 76 18 74 Z"
					fill={`url(#cat-dark-grad-${id})`}
				/>
				{/* Chunky Flat Belly Paws */}
				<ellipse
					cx="36"
					cy="91"
					rx="5.5"
					ry="3.5"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="1.6"
				/>
				<ellipse
					cx="64"
					cy="91"
					rx="5.5"
					ry="3.5"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="1.6"
				/>
				<line
					x1="36"
					y1="90"
					x2="36"
					y2="93"
					stroke="#111111"
					strokeWidth="1.2"
					strokeLinecap="round"
				/>
				<line
					x1="64"
					y1="90"
					x2="64"
					y2="93"
					stroke="#111111"
					strokeWidth="1.2"
					strokeLinecap="round"
				/>
			</g>
		),
	},
	{
		id: "cozy_tuck",
		// Sleek / Cozy Tucked Loaf (軽い)
		render: (id) => (
			<g id="body-cozy-tuck">
				{/* Tucked Tail Wrapped around Side */}
				<path
					d="M24 82 C16 78 16 66 22 62 C26 60 34 68 40 72 C32 72 26 76 24 82 Z"
					fill={`url(#cat-dark-grad-${id})`}
					stroke="#111111"
					strokeWidth="1.4"
				/>
				{/* Compact Cozy Silhouette */}
				<path
					d="M30 48 C20 56 18 72 24 82 C30 88 70 88 76 82 C82 72 80 56 70 48 C62 42 38 42 30 48 Z"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				{/* Dark Saddle Stripe */}
				<path
					d="M68 54 C74 62 76 72 74 80 C70 84 66 86 58 87 C68 84 72 76 70 68 C68 60 66 56 68 54 Z"
					fill={`url(#cat-dark-grad-${id})`}
				/>
				{/* Single Front Center Paw */}
				<ellipse
					cx="50"
					cy="86"
					rx="6"
					ry="3.5"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="1.6"
				/>
				<line
					x1="48"
					y1="85"
					x2="48"
					y2="88"
					stroke="#111111"
					strokeWidth="1.2"
					strokeLinecap="round"
				/>
				<line
					x1="52"
					y1="85"
					x2="52"
					y2="88"
					stroke="#111111"
					strokeWidth="1.2"
					strokeLinecap="round"
				/>
			</g>
		),
	},
];

// ---------------------------------------------------------------------------
// Head & Ear Marking Silhouette Variants (Matching Muchi Neko Concept Art)
// ---------------------------------------------------------------------------

const HEAD_VARIANTS: SlotVariant[] = [
	{
		id: "half_mask_cow",
		// Signature Muchi Neko Bicolor Cow Cat (Right ear & cheek black patch)
		render: (id) => (
			<g id="head-half-mask">
				{/* Left Cream Ear */}
				<path
					d="M30 36 L24 16 C28 14 36 20 40 26 Z"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				{/* Left Inner Ear */}
				<path
					d="M29 32 L26 20 C28 19 33 23 35 27 Z"
					fill={`url(#cat-inner-ear-${id})`}
				/>
				{/* Right Dark Ear */}
				<path
					d="M60 26 C64 20 72 14 76 16 L70 36 Z"
					fill={`url(#cat-dark-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				{/* Right Inner Ear */}
				<path d="M65 27 C67 23 72 19 74 20 L71 32 Z" fill="#333333" />
				{/* Round Head Contour */}
				<ellipse
					cx="50"
					cy="38"
					rx="22"
					ry="18"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
				/>
				{/* Dark Mask Patch on Right Side of Face */}
				<path
					d="M50 20 C58 20 68 26 72 38 C72 46 66 52 58 54 C54 48 56 36 50 20 Z"
					fill={`url(#cat-dark-grad-${id})`}
				/>
			</g>
		),
	},
	{
		id: "tuxedo_cap",
		// Classic Tuxedo Mask (Dark crown with white center blaze)
		render: (id) => (
			<g id="head-tuxedo-cap">
				{/* Left Dark Ear */}
				<path
					d="M30 36 L24 16 C28 14 36 20 40 26 Z"
					fill={`url(#cat-dark-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				{/* Right Dark Ear */}
				<path
					d="M60 26 C64 20 72 14 76 16 L70 36 Z"
					fill={`url(#cat-dark-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				{/* Head Contour */}
				<ellipse
					cx="50"
					cy="38"
					rx="22"
					ry="18"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
				/>
				{/* Symmetrical Tuxedo Cap with Center Notch */}
				<path
					d="M28 38 C28 24 38 20 50 26 C62 20 72 24 72 38 C70 32 60 26 50 30 C40 26 30 32 28 38 Z"
					fill={`url(#cat-dark-grad-${id})`}
				/>
			</g>
		),
	},
	{
		id: "calico_spotted",
		// Spotted Calico / Bi-color Ears
		render: (id) => (
			<g id="head-calico-spotted">
				{/* Left Dark Ear */}
				<path
					d="M30 36 L24 16 C28 14 36 20 40 26 Z"
					fill={`url(#cat-dark-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				{/* Right Cream Ear */}
				<path
					d="M60 26 C64 20 72 14 76 16 L70 36 Z"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				<path
					d="M65 27 C67 23 72 19 74 20 L71 32 Z"
					fill={`url(#cat-inner-ear-${id})`}
				/>
				{/* Head Base */}
				<ellipse
					cx="50"
					cy="38"
					rx="22"
					ry="18"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
				/>
				{/* Asymmetrical Cheek Spot */}
				<ellipse
					cx="36"
					cy="42"
					rx="6"
					ry="5"
					fill={`url(#cat-dark-grad-${id})`}
				/>
				<ellipse
					cx="64"
					cy="30"
					rx="4"
					ry="3.5"
					fill={`url(#cat-dark-grad-${id})`}
				/>
			</g>
		),
	},
	{
		id: "pure_cloud",
		// Pure Cloud White / Cream Cat
		render: (id) => (
			<g id="head-pure-cloud">
				{/* Left Ear */}
				<path
					d="M30 36 L24 16 C28 14 36 20 40 26 Z"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				<path
					d="M29 32 L26 20 C28 19 33 23 35 27 Z"
					fill={`url(#cat-inner-ear-${id})`}
				/>
				{/* Right Ear */}
				<path
					d="M60 26 C64 20 72 14 76 16 L70 36 Z"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
					strokeLinejoin="round"
				/>
				<path
					d="M65 27 C67 23 72 19 74 20 L71 32 Z"
					fill={`url(#cat-inner-ear-${id})`}
				/>
				{/* Head Base */}
				<ellipse
					cx="50"
					cy="38"
					rx="22"
					ry="18"
					fill={`url(#cat-cream-grad-${id})`}
					stroke="#111111"
					strokeWidth="2"
				/>
				{/* Tabby Forehead Marks */}
				<path
					d="M46 23 L46 28 M50 22 L50 28 M54 23 L54 28"
					stroke="#111111"
					strokeWidth="1.4"
					strokeLinecap="round"
				/>
			</g>
		),
	},
];

// ---------------------------------------------------------------------------
// Facial Expressions (Minimalist Japanese Cute / Muchi Neko Faces)
// ---------------------------------------------------------------------------

const FACE_VARIANTS: SlotVariant[] = [
	{
		id: "beady_curious",
		// Signature Muchi Neko Face: Solid Beady Black Dots & Tiny Inverted-W Muzzle
		render: () => (
			<g id="face-beady-curious">
				{/* Left & Right Eyes */}
				<circle cx="43" cy="37" r="2.2" fill="#111111" />
				<circle cx="57" cy="37" r="2.2" fill="#111111" />
				{/* Tiny Specular Glint */}
				<circle cx="42.3" cy="36.3" r="0.7" fill="#FFFFFF" />
				<circle cx="56.3" cy="36.3" r="0.7" fill="#FFFFFF" />
				{/* Tiny Triangle Nose */}
				<polygon points="48.8,40.8 51.2,40.8 50,42.4" fill="#111111" />
				{/* Inverted-W Mouth (=^..^=) */}
				<path
					d="M46.5 43.5 Q48.5 45.2 50 43.2 Q51.5 45.2 53.5 43.5"
					fill="none"
					stroke="#111111"
					strokeWidth="1.3"
					strokeLinecap="round"
				/>
				{/* Whiskers */}
				<line
					x1="34"
					y1="39"
					x2="26"
					y2="38"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
					opacity="0.8"
				/>
				<line
					x1="34"
					y1="42"
					x2="27"
					y2="43"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
					opacity="0.8"
				/>
				<line
					x1="66"
					y1="39"
					x2="74"
					y2="38"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
					opacity="0.8"
				/>
				<line
					x1="66"
					y1="42"
					x2="73"
					y2="43"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
					opacity="0.8"
				/>
			</g>
		),
	},
	{
		id: "happy_crescent",
		// Closed Happy Arc Eyes (^ ᴥ ^)
		render: () => (
			<g id="face-happy-crescent">
				{/* Happy Eye Arcs */}
				<path
					d="M40 38 Q43 34 46 38"
					fill="none"
					stroke="#111111"
					strokeWidth="1.8"
					strokeLinecap="round"
				/>
				<path
					d="M54 38 Q57 34 60 38"
					fill="none"
					stroke="#111111"
					strokeWidth="1.8"
					strokeLinecap="round"
				/>
				{/* Nose & Cute W Smile */}
				<polygon points="48.8,40.8 51.2,40.8 50,42.4" fill="#111111" />
				<path
					d="M46 43.2 Q48.2 45.5 50 43.2 Q51.8 45.5 54 43.2"
					fill="none"
					stroke="#111111"
					strokeWidth="1.4"
					strokeLinecap="round"
				/>
				{/* Whiskers */}
				<line
					x1="34"
					y1="40"
					x2="26"
					y2="40"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
					opacity="0.8"
				/>
				<line
					x1="66"
					y1="40"
					x2="74"
					y2="40"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
					opacity="0.8"
				/>
			</g>
		),
	},
	{
		id: "chill_sleepy",
		// Content Sleepy Horizontal Slits (- ᴥ -)
		render: () => (
			<g id="face-chill-sleepy">
				{/* Sleepy Slit Eyes */}
				<line
					x1="40"
					y1="37.5"
					x2="46"
					y2="37.5"
					stroke="#111111"
					strokeWidth="1.8"
					strokeLinecap="round"
				/>
				<line
					x1="54"
					y1="37.5"
					x2="60"
					y2="37.5"
					stroke="#111111"
					strokeWidth="1.8"
					strokeLinecap="round"
				/>
				{/* Tiny Nose & Relaxed Mouth */}
				<polygon points="48.8,40.8 51.2,40.8 50,42.4" fill="#111111" />
				<path
					d="M47 43.2 Q48.5 44.6 50 43.2 Q51.5 44.6 53 43.2"
					fill="none"
					stroke="#111111"
					strokeWidth="1.2"
					strokeLinecap="round"
				/>
				{/* Whiskers */}
				<line
					x1="34"
					y1="39"
					x2="27"
					y2="38"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
					opacity="0.7"
				/>
				<line
					x1="66"
					y1="39"
					x2="73"
					y2="38"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
					opacity="0.7"
				/>
			</g>
		),
	},
	{
		id: "side_glance",
		// Inquisitive Side-Glance Dot Eyes (· ᴥ ·)
		render: () => (
			<g id="face-side-glance">
				<circle cx="45" cy="37" r="2.2" fill="#111111" />
				<circle cx="59" cy="37" r="2.2" fill="#111111" />
				<circle cx="44.2" cy="36.2" r="0.7" fill="#FFFFFF" />
				<circle cx="58.2" cy="36.2" r="0.7" fill="#FFFFFF" />
				<polygon points="49.8,40.8 52.2,40.8 51,42.4" fill="#111111" />
				<path
					d="M48 43.5 Q49.8 45.2 51 43.2 Q52.2 45.2 54 43.5"
					fill="none"
					stroke="#111111"
					strokeWidth="1.3"
					strokeLinecap="round"
				/>
				<line
					x1="34"
					y1="40"
					x2="27"
					y2="40"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
					opacity="0.8"
				/>
				<line
					x1="66"
					y1="40"
					x2="73"
					y2="40"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
					opacity="0.8"
				/>
			</g>
		),
	},
];

// ---------------------------------------------------------------------------
// Charms, Collars & Mascot Accessories
// ---------------------------------------------------------------------------

const ACCESSORY_VARIANTS: SlotVariant[] = [
	{ id: "plain", render: () => null },
	{
		id: "bell_collar",
		// Minimalist Bell Collar around neck
		render: () => (
			<g id="acc-bell-collar">
				{/* Collar Ribbon */}
				<path
					d="M38 52 Q50 56 62 52"
					fill="none"
					stroke="#111111"
					strokeWidth="2.5"
					strokeLinecap="round"
				/>
				{/* Tiny Golden/Lime Bell */}
				<circle
					cx="50"
					cy="56"
					r="3.2"
					fill="#98EE2C"
					stroke="#111111"
					strokeWidth="1.2"
				/>
				<circle cx="50" cy="57" r="0.8" fill="#111111" />
			</g>
		),
	},
	{
		id: "head_sprout",
		// Adorable Sprout / Leaf on Head (Mascot Trope)
		render: () => (
			<g id="acc-head-sprout">
				{/* Sprout Stem */}
				<path
					d="M50 22 Q50 16 52 12"
					fill="none"
					stroke="#111111"
					strokeWidth="1.6"
					strokeLinecap="round"
				/>
				{/* Sprout Leaf */}
				<path
					d="M52 12 C56 8 62 10 60 15 C56 16 53 14 52 12 Z"
					fill="#98EE2C"
					stroke="#111111"
					strokeWidth="1.2"
					strokeLinejoin="round"
				/>
			</g>
		),
	},
	{
		id: "neko_can",
		// Floating Cat Can Snack (ねこ缶 / カリカリ from concept art!)
		render: () => (
			<g id="acc-neko-can">
				{/* Little Canned Food Container */}
				<rect
					x="74"
					y="66"
					width="16"
					height="12"
					rx="3"
					fill="#E6E1D7"
					stroke="#111111"
					strokeWidth="1.5"
				/>
				<ellipse
					cx="82"
					cy="66"
					rx="8"
					ry="2.5"
					fill="#BEB8AD"
					stroke="#111111"
					strokeWidth="1.2"
				/>
				{/* Mini Cat Face on Can Label */}
				<circle cx="82" cy="72" r="3" fill="#111111" />
				<polygon points="79,70 80.5,68 81.5,70" fill="#111111" />
				<polygon points="82.5,70 83.5,68 85,70" fill="#111111" />
				<circle cx="81" cy="72" r="0.5" fill="#FFFFFF" />
				<circle cx="83" cy="72" r="0.5" fill="#FFFFFF" />
				{/* Snack scent rays */}
				<line
					x1="77"
					y1="62"
					x2="75"
					y2="59"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
				/>
				<line
					x1="82"
					y1="60"
					x2="82"
					y2="57"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
				/>
				<line
					x1="87"
					y1="62"
					x2="89"
					y2="59"
					stroke="#111111"
					strokeWidth="1"
					strokeLinecap="round"
				/>
			</g>
		),
	},
	{
		id: "cozy_bandana",
		// Minimalist Scarf / Neckerchief
		render: () => (
			<g id="acc-cozy-bandana">
				{/* Folded Neckerchief */}
				<polygon points="36,50 64,50 50,62" fill="#111111" />
				<polygon points="39,51 61,51 50,60" fill="#98EE2C" />
			</g>
		),
	},
];

const SLOTS: Record<AvatarSlot, SlotVariant[]> = {
	body: BODY_VARIANTS,
	head: HEAD_VARIANTS,
	hair: FACE_VARIANTS,
	outfit: ACCESSORY_VARIANTS,
	accessory: ACCESSORY_VARIANTS,
};

const SLOT_ORDER: AvatarSlot[] = ["body", "head", "hair", "accessory"];

export const AVAILABLE_COSMETICS: Record<AvatarSlot, string[]> = {
	body: BODY_VARIANTS.map((v) => v.id),
	head: HEAD_VARIANTS.map((v) => v.id),
	hair: FACE_VARIANTS.map((v) => v.id),
	outfit: ACCESSORY_VARIANTS.map((v) => v.id),
	accessory: ACCESSORY_VARIANTS.map((v) => v.id),
};

// ---------------------------------------------------------------------------
// Animation Keyframes: Plump Idle Breathing & Floating
// ---------------------------------------------------------------------------

const catFloat = keyframes({
	"0%, 100%": { transform: "translateY(0px) scale(1, 1)" },
	"50%": { transform: "translateY(-3px) scale(1.02, 0.98)" },
});

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export interface HeroAvatarProps {
	seed?: string;
	size?: number;
	color?: string;
	animated?: boolean;
	slots?: Partial<Record<AvatarSlot, string>>;
	equipped?: Partial<Record<AvatarSlot, string>>;
}

export const HeroAvatar: React.FC<HeroAvatarProps> = ({
	seed = "hero",
	size = 64,
	color,
	animated = false,
	slots,
	equipped,
}) => {
	const activeSlots = slots || equipped || {};
	const reducedMotion = usePrefersReducedMotion();
	const shouldAnimate = animated && !reducedMotion;
	const uniqueId = React.useId().replace(/:/g, "-");

	const pickVariant = React.useCallback(
		(slot: AvatarSlot, list: SlotVariant[]): SlotVariant => {
			const override = activeSlots[slot];
			if (override) {
				const found = list.find((v) => v.id === override);
				if (found) return found;
			}
			const rand = seedToRandom(`${seed}-${slot}`);
			const idx = Math.floor(rand() * list.length);
			return list[idx];
		},
		[seed, activeSlots],
	);

	const body = pickVariant("body", BODY_VARIANTS);
	const head = pickVariant("head", HEAD_VARIANTS);
	const face = pickVariant("hair", FACE_VARIANTS);
	const accessory = pickVariant("accessory", ACCESSORY_VARIANTS);

	const layers = [body, head, face, accessory];

	return (
		<Box
			as="span"
			display="inline-block"
			lineHeight={0}
			color={color}
			boxSize={`${size}px`}
			position="relative"
		>
			<svg
				viewBox="0 0 100 100"
				width={size}
				height={size}
				role="img"
				aria-label={`Muchi Neko avatar for ${seed}`}
			>
				<defs>
					{/* Flat Cream/Warm-White Base matching concept art (#F6F4EE) */}
					<linearGradient
						id={`cat-cream-grad-${uniqueId}`}
						x1="0%"
						y1="0%"
						x2="0%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#FFFFFF" />
						<stop offset="100%" stopColor="#F5F3EB" />
					</linearGradient>

					{/* Deep Charcoal/Obsidian Bicolor Patch (#111111 -> #1E2024) */}
					<linearGradient
						id={`cat-dark-grad-${uniqueId}`}
						x1="0%"
						y1="0%"
						x2="0%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#1E2026" />
						<stop offset="100%" stopColor="#111113" />
					</linearGradient>

					{/* Inner Ear Soft Tone */}
					<linearGradient
						id={`cat-inner-ear-${uniqueId}`}
						x1="0%"
						y1="0%"
						x2="0%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#E8E2D5" />
						<stop offset="100%" stopColor="#D6CEC0" />
					</linearGradient>

					{/* Soft Ambient Shadow below Cat */}
					<radialGradient
						id={`cat-shadow-${uniqueId}`}
						cx="50%"
						cy="50%"
						r="50%"
					>
						<stop
							offset="0%"
							stopColor="#111111"
							stopOpacity="0.12"
						/>
						<stop
							offset="100%"
							stopColor="#111111"
							stopOpacity="0"
						/>
					</radialGradient>
				</defs>

				{/* Ground Drop Shadow */}
				<ellipse
					cx="50"
					cy="94"
					rx="28"
					ry="4"
					fill={`url(#cat-shadow-${uniqueId})`}
				/>

				{/* Animated Cat Character Group */}
				<Box
					as="g"
					animation={
						shouldAnimate
							? `${catFloat} 3.2s ease-in-out infinite`
							: undefined
					}
					style={{ transformOrigin: "50px 70px" }}
				>
					{layers.map((variant) => (
						<React.Fragment key={variant.id}>
							{variant.render(uniqueId)}
						</React.Fragment>
					))}
				</Box>
			</svg>
		</Box>
	);
};

export default HeroAvatar;
