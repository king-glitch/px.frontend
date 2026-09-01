import React from "react";
import {
	Badge,
	Box,
	Circle,
	Flex,
	HStack,
	Icon,
	IconButton,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import {
	MenuContent,
	MenuItem,
	MenuRoot,
	MenuSeparator,
	MenuTrigger,
} from "@/components/ui/menu";
import {
	LuChevronDown,
	LuCoins,
	LuFlame,
	LuLogOut,
	LuMenu,
	LuMoon,
	LuSettings,
	LuSparkles,
	LuSun,
	LuZap,
} from "react-icons/lu";
import { useLocation, useNavigate } from "react-router";
import { Avatar } from "@/components/ui/avatar";
import { useColorMode } from "@/components/ui/color-mode";
import { useAuthContext } from "@/contexts/auth-context";
import { usePlayerSummary, useRecovery } from "@/api/hooks/use-game";
import { useTranslation } from "@/lib/i18n";

export interface AppHeaderProps {
	onOpenSidebar?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenSidebar }) => {
	const { t } = useTranslation();
	const { user, logout } = useAuthContext();
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { colorMode, toggleColorMode } = useColorMode();

	const { data: playerSummary } = usePlayerSummary();
	const { data: recovery } = useRecovery();

	const getPageTitle = () => {
		if (pathname === "/" || pathname.startsWith("/dashboard")) return "Dashboard";
		if (pathname.startsWith("/goals")) return "Goals & Projects";
		if (pathname.startsWith("/circle")) return "Co-op Circle";
		if (pathname.startsWith("/tasks")) return "Tasks & Habits";
		if (pathname.startsWith("/reviews")) return "Reviews & Reflection";
		if (pathname.startsWith("/health")) return "Health & Energy";
		if (pathname.startsWith("/game/heroes")) return "Heroes & Avatar";
		if (pathname.startsWith("/game/finance")) return "Finance & Treasury";
		if (pathname.startsWith("/settings")) return "Settings";
		return "PX OS";
	};

	return (
		<Flex
			as="header"
			align="center"
			justify="space-between"
			gap={4}
			w="full"
			h="60px"
			px={{ base: 4, md: 6 }}
			py={2}
			bg="bg.panel"
			borderBottomWidth="1px"
			borderColor="border.glass"
			rounded="none"
			shadow="none"
			backdropFilter="blur(20px)"
			position="relative"
			zIndex={10}
		>
			{/* Left: Mobile Menu Trigger + Page Title */}
			<HStack gap={3}>
				<IconButton
					aria-label="Open Navigation Menu"
					variant="ghost"
					size="sm"
					display={{ base: "flex", md: "none" }}
					onClick={onOpenSidebar}
				>
					<Icon as={LuMenu} boxSize={5} />
				</IconButton>

				<VStack align="flex-start" gap={0}>
					<HStack gap={2}>
						<Text fontSize="md" fontWeight="bold" letterSpacing="-0.02em">
							{getPageTitle()}
						</Text>
						{recovery?.vacation_mode && (
							<Badge
								colorPalette="orange"
								variant="subtle"
								size="sm"
								rounded="pill"
								px={2}
							>
								🌴 Vacation Mode
							</Badge>
						)}
					</HStack>
				</VStack>
			</HStack>

			{/* Right: Player Stats Pill + Theme + User Menu */}
			<HStack gap={{ base: 2, md: 3 }} flexShrink={0}>
				{/* Mobile Compact PX Badge */}
				{playerSummary?.player && (
					<HStack
						display={{ base: "flex", sm: "none" }}
						bg="bg.muted"
						borderWidth="1px"
						borderColor="border.glass"
						rounded="pill"
						px={2.5}
						py={1}
						gap={1}
						fontSize="xs"
					>
						<Icon as={LuCoins} color="lime.400" boxSize={3.5} />
						<Text fontWeight="bold">
							{playerSummary.player.px.toLocaleString()}
						</Text>
					</HStack>
				)}

				{/* Desktop Player Level & Currency Stats Pill */}
				{playerSummary?.player && (
					<HStack
						display={{ base: "none", sm: "flex" }}
						bg="bg.muted"
						borderWidth="1px"
						borderColor="border.glass"
						rounded="pill"
						px={3}
						py={1}
						gap={3}
						shadow="none"
						fontSize="xs"
					>
						{/* Level Badge */}
						<HStack gap={1}>
							<Icon as={LuZap} color="lime.400" boxSize={3.5} />
							<Text fontWeight="bold" color="lime.500">
								Lv. {playerSummary.player.level}
							</Text>
						</HStack>

						{/* PX Points */}
						<HStack gap={1}>
							<Icon as={LuCoins} color="lime.400" boxSize={3.5} />
							<Text fontWeight="semibold">
								{playerSummary.player.px.toLocaleString()}{" "}
								<Text as="span" color="fg.muted" fontSize="10px">
									PX
								</Text>
							</Text>
						</HStack>

						{/* Streak Badge if available */}
						{playerSummary.player.streak > 0 && (
							<HStack gap={1}>
								<Icon as={LuFlame} color="lime.400" boxSize={3.5} />
								<Text fontWeight="semibold" color="lime.500">
									{playerSummary.player.streak}d
								</Text>
							</HStack>
						)}
					</HStack>
				)}

				{/* Color Mode Switcher */}
				<Circle
					size="9"
					bg="bg.muted"
					cursor="pointer"
					onClick={toggleColorMode}
					title={
						colorMode === "light"
							? t("components.layout.navbar.switchToDark") || "Switch to dark mode"
							: t("components.layout.navbar.switchToLight") || "Switch to light mode"
					}
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
							pr={{ base: 1.5, md: 3 }}
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
								display={{ base: "none", md: "inline" }}
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
									{t("components.layout.navbar.signedIn") || "Signed in"}
								</Text>
							</Stack>
						</Box>
						<MenuSeparator borderColor="border.glass" />
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
							{t("common.nav.settings") || "Settings"}
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
							{t("components.layout.navbar.signOut") || "Sign out"}
						</MenuItem>
					</MenuContent>
				</MenuRoot>
			</HStack>
		</Flex>
	);
};

export default AppHeader;
