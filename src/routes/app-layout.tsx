import AppNavbar from "@/components/layout/app-navbar";
import { useAuthContext } from "@/contexts/auth-context";
import { Box, Container, Flex, Spinner } from "@chakra-ui/react";
import React from "react";
import { Navigate, Outlet } from "react-router";

export const AppLayout: React.FC = () => {
	const { isAuthenticated, isLoading } = useAuthContext();

	if (isLoading) {
		return (
			<Flex h="100dvh" align="center" justify="center" bg="bg.canvas">
				<Spinner size="xl" />
			</Flex>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/authentication/login" replace />;
	}

	return (
		<Box
			minH="100dvh"
			bg="bg.canvas"
			position="relative"
			overflowX="hidden"
			display="flex"
			flexDirection="column"
		>
			{/* Ambient background glow */}
			<Box
				position="fixed"
				top="-10%"
				left="30%"
				w="700px"
				h="600px"
				rounded="full"
				pointerEvents="none"
				opacity={0.35}
				css={{
					background:
						"radial-gradient(circle, {colors.holo.lavender} 0%, {colors.holo.blush} 50%, transparent 75%)",
					filter: "blur(90px)",
				}}
			/>

			{/* Persistent Wide Main Container */}
			<Container
				maxW="1680px"
				w="full"
				flex="1"
				display="flex"
				flexDirection="column"
				px={{ base: 4, md: 8, xl: 10 }}
				py={{ base: 3, md: 4 }}
			>
				{/* Top Global App Navbar — Persists across all pages */}
				<AppNavbar />

				{/* Page Content */}
				<Box
					position="relative"
					mt={{ base: 3, md: 4 }}
					flex="1"
					display="flex"
					flexDirection="column"
				>
					<Outlet />
				</Box>
			</Container>
		</Box>
	);
};

export default AppLayout;
