import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuthContext } from "@/contexts/auth-context";
import { Box, Container, Flex, Spinner } from "@chakra-ui/react";
import React, { useState } from "react";
import { Navigate, Outlet } from "react-router";

export const AppLayout: React.FC = () => {
	const { isAuthenticated, isLoading } = useAuthContext();
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
			h="100dvh"
			w="100vw"
			bg="bg.canvas"
			position="relative"
			overflow="hidden"
			display="flex"
			flexDirection="column"
		>
			{/* High-performance GPU-friendly ambient gradient without expensive software blur filters */}
			<Box
				position="fixed"
				top="-10%"
				left="30%"
				w="700px"
				h="600px"
				pointerEvents="none"
				opacity={0.35}
				zIndex={0}
				style={{
					background:
						"radial-gradient(circle at center, rgba(221, 214, 254, 0.4) 0%, rgba(251, 207, 232, 0.25) 35%, rgba(165, 243, 252, 0.1) 60%, transparent 75%)",
				}}
			/>

			{/* Full-Viewport Main Frame: Fixed Sidebar + Content Shell */}
			<Flex
				maxW="1680px"
				w="full"
				h="full"
				mx="auto"
				flexDirection="row"
				gap={{ base: 0, md: 5 }}
				px={{ base: 3, md: 6, xl: 8 }}
				py={{ base: 3, md: 4 }}
				position="relative"
				zIndex={1}
				overflow="hidden"
			>
				{/* Fixed / Non-scrolling Left Sidebar */}
				<AppSidebar
					isOpen={isMobileSidebarOpen}
					onClose={() => setIsMobileSidebarOpen(false)}
				/>

				{/* Right Main Column (Fixed Top Header + Scrollable Page Content) */}
				<Flex
					flex="1"
					minW={0}
					h="full"
					direction="column"
					gap={{ base: 3, md: 4 }}
					overflow="hidden"
				>
					{/* Fixed / Non-scrolling Top Header Bar */}
					<Box flexShrink={0}>
						<AppHeader onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
					</Box>

					{/* ONLY THIS REGION SCROLLS */}
					<Box
						flex="1"
						minH={0}
						overflowY="auto"
						overflowX="hidden"
						position="relative"
						pr={{ base: 0, md: 1 }}
					>
						<Outlet />
					</Box>
				</Flex>
			</Flex>
		</Box>
	);
};

export default AppLayout;
