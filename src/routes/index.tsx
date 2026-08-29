import {
	useDuolingoStatus,
	useFinanceSummary,
	useHealthDay,
	usePlayerSummary,
	useQuests,
	useTodayQuests,
} from "@/api";
import { ExpBar, HeroAvatar, LevelRing, StreakFlame } from "@/components/game";
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
	LuLeaf,
	LuSettings,
	LuTarget,
} from "react-icons/lu";
import { Link, useLocation } from "react-router";

const railItems = [
	{ icon: LuLayoutDashboard, label: "Dashboard", to: "/dashboard" },
	{ icon: LuCircleCheck, label: "Tasks & Habits", to: "/tasks" },
	{ icon: LuActivity, label: "Health", to: "/health" },
	{ icon: LuSettings, label: "Settings", to: "/settings" },
	{ icon: LuCalendarDays, label: "Calendar" },
	{ icon: LuTarget, label: "Goals" },
];

function todayISO(): string {
	return new Date().toISOString().split("T")[0];
}

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
	transition:
		"transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
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

		window.addEventListener("mousemove", handleMouseMove, {
			passive: true,
		});
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
	"33%": {
		transform: "translate3d(8px, -14px, 0) scale(1.02) rotate(1.5deg)",
	},
	"66%": {
		transform: "translate3d(-8px, -20px, 0) scale(0.99) rotate(-1.5deg)",
	},
});

const starfallDrift1 = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
	"50%": {
		transform: "translate3d(14px, -18px, 0) scale(1.03) rotate(3deg)",
	},
});

const starfallDrift2 = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
	"50%": {
		transform: "translate3d(-12px, -15px, 0) scale(0.97) rotate(-2.5deg)",
	},
});

const starfallDrift3 = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
	"50%": {
		transform: "translate3d(10px, -22px, 0) scale(1.04) rotate(2deg)",
	},
});

