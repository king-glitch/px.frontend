import React from "react";
import { Grid, Stack } from "@chakra-ui/react";
import type { AvatarSlot } from "@/components/game";
import type { Buff, PerkID, Player } from "@/api";
import { HeroProgressionCard } from "./hero-progression-card";
import { StreakBadgesCard } from "./streak-badges-card";
import { AttributeRadarCard } from "./attribute-radar-card";
import { HeroMultipliersGrid } from "./hero-multipliers-grid";
import { CategoryMasteryCard } from "./category-mastery-card";
import { TalentPerkTree } from "./talent-perk-tree";

interface HeroOverviewSectionProps {
	player: Player;
	expToNext: number;
	attributes: Record<string, number>;
	activeBuffs: Buff[];
	perks: Array<{ perk_id: PerkID; rank: number }>;
	equippedCosmetics: Partial<Record<AvatarSlot, string>>;
	pendingPerk: string | null;
	onOpenAscend: () => void;
	onOpenWardrobe: () => void;
	onSelectPerkToUpgrade: (perkId: PerkID) => void;
}

export const HeroOverviewSection: React.FC<HeroOverviewSectionProps> = ({
	player,
	expToNext,
	attributes,
	activeBuffs,
	perks,
	equippedCosmetics,
	pendingPerk,
	onOpenAscend,
	onOpenWardrobe,
	onSelectPerkToUpgrade,
}) => {
	const maxAttribute = Math.max(...Object.values(attributes), 10);
	const totalAttributesSum = Object.values(attributes).reduce(
		(a, b) => a + b,
		0,
	);
	const secondWindRank =
		perks.find((p) => p.perk_id === "second_wind")?.rank ?? 0;

	return (
		<Stack gap={6}>
			{/* Focal Avatar + Level & Attribute Radar */}
			<Grid
				gap={5}
				templateColumns={{
					base: "1fr",
					md: "320px 1fr",
				}}
				alignItems="stretch"
			>
				{/* Left Column: Hero Progression + Streak & Badges */}
				<Stack gap={4} justify="space-between">
					<HeroProgressionCard
						player={player}
						expToNext={expToNext}
						equippedCosmetics={equippedCosmetics}
						onOpenAscend={onOpenAscend}
						onOpenWardrobe={onOpenWardrobe}
					/>

					<StreakBadgesCard
						player={player}
						activeBuffs={activeBuffs}
						secondWindRank={secondWindRank}
					/>
				</Stack>

				{/* Attribute Radar Card */}
				<AttributeRadarCard
					attributes={attributes}
					maxAttribute={maxAttribute}
				/>
			</Grid>

			{/* Active Hero Multipliers */}
			<HeroMultipliersGrid
				perks={perks}
				totalAttributesSum={totalAttributesSum}
			/>

			{/* Category Mastery Progression */}
			<CategoryMasteryCard />

			{/* Perk Tree */}
			<TalentPerkTree
				player={player}
				perks={perks}
				pendingPerk={pendingPerk}
				onSelectPerkToUpgrade={onSelectPerkToUpgrade}
			/>
		</Stack>
	);
};
