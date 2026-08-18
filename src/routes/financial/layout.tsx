// ponytail: Financial sub-layout renders only section sub-nav; AppLayout handles the global shell
import {
	Box,
	Flex,
	HStack,
	Heading,
	Icon,
	Text,
	VStack,
} from "@chakra-ui/react";
import React from "react";
import {
	LuFolder,
	LuReceipt,
	LuUsers,
	LuWallet,
} from "react-icons/lu";
import { Link, Outlet, useLocation } from "react-router";

export const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

interface NavItem {
	label: string;
	to: string;
	icon: React.ElementType;
	exact?: boolean;
}

export const FinancialLayout: React.FC = () => {
	const location = useLocation();

	const isDashboardPrefix = location.pathname.startsWith("/dashboard/financial");
	const basePath = isDashboardPrefix ? "/dashboard/financial" : "/financial";

	const navItems: NavItem[] = [
		{ label: "Overview", to: basePath, icon: LuWallet, exact: true },
		{ label: "Transactions", to: `${basePath}/transactions`, icon: LuReceipt },
		{ label: "Categories", to: `${basePath}/categories`, icon: LuFolder },
		{ label: "Counterparties", to: `${basePath}/counterparties`, icon: LuUsers },
	];

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

				{/* Navigation Sub-Pill Menu */}
				<HStack
					bg="bg.panel"
					borderWidth="1px"
					borderColor="border.glass"
					rounded="pill"
					p={1}
					shadow="glass"
					gap={1}
					overflowX="auto"
					maxW="full"
				>
					{navItems.map((item) => {
						const isActive = item.exact
							? location.pathname === item.to || location.pathname === `${item.to}/`
							: location.pathname.startsWith(item.to);

						return (
							<HStack
								key={item.to}
								asChild
								px={3.5}
								py={1.5}
								rounded="pill"
								bg={isActive ? "bg.solid" : "transparent"}
								color={isActive ? "fg.inverted" : "fg.muted"}
								fontSize="xs"
								fontWeight="semibold"
								cursor="pointer"
								whiteSpace="nowrap"
								transition="all 0.2s ease"
								_hover={{ color: isActive ? "fg.inverted" : "fg" }}
							>
								<Link to={item.to}>
									<Icon as={item.icon} boxSize={3.5} />
									<Text>{item.label}</Text>
								</Link>
							</HStack>
						);
					})}
				</HStack>
			</Flex>

			{/* Outlet / Page Content */}
			<Box position="relative" zIndex={1}>
				<Outlet />
			</Box>
		</Box>
	);
};

export default FinancialLayout;
