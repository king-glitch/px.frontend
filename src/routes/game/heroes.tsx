import React, { useMemo, useState } from "react";
import { useParams } from "react-router";
import { Box, Flex, Grid, HStack, Skeleton, Stack, Text, VStack } from "@chakra-ui/react";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import {
	useAscendPlayer,
	useAscendWithPath,
	usePlayerSummary,
	useShopCatalog,
	useSpendPerk,
	type AscensionPath,
	type PerkID,
} from "@/api";
import { useAuthContext } from "@/contexts/auth-context";
import { RewardFlight, type AvatarSlot } from "@/components/game";
import { LedgerModal } from "@/routes/game/heroes/components/ledger-modal";
import { WardrobeModal } from "@/routes/game/heroes/components/wardrobe-modal";
import { ShopSection } from "@/routes/game/heroes/components/shop-section";
import { InventoryAndClaimsSection } from "@/routes/game/heroes/components/inventory-and-claims-section";
import { HeroHeader } from "@/routes/game/heroes/components/hero-header";
import { HeroTopbar } from "@/routes/game/heroes/components/hero-sidebar";
import { HeroOverviewSection } from "@/routes/game/heroes/components/hero-overview-section";
import { AscendModal } from "@/routes/game/heroes/components/ascend-modal";
import {
	PERK_DEFS,
	glassCard,
} from "@/routes/game/heroes/components/perks-data";
import { useTranslation } from "@/lib/i18n";

export { PERK_COSMETIC_MAP } from "@/routes/game/heroes/components/perks-data";

type HeroSection = "overview" | "shop" | "inventory";

