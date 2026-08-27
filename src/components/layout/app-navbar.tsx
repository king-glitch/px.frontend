import { Avatar } from "@/components/ui/avatar";
import { useColorMode } from "@/components/ui/color-mode";
import { useAuthContext } from "@/contexts/auth-context";
import {
	Badge,
	Box,
	Circle,
	Flex,
	HStack,
	Heading,
	Icon,
	Tabs,
	Text,
} from "@chakra-ui/react";
import React from "react";
import {
	LuActivity,
	LuCircleCheck,
	LuLayoutDashboard,
	LuLogOut,
	LuMoon,
	LuSettings,
	LuSparkles,
	LuSun,
} from "react-icons/lu";
import { Link, useLocation, useNavigate } from "react-router";

export interface AppNavbarProps {
	/** Optional additional content rendered in the center */
	children?: React.ReactNode;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ children }) => {
	const { user, logout } = useAuthContext();
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { colorMode, toggleColorMode } = useColorMode();

	const isOverview =
		pathname === "/" ||
		pathname === "/dashboard" ||
		(pathname.startsWith("/dashboard") &&
			!pathname.includes("/tasks") &&
			!pathname.includes("/health") &&
			!pathname.includes("/settings"));
	const isTasks = pathname.startsWith("/tasks");
	const isHealth = pathname.startsWith("/health");
	const isSettings = pathname.startsWith("/settings");

	const currentPillarValue = isTasks
		? "/tasks"
		: isHealth
			? "/health"
			: isSettings
				? "/settings"
				: "/dashboard";

	const navPillars = [
		{
			label: "Overview",
			to: "/dashboard",
			icon: LuLayoutDashboard,
			active: isOverview,
		},
		{
			label: "Tasks & Habits",
			to: "/tasks",
			icon: LuCircleCheck,
			active: isTasks,
		},
		{
			label: "Health",
			to: "/health",
			icon: LuActivity,
			active: isHealth,
		},
		{
			label: "Settings",
			to: "/settings",
			icon: LuSettings,
			active: isSettings,
		},
	];

	return (
		<Flex
			as="header"
			align="center"
			justify="space-between"
			gap={{ base: 3, md: 5 }}
			w="full"
			minH="60px"
			px={{ base: 3, md: 5 }}
			py={2.5}
			bg="bg.glass"
			borderWidth="1px"
			borderColor="border.glass"
			rounded="card"
			shadow="glass"
			backdropFilter="blur(20px)"
			position="relative"
			zIndex={20}
		>
			{/* Left: Brand Identity Mark */}
			<HStack asChild gap={2.5} cursor="pointer" flexShrink={0}>
				<Link to="/dashboard">
					<Circle
						size="9"
						bg="bg.solid"
						color="fg.inverted"
						shadow="glass"
						transition="transform 0.15s ease-out"
						_hover={{ transform: "scale(1.08)" }}
					>
						<Icon as={LuSparkles} boxSize={4} />
					</Circle>
					<HStack gap={1.5}>
						<Heading
							fontSize="md"
							fontWeight="bold"
							letterSpacing="-0.03em"
						>
							PX
						</Heading>
						<Badge
							size="xs"
							rounded="pill"
							variant="subtle"
							colorPalette="mint"
							fontSize="9px"
							px={1.5}
							py={0.5}
						>
							OS
						</Badge>
					</HStack>
				</Link>
			</HStack>

			{/* Center: Holistic Pillar Segmented Navigation Bar using Chakra Tabs */}
			<Flex flex="1" justify="center" px={{ base: 1, md: 4 }}>
				{children ? (
					children
				) : (
					<Tabs.Root
						value={currentPillarValue}
						onValueChange={(details) => {
							if (details.value && details.value !== pathname) {
								navigate(details.value);
							}
						}}
						variant="plain"
						size="sm"
						css={{
							"--tabs-indicator-bg": "colors.bg.solid",
							"--tabs-indicator-shadow": "shadows.glass",
							"--tabs-trigger-radius": "radii.full",
						}}
					>
						<Tabs.List
							bg="bg.muted"
							borderWidth="1px"
							borderColor="border.glass"
							rounded="pill"
							p={1}
							gap={1}
							shadow="glass"
							position="relative"
						>
							{navPillars.map((pillar) => (
								<Tabs.Trigger
									key={pillar.to}
									value={pillar.to}
									px={{ base: 3, md: 4 }}
									py={1.5}
									cursor="pointer"
									fontWeight="semibold"
									fontSize="xs"
									color={
										pillar.active
											? "fg.inverted"
											: "fg.muted"
									}
									_selected={{
										color: "fg.inverted",
										fontWeight: "bold",
									}}
									_hover={{
										color: pillar.active
											? "fg.inverted"
											: "fg",
									}}
									zIndex={1}
									transition="color 0.15s ease-out"
								>
									<Box
										as="span"
										display="inline-flex"
										alignItems="center"
										gap={2}
									>
										<Icon as={pillar.icon} boxSize={3.5} />
										<Text as="span" whiteSpace="nowrap">
											{pillar.label}
										</Text>
									</Box>
								</Tabs.Trigger>
							))}
							<Tabs.Indicator rounded="pill" />
						</Tabs.List>
					</Tabs.Root>
				)}
			</Flex>

			{/* Right: Color Mode, User Profile */}
			<HStack gap={2.5} flexShrink={0}>
				{/* Color Mode Switcher */}
				<Circle
					size="9"
					bg="bg.muted"
					cursor="pointer"
					onClick={toggleColorMode}
					title={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
					transition="transform 0.15s ease-out"
					_hover={{
						bg: "bg.panel",
						shadow: "glass",
						transform: "scale(1.08)",
					}}
					_active={{ transform: "scale(0.92)" }}
				>
					<Icon
						as={colorMode === "light" ? LuMoon : LuSun}
						boxSize={4}
					/>
				</Circle>

				{/* User Profile Capsule */}
				<HStack
					bg="bg.panel"
					borderWidth="1px"
					borderColor="border.glass"
					rounded="pill"
					pl={1.5}
					pr={2.5}
					py={1}
					shadow="glass"
					gap={2}
					transition="box-shadow 0.15s ease-out"
					_hover={{ shadow: "float" }}
				>
					<Avatar size="xs" name={user?.username} />
					<Text
						fontSize="xs"
						fontWeight="semibold"
						display={{ base: "none", md: "inline" }}
					>
						@{user?.username}
					</Text>
					<Circle
						size="6"
						bg="bg.muted"
						cursor="pointer"
						title="Sign out"
						onClick={logout}
						transition="transform 0.15s ease-out"
						_hover={{
							color: "red.fg",
							bg: "red.subtle",
							transform: "scale(1.1)",
						}}
						_active={{ transform: "scale(0.9)" }}
					>
						<Icon as={LuLogOut} boxSize={3} />
					</Circle>
				</HStack>
			</HStack>
		</Flex>
	);
};

export default AppNavbar;
