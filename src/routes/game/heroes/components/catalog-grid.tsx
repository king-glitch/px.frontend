import React from "react";
import {
	Box,
	Grid,
	HStack,
	Icon,
	Skeleton,
	Stack,
	Text,
	Badge,
} from "@chakra-ui/react";
import { LuPackage, LuClock, LuTrash2 } from "react-icons/lu";
import { EmptyState } from "@/components/ui/empty-state";
import { PillButton } from "@/components/ui/pill-button";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import {
	useShopCatalog,
	usePurchaseItem,
	useDeleteShopItem,
	type ShopItemKind,
	type ShopItem,
	type Player,
} from "@/api";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

interface CatalogGridProps {
	kind: ShopItemKind;
	player: Player;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({ kind, player }) => {
	const { data: items, isLoading } = useShopCatalog(kind);
	const purchase = usePurchaseItem();
	const deleteItem = useDeleteShopItem();

	const confirmPurchase = useConfirm<ShopItem>();
	const confirmDelete = useConfirm<string>();

	const handlePurchaseConfirm = async () => {
		if (!confirmPurchase.target) return;
		try {
			await purchase.mutateAsync(confirmPurchase.target.id);
			toaster.create({
				title: `Purchased ${confirmPurchase.target.name}!`,
				description: `Deducted ${confirmPurchase.target.price_px} PX points.`,
				type: "success",
			});
			confirmPurchase.close();
		} catch (err) {
			toaster.create({
				title: "Purchase failed",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	const handleDeleteConfirm = async () => {
		if (!confirmDelete.target) return;
		try {
			await deleteItem.mutateAsync(confirmDelete.target);
			toaster.create({
				title: "Item removed from shop",
				type: "success",
			});
			confirmDelete.close();
		} catch (err) {
			toaster.create({
				title: "Failed to delete item",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	if (isLoading) {
		return (
			<Grid
				gap={3}
				templateColumns={{
					base: "1fr",
					sm: "repeat(2, 1fr)",
					lg: "repeat(3, 1fr)",
				}}
			>
				{[0, 1, 2].map((i) => (
					<Skeleton key={i} h="160px" rounded="card" />
				))}
			</Grid>
		);
	}

	if (!items || items.length === 0) {
		return (
			<Box {...glassCard} p={6}>
				<EmptyState
					title="No items in this category"
					description="Add your own custom real-life rewards using the button above or check back later."
					icon={<Icon as={LuPackage} boxSize={6} />}
				/>
			</Box>
		);
	}

	return (
		<>
			<Grid
				gap={3.5}
				templateColumns={{
					base: "1fr",
					sm: "repeat(2, 1fr)",
					lg: "repeat(3, 1fr)",
				}}
			>
				{items.map((item) => {
					const locked = item.level_required > (player?.level ?? 0);
					const unaffordable = item.price_px > (player?.px ?? 0);
					const disabled = locked || unaffordable;

					// Check if description has expiration tag
					const expiryMatch = item.description?.match(
						/\[Expires:\s*([^\]]+)\]/,
					);
					const cleanDescription = item.description
						?.replace(/\[Expires:\s*[^\]]+\]/, "")
						.trim();

					return (
						<Box
							key={item.id}
							{...glassCard}
							p={4}
							bg="bg.panel"
							transition="all 0.15s ease-out"
							_hover={{
								transform: "translateY(-1px)",
								shadow: "glass",
							}}
						>
							<Stack gap={3} h="full" justify="space-between">
								<Stack gap={1.5}>
									<HStack
										justify="space-between"
										align="flex-start"
									>
										<Text fontWeight="bold" fontSize="sm">
											{item.name}
										</Text>
										{!item.system && (
											<Icon
												as={LuTrash2}
												boxSize={3.5}
												color="fg.muted"
												cursor="pointer"
												onClick={() =>
													confirmDelete.ask(item.id)
												}
												_hover={{ color: "red.fg" }}
											/>
										)}
									</HStack>

									{cleanDescription ? (
										<Text
											fontSize="xs"
											color="fg.muted"
											lineHeight="tall"
										>
											{cleanDescription}
										</Text>
									) : null}

									<HStack gap={2} wrap="wrap" pt={1}>
										<Badge
											size="xs"
											rounded="pill"
											variant="surface"
											colorPalette="mint"
										>
											{item.price_px.toLocaleString()} PX
										</Badge>
										{item.level_required > 0 && (
											<Badge
												size="xs"
												rounded="pill"
												variant="subtle"
											>
												Req Lv {item.level_required}
											</Badge>
										)}
										{item.system && (
											<Badge
												size="xs"
												rounded="pill"
												variant="subtle"
											>
												System Item
											</Badge>
										)}
										{expiryMatch && (
											<Badge
												size="xs"
												rounded="pill"
												variant="subtle"
											>
												<HStack gap={1}>
													<Icon
														as={LuClock}
														boxSize={3}
													/>
													<Text>
														Exp: {expiryMatch[1]}
													</Text>
												</HStack>
											</Badge>
										)}
									</HStack>
								</Stack>

								<PillButton
									size="xs"
									variant="dark"
									w="full"
									disabled={disabled}
									onClick={() => confirmPurchase.ask(item)}
								>
									{locked
										? `Locked (Lv ${item.level_required})`
										: unaffordable
											? "Insufficient PX"
											: "Purchase"}
								</PillButton>
							</Stack>
						</Box>
					);
				})}
			</Grid>

			{/* Confirm Purchase Dialog */}
			<ConfirmDialog
				open={confirmPurchase.open}
				onOpenChange={confirmPurchase.onOpenChange}
				title="Purchase Shop Item"
				description={`Spend ${confirmPurchase.target?.price_px.toLocaleString()} PX to purchase "${confirmPurchase.target?.name}"?`}
				confirmLabel="Confirm Purchase"
				loading={purchase.isPending}
				onConfirm={handlePurchaseConfirm}
			/>

			{/* Confirm Delete Dialog */}
			<ConfirmDialog
				open={confirmDelete.open}
				onOpenChange={confirmDelete.onOpenChange}
				title="Delete Shop Item"
				description="Are you sure you want to permanently remove this custom reward from your catalog?"
				confirmLabel="Delete Item"
				destructive
				loading={deleteItem.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</>
	);
};

export default CatalogGrid;
