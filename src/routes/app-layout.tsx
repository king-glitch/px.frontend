import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuthContext } from "@/contexts/auth-context";
import { Box, Container, Flex, Spinner } from "@chakra-ui/react";
import React, { useState } from "react";
import { useLocation, Navigate, Outlet } from "react-router";

export const AppLayout: React.FC = () => {
	const { isAuthenticated, isLoading } = useAuthContext();
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const { pathname } = useLocation();
	const isDashboard = pathname === "/" || pathname === "/dashboard";

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
			{/* Subtle lime ambient glow in background */}
			<Box
				position="fixed"
				top="-10%"
				left="25%"
				w="600px"
				h="500px"
				pointerEvents="none"
				opacity={0.15}
				zIndex={0}
				style={{
					background:
						"radial-gradient(circle at center, rgba(163, 230, 53, 0.35) 0%, rgba(163, 230, 53, 0.08) 45%, transparent 70%)",
				}}
			/>

			{/* Connected Main Frame: Flush Sidebar + Flush Header & Content Shell */}
			<Flex
				w="full"
				h="full"
				flexDirection="row"
				position="relative"
				zIndex={1}
				overflow="hidden"
			>
				{/* Fixed / Non-scrolling Left Sidebar (Flush to left & top & bottom) */}
				<AppSidebar
					isOpen={isMobileSidebarOpen}
					onClose={() => setIsMobileSidebarOpen(false)}
				/>

				{/* Right Main Column (Flush Top Header + Scrollable Page Content) */}
				<Flex
					flex="1"
					minW={0}
					h="full"
					direction="column"
					overflow="hidden"
				>
					{/* Fixed / Non-scrolling Top Header Bar (Flush to top & right) */}
					<Box flexShrink={0}>
						<AppHeader onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
					</Box>

					{/* ONLY THIS REGION SCROLLS (with clean inner content padding) */}
					<Box
						flex="1"
						minH={0}
						display="flex"
						flexDirection="column"
						overflowY={{ base: "auto", lg: isDashboard ? "hidden" : "auto" }}
						overflowX="hidden"
						position="relative"
						px={{ base: 4, md: 6, xl: 8 }}
						py={{ base: 4, md: isDashboard ? 4 : 6 }}
					>
						<Outlet />
					</Box>
				</Flex>
			</Flex>
		</Box>
	);
};

export default AppLayout;
