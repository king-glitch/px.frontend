import { Avatar } from "@/components/ui/avatar";
import { useColorMode } from "@/components/ui/color-mode";
import { useAuthContext } from "@/contexts/auth-context";
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
import { keyframes } from "@emotion/react";
import React from "react";
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
import { Navigate } from "react-router";

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
	{ label: "Complete at least 10 task today - 2/10", tone: "muted" as const },
	{ label: "Spent 30 seconds", tone: "muted" as const },
	{ label: "Still time", tone: "muted" as const },
];

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

const float = keyframes({
	"0%, 100%": { transform: "translateY(0) scale(1)" },
	"50%": { transform: "translateY(-1.5%) scale(1.02)" },
});

/**
 * Art focal point. No silhouette mask: the source is blown out toward white and
 * composited with `multiply`, so white pixels drop out entirely and only the
 * prismatic shapes survive — whatever the artwork's own background is.
 */
const HoloArt: React.FC = () => (
	<Box
		position="absolute"
		left="49%"
		top="6%"
		w="clamp(360px, 33vw, 620px)"
		h="86%"
		transform="translateX(-50%)"
		zIndex={0}
		pointerEvents="none"
		display={{ base: "none", lg: "block" }}
	>
		<Box
			position="absolute"
			inset="-12%"
			opacity={0.45}
			css={{
				background:
					"radial-gradient(40% 38% at 50% 45%, {colors.holo.lavender} 0%, {colors.holo.blush} 45%, {colors.holo.butter} 68%, transparent 80%)",
				filter: "blur(70px)",
			}}
		/>

		<Box
			position="absolute"
			inset="0"
			animation={`${float} 18s ease-in-out infinite`}
			css={{
				backgroundImage: "url('/image.png')",
				backgroundSize: "contain",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
				mixBlendMode: "multiply",
				maskImage:
					"radial-gradient(54% 46% at 50% 48%, #000 44%, transparent 100%)",
			}}
		/>
	</Box>
);

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
		py="0.16em"
		lineHeight="1.05"
	>
		{children}
	</Flex>
);

interface StatCardProps {
	label: string;
	labelIcon?: React.ElementType;
	badge?: "mint" | "ink";
	children: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
	label,
	labelIcon,
	badge,
	children,
}) => (
	<Box
		{...glassCard}
		px={5}
		py={4}
		minH="clamp(120px, 18vh, 190px)"
		position="relative"
	>
		<HStack gap={2} color="fg.muted">
			{labelIcon && <Icon as={labelIcon} boxSize={3.5} />}
			<Text fontSize="clamp(0.85rem, 1.9vh, 1.05rem)">{label}</Text>
		</HStack>

		{badge && (
			<Circle
				size="7"
				bg={badge === "mint" ? "mint.solid" : "bg.solid"}
				color={badge === "mint" ? "mint.contrast" : "fg.inverted"}
				position="absolute"
				top={3}
				right={3}
			>
				<Icon as={LuArrowUpRight} boxSize={3.5} />
			</Circle>
		)}

		<Box mt={10}>{children}</Box>
	</Box>
);

interface TaskCountProps {
	value: string;
	unit: string;
}

