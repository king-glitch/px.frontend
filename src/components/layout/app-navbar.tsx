import { Avatar } from "@/components/ui/avatar";
import { useColorMode } from "@/components/ui/color-mode";
import {
	MenuContent,
	MenuItem,
	MenuRoot,
	MenuSeparator,
	MenuTrigger,
} from "@/components/ui/menu";
import { useAuthContext } from "@/contexts/auth-context";
import {
	Badge,
	Box,
	Circle,
	Flex,
	HStack,
	Heading,
	Icon,
	Stack,
	Tabs,
	Text,
} from "@chakra-ui/react";
import React from "react";
import {
	LuActivity,
	LuChevronDown,
	LuCircleCheck,
	LuLayoutDashboard,
	LuLogOut,
	LuMoon,
	LuSettings,
	LuShoppingBag,
	LuSparkles,
	LuSun,
	LuSwords,
	LuWallet,
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
			!pathname.includes("/game") &&
			!pathname.includes("/settings"));
	const isTasks = pathname.startsWith("/tasks");
	const isHealth = pathname.startsWith("/health");
	const isFinance = pathname.startsWith("/game/finance");
	const isHeroes = pathname.startsWith("/game/heroes");
	const isShop = pathname.startsWith("/game/shop");

	const currentPillarValue = isTasks
		? "/tasks"
		: isHealth
			? "/health"
			: isHeroes
				? "/game/heroes"
				: isShop
					? "/game/shop"
					: isFinance
						? "/game/finance"
						: isOverview
							? "/dashboard"
							: "";

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
			label: "Heroes",
			to: "/game/heroes",
			icon: LuSwords,
			active: isHeroes,
		},
		{
			label: "Shop",
			to: "/game/shop",
			icon: LuShoppingBag,
			active: isShop,
		},
		{
			label: "Finance",
			to: "/game/finance",
			icon: LuWallet,
			active: isFinance,
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

			{/* Right: Color Mode, User Profile Dropdown */}
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

				{/* User Profile Dropdown */}
				<MenuRoot
					positioning={{
						placement: "bottom-end",
						offset: { mainAxis: 8 },
					}}
				>
					<MenuTrigger asChild>
						<HStack
							as="button"
							bg="bg.panel"
							borderWidth="1px"
							borderColor="border.glass"
							rounded="pill"
							pl={1.5}
							pr={3}
							py={1}
							shadow="glass"
							gap={2}
							cursor="pointer"
							transition="all 0.15s ease-out"
							_hover={{
								shadow: "float",
								transform: "translateY(-1px)",
							}}
							_active={{ transform: "scale(0.98)" }}
						>
							<Avatar size="xs" name={user?.username} />
							<Text
								fontSize="xs"
								fontWeight="semibold"
								display={{ base: "none", md: "inline" }}
							>
								@{user?.username}
							</Text>
							<Icon
								as={LuChevronDown}
								boxSize={3}
								color="fg.muted"
								transition="transform 0.15s ease-out"
							/>
						</HStack>
					</MenuTrigger>
					<MenuContent
						bg="bg.panel"
						borderWidth="1px"
						borderColor="border.glass"
						rounded="2xl"
						shadow="float"
						p={1.5}
						minW="200px"
						backdropFilter="blur(20px)"
					>
						<Box px={3} py={2}>
							<Stack gap={0.5}>
								<Text fontSize="xs" fontWeight="bold">
									{user?.username}
								</Text>
								<Text fontSize="11px" color="fg.muted">
									Signed in
								</Text>
							</Stack>
						</Box>
						<MenuSeparator borderColor="border.glass" />
						<MenuItem
							value="heroes"
							cursor="pointer"
							rounded="xl"
							px={3}
							py={2}
							fontSize="xs"
							fontWeight="medium"
							onClick={() => navigate("/game/heroes")}
							_hover={{ bg: "bg.muted" }}
						>
							<Icon
								as={LuSwords}
								boxSize={4}
								mr={2}
								color="mint.fg"
							/>
							Heroes Command Hub
						</MenuItem>
						<MenuItem
							value="settings"
							cursor="pointer"
							rounded="xl"
							px={3}
							py={2}
							fontSize="xs"
							fontWeight="medium"
							onClick={() => navigate("/settings")}
							_hover={{ bg: "bg.muted" }}
						>
							<Icon
								as={LuSettings}
								boxSize={4}
								mr={2}
								color="fg.muted"
							/>
							Settings
						</MenuItem>
						<MenuSeparator borderColor="border.glass" />
						<MenuItem
							value="logout"
							cursor="pointer"
							rounded="xl"
							px={3}
							py={2}
							fontSize="xs"
							fontWeight="medium"
							color="red.500"
							onClick={logout}
							_hover={{ bg: "red.subtle", color: "red.fg" }}
						>
							<Icon as={LuLogOut} boxSize={4} mr={2} />
							Sign out
						</MenuItem>
					</MenuContent>
				</MenuRoot>
			</HStack>
		</Flex>
	);
};

export default AppNavbar;
