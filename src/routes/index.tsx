// ponytail: Dashboard view rendered inside persistent AppLayout
import { PillButton } from "@/components/ui/pill-button";
import {
	Box,
	Circle,
	Flex,
	Grid,
	GridItem,
	HStack,
	Heading,
	Icon,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import React from "react";
import {
	LuActivity,
	LuArrowUpRight,
	LuCalendarDays,
	LuCircleCheck,
	LuLayoutDashboard,
	LuMessageSquare,
	LuSparkles,
	LuTarget,
	LuWallet,
} from "react-icons/lu";
import { Link, useLocation } from "react-router";

const railItems = [
	{ icon: LuLayoutDashboard, label: "Dashboard", to: "/dashboard" },
	{ icon: LuWallet, label: "Financial", to: "/financial" },
	{ icon: LuCircleCheck, label: "Tasks & Habits", to: "/tasks" },
	{ icon: LuActivity, label: "Health", to: "/health" },
	{ icon: LuCalendarDays, label: "Calendar" },
	{ icon: LuTarget, label: "Goals" },
];

const trackerRows = [
	{ label: "Work 1 - 5 hrs", tone: "solid" as const },
	{ label: "Valuable investment", tone: "solid" as const },
	{ label: "Complete at least 10 task today - 2/10", tone: "muted" as const },
	{ label: "Spent 30 seconds", tone: "muted" as const },
	{ label: "Still time", tone: "muted" as const },
];

// Luminous Holographic Glassmorphism tokens (Enhanced frosted depth & specular glow)
const holoGlassCard = {
	bg: {
		base: "rgba(255, 255, 255, 0.65)",
		_dark: "rgba(18, 22, 34, 0.65)",
	},
	backdropFilter: "blur(24px) saturate(180%)",
	borderWidth: "1px",
	borderColor: {
		base: "rgba(255, 255, 255, 0.9)",
		_dark: "rgba(255, 255, 255, 0.16)",
	},
	rounded: "3xl",
	shadow: {
		base: "0 16px 40px -10px rgba(15, 23, 42, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.95), inset 0 0 0 1px rgba(255, 255, 255, 0.6)",
		_dark: "0 16px 40px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
	},
	transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
	_hover: {
		transform: "translateY(-2px)",
		shadow: {
			base: "0 24px 52px -12px rgba(15, 23, 42, 0.1), inset 0 1px 2px rgba(255, 255, 255, 1), inset 0 0 0 1px rgba(255, 255, 255, 0.8)",
			_dark: "0 24px 52px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.18), inset 0 0 0 1px rgba(255, 255, 255, 0.12)",
		},
	},
} as const;

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
			const k = 0.075;
			currentRef.current.x += (targetRef.current.x - currentRef.current.x) * k;
			currentRef.current.y += (targetRef.current.y - currentRef.current.y) * k;

			setOffset({
				x: Math.round(currentRef.current.x * 1000) / 1000,
				y: Math.round(currentRef.current.y * 1000) / 1000,
			});

			rafRef.current = requestAnimationFrame(animate);
		};

		window.addEventListener("mousemove", handleMouseMove, { passive: true });
		rafRef.current = requestAnimationFrame(animate);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return offset;
}

// Organic Starfall cascading floating keyframes
const starfallHero = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)" },
	"33%": { transform: "translate3d(8px, -14px, 0) scale(1.02) rotate(1.5deg)" },
	"66%": { transform: "translate3d(-8px, -20px, 0) scale(0.99) rotate(-1.5deg)" },
});

const starfallDrift1 = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
	"50%": { transform: "translate3d(14px, -18px, 0) scale(1.03) rotate(3deg)" },
});

const starfallDrift2 = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
	"50%": { transform: "translate3d(-12px, -15px, 0) scale(0.97) rotate(-2.5deg)" },
});

const starfallDrift3 = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
	"50%": { transform: "translate3d(10px, -22px, 0) scale(1.04) rotate(2deg)" },
});

const starfallDrift4 = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
	"50%": { transform: "translate3d(-14px, -20px, 0) scale(1.03) rotate(-2deg)" },
});

