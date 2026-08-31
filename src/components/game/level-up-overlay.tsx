import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { usePrefersReducedMotion } from "./hooks";
import { useTranslation } from "@/lib/i18n";

const fadeIn = keyframes({
	from: { opacity: 0 },
	to: { opacity: 1 },
});

const popIn = keyframes({
	"0%": { transform: "scale(0)", opacity: 0 },
	"60%": { transform: "scale(1.15)", opacity: 1 },
	"100%": { transform: "scale(1)", opacity: 1 },
});

const prismSpin = keyframes({
	from: { transform: "rotate(0deg) scale(1)" },
	to: { transform: "rotate(360deg) scale(1.08)" },
});

const shardFly = keyframes({
	"0%": { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
	"100%": {
		transform: "translate(var(--tx), var(--ty)) rotate(var(--rot))",
		opacity: 0,
	},
});

const SHARD_COUNT = 10;

// Matches theme.ts holo.cyan/lavender/blush/butter pastel holographic spectrum
const HOLO_STOPS = [
	"rgba(165, 243, 252, 0.85)", // Prism Cyan
	"rgba(221, 214, 254, 0.85)", // Soft Lavender
	"rgba(251, 207, 232, 0.85)", // Pastel Blush
	"rgba(254, 240, 138, 0.85)", // Spectral Pale Yellow
];

export interface LevelUpOverlayProps {
	level: number;
	open: boolean;
	onDone: () => void;
}

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({
	level,
	open,
	onDone,
}) => {
	const { t } = useTranslation();
	const reducedMotion = usePrefersReducedMotion();

	React.useEffect(() => {
		if (!open) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onDone();
		};
		window.addEventListener("keydown", handleKeyDown);
		const timeout = setTimeout(onDone, 2200);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			clearTimeout(timeout);
		};
	}, [open, onDone]);

	if (!open) return null;

	const shards = reducedMotion
		? []
		: Array.from({ length: SHARD_COUNT }, (_, i) => {
				const angle = (i / SHARD_COUNT) * 2 * Math.PI;
				const distance = 160 + (i % 3) * 30;
				return {
					id: i,
					tx: Math.cos(angle) * distance,
					ty: Math.sin(angle) * distance,
					rot: (i % 2 === 0 ? 1 : -1) * 180,
					rotateStart: (angle * 180) / Math.PI,
					delay: (i % 4) * 0.03,
				};
			});

	return (
		<Box
			position="fixed"
			inset={0}
			zIndex={9999}
			display="flex"
			alignItems="center"
			justifyContent="center"
			bg="rgba(12, 14, 20, 0.65)"
			backdropFilter="blur(8px)"
			animation={`${fadeIn} 0.25s ease-out`}
		>
			{!reducedMotion && (
				<Box
					position="absolute"
					boxSize="420px"
					rounded="full"
					filter="blur(40px)"
					opacity={0.65}
					backgroundImage={`conic-gradient(from 0deg, ${HOLO_STOPS.join(", ")}, ${HOLO_STOPS[0]})`}
					animation={`${prismSpin} 6s linear infinite`}
				/>
			)}

			{!reducedMotion &&
				shards.map((shard) => (
					<Box
						key={shard.id}
						position="absolute"
						boxSize="10px"
						rounded="sm"
						bg="mint.solid"
						style={
							{
								"--tx": `${shard.tx}px`,
								"--ty": `${shard.ty}px`,
								"--rot": `${shard.rot}deg`,
								transform: `rotate(${shard.rotateStart}deg)`,
							} as React.CSSProperties
						}
						animation={`${shardFly} 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${shard.delay}s both`}
					/>
				))}

			<Box
				position="relative"
				textAlign="center"
				animation={
					reducedMotion
						? undefined
						: `${popIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both`
				}
			>
				<Text
					fontSize="sm"
					fontWeight="semibold"
					letterSpacing="0.18em"
					textTransform="uppercase"
					color="mint.fg"
				>
					{t("components.game.levelUp.title")}
				</Text>
				<Heading fontSize="7xl" color="white" lineHeight="1">
					{level}
				</Heading>
			</Box>
		</Box>
	);
};

export default LevelUpOverlay;