export const Heroes: React.FC = () => {
	const { t } = useTranslation();
	const { user } = useAuthContext();
	const { data: summary, isLoading, isError } = usePlayerSummary();
	const { section } = useParams<{ section?: string }>();
	const activeSection: HeroSection =
		section === "shop" || section === "inventory" ? section : "overview";

	const spendPerk = useSpendPerk();
	const ascend = useAscendPlayer();
	const { data: cosmetics } = useShopCatalog("cosmetic");
	const [pendingPerk, setPendingPerk] = useState<string | null>(null);
	const [ascendOpen, setAscendOpen] = useState(false);
	const [ledgerOpen, setLedgerOpen] = useState(false);
	const [wardrobeOpen, setWardrobeOpen] = useState(false);

	const confirmSpendPerk = useConfirm<PerkID>();

	const equippedCosmetics = useMemo(() => {
		const res: Partial<Record<AvatarSlot, string>> = {};
		if (summary?.avatar?.equipped) {
			for (const [slotType, itemId] of Object.entries(
				summary.avatar.equipped,
			)) {
				const item = cosmetics?.find((c) => c.id === itemId);
				if (item?.slot) {
					const parts = item.slot.split(":");
					const key = parts[0] as AvatarSlot;
					res[key] = parts[1] || parts[0];
				}
				// ponytail: omit unresolvable/deleted item IDs so SVG avatar rendering never receives raw MongoDB IDs
			}
		}
		return res;
	}, [summary?.avatar?.equipped, cosmetics]);

	const handleSpend = async (perkId: PerkID) => {
		setPendingPerk(perkId);
		try {
			await spendPerk.mutateAsync(perkId);
			toaster.create({
				title: t("routes.heroes.main.spend.success.title"),
				description: t("routes.heroes.main.spend.success.description", {
					perk: PERK_DEFS.find((p) => p.id === perkId)?.label ?? "",
				}),
				type: "success",
			});
			confirmSpendPerk.close();
		} catch (err) {
			toaster.create({
				title: t("routes.heroes.main.spend.failed.title"),
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		} finally {
			setPendingPerk(null);
		}
	};

	const ascendWithPath = useAscendWithPath();

	const handleAscend = async (path: AscensionPath) => {
		try {
			await ascendWithPath.mutateAsync(path);
			toaster.create({
				title: t("routes.heroes.main.ascend.success.title"),
				description: `Ascended on the path of the ${path.toUpperCase()}!`,
				type: "success",
			});
			setAscendOpen(false);
		} catch (err) {
			toaster.create({
				title: t("routes.heroes.main.ascend.failed.title"),
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	if (isLoading) {
		return (
			<Box flex="1" pb={12}>
				<Stack gap={6}>
					{/* Header Skeleton */}
					<Flex justify="space-between" align="center" wrap="wrap" gap={3}>
						<Stack gap={2}>
							<HStack gap={3}>
								<Skeleton h="32px" w="220px" rounded="md" />
								<Skeleton h="24px" w="60px" rounded="pill" />
							</HStack>
							<Skeleton h="14px" w="320px" rounded="md" />
						</Stack>
						<HStack gap={3}>
							<Skeleton h="36px" w="130px" rounded="pill" />
							<Skeleton h="36px" w="140px" rounded="card" />
						</HStack>
					</Flex>

					{/* Topbar Skeleton */}
					<Box {...glassCard} p={2.5}>
						<Flex justify="space-between" align="center">
							<HStack gap={2}>
								<Skeleton h="32px" w="90px" rounded="pill" />
								<Skeleton h="32px" w="110px" rounded="pill" />
								<Skeleton h="32px" w="130px" rounded="pill" />
							</HStack>
							<HStack gap={2} pr={2}>
								<Skeleton h="32px" w="32px" rounded="full" />
								<VStack align="flex-start" gap={1}>
									<Skeleton h="12px" w="60px" rounded="md" />
									<Skeleton h="10px" w="75px" rounded="md" />
								</VStack>
							</HStack>
						</Flex>
					</Box>

					{/* Section Matrix Skeleton */}
					<Grid templateColumns={{ base: "1fr", lg: "340px 1fr" }} gap={6}>
						<Skeleton h="380px" rounded="card" />
						<VStack gap={5} align="stretch">
							<Skeleton h="180px" rounded="card" />
							<Skeleton h="220px" rounded="card" />
						</VStack>
					</Grid>
				</Stack>
			</Box>
		);
	}

	if (isError || !summary) {
		return (
			<Box flex="1" pb={12}>
				<Text color="red.400">
					{t("routes.heroes.failedToLoad")}
				</Text>
			</Box>
		);
	}

	const { player, exp_to_next, attributes, active_buffs, perks } = summary;

	return (
		<Box flex="1" pb={12}>
			<RewardFlight />
			<Stack gap={6}>
				{/* Top Hero Command Header */}
				<HeroHeader
					player={player}
					onOpenLedger={() => setLedgerOpen(true)}
				/>

				{/* Horizontal Topbar Navigation */}
				<HeroTopbar
					activeSection={activeSection}
					player={player}
					username={user?.username}
					equippedCosmetics={equippedCosmetics}
				/>

				{/* Main Content Area */}
				<Box minW={0}>
					{activeSection === "overview" && (
						<HeroOverviewSection
							player={player}
							expToNext={exp_to_next}
							attributes={attributes}
							activeBuffs={active_buffs}
							perks={perks}
							equippedCosmetics={equippedCosmetics}
							pendingPerk={pendingPerk}
							onOpenAscend={() => setAscendOpen(true)}
							onOpenWardrobe={() => setWardrobeOpen(true)}
							onSelectPerkToUpgrade={(perkId) =>
								confirmSpendPerk.ask(perkId)
							}
						/>
					)}

					{activeSection === "shop" && (
						<ShopSection player={player} />
					)}

					{activeSection === "inventory" && (
						<InventoryAndClaimsSection
							player={player}
							activeBuffs={active_buffs}
							avatar={summary.avatar}
						/>
					)}
				</Box>
			</Stack>

			{/* Ledger History Modal */}
			<LedgerModal open={ledgerOpen} onOpenChange={setLedgerOpen} />

			{/* Wardrobe & Perk Customization Modal */}
			<WardrobeModal
				open={wardrobeOpen}
				onOpenChange={setWardrobeOpen}
				player={player}
				summary={summary}
				cosmetics={cosmetics}
				equipped={equippedCosmetics}
			/>

			{/* Confirm Spend Perk Dialog */}
			<ConfirmDialog
				open={confirmSpendPerk.open}
				onOpenChange={confirmSpendPerk.onOpenChange}
				title={t("routes.heroes.main.upgrade.dialog.title")}
				description={t(
					"routes.heroes.main.upgrade.dialog.description",
					{
						perk:
							PERK_DEFS.find(
								(p) => p.id === confirmSpendPerk.target,
							)?.label ?? "",
					},
				)}
				confirmLabel={t("routes.heroes.main.upgrade.dialog.confirm")}
				loading={spendPerk.isPending}
				onConfirm={() =>
					confirmSpendPerk.target &&
					handleSpend(confirmSpendPerk.target)
				}
			/>

			{/* Ascend Modal */}
			<AscendModal
				open={ascendOpen}
				onOpenChange={setAscendOpen}
				loading={ascend.isPending}
				onAscend={handleAscend}
			/>
		</Box>
	);
};

export default Heroes;