const starfallDrift4 = keyframes({
	"0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
	"50%": {
		transform: "translate3d(-14px, -20px, 0) scale(1.03) rotate(-2deg)",
	},
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
	const { data: duolingoStatus } = useDuolingoStatus();
	const { data: summary } = usePlayerSummary();
	const { data: todayQuests = [] } = useTodayQuests();
	const { data: questPage } = useQuests(1, 1);
	const { data: healthSummary } = useHealthDay(todayISO());
	const { data: financeSummary } = useFinanceSummary();

	const player = summary?.player;
	const completedToday = todayQuests.filter((tq) => tq.completed).length;
	const pendingToday = todayQuests.length - completedToday;
	const ongoingHabits = Math.max(
		0,
		(questPage?.count ?? 0) - todayQuests.length,
	);

	const healthScores = Object.values(healthSummary?.metrics ?? {});
	const healthScorePct = healthScores.length
		? Math.round(
				(healthScores.reduce((sum, m) => sum + m.score, 0) /
					healthScores.length) *
					100,
			)
		: 0;
	const todayCompletionPct = todayQuests.length
		? Math.round((completedToday / todayQuests.length) * 100)
		: 0;

	const netThisMonth = financeSummary
		? financeSummary.income - financeSummary.expense
		: undefined;

	const todayLabel = new Date().toLocaleDateString(undefined, {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});

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
										aria-current={
											active ? "page" : undefined
										}
										size="11"
										bg={active ? "bg.solid" : "transparent"}
										color={
											active ? "fg.inverted" : "fg.muted"
										}
										shadow={active ? "glass" : "none"}
										cursor="pointer"
										transition="all 0.15s ease-out"
										_hover={{
											color: active
												? "fg.inverted"
												: "fg",
											bg: active
												? "bg.solid"
												: "bg.panel",
											transform: "scale(1.08)",
										}}
									>
										<Link to={item.to}>
											<Icon
												as={item.icon}
												boxSize={4.5}
											/>
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
									_hover={{
										color: "fg",
										transform: "scale(1.08)",
									}}
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
								lg: "220px 1fr",
								xl: "260px 1fr",
							}}
						>
							{/* 1. Isolated Duolingo Card */}
							<Box
								{...holoGlassCard}
								p={{ base: 5, xl: 6 }}
								minH={{ base: "140px", xl: "155px" }}
								position="relative"
							>
								<HStack gap={1.5} color="fg.muted">
									<Icon
										as={LuLeaf}
										boxSize={4}
										color="mint.fg"
									/>
									<Text fontSize="sm" fontWeight="semibold">
										{duolingoStatus?.username || "Duolingo"}
									</Text>
								</HStack>
								<Circle
									asChild
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
									<Link
										to={
											duolingoStatus
												? "/settings"
												: "/settings/duolingo"
										}
										title={
											duolingoStatus
												? "Manage Duolingo"
												: "Connect Duolingo"
										}
									>
										<Icon
											as={LuArrowUpRight}
											boxSize={4.5}
										/>
									</Link>
								</Circle>
								<HStack align="baseline" gap={2} mt={4}>
									<Text
										fontSize={{
											base: "2.6rem",
											xl: "3.2rem",
										}}
										fontWeight="bold"
										letterSpacing="-0.04em"
										lineHeight="1"
									>
										{duolingoStatus
											? `${duolingoStatus.streak}d`
											: "0d"}
									</Text>
									<Text
										fontSize="sm"
										color="fg.muted"
										fontWeight="medium"
									>
										{duolingoStatus ? "streak" : "streak"}
									</Text>
								</HStack>
								<Text
									fontSize="xs"
									color="fg.muted"
									fontWeight="medium"
									mt={1}
								>
									{duolingoStatus
										? `${duolingoStatus.rank > 0 ? `#${duolingoStatus.rank} rank · ` : ""}${duolingoStatus.xp} XP`
										: "Link account"}
								</Text>
							</Box>

							{/* 2. Large Merged Card: To do, On going, Complete */}
							<Box
								{...holoGlassCard}
								p={{ base: 5, xl: 6 }}
								minH={{ base: "140px", xl: "155px" }}
								position="relative"
							>
								<Grid
									templateColumns={{
										base: "1fr",
										sm: "repeat(2, 1fr)",
										xl: "repeat(3, 1fr)",
									}}
									gap={{ base: 4, xl: 5 }}
									h="full"
									alignItems="center"
								>
									{/* To do */}
									<Box
										position="relative"
										pr={{ xl: 4 }}
										borderRightWidth={{ xl: "1px" }}
										borderColor="border.glass"
									>
										<Text
											fontSize="sm"
											fontWeight="semibold"
											color="fg.muted"
										>
											To do
										</Text>
										<HStack align="baseline" gap={2} mt={4}>
											<Text
												fontSize={{
													base: "2.4rem",
													xl: "2.8rem",
												}}
												fontWeight="bold"
												letterSpacing="-0.04em"
												lineHeight="1"
											>
												{pendingToday}
											</Text>
											<Text
												fontSize="sm"
												color="fg.muted"
												fontWeight="medium"
											>
												tasks
											</Text>
										</HStack>
									</Box>

									{/* On going */}
									<Box
										position="relative"
										pr={{ xl: 4 }}
										borderRightWidth={{ xl: "1px" }}
										borderColor="border.glass"
									>
										<Text
											fontSize="sm"
											fontWeight="semibold"
											color="fg.muted"
										>
											On going
										</Text>
										<Circle
											size="8"
											bg="bg.solid"
											color="fg.inverted"
											position="absolute"
											top={0}
											right={2}
											shadow="glass"
											transition="all 0.15s ease-out"
											_hover={{ transform: "scale(1.1)" }}
										>
											<Icon
												as={LuArrowUpRight}
												boxSize={4}
											/>
										</Circle>
										<HStack align="baseline" gap={2} mt={4}>
											<Text
												fontSize={{
													base: "2.4rem",
													xl: "2.8rem",
												}}
												fontWeight="bold"
												letterSpacing="-0.04em"
												lineHeight="1"
											>
												{ongoingHabits}
											</Text>
											<Text
												fontSize="sm"
												color="fg.muted"
												fontWeight="medium"
											>
												tasks
											</Text>
										</HStack>
									</Box>

									{/* Complete */}
									<Box
										position="relative"
										pr={{ xl: 4 }}
										borderRightWidth={{ xl: "1px" }}
										borderColor="border.glass"
									>
										<Text
											fontSize="sm"
											fontWeight="semibold"
											color="fg.muted"
										>
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
											px={4}
											py={2}
											justify="space-between"
											mt={3}
											w="fit-content"
											gap={3}
											cursor="pointer"
											transition="all 0.15s ease-out"
											_hover={{
												transform: "translateY(-1px)",
												shadow: "float",
											}}
										>
											<HStack align="baseline" gap={2}>
												<Text
													fontSize="2rem"
													fontWeight="bold"
													letterSpacing="-0.04em"
													lineHeight="1"
												>
													{String(
														completedToday,
													).padStart(2, "0")}
												</Text>
												<Text
													fontSize="xs"
													color="fg.muted"
													fontWeight="medium"
												>
													tasks
												</Text>
											</HStack>
											<Circle
												size="6"
												bg="bg.muted"
												color="fg"
											>
												<Icon
													as={LuArrowUpRight}
													boxSize={3}
												/>
											</Circle>
										</HStack>
									</Box>
								</Grid>
							</Box>
						</Grid>
					</Stack>
				</GridItem>

				{/* Right Side Widgets: Hero, Habit Tracker & Performance */}
				<GridItem h="full" minH="0">
					<Flex
						direction="column"
						h="full"
						justify="space-between"
						gap={4}
						pb={3}
					>
						{/* Hero Snapshot Card */}
						<Box {...holoGlassCard} p={{ base: 5, xl: 6 }}>
							<HStack justify="space-between" align="flex-start">
								<HStack gap={3.5}>
									<Box position="relative" boxSize="60px">
										<Box position="absolute" inset={0}>
											<LevelRing
												level={player?.level ?? 1}
												progress={
													player && summary
														? player.exp_into_level /
															Math.max(
																1,
																summary.exp_to_next,
															)
														: 0
												}
												size={60}
											/>
										</Box>
										<Flex
											position="absolute"
											inset={0}
											align="center"
											justify="center"
										>
											<HeroAvatar
												seed={player?.user_id ?? "hero"}
												size={40}
												animated
											/>
										</Flex>
									</Box>
									<Stack gap={0.5}>
										<Text
											fontSize="xs"
											fontWeight="bold"
											textTransform="uppercase"
											letterSpacing="0.06em"
											color="fg.muted"
										>
											{player?.ascensions
												? `${player.ascensions} ascension${player.ascensions === 1 ? "" : "s"}`
												: "Hero"}
										</Text>
										<Text
											fontSize="lg"
											fontWeight="bold"
											letterSpacing="-0.02em"
											lineHeight="1"
										>
											{(player?.px ?? 0).toLocaleString()}{" "}
											PX
										</Text>
									</Stack>
								</HStack>
								<StreakFlame
									days={player?.streak ?? 0}
									size={18}
								/>
							</HStack>

							<Box mt={4}>
								<ExpBar
									level={player?.level ?? 1}
									expIntoLevel={player?.exp_into_level ?? 0}
									expToNext={summary?.exp_to_next ?? 1}
								/>
							</Box>
						</Box>

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
								Today, {todayLabel}
							</Text>

							<Flex wrap="wrap" gap={2.5} mt={4}>
								{todayQuests.length === 0 ? (
									<HStack
										flex="1 1 auto"
										bg={{
											base: "rgba(255, 255, 255, 0.8)",
											_dark: "rgba(25, 30, 45, 0.8)",
										}}
										borderWidth="1px"
										borderColor={{
											base: "rgba(255, 255, 255, 0.9)",
											_dark: "rgba(255, 255, 255, 0.12)",
										}}
										rounded="pill"
										px={4}
										py={2}
										gap={2.5}
									>
										<Circle size="2.5" bg="fg.muted" />
										<Text
											fontSize="sm"
											fontWeight="medium"
											whiteSpace="nowrap"
										>
											No quests scheduled today
										</Text>
									</HStack>
								) : (
									todayQuests.map((tq) => (
										<HStack
											key={tq.quest.id}
											flex="1 1 auto"
											bg={
												tq.completed
													? "bg.solid"
													: {
															base: "rgba(255, 255, 255, 0.8)",
															_dark: "rgba(25, 30, 45, 0.8)",
														}
											}
											color={
												tq.completed
													? "fg.inverted"
													: "fg"
											}
											borderWidth={
												tq.completed ? "0" : "1px"
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
												tq.completed
													? "none"
													: "0 2px 8px -2px rgba(15, 23, 42, 0.04)"
											}
											_hover={{
												transform: "translateY(-1px)",
												shadow: "glass",
											}}
										>
											<Circle
												size="2.5"
												bg={
													tq.completed
														? "mint.solid"
														: "fg.muted"
												}
											/>
											<Text
												fontSize="sm"
												fontWeight="medium"
												whiteSpace="nowrap"
											>
												{tq.quest.title}
											</Text>
											<Text
												fontSize="10px"
												fontWeight="bold"
												opacity={0.65}
												whiteSpace="nowrap"
											>
												+
												{tq.completed
													? tq.exp_awarded
													: tq.quest.exp_value}{" "}
												EXP
											</Text>
										</HStack>
									))
								)}
							</Flex>
						</Box>

						{/* Today's Pulse: Health + Quests bars, Finance headline */}
						<Box {...holoGlassCard} p={{ base: 6, xl: 7 }}>
							<Text
								fontSize="sm"
								fontWeight="bold"
								textTransform="uppercase"
								letterSpacing="0.08em"
							>
								Today
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
										w={`${todayCompletionPct}%`}
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
										w={`${healthScorePct}%`}
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
									color={
										netThisMonth !== undefined &&
										netThisMonth < 0
											? "red.fg"
											: "fg"
									}
								>
									{netThisMonth !== undefined
										? `${netThisMonth >= 0 ? "+" : ""}${netThisMonth.toLocaleString()}`
										: "—"}
								</Text>
								<Text
									fontSize="sm"
									color="fg.muted"
									pl={3}
									fontWeight="medium"
								>
									net this period
								</Text>
							</HStack>
							{financeSummary && (
								<Text fontSize="xs" color="fg.muted" mt={1.5}>
									Income{" "}
									{financeSummary.income.toLocaleString()} ·
									Expense{" "}
									{financeSummary.expense.toLocaleString()} ·
									+{financeSummary.projected_exp} EXP
									projected
								</Text>
							)}
						</Box>
					</Flex>
				</GridItem>
			</Grid>
		</Box>
	);
};

export default Index;
