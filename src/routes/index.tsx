import React from "react";
import { Navigate } from "react-router";
import { keyframes } from "@emotion/react";
import {
	Box,
	Button,
	Circle,
	Container,
	Flex,
	Grid,
	GridItem,
	HStack,
	Heading,
	Icon,
	Input,
	Spinner,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import {
	LuArrowUpRight,
	LuBell,
	LuCalendarDays,
	LuLayoutDashboard,
	LuMoon,
	LuSearch,
	LuSettings,
	LuShuffle,
	LuSun,
	LuTarget,
	LuWallet,
} from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar";
import { useColorMode } from "@/components/ui/color-mode";
import { useAuthContext } from "@/contexts/auth-context";

const railIcons = [
	LuLayoutDashboard,
	LuCalendarDays,
	LuShuffle,
	LuTarget,
	LuSettings,
];

const trackerRows = [
	{ label: "Work 1 - 5 hrs", tone: "solid" as const },
	{ label: "Valuable investment", tone: "solid" as const },
	{ label: "Complete at least 10 task today - 2/10", tone: "solid" as const },
	{ label: "Spent 30 seconds", tone: "solid" as const },
	{ label: "Still time", tone: "muted" as const },
];

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(20px)",
} as const;

const drift = keyframes({
	"0%": { transform: "translate(-50%, 0) rotate(0deg) scale(1)" },
	"50%": { transform: "translate(-50%, -2%) rotate(6deg) scale(1.04)" },
	"100%": { transform: "translate(-50%, 0) rotate(0deg) scale(1)" },
});

const shimmer = keyframes({
	"0%, 100%": { opacity: 0.25 },
	"50%": { opacity: 0.5 },
});

const holoSpectrum =
	"conic-gradient(from 200deg at 50% 40%, {colors.holo.cyan} 0deg, {colors.holo.lavender} 90deg, {colors.holo.blush} 175deg, {colors.holo.butter} 255deg, {colors.holo.cyan} 360deg)";

/**
 * Stand-in for the holographic character art: the prism spectrum masked into a
 * head-and-shoulders silhouette that dissolves into the canvas. Replace the
 * whole component with an <Image> once real artwork exists.
 */
const HoloFigure: React.FC = () => (
	<Box
		position="absolute"
		left="50%"
		bottom="2%"
		w="clamp(220px, 19vw, 300px)"
		h="76%"
		transform="translateX(-50%)"
		zIndex={0}
		pointerEvents="none"
		display={{ base: "none", lg: "block" }}
	>
		<Box
			position="absolute"
			inset="-40%"
			opacity={0.28}
			css={{
				background:
					"radial-gradient(45% 42% at 50% 52%, {colors.holo.lavender} 0%, {colors.holo.blush} 55%, transparent 78%)",
				filter: "blur(70px)",
			}}
		/>

		<Box
			position="absolute"
			inset="0"
			opacity={0.55}
			animation={`${drift} 26s ease-in-out infinite`}
			css={{
				background: holoSpectrum,
				filter: "blur(22px) saturate(1.15)",
				maskImage:
					"radial-gradient(42% 50% at 50% 48%, #000 30%, transparent 100%)",
			}}
		/>

		<Box
			position="absolute"
			top="6%"
			left="50%"
			w="40%"
			h="30%"
			transform="translateX(-50%)"
			rounded="full"
			animation={`${shimmer} 9s ease-in-out infinite`}
			css={{
				background:
					"radial-gradient(50% 50% at 50% 45%, rgba(255,255,255,0.85), transparent 74%)",
				filter: "blur(24px)",
			}}
		/>
	</Box>
);

interface OutlinePillProps {
	children: React.ReactNode;
}

const OutlinePill: React.FC<OutlinePillProps> = ({ children }) => (
	<Box
		as="span"
		display="inline-block"
		borderWidth="1px"
		borderColor="fg"
		rounded="pill"
		px={5}
		py={1}
	>
		{children}
	</Box>
);

interface StatCardProps {
	label: string;
	labelIcon?: React.ElementType;
	accent?: boolean;
	children: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
	label,
	labelIcon,
	accent,
	children,
}) => (
	<Box {...glassCard} px={5} py={4} minH="112px" position="relative">
		<HStack gap={2} color="fg.muted">
			{labelIcon && <Icon as={labelIcon} boxSize={3.5} />}
			<Text fontSize="sm">{label}</Text>
		</HStack>

		{accent && (
			<Circle
				size="8"
				bg="mint.solid"
				color="mint.contrast"
				position="absolute"
				top={4}
				right={4}
			>
				<Icon as={LuArrowUpRight} boxSize={4} />
			</Circle>
		)}

		<Box mt={6}>{children}</Box>
	</Box>
);

