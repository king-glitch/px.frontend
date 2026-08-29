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
	useRedeemClaim,
	type Buff,
	type Avatar,
	type Player,
} from "@/api";
import { glassCard } from "./perks-data";
import { ActiveBuffsMatrix } from "./active-buffs-matrix";
import { InventoryCard } from "./inventory-card";
import { ClaimCard } from "./claim-card";

interface InventoryAndClaimsSectionProps {
	player: Player;
	activeBuffs: Buff[];
	avatar?: Avatar;
}

export const InventoryAndClaimsSection: React.FC<
	InventoryAndClaimsSectionProps
> = ({ activeBuffs, avatar }) => {
	const { data: inventory, isLoading: invLoading } = useInventory();
	const { data: claims, isLoading: claimsLoading } = useClaims();
	const { data: allCatalog } = useShopCatalog();
	const useItem = useUseInventoryItem();
	const redeemClaim = useRedeemClaim();

	const confirmUseItem = useConfirm<string>();
	const confirmRedeem = useConfirm<string>();

	const handleUseItemConfirm = async () => {
		if (!confirmUseItem.target) return;
		try {
			await useItem.mutateAsync(confirmUseItem.target);
			toaster.create({
				title: "Item Used!",
				type: "success",
			});
			confirmUseItem.close();
		} catch (err) {
			toaster.create({
				title: "Failed to use item",
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
				title: "Reward Claim Redeemed!",
				description: "Enjoy your real-world reward!",
				type: "success",
			});
			confirmRedeem.close();
		} catch (err) {
			toaster.create({
				title: "Failed to redeem claim",
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
							Inventory Bag
						</Text>
						<Text fontSize="xs" color="fg.muted">
							Manage and use consumables or equip cyber avatar
							cosmetics.
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
						title="Your bag is empty"
						description="Purchase consumables like Streak Shields or cosmetics from the Shop."
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
									onUse={(id) => confirmUseItem.ask(id)}
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
							Real-World Reward Claims
						</Text>
						<Text fontSize="xs" color="fg.muted">
							Track real-world rewards purchased with PX points.
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
						title="No reward claims yet"
						description="When you buy real-life rewards from the shop, they appear here."
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
				title="Use Consumable Item"
				description="Are you sure you want to consume this item? Its effects or buffs will activate immediately."
				confirmLabel="Use Item"
				loading={useItem.isPending}
				onConfirm={handleUseItemConfirm}
			/>

			{/* Confirm Redeem Claim Dialog */}
			<ConfirmDialog
				open={confirmRedeem.open}
				onOpenChange={confirmRedeem.onOpenChange}
				title="Mark Claim as Redeemed"
				description="Have you fulfilled/enjoyed this real-world reward in your life?"
				confirmLabel="Mark as Redeemed"
				loading={redeemClaim.isPending}
				onConfirm={handleRedeemConfirm}
			/>
		</Stack>
	);
};

export default InventoryAndClaimsSection;
