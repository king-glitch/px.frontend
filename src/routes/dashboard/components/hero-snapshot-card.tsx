import React from "react";
import { Box, Flex, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import { ExpBar, HeroAvatar, LevelRing, StreakFlame } from "@/components/game";
import type { PlayerSummary } from "@/api/types";
import { holoGlassCard } from "./holo-card";

interface HeroSnapshotCardProps {
	summary?: PlayerSummary;
	isLoading: boolean;
	isError: boolean;
}

export const HeroSnapshotCard: React.FC<HeroSnapshotCardProps> = ({
	summary,
	isLoading,
	isError,
}) => {
	const player = summary?.player;

	return (
		<Box {...holoGlassCard} p={{ base: 5, xl: 6 }}>
			{isLoading ? (
				<Stack gap={3}>
					<Skeleton h="12" rounded="lg" w="70%" />
					<Skeleton h="8" rounded="lg" w="60%" />
					<Skeleton h="4" rounded="full" w="100%" mt={2} />
				</Stack>
			) : isError ? (
				<Stack gap={2}>
					<Text fontSize="sm" color="red.fg" fontWeight="medium">
						Failed to load player data
					</Text>
					<Text fontSize="xs" color="fg.muted">
						Try refreshing the page
					</Text>
				</Stack>
			) : (
				<>
					<HStack justify="space-between" align="flex-start">
						<HStack gap={3.5}>
							<Box position="relative" boxSize="60px">
								<Box position="absolute" inset={0}>
									<LevelRing
										level={player?.level ?? 1}
										progress={
											player && summary
												? player.exp_into_level /
													Math.max(
														1,
														summary.exp_to_next,
													)
												: 0
										}
										size={60}
									/>
								</Box>
								<Flex
									position="absolute"
									inset={0}
									align="center"
									justify="center"
								>
									<HeroAvatar
										seed={player?.user_id ?? "hero"}
										size={40}
										animated
									/>
								</Flex>
							</Box>
							<Stack gap={0.5}>
								<Text
									fontSize="xs"
									fontWeight="bold"
									textTransform="uppercase"
									letterSpacing="0.06em"
									color="fg.muted"
								>
									{player?.ascensions
										? `${player.ascensions} ascension${player.ascensions === 1 ? "" : "s"}`
										: "Hero"}
								</Text>
								<Text
									fontSize="lg"
									fontWeight="bold"
									letterSpacing="-0.02em"
									lineHeight="1"
								>
									{(player?.px ?? 0).toLocaleString()} PX
								</Text>
							</Stack>
						</HStack>
						<StreakFlame days={player?.streak ?? 0} size={18} />
					</HStack>

					<Box mt={4}>
						<ExpBar
							level={player?.level ?? 1}
							expIntoLevel={player?.exp_into_level ?? 0}
							expToNext={summary?.exp_to_next ?? 1}
						/>
					</Box>
				</>
			)}
		</Box>
	);
};
