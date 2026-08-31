import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import {
	CREATURE_CONFIGS,
	type FloatingCreatureConfig,
} from "./creature-configs";

// Smooth physics-based mouse parallax hook (GPU-lerped 60fps)
function useMouseParallax() {
	const [offset, setOffset] = React.useState({ x: 0, y: 0 });
	const targetRef = React.useRef({ x: 0, y: 0 });
	const currentRef = React.useRef({ x: 0, y: 0 });
	const rafRef = React.useRef<number | null>(null);

	React.useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			const { innerWidth, innerHeight } = window;
			const nx = (e.clientX / innerWidth - 0.5) * 2;
			const ny = (e.clientY / innerHeight - 0.5) * 2;
			targetRef.current = { x: nx, y: ny };
		};

		const animate = () => {
			if (document.hidden) {
				rafRef.current = null;
				return;
			}

			const k = 0.075;
			currentRef.current.x +=
				(targetRef.current.x - currentRef.current.x) * k;
			currentRef.current.y +=
				(targetRef.current.y - currentRef.current.y) * k;

			setOffset({
				x: Math.round(currentRef.current.x * 1000) / 1000,
				y: Math.round(currentRef.current.y * 1000) / 1000,
			});

			rafRef.current = requestAnimationFrame(animate);
		};

		const handleVisibilityChange = () => {
			if (!document.hidden && !rafRef.current) {
				rafRef.current = requestAnimationFrame(animate);
			}
		};

		window.addEventListener("mousemove", handleMouseMove, {
			passive: true,
		});
		document.addEventListener("visibilitychange", handleVisibilityChange);
		rafRef.current = requestAnimationFrame(animate);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener(
				"visibilitychange",
				handleVisibilityChange,
			);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return offset;
}

export const FloatingCreaturesScene: React.FC = () => {
	const mouse = useMouseParallax();

	const backCreatures = CREATURE_CONFIGS.filter((c) => c.layer === "back");
	const frontCreatures = CREATURE_CONFIGS.filter((c) => c.layer === "front");

	const renderCreature = (creature: FloatingCreatureConfig) => {
		const isCenter = creature.id === "starelly";
		const baseTransform = isCenter
			? "translate3d(-50%, 0, 0)"
			: "translate3d(0, 0, 0)";
		const parallaxTransform = `translate3d(${mouse.x * creature.depth}px, ${mouse.y * creature.depth}px, 0)`;

		return (
			<Box
				key={creature.id}
				position="absolute"
				w={creature.boxSize}
				h={creature.boxSize}
				style={{
					...creature.style,
					transform: `${baseTransform} ${parallaxTransform}`,
					filter:
						creature.blur !== "0px"
							? `blur(${creature.blur})`
							: undefined,
					opacity: creature.opacity,
					willChange: "transform, filter",
				}}
				pointerEvents="none"
				userSelect="none"
			>
				{/* Starfall Floating Loop */}
				<Box
					w="full"
					h="full"
					position="relative"
					animation={creature.animation}
				>
					{/* Individual creature soft glow */}
					<Box
						position="absolute"
						inset="-15%"
						opacity={0.35}
						style={{
							background: creature.glowGradient,
						}}
					/>

					{/* Creature Sprite */}
					<Box
						position="absolute"
						inset="0"
						style={{
							willChange: "transform",
						}}
						css={{
							backgroundImage: `url('${creature.src}')`,
							backgroundSize: "contain",
							backgroundPosition: "center center",
							backgroundRepeat: "no-repeat",
						}}
					/>
				</Box>
			</Box>
		);
	};

	return (
		<Box
			position="absolute"
			inset="0"
			zIndex={0}
			pointerEvents="none"
			userSelect="none"
			overflow="visible"
		>
			{/* Ambient central backdrop glow centered in creature stage */}
			<Box
				position="absolute"
				left="50%"
				top="50%"
				transform={`translate(-50%, -50%) translate3d(${mouse.x * 12}px, ${mouse.y * 12}px, 0)`}
				w="clamp(550px, 60vw, 900px)"
				h="clamp(450px, 50vw, 750px)"
				opacity={0.65}
				style={{
					background:
						"radial-gradient(circle at center, rgba(221, 214, 254, 0.6) 0%, rgba(251, 207, 232, 0.4) 35%, rgba(165, 243, 252, 0.25) 55%, transparent 75%)",
					willChange: "transform",
				}}
			/>

			{/* Layer 0 (Behind Text): Starfall Background Creatures */}
			<Box position="absolute" inset="0" zIndex={0}>
				{backCreatures.map(renderCreature)}
			</Box>

			{/* Layer 1 (Middle): Massive Hero Typography Exactly Centered in Creature Box */}
			<Flex
				position="absolute"
				left="50%"
				top="50%"
				transform={`translate(-50%, -50%) translate3d(${mouse.x * 22}px, ${mouse.y * 22}px, 0)`}
				zIndex={1}
				pointerEvents="none"
				userSelect="none"
				direction="column"
				align="center"
				textAlign="center"
				w="full"
				style={{
					willChange: "transform",
				}}
			>
				<Text
					fontSize={{
						base: "4.5rem",
						md: "6.5rem",
						lg: "8.5rem",
						xl: "11rem",
					}}
					fontWeight="900"
					letterSpacing="-0.07em"
					lineHeight="0.85"
					color="fg"
					textTransform="uppercase"
				>
					PX.OS
				</Text>
			</Flex>

			{/* Layer 2 (In Front of Text): Starfall Foreground Creatures */}
			<Box position="absolute" inset="0" zIndex={2}>
				{frontCreatures.map(renderCreature)}
			</Box>
		</Box>
	);
};
