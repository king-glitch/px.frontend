import React from "react";
import {
	Box,
	Circle,
	Flex,
	HStack,
	Heading,
	Skeleton,
	Stack,
	Text,
} from "@chakra-ui/react";
import type { TodayQuest } from "@/api/types";
import { OutlinePill, holoGlassCard } from "./holo-card";

interface HabitsCardProps {
	todayQuests: TodayQuest[];
	isLoading: boolean;
	isError: boolean;
	todayLabel: string;
}

export const HabitsCard: React.FC<HabitsCardProps> = ({
	todayQuests,
	isLoading,
	isError,
	todayLabel,
}) => {
	return (
		<Box {...holoGlassCard} p={{ base: 6, xl: 7 }}>
			<Heading fontSize="xl" fontWeight="normal" letterSpacing="-0.03em">
				Habit <OutlinePill>tracker</OutlinePill>
			</Heading>
			<Text fontSize="sm" color="fg.muted" mt={1}>
				Today, {todayLabel}
			</Text>

			{isLoading ? (
				<Stack gap={2} mt={4}>
					<Skeleton h="12" rounded="lg" />
					<Skeleton h="12" rounded="lg" />
					<Skeleton h="12" rounded="lg" />
				</Stack>
			) : isError ? (
				<Stack gap={2} mt={4}>
					<Text fontSize="sm" color="red.fg" fontWeight="medium">
						Failed to load today's quests
					</Text>
					<Text fontSize="xs" color="fg.muted">
						Try refreshing the page
					</Text>
				</Stack>
			) : (
				<Flex wrap="wrap" gap={2.5} mt={4}>
					{todayQuests.length === 0 ? (
						<HStack
							flex="1 1 auto"
							bg={{
								base: "rgba(255, 255, 255, 0.8)",
								_dark: "rgba(25, 30, 45, 0.8)",
							}}
							borderWidth="1px"
							borderColor={{
								base: "rgba(255, 255, 255, 0.9)",
								_dark: "rgba(255, 255, 255, 0.12)",
							}}
							rounded="pill"
							px={4}
							py={2}
							gap={2.5}
						>
							<Circle size="2.5" bg="fg.muted" />
							<Text
								fontSize="sm"
								fontWeight="medium"
								whiteSpace="nowrap"
							>
								No quests scheduled today
							</Text>
						</HStack>
					) : (
						todayQuests.map((tq) => (
							<HStack
								key={tq.quest.id}
								flex="1 1 auto"
								bg={
									tq.completed
										? "bg.solid"
										: {
												base: "rgba(255, 255, 255, 0.8)",
												_dark: "rgba(25, 30, 45, 0.8)",
											}
								}
								color={tq.completed ? "fg.inverted" : "fg"}
								borderWidth={tq.completed ? "0" : "1px"}
								borderColor={{
									base: "rgba(255, 255, 255, 0.9)",
									_dark: "rgba(255, 255, 255, 0.12)",
								}}
								rounded="pill"
								px={4}
								py={2}
								gap={2.5}
								cursor="pointer"
								transition="all 0.15s ease-out"
								shadow={
									tq.completed
										? "none"
										: "0 2px 8px -2px rgba(15, 23, 42, 0.04)"
								}
								_hover={{
									transform: "translateY(-1px)",
									shadow: "glass",
								}}
							>
								<Circle
									size="2.5"
									bg={
										tq.completed ? "mint.solid" : "fg.muted"
									}
								/>
								<Text
									fontSize="sm"
									fontWeight="medium"
									whiteSpace="nowrap"
								>
									{tq.quest.title}
								</Text>
								<Text
									fontSize="10px"
									fontWeight="bold"
									opacity={0.65}
									whiteSpace="nowrap"
								>
									+
									{tq.completed
										? tq.exp_awarded
										: tq.quest.exp_value}{" "}
									EXP
								</Text>
							</HStack>
						))
					)}
				</Flex>
			)}
		</Box>
	);
};