interface FloatingCreatureConfig {
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

// Starfall celestial cascading arrangement across 3D depth planes with Optical Focus & Bokeh
const CREATURE_CONFIGS: FloatingCreatureConfig[] = [
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
			"radial-gradient(circle at 50% 50%, rgba(165, 243, 252, 0.5) 0%, rgba(221, 214, 254, 0.3) 45%, transparent 75%)",
		blur: "2.5px",
		opacity: 0.9,
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
			"radial-gradient(circle at 50% 50%, rgba(254, 240, 138, 0.45) 0%, rgba(251, 207, 232, 0.3) 45%, transparent 75%)",
		blur: "7px",
		opacity: 0.6,
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
			"radial-gradient(circle at 50% 50%, rgba(251, 207, 232, 0.5) 0%, rgba(221, 214, 254, 0.3) 45%, transparent 75%)",
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
			"radial-gradient(circle at 50% 50%, rgba(221, 214, 254, 0.55) 0%, rgba(251, 207, 232, 0.38) 45%, transparent 75%)",
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
			"radial-gradient(circle at 50% 50%, rgba(163, 247, 136, 0.45) 0%, rgba(165, 243, 252, 0.3) 45%, transparent 75%)",
		blur: "4px",
		opacity: 0.82,
	},
];

const FloatingCreaturesScene: React.FC = () => {
	const mouse = useMouseParallax();

	const backCreatures = CREATURE_CONFIGS.filter((c) => c.layer === "back");
	const frontCreatures = CREATURE_CONFIGS.filter((c) => c.layer === "front");

	const renderCreature = (creature: FloatingCreatureConfig) => {
		const isCenter = creature.id === "starelly";
		const baseTransform = isCenter ? "translate3d(-50%, 0, 0)" : "translate3d(0, 0, 0)";
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
					filter: creature.blur !== "0px" ? `blur(${creature.blur})` : undefined,
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
				transform={`translate(-50%, -50%) translate3d(${mouse.x * 8}px, ${mouse.y * 8}px, 0)`}
				w="clamp(420px, 40vw, 650px)"
				h="clamp(320px, 30vw, 500px)"
				opacity={0.45}
				style={{
					background:
						"radial-gradient(circle at center, rgba(221, 214, 254, 0.5) 0%, rgba(251, 207, 232, 0.3) 40%, rgba(165, 243, 252, 0.2) 60%, transparent 75%)",
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
					fontSize={{ base: "4.5rem", md: "6.5rem", lg: "8.5rem", xl: "11rem" }}
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

interface OutlinePillProps {
	children: React.ReactNode;
}

const OutlinePill: React.FC<OutlinePillProps> = ({ children }) => (
	<Flex
		as="span"
		display="inline-flex"
		align="center"
		justify="center"
		borderWidth="1.5px"
		borderColor="fg"
		rounded="pill"
		px="0.55em"
		py="0.12em"
		lineHeight="1.05"
	>
		{children}
	</Flex>
);

export const Index: React.FC = () => {
	const { pathname } = useLocation();

	return (
		<Box
			position="relative"
			flex="1"
			h="full"
			overflow="hidden"
			display="flex"
			flexDirection="column"
			justifyContent="space-between"
		>
			<Grid
				flex="1"
				minH="0"
				h="full"
				gap={{ base: 4, lg: 6, xl: 8 }}
				templateColumns={{
					base: "1fr",
					lg: "76px minmax(0, 1fr) 370px",
					xl: "84px minmax(0, 1fr) 420px",
				}}
				position="relative"
				zIndex={1}
			>
				{/* Left Floating Rail */}
				<GridItem
					display={{ base: "none", lg: "flex" }}
					alignItems="flex-end"
					pb={3}
				>
					<VStack
						gap={2.5}
						bg={{
							base: "rgba(255, 255, 255, 0.7)",
							_dark: "rgba(20, 24, 36, 0.7)",
						}}
						backdropFilter="blur(24px) saturate(180%)"
						borderWidth="1px"
						borderColor={{
							base: "rgba(255, 255, 255, 0.9)",
							_dark: "rgba(255, 255, 255, 0.16)",
						}}
						rounded="pill"
						py={5}
						px={2.5}
						shadow={{
							base: "0 16px 40px -10px rgba(15, 23, 42, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.95)",
							_dark: "0 16px 40px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.12)",
						}}
					>
						{railItems.map((item) => {
							const active =
								item.to === pathname ||
								(item.to === "/dashboard" && pathname === "/");

							if (item.to) {
								return (
									<Circle
										key={item.label}
										asChild
										title={item.label}
										aria-label={item.label}
										aria-current={active ? "page" : undefined}
										size="11"
										bg={active ? "bg.solid" : "transparent"}
										color={active ? "fg.inverted" : "fg.muted"}
										shadow={active ? "glass" : "none"}
										cursor="pointer"
										transition="all 0.15s ease-out"
										_hover={{
											color: active ? "fg.inverted" : "fg",
											bg: active ? "bg.solid" : "bg.panel",
											transform: "scale(1.08)",
										}}
									>
										<Link to={item.to}>
											<Icon as={item.icon} boxSize={4.5} />
										</Link>
									</Circle>
								);
							}

							return (
								<Circle
									key={item.label}
									title={item.label}
									aria-label={item.label}
									size="11"
									bg="transparent"
									color="fg.muted"
									cursor="pointer"
									transition="all 0.15s ease-out"
									_hover={{ color: "fg", transform: "scale(1.08)" }}
								>
									<Icon as={item.icon} boxSize={4.5} />
								</Circle>
							);
						})}
					</VStack>
				</GridItem>

				{/* Center Column: Open Creature Stage Box & Bottom Daily Summary */}
				<GridItem
					h="full"
					minH="0"
					display="flex"
					flexDirection="column"
					justifyContent="space-between"
					position="relative"
				>
					{/* Dedicated Creature Stage Box (Fills entire available space above Daily Summary) */}
					<Box
						flex="1"
						minH="0"
						position="relative"
						w="full"
						overflow="visible"
						display={{ base: "none", lg: "block" }}
					>
						<FloatingCreaturesScene />
					</Box>

					{/* Bottom: Daily Summary Dock */}
					<Stack gap={3.5} pb={3} position="relative" zIndex={2}>
						<HStack gap={2.5}>
							<Text fontSize="lg" fontWeight="bold">
								Daily
							</Text>
							<Text fontSize="lg">
								<OutlinePill>summary</OutlinePill>
							</Text>
						</HStack>

						<Grid
							gap={{ base: 3, xl: 4 }}
							templateColumns={{
								base: "1fr",
								sm: "repeat(2, 1fr)",
								xl: "repeat(4, 1fr)",
							}}
						>
							{/* 1. To do */}
							<Box
								{...holoGlassCard}
								p={{ base: 5, xl: 6 }}
								minH={{ base: "140px", xl: "155px" }}
								position="relative"
							>
								<Text fontSize="sm" fontWeight="semibold" color="fg.muted">
									To do
								</Text>
								<Circle
									size="9"
									bg="mint.solid"
									color="mint.contrast"
									position="absolute"
									top={4}
									right={4}
									shadow="glass"
									transition="all 0.15s ease-out"
									_hover={{ transform: "scale(1.1)" }}
								>
									<Icon as={LuArrowUpRight} boxSize={4.5} />
								</Circle>
								<HStack align="baseline" gap={2} mt={4}>
									<Text
										fontSize={{ base: "2.6rem", xl: "3.2rem" }}
										fontWeight="bold"
										letterSpacing="-0.04em"
										lineHeight="1"
									>
										158
									</Text>
									<Text fontSize="sm" color="fg.muted" fontWeight="medium">
										tasks
									</Text>
								</HStack>
							</Box>

							{/* 2. On going */}
							<Box
								{...holoGlassCard}
								p={{ base: 5, xl: 6 }}
								minH={{ base: "140px", xl: "155px" }}
								position="relative"
							>
								<Text fontSize="sm" fontWeight="semibold" color="fg.muted">
									On going
								</Text>
								<Circle
									size="9"
									bg="bg.solid"
									color="fg.inverted"
									position="absolute"
									top={4}
									right={4}
									shadow="glass"
									transition="all 0.15s ease-out"
									_hover={{ transform: "scale(1.1)" }}
								>
									<Icon as={LuArrowUpRight} boxSize={4.5} />
								</Circle>
								<HStack align="baseline" gap={2} mt={4}>
									<Text
										fontSize={{ base: "2.6rem", xl: "3.2rem" }}
										fontWeight="bold"
										letterSpacing="-0.04em"
										lineHeight="1"
									>
										28
									</Text>
									<Text fontSize="sm" color="fg.muted" fontWeight="medium">
										tasks
									</Text>
								</HStack>
							</Box>

							{/* 3. Complete */}
							<Box
								{...holoGlassCard}
								p={{ base: 5, xl: 6 }}
								minH={{ base: "140px", xl: "155px" }}
								position="relative"
							>
								<Text fontSize="sm" fontWeight="semibold" color="fg.muted">
									Complete
								</Text>
								<HStack
									bg={{
										base: "rgba(255, 255, 255, 0.85)",
										_dark: "rgba(25, 30, 45, 0.85)",
									}}
									backdropFilter="blur(24px) saturate(180%)"
									borderWidth="1px"
									borderColor={{
										base: "rgba(255, 255, 255, 0.95)",
										_dark: "rgba(255, 255, 255, 0.18)",
									}}
									rounded="pill"
									px={5}
									py={2.5}
									shadow={{
										base: "0 10px 24px -4px rgba(15, 23, 42, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.95)",
										_dark: "0 10px 24px -4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
									}}
									justify="space-between"
									mt={4}
									w="fit-content"
									gap={4}
									cursor="pointer"
									transition="all 0.15s ease-out"
									_hover={{ transform: "translateY(-1px)", shadow: "float" }}
								>
									<HStack align="baseline" gap={2}>
										<Text
											fontSize="2.2rem"
											fontWeight="bold"
											letterSpacing="-0.04em"
											lineHeight="1"
										>
											02
										</Text>
										<Text fontSize="sm" color="fg.muted" fontWeight="medium">
											tasks
										</Text>
									</HStack>
									<Circle size="7" bg="bg.muted" color="fg">
										<Icon as={LuArrowUpRight} boxSize={3.5} />
									</Circle>
								</HStack>
							</Box>

							{/* 4. Earnings */}
							<Box
								{...holoGlassCard}
								p={{ base: 5, xl: 6 }}
								minH={{ base: "140px", xl: "155px" }}
								position="relative"
							>
								<HStack gap={2} color="fg.muted">
									<Icon as={LuWallet} boxSize={4.5} />
									<Text fontSize="sm" fontWeight="semibold">
										Earnings
									</Text>
								</HStack>
								<Text
									fontSize={{ base: "1.8rem", xl: "2.2rem" }}
									fontWeight="bold"
									letterSpacing="-0.03em"
									mt={3.5}
								>
									$2,932.07
								</Text>
								<Text fontSize="sm" color="fg.muted" fontWeight="medium">
									02 tasks
								</Text>
								<Circle
									size="8"
									bg="bg.panel"
									position="absolute"
									bottom={4}
									right={4}
									shadow="glass"
									transition="all 0.15s ease-out"
									_hover={{ transform: "scale(1.1)" }}
								>
									<Icon as={LuArrowUpRight} boxSize={4} />
								</Circle>
							</Box>
						</Grid>
					</Stack>
				</GridItem>

				{/* Right Side Widgets: Habit Tracker & Performance */}
				<GridItem h="full" minH="0">
					<Flex
						direction="column"
						h="full"
						justify="space-between"
						gap={5}
						pb={3}
					>
						{/* Habit Tracker Card */}
						<Box {...holoGlassCard} p={{ base: 6, xl: 7 }}>
							<Heading
								fontSize="xl"
								fontWeight="normal"
								letterSpacing="-0.03em"
							>
								Habit <OutlinePill>tracker</OutlinePill>
							</Heading>
							<Text fontSize="sm" color="fg.muted" mt={1}>
								Today, Dec 28, 2030
							</Text>

							<Flex wrap="wrap" gap={2.5} mt={4}>
								{trackerRows.map((row) => (
									<HStack
										key={row.label}
										flex="1 1 auto"
										bg={
											row.tone === "solid"
												? "bg.solid"
												: {
														base: "rgba(255, 255, 255, 0.8)",
														_dark: "rgba(25, 30, 45, 0.8)",
													}
										}
										color={
											row.tone === "solid"
												? "fg.inverted"
												: "fg"
										}
										borderWidth={
											row.tone === "solid" ? "0" : "1px"
										}
										borderColor={{
											base: "rgba(255, 255, 255, 0.9)",
											_dark: "rgba(255, 255, 255, 0.12)",
										}}
										rounded="pill"
										px={4}
										py={2}
										gap={2.5}
										cursor="pointer"
										transition="all 0.15s ease-out"
										shadow={
											row.tone === "solid"
												? "none"
												: "0 2px 8px -2px rgba(15, 23, 42, 0.04)"
										}
										_hover={{ transform: "translateY(-1px)", shadow: "glass" }}
									>
										<Circle
											size="2.5"
											bg={
												row.tone === "solid"
													? "mint.solid"
													: "fg.muted"
											}
										/>
										<Text fontSize="sm" fontWeight="medium" whiteSpace="nowrap">
											{row.label}
										</Text>
									</HStack>
								))}
							</Flex>
						</Box>

						{/* Focus Flow & Studio Companion Action Card */}
						<Box {...holoGlassCard} p={{ base: 5, xl: 6 }}>
							<Flex justify="space-between" align="center" mb={2.5}>
								<HStack gap={2}>
									<Circle size="2" bg="mint.solid" />
									<Text
										fontSize="xs"
										fontWeight="bold"
										textTransform="uppercase"
										letterSpacing="0.08em"
										color="fg.muted"
									>
										Focus Momentum
									</Text>
								</HStack>
								<Text
									fontSize="xs"
									fontWeight="semibold"
									color="mint.fg"
									bg="mint.subtle"
									px={2.5}
									py={0.5}
									rounded="pill"
								>
									94% Flow
								</Text>
							</Flex>

							<HStack justify="space-between" align="center" mb={3.5}>
								<VStack align="flex-start" gap={0}>
									<Heading
										fontSize="2xl"
										fontWeight="bold"
										letterSpacing="-0.03em"
									>
										45:00
									</Heading>
									<Text fontSize="xs" color="fg.muted">
										Deep Work & Cognitive Sync
									</Text>
								</VStack>
								<Circle
									size="10"
									bg="bg.solid"
									color="fg.inverted"
									shadow="glass"
								>
									<Icon as={LuSparkles} boxSize={5} />
								</Circle>
							</HStack>

							<HStack gap={2}>
								<PillButton
									size="xs"
									variant="dark"
									flex="1"
									icon={LuArrowUpRight}
								>
									FOCUS SPRINT
								</PillButton>
								<PillButton
									size="xs"
									variant="outline"
									flex="1"
									icon={LuMessageSquare}
								>
									CHAT CREW
								</PillButton>
							</HStack>
						</Box>

						{/* Performance Stats Card */}
						<Box {...holoGlassCard} p={{ base: 6, xl: 7 }}>
							<Text fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="0.08em">
								Performance
							</Text>
							<Stack gap={2.5} mt={4}>
								<Box
									h="3.5"
									rounded="pill"
									bg="bg.muted"
									overflow="hidden"
								>
									<Box
										h="full"
										w="72%"
										rounded="pill"
										bg="bg.solid"
									/>
								</Box>
								<Box
									h="3.5"
									rounded="pill"
									bg="bg.muted"
									overflow="hidden"
								>
									<Box
										h="full"
										w="45%"
										rounded="pill"
										bg="bg.solid"
									/>
								</Box>
							</Stack>

							<HStack align="baseline" gap={2} mt={5}>
								<Text
									fontSize={{ base: "3.2rem", xl: "3.8rem" }}
									fontWeight="bold"
									letterSpacing="-0.04em"
									lineHeight="1"
								>
									35
								</Text>
								<Text
									fontSize={{ base: "3.2rem", xl: "3.8rem" }}
									color="fg.muted"
									fontWeight="light"
									lineHeight="1"
								>
									/
								</Text>
								<Text
									fontSize={{ base: "3.2rem", xl: "3.8rem" }}
									fontWeight="bold"
									letterSpacing="-0.04em"
									lineHeight="1"
								>
									82
								</Text>
								<Text
									fontSize="sm"
									color="fg.muted"
									pl={3}
									fontWeight="medium"
								>
									Total target
								</Text>
							</HStack>
						</Box>
					</Flex>
				</GridItem>
			</Grid>
		</Box>
	);
};

export default Index;
