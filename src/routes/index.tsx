import React from "react";
import { Navigate } from "react-router";
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
import { holoGradient } from "@/theme";

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
	value: string;
	unit?: string;
	accent?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, accent }) => (
	<Box
		bg="bg.glass"
		borderWidth="1px"
		borderColor="border.glass"
		rounded="card"
		shadow="glass"
		backdropFilter="blur(20px)"
		px={5}
		py={4}
		minH="128px"
		position="relative"
	>
		<Text fontSize="sm" color="fg.muted">
			{label}
		</Text>

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

		<HStack align="baseline" gap={1} mt={8}>
			<Text
				fontSize="4xl"
				fontWeight="semibold"
				letterSpacing="-0.04em"
				lineHeight="1"
			>
				{value}
			</Text>
			{unit && (
				<Text fontSize="xs" color="fg.muted">
					{unit}
				</Text>
			)}
		</HStack>
	</Box>
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
		<Box
			minH="100vh"
			position="relative"
			overflow="hidden"
			display="flex"
			alignItems="center"
			justifyContent="center"
			p={{ base: 4, md: 10 }}
			css={{ backgroundImage: holoGradient }}
		>
			<Box
				position="absolute"
				top="-20%"
				left="-10%"
				w="60vw"
				h="60vw"
				rounded="full"
				filter="blur(120px)"
				opacity={0.6}
				bg="holo.blush"
			/>
			<Box
				position="absolute"
				bottom="-25%"
				right="-5%"
				w="55vw"
				h="55vw"
				rounded="full"
				filter="blur(140px)"
				opacity={0.55}
				bg="holo.cyan"
			/>

			<Box
				position="relative"
				w="full"
				maxW="1240px"
				bg="bg.panel"
				rounded="squircle"
				shadow="float"
				px={{ base: 5, md: 8 }}
				py={{ base: 5, md: 7 }}
			>
				<HStack justify="space-between" gap={6}>
					<HStack gap={3} flex="1" maxW="360px">
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

					<VStack gap={0} lineHeight="0.95">
						<Text
							fontSize="lg"
							fontWeight="bold"
							letterSpacing="0.18em"
						>
							HA
						</Text>
						<Text
							fontSize="lg"
							fontWeight="bold"
							letterSpacing="0.18em"
						>
							BIT
						</Text>
					</VStack>

					<HStack gap={4} flex="1" justify="flex-end">
						<Circle size="10" bg="bg.muted">
							<Icon as={LuBell} boxSize={4} />
						</Circle>
						<HStack
							gap={2}
							cursor="pointer"
							onClick={logout}
							title="Logout"
						>
							<Text fontSize="sm">Hi, {user?.username}</Text>
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
				</HStack>

				<Grid
					mt={8}
					gap={6}
					templateColumns={{ base: "1fr", lg: "72px 1fr 320px" }}
				>
					<GridItem display={{ base: "none", lg: "block" }}>
						<VStack
							gap={3}
							bg="bg.muted"
							rounded="pill"
							py={5}
							px={2}
						>
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
						<Stack gap={10}>
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
									pl={{ base: 0, md: 10 }}
								>
									<OutlinePill>day to win</OutlinePill>
								</Heading>
							</Stack>

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
									md: "repeat(3, 1fr)",
								}}
							>
								<StatCard
									label="To do"
									value="158"
									unit="tasks"
									accent
								/>
								<StatCard
									label="On going"
									value="28"
									unit="tasks"
									accent
								/>
								<StatCard
									label="Complete"
									value="02"
									unit="tasks"
								/>
							</Grid>
						</Stack>
					</GridItem>

					<GridItem>
						<Stack gap={5}>
							<Box
								bg="bg.glass"
								borderWidth="1px"
								borderColor="border.glass"
								rounded="card"
								shadow="glass"
								backdropFilter="blur(20px)"
								p={5}
							>
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
											<Text fontSize="xs">
												{row.label}
											</Text>
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

							<Box
								bg="bg.glass"
								borderWidth="1px"
								borderColor="border.glass"
								rounded="card"
								shadow="glass"
								backdropFilter="blur(20px)"
								p={5}
							>
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

							<Grid
								gap={4}
								templateColumns={{
									base: "1fr",
									md: "repeat(2, 1fr)",
								}}
							>
								<Box
									bg="bg.glass"
									borderWidth="1px"
									borderColor="border.glass"
									rounded="card"
									shadow="glass"
									backdropFilter="blur(20px)"
									px={5}
									py={4}
								>
									<HStack gap={2} color="fg.muted">
										<Icon as={LuWallet} boxSize={3.5} />
										<Text fontSize="sm">Earnings</Text>
									</HStack>
									<Text
										fontSize="xl"
										fontWeight="semibold"
										letterSpacing="-0.03em"
										mt={6}
									>
										$2,932.07
									</Text>
									<Text fontSize="xs" color="fg.muted">
										02 tasks
									</Text>
								</Box>

								<Box
									bg="bg.glass"
									borderWidth="1px"
									borderColor="border.glass"
									rounded="card"
									shadow="glass"
									backdropFilter="blur(20px)"
									px={5}
									py={4}
								>
									<Flex align="center" gap={1}>
										<Text
											fontSize="4xl"
											fontWeight="semibold"
											letterSpacing="-0.04em"
											lineHeight="1"
										>
											35
										</Text>
										<Text
											fontSize="4xl"
											color="fg.muted"
											fontWeight="light"
											lineHeight="1"
										>
											/
										</Text>
										<Stack gap={0}>
											<Text
												fontSize="4xl"
												fontWeight="semibold"
												letterSpacing="-0.04em"
												lineHeight="1"
											>
												82
											</Text>
										</Stack>
									</Flex>
									<Text fontSize="xs" color="fg.muted" mt={2}>
										Total target
									</Text>
								</Box>
							</Grid>
						</Stack>
					</GridItem>
				</Grid>
			</Box>
		</Box>
	);
};

export default Index;
