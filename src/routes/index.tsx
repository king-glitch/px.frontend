// ponytail: Dashboard view rendered inside persistent AppLayout
import { useColorMode } from "@/components/ui/color-mode";
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
	LuMoon,
	LuSun,
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

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "3xl",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

const float = keyframes({
	"0%, 100%": { transform: "translateY(0) scale(1)" },
	"50%": { transform: "translateY(-1.5%) scale(1.02)" },
});

const HoloArt: React.FC = () => (
	<Box
		position="absolute"
		left={{ base: "50%", lg: "45%" }}
		bottom="0%"
		w="clamp(520px, 50vw, 880px)"
		h="100%"
		transform="translateX(-50%)"
		zIndex={0}
		pointerEvents="none"
		overflow="hidden"
		display={{ base: "none", lg: "block" }}
	>
		<Box
			position="absolute"
			inset="0"
			opacity={0.45}
			css={{
				background:
					"radial-gradient(40% 38% at 50% 45%, {colors.holo.lavender} 0%, {colors.holo.blush} 45%, {colors.holo.butter} 68%, transparent 80%)",
				filter: "blur(65px)",
			}}
		/>

		<Box
			position="absolute"
			inset="0"
			animation={`${float} 18s ease-in-out infinite`}
			css={{
				backgroundImage: "url('/image.png')",
				backgroundSize: "contain",
				backgroundPosition: "center bottom",
				backgroundRepeat: "no-repeat",
				mixBlendMode: "multiply",
				maskImage:
					"radial-gradient(56% 50% at 50% 50%, #000 48%, transparent 100%)",
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
		py="0.12em"
		lineHeight="1.05"
	>
		{children}
	</Flex>
);

export const Index: React.FC = () => {
	const { pathname } = useLocation();
	const { colorMode, toggleColorMode } = useColorMode();

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
			{/* Central Hologram Character Illustration */}
			<HoloArt />

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
						bg="bg.muted"
						rounded="pill"
						py={5}
						px={2.5}
						shadow="glass"
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
										bg={active ? "bg.panel" : "transparent"}
										color={active ? "fg" : "fg.muted"}
										shadow={active ? "glass" : "none"}
										cursor="pointer"
										transition="all 0.2s"
										_hover={{ color: "fg", bg: "bg.panel", transform: "scale(1.06)" }}
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
									transition="all 0.2s"
									_hover={{ color: "fg", transform: "scale(1.06)" }}
								>
									<Icon as={item.icon} boxSize={4.5} />
								</Circle>
							);
						})}
					</VStack>
				</GridItem>

				{/* Center Column: Open Center Stage & Bottom Daily Summary */}
				<GridItem h="full" minH="0">
					<Flex
						direction="column"
						h="full"
						justify="flex-end"
						pb={3}
					>
						{/* Daily Summary Dock */}
						<Stack gap={3.5}>
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
									{...glassCard}
									p={{ base: 5, xl: 6 }}
									minH={{ base: "140px", xl: "155px" }}
									position="relative"
								>
									<Text fontSize="sm" fontWeight="medium" color="fg.muted">
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
									>
										<Icon as={LuArrowUpRight} boxSize={4.5} />
									</Circle>
									<HStack align="baseline" gap={2} mt={4}>
										<Text
											fontSize={{ base: "2.6rem", xl: "3.2rem" }}
											fontWeight="semibold"
											letterSpacing="-0.04em"
											lineHeight="1"
										>
											158
										</Text>
										<Text fontSize="sm" color="fg.muted">
											tasks
										</Text>
									</HStack>
								</Box>

								{/* 2. On going */}
								<Box
									{...glassCard}
									p={{ base: 5, xl: 6 }}
									minH={{ base: "140px", xl: "155px" }}
									position="relative"
								>
									<Text fontSize="sm" fontWeight="medium" color="fg.muted">
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
									>
										<Icon as={LuArrowUpRight} boxSize={4.5} />
									</Circle>
									<HStack align="baseline" gap={2} mt={4}>
										<Text
											fontSize={{ base: "2.6rem", xl: "3.2rem" }}
											fontWeight="semibold"
											letterSpacing="-0.04em"
											lineHeight="1"
										>
											28
										</Text>
										<Text fontSize="sm" color="fg.muted">
											tasks
										</Text>
									</HStack>
								</Box>

								{/* 3. Complete */}
								<Box
									{...glassCard}
									p={{ base: 5, xl: 6 }}
									minH={{ base: "140px", xl: "155px" }}
									position="relative"
								>
									<Text fontSize="sm" fontWeight="medium" color="fg.muted">
										Complete
									</Text>
									<HStack
										bg="bg.panel"
										rounded="pill"
										px={5}
										py={2.5}
										shadow="glass"
										justify="space-between"
										mt={4}
										w="fit-content"
										gap={4}
									>
										<HStack align="baseline" gap={2}>
											<Text
												fontSize="2.2rem"
												fontWeight="semibold"
												letterSpacing="-0.04em"
												lineHeight="1"
											>
												02
											</Text>
											<Text fontSize="sm" color="fg.muted">
												tasks
											</Text>
										</HStack>
										<Circle size="7" bg="bg.muted">
											<Icon as={LuArrowUpRight} boxSize={3.5} />
										</Circle>
									</HStack>
								</Box>

								{/* 4. Earnings */}
								<Box
									{...glassCard}
									p={{ base: 5, xl: 6 }}
									minH={{ base: "140px", xl: "155px" }}
									position="relative"
								>
									<HStack gap={2} color="fg.muted">
										<Icon as={LuWallet} boxSize={4.5} />
										<Text fontSize="sm" fontWeight="medium">
											Earnings
										</Text>
									</HStack>
									<Text
										fontSize={{ base: "1.8rem", xl: "2.2rem" }}
										fontWeight="semibold"
										letterSpacing="-0.03em"
										mt={3.5}
									>
										$2,932.07
									</Text>
									<Text fontSize="sm" color="fg.muted">
										02 tasks
									</Text>
									<Circle
										size="8"
										bg="bg.panel"
										position="absolute"
										bottom={4}
										right={4}
										shadow="glass"
									>
										<Icon as={LuArrowUpRight} boxSize={4} />
									</Circle>
								</Box>
							</Grid>
						</Stack>
					</Flex>
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
						<Box {...glassCard} p={{ base: 6, xl: 7 }}>
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
										px={4}
										py={2}
										gap={2.5}
										cursor="pointer"
										transition="all 0.2s"
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

						{/* Mode Switcher */}
						<HStack justify="center" gap={3.5} my="auto">
							<Box
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border.glass"
								rounded="pill"
								px={5}
								py={2}
								fontSize="sm"
								fontWeight="semibold"
								shadow="glass"
							>
								{colorMode === "light" ? "Light Mode" : "Dark Mode"}
							</Box>

							{/* Clean Dual-State Capsule Toggle */}
							<HStack
								bg="bg.muted"
								borderWidth="1px"
								borderColor="border.glass"
								rounded="pill"
								p={1}
								gap={1}
								shadow="glass"
								cursor="pointer"
								onClick={toggleColorMode}
								title="Toggle light/dark mode"
							>
								<Circle
									size="10"
									bg={colorMode === "light" ? "bg.solid" : "transparent"}
									color={colorMode === "light" ? "fg.inverted" : "fg.muted"}
									shadow={colorMode === "light" ? "glass" : "none"}
									transition="all 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
									_hover={{ transform: "scale(1.06)" }}
								>
									<Icon as={LuSun} boxSize={4.5} />
								</Circle>
								<Circle
									size="10"
									bg={colorMode === "dark" ? "bg.solid" : "transparent"}
									color={colorMode === "dark" ? "fg.inverted" : "fg.muted"}
									shadow={colorMode === "dark" ? "glass" : "none"}
									transition="all 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
									_hover={{ transform: "scale(1.06)" }}
								>
									<Icon as={LuMoon} boxSize={4.5} />
								</Circle>
							</HStack>
						</HStack>

						{/* Performance Stats Card */}
						<Box {...glassCard} p={{ base: 6, xl: 7 }}>
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
