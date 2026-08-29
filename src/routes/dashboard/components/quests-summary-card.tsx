import React from "react";
import {
	Box,
	Circle,
	Grid,
	HStack,
	Icon,
	Skeleton,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuArrowUpRight } from "react-icons/lu";
import { holoGlassCard } from "./holo-card";

interface QuestsSummaryCardProps {
	pendingToday: number;
	ongoingHabits: number;
	completedToday: number;
	isLoading: boolean;
	isError: boolean;
}

export const QuestsSummaryCard: React.FC<QuestsSummaryCardProps> = ({
	pendingToday,
	ongoingHabits,
	completedToday,
	isLoading,
	isError,
}) => {
	return (
		<Box
			{...holoGlassCard}
			p={{ base: 5, xl: 6 }}
			minH={{ base: "140px", xl: "155px" }}
			position="relative"
		>
			{isLoading ? (
				<Grid
					templateColumns={{
						base: "1fr",
						sm: "repeat(2, 1fr)",
						xl: "repeat(3, 1fr)",
					}}
					gap={{ base: 4, xl: 5 }}
					h="full"
					alignItems="center"
				>
					<Skeleton h="20" rounded="lg" />
					<Skeleton h="20" rounded="lg" />
					<Skeleton h="20" rounded="lg" />
				</Grid>
			) : isError ? (
				<Stack gap={2} h="full" justify="center">
					<Text fontSize="sm" color="red.fg" fontWeight="medium">
						Failed to load quests
					</Text>
					<Text fontSize="xs" color="fg.muted">
						Try refreshing the page
					</Text>
				</Stack>
			) : (
				<Grid
					templateColumns={{
						base: "1fr",
						sm: "repeat(2, 1fr)",
						xl: "repeat(3, 1fr)",
					}}
					gap={{ base: 4, xl: 5 }}
					h="full"
					alignItems="center"
				>
					{/* To do */}
					<Box
						position="relative"
						pr={{ xl: 4 }}
						borderRightWidth={{ xl: "1px" }}
						borderColor="border.glass"
					>
						<Text
							fontSize="sm"
							fontWeight="semibold"
							color="fg.muted"
						>
							To do
						</Text>
						<HStack align="baseline" gap={2} mt={4}>
							<Text
								fontSize={{
									base: "2.4rem",
									xl: "2.8rem",
								}}
								fontWeight="bold"
								letterSpacing="-0.04em"
								lineHeight="1"
							>
								{pendingToday}
							</Text>
							<Text
								fontSize="sm"
								color="fg.muted"
								fontWeight="medium"
							>
								tasks
							</Text>
						</HStack>
					</Box>

					{/* On going */}
					<Box
						position="relative"
						pr={{ xl: 4 }}
						borderRightWidth={{ xl: "1px" }}
						borderColor="border.glass"
					>
						<Text
							fontSize="sm"
							fontWeight="semibold"
							color="fg.muted"
						>
							On going
						</Text>
						<Circle
							size="8"
							bg="bg.solid"
							color="fg.inverted"
							position="absolute"
							top={0}
							right={2}
							shadow="glass"
							transition="all 0.15s ease-out"
							_hover={{
								transform: "scale(1.1)",
							}}
						>
							<Icon as={LuArrowUpRight} boxSize={4} />
						</Circle>
						<HStack align="baseline" gap={2} mt={4}>
							<Text
								fontSize={{
									base: "2.4rem",
									xl: "2.8rem",
								}}
								fontWeight="bold"
								letterSpacing="-0.04em"
								lineHeight="1"
							>
								{ongoingHabits}
							</Text>
							<Text
								fontSize="sm"
								color="fg.muted"
								fontWeight="medium"
							>
								tasks
							</Text>
						</HStack>
					</Box>

					{/* Complete */}
					<Box
						position="relative"
						pr={{ xl: 4 }}
						borderRightWidth={{ xl: "1px" }}
						borderColor="border.glass"
					>
						<Text
							fontSize="sm"
							fontWeight="semibold"
							color="fg.muted"
						>
							Complete
						</Text>
						<HStack
							bg={{
								base: "rgba(255, 255, 255, 0.85)",
								_dark: "rgba(25, 30, 45, 0.85)",
							}}
							backdropFilter="blur(24px) saturate(180%)"
							borderWidth="1px"
							borderColor={{
								base: "rgba(255, 255, 255, 0.95)",
								_dark: "rgba(255, 255, 255, 0.18)",
							}}
							rounded="pill"
							px={4}
							py={2}
							justify="space-between"
							mt={3}
							w="fit-content"
							gap={3}
							cursor="pointer"
							transition="all 0.15s ease-out"
							_hover={{
								transform: "translateY(-1px)",
								shadow: "float",
							}}
						>
							<HStack align="baseline" gap={2}>
								<Text
									fontSize="2rem"
									fontWeight="bold"
									letterSpacing="-0.04em"
									lineHeight="1"
								>
									{String(completedToday).padStart(2, "0")}
								</Text>
								<Text
									fontSize="xs"
									color="fg.muted"
									fontWeight="medium"
								>
									tasks
								</Text>
							</HStack>
							<Circle size="6" bg="bg.muted" color="fg">
								<Icon as={LuArrowUpRight} boxSize={3} />
							</Circle>
						</HStack>
					</Box>
				</Grid>
			)}
		</Box>
	);
};