const TaskCount: React.FC<TaskCountProps> = ({ value, unit }) => (
	<HStack align="baseline" gap={1}>
		<Text
			fontSize="clamp(2rem, 5.4vh, 3.4rem)"
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
			gap={3}
			h={{ base: "auto", lg: "100dvh" }}
			minH="100dvh"
			bg="bg.canvas"
			position="relative"
			overflowX="hidden"
			overflowY={{ lg: "hidden" }}
			px={{ base: 4, md: 7 }}
			py={{ base: 4, md: 5 }}
		>
			<HoloArt />

			<Grid
				templateColumns={{ base: "1fr", md: "1fr auto 1fr" }}
				alignItems="center"
				gap={4}
				position="relative"
				zIndex={2}
			>
				<HStack gap={2.5} maxW="400px">
					<Circle size="12" bg="bg.solid" color="fg.inverted">
						<Icon as={LuSearch} boxSize={4} />
					</Circle>
					<Input
						placeholder="Task name, status..."
						rounded="pill"
						bg="bg.muted"
						border="none"
						h="12"
						px={5}
						fontSize="sm"
						_placeholder={{ color: "fg.muted" }}
					/>
				</HStack>

				<VStack
					gap={0}
					lineHeight="0.9"
					display={{ base: "none", md: "flex" }}
				>
					<Text
						fontSize="lg"
						fontWeight="bold"
						letterSpacing="0.16em"
					>
						HA
					</Text>
					<Text
						fontSize="lg"
						fontWeight="bold"
						letterSpacing="0.16em"
					>
						BIT
					</Text>
				</VStack>

				<HStack gap={3} justify="flex-end">
					<Circle size="11" bg="bg.muted">
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
						<Avatar size="md" name={user?.username} />
					</HStack>
					<Button
						rounded="pill"
						bg="mint.solid"
						color="mint.contrast"
						size="md"
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
				gap={4}
				templateColumns={{
					base: "1fr",
					lg: "76px minmax(0, 1fr) 340px",
				}}
				position="relative"
				zIndex={2}
			>
				<GridItem
					display={{ base: "none", lg: "flex" }}
					alignItems="flex-end"
				>
					<VStack
						gap={2}
						bg="bg.muted"
						rounded="pill"
						py={4}
						px={2}
						mb={6}
					>
						{railIcons.map((RailIcon, index) => (
							<Circle
								key={index}
								size="11"
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
							pt={1}
							style={{ writingMode: "vertical-rl" }}
						>
							Post
						</Text>
					</VStack>
				</GridItem>

				<GridItem position="relative">
					<Flex
						direction="column"
						h="full"
						justify="space-between"
						gap={6}
						position="relative"
						zIndex={1}
					>
						<Stack gap={1.5} pt={2}>
							<Heading
								fontSize="clamp(2.2rem, 6.6vh, 4.2rem)"
								fontWeight="semibold"
								letterSpacing="-0.04em"
								lineHeight="1.05"
							>
								Today is
							</Heading>
							<Heading
								fontSize="clamp(2.2rem, 6.6vh, 4.2rem)"
								fontWeight="normal"
								letterSpacing="-0.04em"
								lineHeight="1.05"
							>
								<OutlinePill>a best</OutlinePill>
							</Heading>
							<Heading
								fontSize="clamp(2.2rem, 6.6vh, 4.2rem)"
								fontWeight="normal"
								letterSpacing="-0.04em"
								lineHeight="1.05"
								pl={{ base: 0, md: 8 }}
							>
								<OutlinePill>day to win</OutlinePill>
							</Heading>
						</Stack>

						<Stack gap={2.5}>
							<HStack gap={2}>
								<Text fontSize="lg">Daily</Text>
								<Text fontSize="lg">
									<OutlinePill>summary</OutlinePill>
								</Text>
							</HStack>

							<Grid
								gap={3}
								templateColumns={{
									base: "1fr",
									md: "repeat(2, 1fr)",
									lg: "repeat(4, 1fr)",
								}}
							>
								<StatCard label="To do" badge="mint">
									<TaskCount value="158" unit="tasks" />
								</StatCard>
								<StatCard label="On going" badge="ink">
									<TaskCount value="28" unit="tasks" />
								</StatCard>
								<StatCard label="Complete">
									<Box
										bg="bg.panel"
										rounded="pill"
										px={4}
										py={2}
										shadow="glass"
										w="fit-content"
									>
										<TaskCount value="02" unit="tasks" />
									</Box>
								</StatCard>
								<StatCard label="Earnings" labelIcon={LuWallet}>
									<Text
										fontSize="lg"
										fontWeight="semibold"
										letterSpacing="-0.03em"
									>
										$2,932.07
									</Text>
									<Text fontSize="xs" color="fg.muted">
										02 tasks
									</Text>
								</StatCard>
							</Grid>
						</Stack>
					</Flex>
				</GridItem>

				<GridItem>
					<Flex direction="column" h="full" gap={3}>
						<Box {...glassCard} p={5}>
							<Heading
								fontSize="clamp(1.3rem, 3.4vh, 2rem)"
								fontWeight="normal"
								letterSpacing="-0.03em"
							>
								Habit <OutlinePill>tracker</OutlinePill>
							</Heading>
							<Text fontSize="xs" color="fg.muted" mt={2}>
								Today, Dec 28, 2030
							</Text>

							<Flex wrap="wrap" gap={1.5} mt={3}>
								{trackerRows.map((row) => (
									<HStack
										key={row.label}
										flex="1 1 auto"
										bg={
											row.tone === "solid"
												? "bg.solid"
												: "bg.panel"
										}
										color={
											row.tone === "solid"
												? "fg.inverted"
												: "fg.muted"
										}
										borderWidth={
											row.tone === "solid" ? "0" : "1px"
										}
										borderColor="border"
										rounded="pill"
										px={3.5}
										py={2}
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
										<Text
											fontSize="clamp(0.72rem, 1.6vh, 0.9rem)"
											whiteSpace="nowrap"
										>
											{row.label}
										</Text>
									</HStack>
								))}
							</Flex>
						</Box>

						<HStack justify="center" gap={3} mt="auto">
							<Box
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border"
								rounded="pill"
								px={4}
								py={1}
								fontSize="xs"
								shadow="glass"
							>
								Light Mode
							</Box>
							<HStack
								gap={0}
								cursor="pointer"
								onClick={toggleColorMode}
							>
								<Circle
									size="11"
									bg="bg.panel"
									color="fg"
									borderWidth="1px"
									borderColor="border"
									shadow="glass"
									zIndex={1}
								>
									<Icon
										as={LuSun}
										boxSize={4}
										opacity={
											colorMode === "light" ? 1 : 0.35
										}
									/>
								</Circle>
								<Circle
									size="14"
									bg="bg.solid"
									color="fg.inverted"
									ml="-3"
									shadow="glass"
								>
									<Icon
										as={LuMoon}
										boxSize={5}
										opacity={
											colorMode === "dark" ? 1 : 0.75
										}
									/>
								</Circle>
							</HStack>
						</HStack>

						<Box {...glassCard} p={5}>
							<Text fontSize="clamp(0.9rem, 2vh, 1.15rem)">
								Performance
							</Text>
							<Stack gap={2} mt={3}>
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

							<HStack align="center" gap={1} mt={4}>
								<Text
									fontSize="clamp(2.2rem, 5.8vh, 3.6rem)"
									fontWeight="semibold"
									letterSpacing="-0.04em"
									lineHeight="1"
								>
									35
								</Text>
								<Text
									fontSize="clamp(2.2rem, 5.8vh, 3.6rem)"
									color="fg.muted"
									fontWeight="light"
									lineHeight="1"
								>
									/
								</Text>
								<Text
									fontSize="clamp(2.2rem, 5.8vh, 3.6rem)"
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
									pb={1}
									pl={2}
								>
									Total
									<br />
									target
								</Text>
							</HStack>
						</Box>
					</Flex>
				</GridItem>
			</Grid>
		</Flex>
	);
};

export default Index;
