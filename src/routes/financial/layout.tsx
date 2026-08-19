// ponytail: Financial sub-layout renders only section sub-nav; AppLayout handles the global shell
import {
	Box,
	Flex,
	HStack,
	Heading,
	Icon,
	Tabs,
	Text,
	VStack,
} from "@chakra-ui/react";
import React from "react";
import {
	LuBuilding2,
	LuFolder,
	LuReceipt,
	LuWallet,
} from "react-icons/lu";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

export const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(20px)",
} as const;

interface NavItem {
	label: string;
	to: string;
	icon: React.ElementType;
	exact?: boolean;
}

export const FinancialLayout: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const isDashboardPrefix = location.pathname.startsWith("/dashboard/financial");
	const basePath = isDashboardPrefix ? "/dashboard/financial" : "/financial";

	const navItems: NavItem[] = [
		{ label: "Overview", to: basePath, icon: LuWallet, exact: true },
		{ label: "Transactions", to: `${basePath}/transactions`, icon: LuReceipt },
		{ label: "Categories", to: `${basePath}/categories`, icon: LuFolder },
		{ label: "Banks", to: `${basePath}/banks`, icon: LuBuilding2 },
	];

	// Determine active tab value
	const currentTab =
		navItems.find((item) =>
			item.exact
				? location.pathname === item.to || location.pathname === `${item.to}/`
				: location.pathname.startsWith(item.to)
		)?.to || basePath;

	return (
		<Box>
			{/* Financial Section Sub-Header & Navigation */}
			<Flex
				align="center"
				justify="space-between"
				gap={4}
				mb={{ base: 4, md: 6 }}
				wrap="wrap"
			>
				{/* Section Title */}
				<VStack align="flex-start" gap={0}>
					<HStack gap={1.5}>
						<Icon as={LuWallet} boxSize={4} color="mint.fg" />
						<Heading
							fontSize={{ base: "md", md: "lg" }}
							fontWeight="bold"
							letterSpacing="-0.02em"
						>
							Financial Hub
						</Heading>
					</HStack>
					<Text fontSize="xs" color="fg.muted">
						Personal expense & transaction manager
					</Text>
				</VStack>

				{/* Navigation Sub-Tabs using Chakra Tabs */}
				<Tabs.Root
					value={currentTab}
					onValueChange={(details) => {
						if (details.value && details.value !== location.pathname) {
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
						bg="bg.panel"
						borderWidth="1px"
						borderColor="border.glass"
						rounded="pill"
						p={1}
						shadow="glass"
						gap={1}
						position="relative"
					>
						{navItems.map((item) => {
							const isActive = item.to === currentTab;

							return (
								<Tabs.Trigger
									key={item.to}
									value={item.to}
									px={3.5}
									py={1.5}
									cursor="pointer"
									fontWeight="semibold"
									fontSize="xs"
									color={isActive ? "fg.inverted" : "fg.muted"}
									_selected={{
										color: "fg.inverted",
										fontWeight: "bold",
									}}
									_hover={{
										color: isActive ? "fg.inverted" : "fg",
									}}
									zIndex={1}
									transition="color 0.15s ease-out"
								>
									<Box as="span" display="inline-flex" alignItems="center" gap={2}>
										<Icon as={item.icon} boxSize={3.5} />
										<Text as="span" whiteSpace="nowrap">
											{item.label}
										</Text>
									</Box>
								</Tabs.Trigger>
							);
						})}
						<Tabs.Indicator rounded="pill" />
					</Tabs.List>
				</Tabs.Root>
			</Flex>

			{/* Outlet / Page Content */}
			<Box position="relative" zIndex={1}>
				<Outlet />
			</Box>
		</Box>
	);
};

export default FinancialLayout;