interface TaskCountProps {
	value: string;
	unit: string;
}

const TaskCount: React.FC<TaskCountProps> = ({ value, unit }) => (
	<HStack align="baseline" gap={1}>
		<Text
			fontSize="4xl"
			fontWeight="semibold"
			letterSpacing="-0.04em"
			lineHeight="1"
		>
			{value}
		</Text>
		<Text fontSize="xs" color="fg.muted">
			{unit}
		</Text>
	</HStack>
);

interface IndexProps {}

export const Index: React.FC<IndexProps> = () => {
	const { user, isAuthenticated, isLoading, logout } = useAuthContext();
	const { colorMode, toggleColorMode } = useColorMode();

	if (isLoading) {
		return (
			<Container py={12} centerContent>
				<Spinner size="xl" />
			</Container>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/authentication/login" replace />;
	}

	return (
		<Flex
			direction="column"
			gap={{ base: 5, lg: 4 }}
			h={{ base: "auto", lg: "100dvh" }}
			minH="100dvh"
			bg="bg.canvas"
			position="relative"
			overflowX="hidden"
			overflowY={{ lg: "hidden" }}
			px={{ base: 5, md: 8, xl: 14 }}
			py={{ base: 5, md: 6 }}
		>
			<HoloFigure />

			<Grid
				templateColumns={{ base: "1fr", md: "1fr auto 1fr" }}
				alignItems="center"
				gap={6}
				position="relative"
				zIndex={2}
			>
				<HStack gap={3} maxW="380px">
					<Circle size="11" bg="bg.solid" color="fg.inverted">
						<Icon as={LuSearch} boxSize={4} />
					</Circle>
					<Input
						placeholder="Task name, status..."
						rounded="pill"
						bg="bg.muted"
						border="none"
						h="11"
						px={5}
						fontSize="sm"
						_placeholder={{ color: "fg.muted" }}
					/>
				</HStack>

				<VStack
					gap={0}
					lineHeight="0.95"
					display={{ base: "none", md: "flex" }}
				>
					<Text fontSize="lg" fontWeight="bold" letterSpacing="0.18em">
						HA
					</Text>
					<Text fontSize="lg" fontWeight="bold" letterSpacing="0.18em">
						BIT
					</Text>
				</VStack>

				<HStack gap={4} justify="flex-end">
					<Circle size="10" bg="bg.muted">
						<Icon as={LuBell} boxSize={4} />
					</Circle>
					<HStack
						gap={2}
						cursor="pointer"
						onClick={logout}
						title="Logout"
					>
						<Text fontSize="sm" whiteSpace="nowrap">
							Hi, {user?.username}
						</Text>
						<Avatar size="sm" name={user?.username} />
					</HStack>
					<Button
						rounded="pill"
						bg="mint.solid"
						color="mint.contrast"
						size="sm"
						px={5}
						_hover={{ bg: "mint.400" }}
					>
						<Icon as={LuTarget} boxSize={3.5} />
						Upgrade
					</Button>
				</HStack>
			</Grid>

			<Grid
				flex="1"
				minH="0"
				gap={6}
				templateColumns={{ base: "1fr", lg: "72px 1fr 330px" }}
				position="relative"
				zIndex={2}
			>
				<GridItem display={{ base: "none", lg: "block" }}>
					<VStack gap={3} bg="bg.muted" rounded="pill" py={5} px={2}>
						{railIcons.map((RailIcon, index) => (
							<Circle
								key={index}
								size="10"
								bg={index === 0 ? "bg.panel" : "transparent"}
								color={index === 0 ? "fg" : "fg.muted"}
								shadow={index === 0 ? "glass" : "none"}
								cursor="pointer"
							>
								<Icon as={RailIcon} boxSize={4} />
							</Circle>
						))}
						<Text
							fontSize="10px"
							color="fg.muted"
							pt={2}
							style={{ writingMode: "vertical-rl" }}
						>
							Post
						</Text>
					</VStack>
				</GridItem>

				<GridItem>
					<Stack gap={2} pt={4}>
						<Heading
							fontSize={{ base: "3xl", md: "5xl" }}
							fontWeight="semibold"
							letterSpacing="-0.04em"
						>
							Today is
						</Heading>
						<Heading
							fontSize={{ base: "3xl", md: "5xl" }}
							fontWeight="normal"
							letterSpacing="-0.04em"
						>
							<OutlinePill>a best</OutlinePill>
						</Heading>
						<Heading
							fontSize={{ base: "3xl", md: "5xl" }}
							fontWeight="normal"
							letterSpacing="-0.04em"
							pl={{ base: 0, md: 12 }}
						>
							<OutlinePill>day to win</OutlinePill>
						</Heading>
					</Stack>
				</GridItem>

				<GridItem>
					<Stack gap={4}>
						<Box {...glassCard} p={5}>
							<Heading
								fontSize="2xl"
								fontWeight="normal"
								letterSpacing="-0.03em"
							>
								Habit <OutlinePill>tracker</OutlinePill>
							</Heading>
							<Text fontSize="xs" color="fg.muted" mt={3}>
								Today, Dec 28, 2030
							</Text>

							<Stack gap={2} mt={4}>
								{trackerRows.map((row) => (
									<HStack
										key={row.label}
										bg={
											row.tone === "solid"
												? "bg.solid"
												: "bg.muted"
										}
										color={
											row.tone === "solid"
												? "fg.inverted"
												: "fg.muted"
										}
										rounded="pill"
										px={4}
										py={1.5}
										gap={2}
									>
										<Circle
											size="1.5"
											bg={
												row.tone === "solid"
													? "mint.solid"
													: "fg.muted"
											}
										/>
										<Text fontSize="xs">{row.label}</Text>
									</HStack>
								))}
							</Stack>
						</Box>

						<HStack justify="flex-end" gap={3}>
							<Box
								borderWidth="1px"
								borderColor="border"
								rounded="pill"
								px={4}
								py={1}
								fontSize="xs"
							>
								Light Mode
							</Box>
							<HStack
								bg="bg.solid"
								rounded="pill"
								p={1}
								gap={1}
								cursor="pointer"
								onClick={toggleColorMode}
							>
								<Circle
									size="8"
									bg={
										colorMode === "light"
											? "bg.panel"
											: "transparent"
									}
									color={
										colorMode === "light"
											? "fg"
											: "fg.inverted"
									}
								>
									<Icon as={LuSun} boxSize={4} />
								</Circle>
								<Circle
									size="8"
									bg={
										colorMode === "dark"
											? "bg.panel"
											: "transparent"
									}
									color={
										colorMode === "dark"
											? "fg"
											: "fg.inverted"
									}
								>
									<Icon as={LuMoon} boxSize={4} />
								</Circle>
							</HStack>
						</HStack>

						<Box {...glassCard} p={5}>
							<Text fontSize="sm">Performance</Text>
							<Stack gap={2} mt={4}>
								<Box
									h="2"
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
									h="2"
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
						</Box>
					</Stack>
				</GridItem>
			</Grid>

			<Stack gap={3} pl={{ lg: "96px" }} position="relative" zIndex={2}>
				<HStack gap={3}>
					<Text fontSize="lg">Daily</Text>
					<Text fontSize="lg">
						<OutlinePill>summary</OutlinePill>
					</Text>
				</HStack>

				<Grid
					gap={4}
					templateColumns={{
						base: "1fr",
						md: "repeat(2, 1fr)",
						lg: "repeat(5, 1fr)",
					}}
				>
					<StatCard label="To do" accent>
						<TaskCount value="158" unit="tasks" />
					</StatCard>
					<StatCard label="On going" accent>
						<TaskCount value="28" unit="tasks" />
					</StatCard>
					<StatCard label="Complete">
						<TaskCount value="02" unit="tasks" />
					</StatCard>
					<StatCard label="Earnings" labelIcon={LuWallet}>
						<Text
							fontSize="xl"
							fontWeight="semibold"
							letterSpacing="-0.03em"
						>
							$2,932.07
						</Text>
						<Text fontSize="xs" color="fg.muted">
							02 tasks
						</Text>
					</StatCard>
					<Box {...glassCard} px={5} py={4} minH="112px">
						<Flex align="center" gap={1} h="full">
							<Text
								fontSize="5xl"
								fontWeight="semibold"
								letterSpacing="-0.04em"
								lineHeight="1"
							>
								35
							</Text>
							<Text
								fontSize="5xl"
								color="fg.muted"
								fontWeight="light"
								lineHeight="1"
							>
								/
							</Text>
							<Text
								fontSize="5xl"
								fontWeight="semibold"
								letterSpacing="-0.04em"
								lineHeight="1"
							>
								82
							</Text>
							<Text
								fontSize="xs"
								color="fg.muted"
								alignSelf="flex-end"
								pb={2}
								pl={2}
							>
								Total target
							</Text>
						</Flex>
					</Box>
				</Grid>
			</Stack>
		</Flex>
	);
};

export default Index;
