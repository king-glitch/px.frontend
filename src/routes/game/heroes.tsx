import React, { useMemo, useState } from "react";
import { useParams } from "react-router";
import { Box, Container, Grid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import {
	useAscendPlayer,
	usePlayerSummary,
	useShopCatalog,
	useSpendPerk,
	type PerkID,
} from "@/api";
import { useAuthContext } from "@/contexts/auth-context";
import { RewardFlight, type AvatarSlot } from "@/components/game";
import { LedgerModal } from "./heroes/components/ledger-modal";
import { WardrobeModal } from "./heroes/components/wardrobe-modal";
import { ShopSection } from "./heroes/components/shop-section";
import { InventoryAndClaimsSection } from "./heroes/components/inventory-and-claims-section";
import { HeroHeader } from "./heroes/components/hero-header";
import { HeroSidebar } from "./heroes/components/hero-sidebar";
import { HeroOverviewSection } from "./heroes/components/hero-overview-section";
import { AscendModal } from "./heroes/components/ascend-modal";
import { PERK_DEFS, glassCard } from "./heroes/components/perks-data";
import { useTranslation } from "@/lib/i18n";

export { PERK_COSMETIC_MAP } from "./heroes/components/perks-data";

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
				} else {
					res[slotType as AvatarSlot] = itemId;
				}
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

	const handleAscend = async () => {
		try {
			await ascend.mutateAsync();
			toaster.create({
				title: t("routes.heroes.main.ascend.success.title"),
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
			<Container maxW="7xl" py={{ base: 4, md: 8 }}>
				<Stack gap={6}>
					<Skeleton h="10" w="240px" rounded="xl" />
					<Grid
						gap={5}
						templateColumns={{ base: "1fr", lg: "240px 1fr" }}
					>
						<Skeleton h="300px" rounded="card" />
						<Skeleton h="500px" rounded="card" />
					</Grid>
				</Stack>
			</Container>
		);
	}

	if (isError || !summary) {
		return (
			<Container maxW="7xl" py={{ base: 4, md: 8 }}>
				<Box {...glassCard} p={8}>
					<Text color="fg.muted">
						{t("routes.heroes.main.load.error")}
					</Text>
				</Box>
			</Container>
		);
	}

	const { player, exp_to_next, attributes, active_buffs, perks } = summary;

	return (
		<Container maxW="7xl" py={{ base: 4, md: 6 }}>
			<RewardFlight />
			<Stack gap={6}>
				{/* Top Hero Command Header */}
				<HeroHeader
					player={player}
					onOpenLedger={() => setLedgerOpen(true)}
				/>

				{/* Sidebar Navigation & Active View Grid */}
				<Grid
					gap={6}
					templateColumns={{ base: "1fr", lg: "240px 1fr" }}
					alignItems="start"
				>
					{/* Sidebar Navigation */}
					<HeroSidebar
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
				</Grid>
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
		</Container>
	);
};

export default Heroes;
