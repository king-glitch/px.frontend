import React from "react";
import {
	Badge,
	Box,
	Circle,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import {
	LuActivity,
	LuCircleCheck,
	LuLayoutDashboard,
	LuLogOut,
	LuSettings,
	LuSparkles,
	LuSwords,
	LuTarget,
	LuTrendingUp,
	LuUsers,
	LuWallet,
	LuX,
} from "react-icons/lu";
import { Link, useLocation } from "react-router";
import { Avatar } from "@/components/ui/avatar";
import { useAuthContext } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n";

export interface AppSidebarProps {
	isOpen?: boolean;
	onClose?: () => void;
}

interface NavItem {
	label: string;
	to: string;
	icon: React.ElementType;
	badge?: string;
}

interface NavSection {
	title: string;
	items: NavItem[];
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
	isOpen = false,
	onClose,
}) => {
	const { t } = useTranslation();
	const { user, logout } = useAuthContext();
	const { pathname } = useLocation();

	const navSections: NavSection[] = [
		{
			title: "Planning & Strategy",
			items: [
				{
					label: t("components.layout.navbar.overview") || "Dashboard",
					to: "/dashboard",
					icon: LuLayoutDashboard,
				},
				{
					label: "Goals & Projects",
					to: "/goals",
					icon: LuTarget,
				},
			],
		},
		{
			title: "Action & Habits",
			items: [
				{
					label: t("common.nav.tasksHabits") || "Tasks & Habits",
					to: "/tasks",
					icon: LuCircleCheck,
				},
				{
					label: t("common.nav.health") || "Health & Energy",
					to: "/health",
					icon: LuActivity,
				},
				{
					label: "Reviews",
					to: "/reviews",
					icon: LuTrendingUp,
				},
			],
		},
		{
			title: "Co-op & World",
			items: [
				{
					label: "Co-op Circle",
					to: "/circle",
					icon: LuUsers,
				},
				{
					label: t("components.layout.navbar.heroes") || "Heroes & Avatar",
					to: "/game/heroes",
					icon: LuSwords,
				},
				{
					label: t("components.layout.navbar.finance") || "Finance",
					to: "/game/finance",
					icon: LuWallet,
				},
			],
		},
	];

	const isItemActive = (to: string) => {
		if (to === "/dashboard") {
			return (
				pathname === "/" ||
				pathname === "/dashboard" ||
				(pathname.startsWith("/dashboard") &&
					!pathname.includes("/tasks") &&
					!pathname.includes("/health") &&
					!pathname.includes("/game") &&
					!pathname.includes("/settings"))
			);
		}
		return pathname.startsWith(to);
	};

	const sidebarContent = (
		<Flex
			direction="column"
			h="full"
			w="full"
			justify="space-between"
			p={4}
		>
			{/* Top: Brand Header */}
			<VStack align="stretch" gap={5}>
				<Flex align="center" justify="space-between">
					<HStack asChild gap={2.5} cursor="pointer">
						<Link to="/dashboard" onClick={onClose}>
							<Circle
								size="9"
								bg="lime.solid"
								color="lime.contrast"
								shadow="none"
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
									colorPalette="lime"
								>
									OS
								</Badge>
							</HStack>
						</Link>
					</HStack>

					{/* Mobile Close Button */}
					{onClose && (
						<IconButton
							aria-label="Close Sidebar"
							variant="ghost"
							size="sm"
							display={{ base: "flex", md: "none" }}
							onClick={onClose}
						>
							<Icon as={LuX} boxSize={4} />
						</IconButton>
					)}
				</Flex>

				{/* Navigation Sections (Independently scrollable if needed) */}
				<VStack align="stretch" gap={4} flex="1" minH={0} overflowY="auto" pr={0.5}>
					{navSections.map((section) => (
						<VStack key={section.title} align="stretch" gap={1}>
							<Text
								fontSize="10px"
								fontWeight="bold"
								textTransform="uppercase"
								letterSpacing="0.08em"
								color="fg.muted"
								px={2.5}
								mb={0.5}
							>
								{section.title}
							</Text>

							{section.items.map((item) => {
								const active = isItemActive(item.to);
								return (
									<HStack
										key={item.to}
										asChild
										px={3}
										py={2}
										rounded="xl"
										gap={3}
										cursor="pointer"
										transition="all 0.15s ease-out"
										bg={active ? "lime.solid" : "transparent"}
										color={active ? "lime.contrast" : "fg.muted"}
										fontWeight={active ? "bold" : "medium"}
										fontSize="xs"
										_hover={{
											bg: active ? "lime.solid" : "bg.muted",
											color: active ? "lime.contrast" : "fg",
										}}
										onClick={onClose}
									>
										<Link to={item.to}>
											<Icon
												as={item.icon}
												boxSize={4}
												color={active ? "lime.contrast" : "inherit"}
											/>
											<Text flex="1" whiteSpace="nowrap">
												{item.label}
											</Text>
											{item.badge && (
												<Badge
													size="xs"
													variant="solid"
													colorPalette="lime"
													rounded="pill"
												>
													{item.badge}
												</Badge>
											)}
										</Link>
									</HStack>
								);
							})}
						</VStack>
					))}
				</VStack>
			</VStack>

			{/* Bottom: Settings & User Profile */}
			<VStack align="stretch" gap={2} pt={4} borderTopWidth="1px" borderColor="border.glass" flexShrink={0}>
				<HStack
					asChild
					px={3}
					py={2}
					rounded="xl"
					gap={3}
					cursor="pointer"
					transition="all 0.15s ease-out"
					bg={pathname.startsWith("/settings") ? "lime.solid" : "transparent"}
					color={pathname.startsWith("/settings") ? "lime.contrast" : "fg.muted"}
					fontWeight={pathname.startsWith("/settings") ? "bold" : "medium"}
					fontSize="xs"
					_hover={{
						bg: pathname.startsWith("/settings") ? "lime.solid" : "bg.muted",
						color: pathname.startsWith("/settings") ? "lime.contrast" : "fg",
					}}
					onClick={onClose}
				>
					<Link to="/settings">
						<Icon as={LuSettings} boxSize={4} />
						<Text flex="1">{t("common.nav.settings") || "Settings"}</Text>
					</Link>
				</HStack>

				{/* User Profile Card */}
				<Flex
					align="center"
					justify="space-between"
					p={2}
					rounded="xl"
					bg="bg.muted"
					borderWidth="1px"
					borderColor="border.glass"
				>
					<HStack gap={2.5} overflow="hidden">
						<Avatar size="xs" name={user?.username} />
						<Stack gap={0} overflow="hidden">
							<Text fontSize="xs" fontWeight="bold" lineClamp={1}>
								{user?.username}
							</Text>
							<Text fontSize="10px" color="fg.muted" lineClamp={1}>
								{t("components.layout.navbar.signedIn") || "Signed in"}
							</Text>
						</Stack>
					</HStack>

					<IconButton
						aria-label="Sign Out"
						variant="ghost"
						size="xs"
						color="fg.muted"
						_hover={{ color: "fg" }}
						onClick={logout}
						title={t("components.layout.navbar.signOut") || "Sign out"}
					>
						<Icon as={LuLogOut} boxSize={3.5} />
					</IconButton>
				</Flex>
			</VStack>
		</Flex>
	);

	return (
		<>
			{/* Desktop Fixed / Static Sidebar (Flush to Left, Top, Bottom) */}
			<Box
				as="aside"
				display={{ base: "none", md: "flex" }}
				w="260px"
				h="100dvh"
				flexShrink={0}
				bg="bg.panel"
				borderRightWidth="1px"
				borderColor="border.glass"
				rounded="none"
				shadow="none"
				backdropFilter="blur(20px)"
				zIndex={20}
				overflow="hidden"
			>
				{sidebarContent}
			</Box>

			{/* Mobile Drawer Backdrop & Sidebar */}
			{isOpen && (
				<Box
					display={{ base: "block", md: "none" }}
					position="fixed"
					inset={0}
					zIndex={50}
				>
					{/* Backdrop */}
					<Box
						position="absolute"
						inset={0}
						bg="blackAlpha.600"
						backdropFilter="blur(4px)"
						onClick={onClose}
					/>

					{/* Drawer Panel */}
					<Box
						position="absolute"
						top={0}
						left={0}
						bottom={0}
						w="280px"
						bg="bg.panel"
						borderRightWidth="1px"
						borderColor="border.glass"
						shadow="float"
						backdropFilter="blur(24px)"
						zIndex={51}
					>
						{sidebarContent}
					</Box>
				</Box>
			)}
		</>
	);
};

export default AppSidebar;
