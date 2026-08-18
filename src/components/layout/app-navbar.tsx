import { Avatar } from "@/components/ui/avatar";
import { useColorMode } from "@/components/ui/color-mode";
import { useAuthContext } from "@/contexts/auth-context";
import { useActiveQueues } from "@/api";
import {
	Badge,
	Box,
	Circle,
	Flex,
	HStack,
	Heading,
	Icon,
	Spinner,
	Text,
} from "@chakra-ui/react";
import React from "react";
import {
	LuActivity,
	LuCircleCheck,
	LuLayoutDashboard,
	LuLogOut,
	LuMoon,
	LuSparkles,
	LuSun,
	LuWallet,
} from "react-icons/lu";
import { Link, useLocation } from "react-router";

export interface AppNavbarProps {
	/** Optional additional content rendered in the center */
	children?: React.ReactNode;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ children }) => {
	const { user, logout } = useAuthContext();
	const { pathname } = useLocation();
	const { colorMode, toggleColorMode } = useColorMode();

	const { activeQueues, hasActiveQueues } = useActiveQueues({
		tag: "bank.slip",
	});

	const isOverview =
		pathname === "/" ||
		pathname === "/dashboard" ||
		(pathname.startsWith("/dashboard") &&
			!pathname.includes("/financial") &&
			!pathname.includes("/tasks") &&
			!pathname.includes("/health"));
	const isFinancial = pathname.startsWith("/financial");
	const isTasks = pathname.startsWith("/tasks");
	const isHealth = pathname.startsWith("/health");

	const navPillars = [
		{
			label: "Overview",
			to: "/dashboard",
			icon: LuLayoutDashboard,
			active: isOverview,
		},
		{
			label: "Financials",
			to: "/financial",
			icon: LuWallet,
			active: isFinancial,
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
			backdropFilter="blur(30px) saturate(1.4)"
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
						transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
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

			{/* Center: Holistic Pillar Segmented Navigation Bar */}
			<Flex flex="1" justify="center" px={{ base: 1, md: 4 }}>
				{children ? (
					children
				) : (
					<HStack
						bg="bg.muted"
						borderWidth="1px"
						borderColor="border"
						rounded="pill"
						p={1}
						gap={1}
						shadow="glass"
					>
						{navPillars.map((pillar) => (
							<HStack
								key={pillar.to}
								asChild
								px={{ base: 3, md: 4 }}
								py={1.5}
								rounded="pill"
								bg={pillar.active ? "bg.solid" : "transparent"}
								color={pillar.active ? "fg.inverted" : "fg.muted"}
								fontSize="xs"
								fontWeight={pillar.active ? "bold" : "semibold"}
								letterSpacing="0.01em"
								cursor="pointer"
								transition="all 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
								shadow={pillar.active ? "glass" : "none"}
								_hover={{
									color: pillar.active ? "fg.inverted" : "fg",
									bg: pillar.active ? "bg.solid" : "bg.panel",
									transform: pillar.active ? "none" : "translateY(-1px)",
								}}
								_active={{ transform: "scale(0.97)" }}
							>
								<Link to={pillar.to}>
									<Icon as={pillar.icon} boxSize={3.5} />
									<Text whiteSpace="nowrap">{pillar.label}</Text>
								</Link>
							</HStack>
						))}
					</HStack>
				)}
			</Flex>

			{/* Right: Background Queues Status, Color Mode, User Profile */}
			<HStack gap={2.5} flexShrink={0}>
				{/* Background Queues Ingestion Status Badge */}
				{hasActiveQueues && (
					<HStack
						asChild
						bg="bg.panel"
						borderWidth="1px"
						borderColor="mint.solid"
						px={3}
						py={1.5}
						rounded="pill"
						fontSize="xs"
						fontWeight="semibold"
						gap={2}
						cursor="pointer"
						shadow="glass"
						transition="all 0.2s"
						_hover={{ transform: "translateY(-1px)", bg: "bg.muted" }}
					>
						<Link to="/financial/transactions">
							<Spinner size="xs" color="mint.fg" />
							<Text display={{ base: "none", sm: "inline" }}>
								{activeQueues.length} slip
								{activeQueues.length > 1 ? "s" : ""} processing
							</Text>
						</Link>
					</HStack>
				)}

				{/* Color Mode Switcher */}
				<Circle
					size="9"
					bg="bg.muted"
					cursor="pointer"
					onClick={toggleColorMode}
					title={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
					transition="all 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
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
					transition="all 0.2s"
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
						transition="all 0.2s"
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
