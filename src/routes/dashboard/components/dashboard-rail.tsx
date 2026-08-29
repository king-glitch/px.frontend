import React from "react";
import { Circle, GridItem, Icon, VStack } from "@chakra-ui/react";
import { Link, useLocation } from "react-router";
import {
	LuActivity,
	LuCalendarDays,
	LuCircleCheck,
	LuLayoutDashboard,
	LuSettings,
	LuTarget,
} from "react-icons/lu";

const railItems = [
	{ icon: LuLayoutDashboard, label: "Dashboard", to: "/dashboard" },
	{ icon: LuCircleCheck, label: "Tasks & Habits", to: "/tasks" },
	{ icon: LuActivity, label: "Health", to: "/health" },
	{ icon: LuSettings, label: "Settings", to: "/settings" },
	{ icon: LuCalendarDays, label: "Calendar" },
	{ icon: LuTarget, label: "Goals" },
];

export const DashboardRail: React.FC = () => {
	const { pathname } = useLocation();

	return (
		<GridItem
			display={{ base: "none", lg: "flex" }}
			alignItems="flex-end"
			pb={3}
		>
			<VStack
				gap={2.5}
				bg={{
					base: "rgba(255, 255, 255, 0.7)",
					_dark: "rgba(20, 24, 36, 0.7)",
				}}
				backdropFilter="blur(24px) saturate(180%)"
				borderWidth="1px"
				borderColor={{
					base: "rgba(255, 255, 255, 0.9)",
					_dark: "rgba(255, 255, 255, 0.16)",
				}}
				rounded="pill"
				py={5}
				px={2.5}
				shadow={{
					base: "0 16px 40px -10px rgba(15, 23, 42, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.95)",
					_dark: "0 16px 40px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.12)",
				}}
			>
				{railItems.map((item) => {
					const active =
						item.to === pathname ||
						(item.to === "/dashboard" && pathname === "/");

					if (item.to) {
						return (
							<Circle
								key={item.label}
								asChild
								title={item.label}
								aria-label={item.label}
								aria-current={active ? "page" : undefined}
								size="11"
								bg={active ? "bg.solid" : "transparent"}
								color={active ? "fg.inverted" : "fg.muted"}
								shadow={active ? "glass" : "none"}
								cursor="pointer"
								transition="all 0.15s ease-out"
								_hover={{
									color: active ? "fg.inverted" : "fg",
									bg: active ? "bg.solid" : "bg.panel",
									transform: "scale(1.08)",
								}}
							>
								<Link to={item.to}>
									<Icon as={item.icon} boxSize={4.5} />
								</Link>
							</Circle>
						);
					}

					return (
						<Circle
							key={item.label}
							title={item.label}
							aria-label={item.label}
							size="11"
							bg="transparent"
							color="fg.muted"
							cursor="pointer"
							transition="all 0.15s ease-out"
							_hover={{
								color: "fg",
								transform: "scale(1.08)",
							}}
						>
							<Icon as={item.icon} boxSize={4.5} />
						</Circle>
					);
				})}
			</VStack>
		</GridItem>
	);
};
