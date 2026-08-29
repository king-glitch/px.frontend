import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { usePrefersReducedMotion } from "./hooks";

export type Attribute =
	"vigor" | "craft" | "mind" | "order" | "spirit" | "bond" | "fortune";

export interface AttributeMeta {
	key: Attribute;
	label: string;
	/** The quest category whose EXP raises this attribute. */
	source: string;
	description: string;
}

export const ATTRIBUTES: AttributeMeta[] = [
	{
		key: "vigor",
		label: "VIGOR",
		source: "health",
		description: "Raised by health quests and your daily health award.",
	},
	{
		key: "craft",
		label: "CRAFT",
		source: "work",
		description: "Raised by work quests — anything you build or ship.",
	},
	{
		key: "mind",
		label: "MIND",
		source: "learning",
		description: "Raised by learning quests — study, reading, practice.",
	},
	{
		key: "order",
		label: "ORDER",
		source: "chores",
		description: "Raised by chores — the upkeep that keeps everything else running.",
	},
	{
		key: "spirit",
		label: "SPIRIT",
		source: "mindfulness",
		description: "Raised by mindfulness quests — rest, reflection, stillness.",
	},
	{
		key: "bond",
		label: "BOND",
		source: "social",
		description: "Raised by social quests — time spent on people.",
	},
	{
		key: "fortune",
		label: "FORTUNE",
		source: "finance",
		description: "Raised by finance quests and by logging your income and expenses.",
	},
];

const RING_STEPS = [0.25, 0.5, 0.75, 1];

function getPoint(
	index: number,
	fraction: number,
	cx: number,
	cy: number,
	radius: number,
): [number, number] {
	// Start at 12 o'clock (-PI / 2) and distribute 7 points clockwise
	const angle = -Math.PI / 2 + (index * 2 * Math.PI) / ATTRIBUTES.length;
	return [
		cx + Math.cos(angle) * radius * fraction,
		cy + Math.sin(angle) * radius * fraction,
	];
}

function getPolygonPoints(
	fractions: number[],
	cx: number,
	cy: number,
	radius: number,
): string {
	return fractions
		.map((fraction, index) =>
			getPoint(index, fraction, cx, cy, radius).join(","),
		)
		.join(" ");
}

const growIn = keyframes({
	from: { transform: "scale(0.1)", opacity: 0 },
	to: { transform: "scale(1)", opacity: 1 },
});

export interface AttributeRadarProps {
	values: Record<Attribute, number>;
	max: number;
	size?: number;
}

export const AttributeRadar: React.FC<AttributeRadarProps> = ({
	values,
	max = 100,
	size = 280,
}) => {
	const reducedMotion = usePrefersReducedMotion();
	const padding = 44;
	const cx = size / 2;
	const cy = size / 2;
	const radius = size / 2 - padding;

	const effectiveMax = Math.max(20, max);
	const valueFractions = ATTRIBUTES.map((attr) => {
		const val = values[attr.key] ?? 0;
		return Math.max(0.12, Math.min(1, val / effectiveMax));
	});

	const areaPoints = getPolygonPoints(valueFractions, cx, cy, radius);

	return (
		<Box
			display="inline-flex"
			justifyContent="center"
			alignItems="center"
			position="relative"
		>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				role="img"
				aria-label="Attribute Radar Matrix"
				style={{ overflow: "visible" }}
			>
				<defs>
					{/* Monochrome + Lime Gradient */}
					<linearGradient
						id="radar-mesh-grad"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop
							offset="0%"
							stopColor="#98EE2C"
							stopOpacity="0.35"
						/>
						<stop
							offset="100%"
							stopColor="#98EE2C"
							stopOpacity="0.08"
						/>
					</linearGradient>
					<filter
						id="radar-glow"
						x="-20%"
						y="-20%"
						width="140%"
						height="140%"
					>
						<feDropShadow
							dx="0"
							dy="0"
							stdDeviation="4"
							floodColor="#98EE2C"
							floodOpacity="0.35"
						/>
					</filter>
				</defs>

				{/* Background Concentric Grid Rings */}
				<Box as="g" color="border" opacity={0.4}>
					{RING_STEPS.map((step) => (
						<polygon
							key={step}
							points={getPolygonPoints(
								ATTRIBUTES.map(() => step),
								cx,
								cy,
								radius,
							)}
							fill="none"
							stroke="currentColor"
							strokeWidth={step === 1 ? 1.5 : 1}
							strokeDasharray={step === 1 ? undefined : "3 3"}
						/>
					))}

					{/* Radial Axis Spokes */}
					{ATTRIBUTES.map((attr, index) => {
						const [x, y] = getPoint(index, 1, cx, cy, radius);
						return (
							<line
								key={attr.key}
								x1={cx}
								y1={cy}
								x2={x}
								y2={y}
								stroke="currentColor"
								strokeWidth={1}
							/>
						);
					})}
				</Box>

				{/* Filled Attribute Polygon matching theme Cyber Mint / Holographic */}
				<Box
					as="g"
					style={{ transformOrigin: `${cx}px ${cy}px` }}
					animation={
						reducedMotion
							? undefined
							: `${growIn} 600ms cubic-bezier(0.16, 1, 0.3, 1) both`
					}
				>
					<polygon
						points={areaPoints}
						fill="url(#radar-mesh-grad)"
						stroke="#98EE2C"
						strokeWidth={2}
						strokeLinejoin="round"
						filter="url(#radar-glow)"
					/>

					{/* Vertex Data Points */}
					{valueFractions.map((fraction, index) => {
						const [x, y] = getPoint(
							index,
							fraction,
							cx,
							cy,
							radius,
						);
						const attr = ATTRIBUTES[index];
						return (
							<circle
								key={attr.key}
								cx={x}
								cy={y}
								r={4.5}
								fill="var(--chakra-colors-mint-fg)"
								stroke="var(--chakra-colors-bg-panel)"
								strokeWidth={2}
							/>
						);
					})}
				</Box>

				{/* Labels with Precision Alignment */}
				<Box as="g">
					{ATTRIBUTES.map((attr, index) => {
						const angle =
							-Math.PI / 2 +
							(index * 2 * Math.PI) / ATTRIBUTES.length;
						const [x, y] = getPoint(index, 1.22, cx, cy, radius);
						const val = values[attr.key] ?? 0;

						const cos = Math.cos(angle);
						const sin = Math.sin(angle);

						let textAnchor: "middle" | "start" | "end" = "middle";
						if (cos > 0.2) textAnchor = "start";
						else if (cos < -0.2) textAnchor = "end";

						let dy = "0.35em";
						if (sin < -0.6)
							dy = "-0.2em"; // top
						else if (sin > 0.6) dy = "0.8em"; // bottom

						return (
							<g key={attr.key}>
								<text
									x={x}
									y={y}
									dy={dy}
									fill="var(--chakra-colors-fg)"
									fontSize={10}
									fontWeight={700}
									letterSpacing="0.06em"
									textAnchor={textAnchor}
									style={{ userSelect: "none" }}
								>
									{attr.label}
								</text>
								<text
									x={x}
									y={
										y +
										(sin < -0.6 ? 11 : sin > 0.6 ? 13 : 12)
									}
									dy={dy}
									fill="var(--chakra-colors-fg-muted)"
									fontSize={9}
									fontWeight={600}
									fontFamily="mono"
									textAnchor={textAnchor}
									style={{ userSelect: "none" }}
								>
									{val}
								</text>
							</g>
						);
					})}
				</Box>
			</svg>
		</Box>
	);
};

export default AttributeRadar;
