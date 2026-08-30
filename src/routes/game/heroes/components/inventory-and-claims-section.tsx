import React from "react";
import {
	Box,
	Grid,
	HStack,
	Icon,
	Skeleton,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuClipboardList, LuPackage } from "react-icons/lu";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import {
	useInventory,
	useClaims,
	useShopCatalog,
	useUseInventoryItem,
	useUpdateAvatar,
	useRedeemClaim,
	type Buff,
	type Avatar,
	type Player,
} from "@/api";
import { glassCard } from "./perks-data";
import { ActiveBuffsMatrix } from "./active-buffs-matrix";
import { InventoryCard } from "./inventory-card";
import { ClaimCard } from "./claim-card";
import { useTranslation } from "@/lib/i18n";

interface InventoryAndClaimsSectionProps {
	player: Player;
	activeBuffs: Buff[];
	avatar?: Avatar;
}

export const InventoryAndClaimsSection: React.FC<
	InventoryAndClaimsSectionProps
> = ({ activeBuffs, avatar }) => {
	const { t } = useTranslation();
	const { data: inventory, isLoading: invLoading } = useInventory();
	const { data: claims, isLoading: claimsLoading } = useClaims();
	const { data: allCatalog } = useShopCatalog();
	const useItem = useUseInventoryItem();
	const updateAvatar = useUpdateAvatar();
	const redeemClaim = useRedeemClaim();

	const confirmUseItem = useConfirm<string>();
	const confirmRedeem = useConfirm<string>();

	const handleUseItemConfirm = async () => {
		if (!confirmUseItem.target) return;
		try {
			await useItem.mutateAsync(confirmUseItem.target);
			toaster.create({
				title: t("routes.heroes.inventory.toasts.itemUsed"),
				type: "success",
			});
			confirmUseItem.close();
		} catch (err) {
			toaster.create({
				title: t("routes.heroes.inventory.toasts.failedUse"),
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	const handleToggleEquip = async (shopItemId: string, slotType: string) => {
		const isEquipped = avatar?.equipped?.[slotType] === shopItemId;
		const equipped = { ...(avatar?.equipped ?? {}) };
		if (isEquipped) {
			delete equipped[slotType];
		} else {
			equipped[slotType] = shopItemId;
		}

		try {
			await updateAvatar.mutateAsync(equipped);
			toaster.create({
				title: isEquipped
					? t("routes.heroes.inventory.toasts.itemUnequipped")
					: t("routes.heroes.inventory.toasts.itemEquipped"),
				type: "success",
			});
		} catch (err) {
			toaster.create({
				title: t("routes.heroes.inventory.toasts.failedEquip"),
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	const handleRedeemConfirm = async () => {
		if (!confirmRedeem.target) return;
		try {
			await redeemClaim.mutateAsync(confirmRedeem.target);
			toaster.create({
				title: t("routes.heroes.inventory.toasts.claimRedeemed"),
				description: t(
					"routes.heroes.inventory.toasts.claimRedeemedDesc",
				),
				type: "success",
			});
			confirmRedeem.close();
		} catch (err) {
			toaster.create({
				title: t("routes.heroes.inventory.toasts.failedRedeem"),
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	return (
		<Stack gap={6}>
			{/* Active Buffs Matrix with Live Countdowns */}
			<ActiveBuffsMatrix activeBuffs={activeBuffs} />

			{/* Bag Inventory */}
			<Box {...glassCard} p={5}>
				<HStack justify="space-between" mb={3}>
					<Stack gap={0.5}>
						<Text fontSize="md" fontWeight="bold">
							{t("routes.heroes.inventory.bag.title")}
						</Text>
						<Text fontSize="xs" color="fg.muted">
							{t("routes.heroes.inventory.bag.subtitle")}
						</Text>
					</Stack>
					<Icon as={LuPackage} boxSize={4} color="fg.muted" />
				</HStack>

				{invLoading ? (
					<Grid
						gap={3}
						templateColumns={{
							base: "1fr",
							sm: "repeat(2, 1fr)",
							lg: "repeat(3, 1fr)",
						}}
					>
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} h="120px" rounded="card" />
						))}
					</Grid>
				) : !inventory || inventory.length === 0 ? (
					<EmptyState
						title={t("routes.heroes.inventory.bag.emptyTitle")}
						description={t("routes.heroes.inventory.bag.emptyDesc")}
						icon={<Icon as={LuPackage} boxSize={6} />}
					/>
				) : (
					<Grid
						gap={3}
						templateColumns={{
							base: "1fr",
							sm: "repeat(2, 1fr)",
							lg: "repeat(3, 1fr)",
						}}
					>
						{inventory.map((inv) => {
							const shopItem = allCatalog?.find(
								(c) => c.id === inv.shop_item_id,
							);
							return (
								<InventoryCard
									key={inv.id}
									item={inv}
									shopItem={shopItem}
									avatar={avatar}
									onUse={() =>
										shopItem?.kind === "cosmetic"
											? handleToggleEquip(
													inv.shop_item_id,
													shopItem.slot?.split(
														":",
													)[0] || "accessory",
												)
											: confirmUseItem.ask(inv.id)
									}
								/>
							);
						})}
					</Grid>
				)}
			</Box>

			{/* Real-World Reward Claims History */}
			<Box {...glassCard} p={5}>
				<HStack justify="space-between" mb={3}>
					<Stack gap={0.5}>
						<Text fontSize="md" fontWeight="bold">
							{t("routes.heroes.inventory.claims.title")}
						</Text>
						<Text fontSize="xs" color="fg.muted">
							{t("routes.heroes.inventory.claims.subtitle")}
						</Text>
					</Stack>
					<Icon as={LuClipboardList} boxSize={4} color="fg.muted" />
				</HStack>

				{claimsLoading ? (
					<Grid
						gap={3}
						templateColumns={{
							base: "1fr",
							sm: "repeat(2, 1fr)",
							lg: "repeat(3, 1fr)",
						}}
					>
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} h="120px" rounded="card" />
						))}
					</Grid>
				) : !claims || claims.length === 0 ? (
					<EmptyState
						title={t("routes.heroes.inventory.claims.emptyTitle")}
						description={t(
							"routes.heroes.inventory.claims.emptyDesc",
						)}
						icon={<Icon as={LuClipboardList} boxSize={6} />}
					/>
				) : (
					<Grid
						gap={3}
						templateColumns={{
							base: "1fr",
							sm: "repeat(2, 1fr)",
							lg: "repeat(3, 1fr)",
						}}
					>
						{claims.map((claim) => (
							<ClaimCard
								key={claim.id}
								claim={claim}
								onRedeem={(id) => confirmRedeem.ask(id)}
							/>
						))}
					</Grid>
				)}
			</Box>

			{/* Confirm Use Item Dialog */}
			<ConfirmDialog
				open={confirmUseItem.open}
				onOpenChange={confirmUseItem.onOpenChange}
				title={t("routes.heroes.inventory.dialogs.useTitle")}
				description={t("routes.heroes.inventory.dialogs.useDesc")}
				confirmLabel={t("routes.heroes.inventory.dialogs.useConfirm")}
				loading={useItem.isPending}
				onConfirm={handleUseItemConfirm}
			/>

			{/* Confirm Redeem Claim Dialog */}
			<ConfirmDialog
				open={confirmRedeem.open}
				onOpenChange={confirmRedeem.onOpenChange}
				title={t("routes.heroes.inventory.dialogs.redeemTitle")}
				description={t("routes.heroes.inventory.dialogs.redeemDesc")}
				confirmLabel={t(
					"routes.heroes.inventory.dialogs.redeemConfirm",
				)}
				loading={redeemClaim.isPending}
				onConfirm={handleRedeemConfirm}
			/>
		</Stack>
	);
};

export default InventoryAndClaimsSection;
