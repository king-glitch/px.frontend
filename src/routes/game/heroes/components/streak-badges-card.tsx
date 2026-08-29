import React from "react";
import { Badge, Box, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { LuFlame, LuShieldCheck } from "react-icons/lu";
import { StreakFlame } from "@/components/game";
import type { Buff, Player } from "@/api";
import { BUFF_LABEL, glassCard } from "./perks-data";

interface StreakBadgesCardProps {
	player: Player;
	activeBuffs: Buff[];
	secondWindRank: number;
}

export const StreakBadgesCard: React.FC<StreakBadgesCardProps> = ({
	player,
	activeBuffs,
	secondWindRank,
}) => {
	return (
		<Box {...glassCard} p={4.5}>
			<Stack gap={3}>
				<HStack justify="space-between" align="center">
					<HStack gap={2}>
						<Icon as={LuFlame} boxSize={4} color="mint.fg" />
						<Text
							fontSize="xs"
							fontWeight="semibold"
							textTransform="uppercase"
							letterSpacing="0.05em"
						>
							Streak & Badges
						</Text>
					</HStack>
					<Badge size="xs" rounded="pill" variant="subtle">
						Best: {player.longest_streak}d
					</Badge>
				</HStack>

				<HStack
					justify="space-between"
					align="center"
					bg="bg.panel"
					p={2.5}
					rounded="card"
					borderWidth="1px"
					borderColor="border.glass"
				>
					<HStack gap={2.5}>
						<StreakFlame days={player.streak} size={24} />
						<Stack gap={0}>
							<Text fontSize="sm" fontWeight="bold">
								{player.streak}{" "}
								{player.streak === 1 ? "Day" : "Days"}
							</Text>
							<Text fontSize="10px" color="fg.muted">
								Active Streak
							</Text>
						</Stack>
					</HStack>
					{secondWindRank > 0 && (
						<Badge
							size="xs"
							rounded="pill"
							variant="surface"
							colorPalette="mint"
						>
							Shielded
						</Badge>
					)}
				</HStack>

				{activeBuffs.length > 0 ? (
					<HStack gap={1.5} wrap="wrap">
						{activeBuffs.map((buff) => (
							<Badge
								key={buff.kind}
								size="xs"
								rounded="pill"
								variant="subtle"
							>
								{BUFF_LABEL[buff.kind] || buff.kind}
							</Badge>
						))}
					</HStack>
				) : (
					<HStack gap={2} color="fg.muted" fontSize="xs">
						<Icon as={LuShieldCheck} boxSize={3.5} />
						<Text fontSize="11px">
							{secondWindRank > 0
								? "Second Wind talent active"
								: "No active consumable buffs"}
						</Text>
					</HStack>
				)}
			</Stack>
		</Box>
	);
};
