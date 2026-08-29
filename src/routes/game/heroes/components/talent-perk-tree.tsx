import React from "react";
import {
	Badge,
	Box,
	Grid,
	HStack,
	Heading,
	Stack,
	Text,
} from "@chakra-ui/react";
import { PillButton } from "@/components/ui/pill-button";
import type { PerkID, Player } from "@/api";
import {
	PERK_DEFS,
	getPerkCurrentEffect,
	getPerkUpgradeGain,
	glassCard,
} from "./perks-data";

interface TalentPerkTreeProps {
	player: Player;
	perks: Array<{ perk_id: PerkID; rank: number }>;
	pendingPerk: string | null;
	onSelectPerkToUpgrade: (perkId: PerkID) => void;
}

export const TalentPerkTree: React.FC<TalentPerkTreeProps> = ({
	player,
	perks,
	pendingPerk,
	onSelectPerkToUpgrade,
}) => {
	return (
		<Stack gap={3}>
			<HStack justify="space-between">
				<Stack gap={0.5}>
					<Heading size="md">Talent Perk Tree</Heading>
					<Text fontSize="xs" color="fg.muted">
						Spend skill points earned from leveling up to activate
						permanent multipliers.
					</Text>
				</Stack>
				<Badge
					size="sm"
					rounded="pill"
					variant="surface"
					colorPalette={player.skill_points > 0 ? "mint" : "gray"}
				>
					{player.skill_points} Points Available
				</Badge>
			</HStack>

			<Box {...glassCard}>
				<Grid
					gap={3.5}
					templateColumns={{
						base: "1fr",
						sm: "repeat(2, 1fr)",
						lg: "repeat(4, 1fr)",
					}}
				>
					{PERK_DEFS.map((def) => {
						const owned = perks.find(
							(perk) => perk.perk_id === def.id,
						);
						const rank = owned?.rank ?? 0;
						const atMax = rank >= def.max;
						const disabled =
							atMax ||
							player.skill_points === 0 ||
							pendingPerk === def.id;

						return (
							<Box
								key={def.id}
								p={4}
								rounded="card"
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border.glass"
								transition="all 0.15s ease-out"
								_hover={{
									transform: "translateY(-1px)",
									shadow: "glass",
								}}
							>
								<Stack gap={3} h="full" justify="space-between">
									<Stack gap={2}>
										<HStack justify="space-between">
											<Text
												fontWeight="bold"
												fontSize="sm"
											>
												{def.label}
											</Text>
											<Badge
												size="xs"
												rounded="pill"
												variant={
													atMax ? "solid" : "subtle"
												}
												colorPalette={
													atMax ? "mint" : "gray"
												}
											>
												{rank}/{def.max}
											</Badge>
										</HStack>

										{/* Visual Rank Bar */}
										<Box
											h="1.5"
											rounded="pill"
											bg="bg.muted"
											overflow="hidden"
										>
											<Box
												h="full"
												w={`${(rank / def.max) * 100}%`}
												bg="mint.solid"
												rounded="pill"
											/>
										</Box>

										<Text
											fontSize="xs"
											color="fg.muted"
											lineHeight="tall"
										>
											{def.description}
										</Text>

										{/* Current vs Next Stats Breakdown */}
										<Stack
											gap={1}
											p={2}
											rounded="xl"
											bg="bg.muted"
											fontSize="11px"
										>
											<HStack justify="space-between">
												<Text color="fg.muted">
													Current:
												</Text>
												<Text
													fontWeight="bold"
													color={
														rank > 0
															? "mint.fg"
															: "fg.muted"
													}
												>
													{getPerkCurrentEffect(
														def.id,
														rank,
													)}
												</Text>
											</HStack>
											{!atMax && (
												<HStack justify="space-between">
													<Text color="fg.muted">
														Next rank:
													</Text>
													<Text
														fontWeight="semibold"
														color="fg"
													>
														{getPerkUpgradeGain(
															def.id,
														)}
													</Text>
												</HStack>
											)}
										</Stack>
									</Stack>

									<PillButton
										size="xs"
										variant={atMax ? "outline" : "dark"}
										w="full"
										disabled={disabled}
										loading={pendingPerk === def.id}
										onClick={() =>
											onSelectPerkToUpgrade(def.id)
										}
									>
										{atMax
											? "Max Rank"
											: player.skill_points === 0
												? "0 Skill Points"
												: `Upgrade (+${getPerkUpgradeGain(def.id)})`}
									</PillButton>
								</Stack>
							</Box>
						);
					})}
				</Grid>
			</Box>
		</Stack>
	);
};
