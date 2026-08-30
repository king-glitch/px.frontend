import React from "react";
import {
	Badge,
	Box,
	HStack,
	Heading,
	Icon,
	SimpleGrid,
	Stack,
	Text,
} from "@chakra-ui/react";
import {
	LuActivity,
	LuCoins,
	LuFlame,
	LuShield,
	LuShoppingBag,
	LuTarget,
	LuTrendingUp,
	LuZap,
} from "react-icons/lu";
import type { PerkID } from "@/api";
import { glassCard } from "./perks-data";
import { useTranslation } from "@/lib/i18n";

interface HeroMultipliersGridProps {
	perks: Array<{ perk_id: PerkID; rank: number }>;
	totalAttributesSum: number;
}

export const HeroMultipliersGrid: React.FC<HeroMultipliersGridProps> = ({
	perks,
	totalAttributesSum,
}) => {
	const { t } = useTranslation();
	const diligenceRank =
		perks.find((p) => p.perk_id === "diligence")?.rank ?? 0;
	const merchantRank = perks.find((p) => p.perk_id === "merchant")?.rank ?? 0;
	const vitalityRank = perks.find((p) => p.perk_id === "vitality")?.rank ?? 0;
	const resolveRank = perks.find((p) => p.perk_id === "resolve")?.rank ?? 0;
	const ledgerRank = perks.find((p) => p.perk_id === "ledger")?.rank ?? 0;
	const deepFocusRank =
		perks.find((p) => p.perk_id === "deep_focus")?.rank ?? 0;
	const bargainRank = perks.find((p) => p.perk_id === "bargain")?.rank ?? 0;
	const secondWindRank =
		perks.find((p) => p.perk_id === "second_wind")?.rank ?? 0;

	const totalInvestedPoints = perks.reduce((acc, p) => acc + p.rank, 0);

	return (
		<Stack gap={3}>
			<HStack justify="space-between" wrap="wrap" gap={2}>
				<Stack gap={0.5}>
					<Heading size="md">
						{t("routes.heroes.multipliers.title")}
					</Heading>
					<Text fontSize="xs" color="fg.muted">
						{t("routes.heroes.multipliers.subtitle")}
					</Text>
				</Stack>
				<HStack gap={2}>
					<Badge size="sm" rounded="pill" variant="subtle">
						{t("routes.heroes.multipliers.pointsInvested", {
							count: totalInvestedPoints,
						})}
					</Badge>
					<Badge
						size="sm"
						rounded="pill"
						variant="surface"
						colorPalette="mint"
					>
						{t("routes.heroes.multipliers.totalAttributes", {
							count: totalAttributesSum,
						})}
					</Badge>
				</HStack>
			</HStack>

			<SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 4 }} gap={2.5}>
				<Box {...glassCard} p={3} bg="bg.panel">
					<HStack justify="space-between" color="fg.muted" mb={1}>
						<Text
							fontSize="10px"
							fontWeight="semibold"
							textTransform="uppercase"
						>
							{t("routes.heroes.multipliers.questExp.label")}
						</Text>
						<Icon as={LuZap} boxSize={3.5} color="mint.fg" />
					</HStack>
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={diligenceRank > 0 ? "mint.fg" : "fg"}
					>
						+{diligenceRank * 5}%
					</Text>
					<Text fontSize="10px" color="fg.muted">
						{diligenceRank > 0
							? t("routes.heroes.multipliers.questExp.note", {
									percent: diligenceRank * 5,
								})
							: t("routes.heroes.multipliers.rankZeroBase")}
					</Text>
				</Box>

				<Box {...glassCard} p={3} bg="bg.panel">
					<HStack justify="space-between" color="fg.muted" mb={1}>
						<Text
							fontSize="10px"
							fontWeight="semibold"
							textTransform="uppercase"
						>
							{t("routes.heroes.multipliers.pxYield.label")}
						</Text>
						<Icon as={LuCoins} boxSize={3.5} color="mint.fg" />
					</HStack>
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={merchantRank > 0 ? "mint.fg" : "fg"}
					>
						+{merchantRank * 5}%
					</Text>
					<Text fontSize="10px" color="fg.muted">
						{merchantRank > 0
							? t("routes.heroes.multipliers.pxYield.note", {
									percent: merchantRank * 5,
								})
							: t("routes.heroes.multipliers.rankZeroBase")}
					</Text>
				</Box>

				<Box {...glassCard} p={3} bg="bg.panel">
					<HStack justify="space-between" color="fg.muted" mb={1}>
						<Text
							fontSize="10px"
							fontWeight="semibold"
							textTransform="uppercase"
						>
							{t("routes.heroes.multipliers.deepFocus.label")}
						</Text>
						<Icon as={LuTarget} boxSize={3.5} color="mint.fg" />
					</HStack>
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={deepFocusRank > 0 ? "mint.fg" : "fg"}
					>
						+{deepFocusRank * 20}%
					</Text>
					<Text fontSize="10px" color="fg.muted">
						{deepFocusRank > 0
							? t("routes.heroes.multipliers.deepFocus.note", {
									percent: deepFocusRank * 20,
								})
							: t("routes.heroes.multipliers.rankZeroBase")}
					</Text>
				</Box>

				<Box {...glassCard} p={3} bg="bg.panel">
					<HStack justify="space-between" color="fg.muted" mb={1}>
						<Text
							fontSize="10px"
							fontWeight="semibold"
							textTransform="uppercase"
						>
							Health Award
						</Text>
						<Icon as={LuActivity} boxSize={3.5} color="mint.fg" />
					</HStack>
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={vitalityRank > 0 ? "mint.fg" : "fg"}
					>
						+{vitalityRank * 10}%
					</Text>
					<Text fontSize="10px" color="fg.muted">
						{vitalityRank > 0
							? `+${vitalityRank * 10}% daily health`
							: "Rank 0 (Base 1.0x)"}
					</Text>
				</Box>

				<Box {...glassCard} p={3} bg="bg.panel">
					<HStack justify="space-between" color="fg.muted" mb={1}>
						<Text
							fontSize="10px"
							fontWeight="semibold"
							textTransform="uppercase"
						>
							Streak Bonus
						</Text>
						<Icon as={LuFlame} boxSize={3.5} color="mint.fg" />
					</HStack>
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={resolveRank > 0 ? "mint.fg" : "fg"}
					>
						+{resolveRank * 15}%
					</Text>
					<Text fontSize="10px" color="fg.muted">
						{resolveRank > 0
							? `+${resolveRank * 15}% streak boost`
							: "Rank 0 (Base 1.0x)"}
					</Text>
				</Box>

				<Box {...glassCard} p={3} bg="bg.panel">
					<HStack justify="space-between" color="fg.muted" mb={1}>
						<Text
							fontSize="10px"
							fontWeight="semibold"
							textTransform="uppercase"
						>
							Finance EXP
						</Text>
						<Icon as={LuTrendingUp} boxSize={3.5} color="mint.fg" />
					</HStack>
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={ledgerRank > 0 ? "mint.fg" : "fg"}
					>
						+{ledgerRank * 10}%
					</Text>
					<Text fontSize="10px" color="fg.muted">
						{ledgerRank > 0
							? `+${ledgerRank * 10}% monthly exp`
							: "Rank 0 (Base 1.0x)"}
					</Text>
				</Box>

				<Box {...glassCard} p={3} bg="bg.panel">
					<HStack justify="space-between" color="fg.muted" mb={1}>
						<Text
							fontSize="10px"
							fontWeight="semibold"
							textTransform="uppercase"
						>
							Shop Discount
						</Text>
						<Icon
							as={LuShoppingBag}
							boxSize={3.5}
							color="mint.fg"
						/>
					</HStack>
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={bargainRank > 0 ? "mint.fg" : "fg"}
					>
						-{bargainRank * 5}%
					</Text>
					<Text fontSize="10px" color="fg.muted">
						{bargainRank > 0
							? `-${bargainRank * 5}% shop price`
							: "Rank 0 (Full price)"}
					</Text>
				</Box>

				<Box {...glassCard} p={3} bg="bg.panel">
					<HStack justify="space-between" color="fg.muted" mb={1}>
						<Text
							fontSize="10px"
							fontWeight="semibold"
							textTransform="uppercase"
						>
							Second Wind
						</Text>
						<Icon as={LuShield} boxSize={3.5} color="mint.fg" />
					</HStack>
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={secondWindRank > 0 ? "mint.fg" : "fg.muted"}
					>
						{secondWindRank > 0 ? "Active" : "Inactive"}
					</Text>
					<Text fontSize="10px" color="fg.muted">
						{secondWindRank > 0
							? "Streak auto-shield (14d)"
							: "Rank 0 (0/1)"}
					</Text>
				</Box>
			</SimpleGrid>
		</Stack>
	);
};
