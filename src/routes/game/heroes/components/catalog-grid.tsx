import React, { useMemo } from "react";
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
	useInventory,
	type ShopItemKind,
	type ShopItem,
	type Player,
} from "@/api";
import { useTranslation } from "@/lib/i18n";

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
	const { t } = useTranslation();
	const { data: rawItems, isLoading } = useShopCatalog(kind);
	const { data: inventory } = useInventory();
	const purchase = usePurchaseItem();
	const deleteItem = useDeleteShopItem();

	const items = useMemo(() => {
		if (!rawItems) return [];
		if (kind === "cosmetic") {
			return rawItems.filter((item) => item.price_px > 0);
		}
		return rawItems;
	}, [rawItems, kind]);

	const confirmPurchase = useConfirm<ShopItem>();
	const confirmDelete = useConfirm<string>();

	const handlePurchaseConfirm = async () => {
		if (!confirmPurchase.target) return;
		try {
			await purchase.mutateAsync(confirmPurchase.target.id);
			toaster.create({
				title: t("routes.heroes.catalog.toasts.purchaseSuccess", {
					name: confirmPurchase.target.name,
				}),
				description: t(
					"routes.heroes.catalog.toasts.purchaseSuccessDesc",
					{
						price: confirmPurchase.target.price_px,
					},
				),
				type: "success",
			});
			confirmPurchase.close();
		} catch (err) {
			toaster.create({
				title: t("routes.heroes.catalog.toasts.purchaseFailed"),
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
				title: t("routes.heroes.catalog.toasts.deleteSuccess"),
				type: "success",
			});
			confirmDelete.close();
		} catch (err) {
			toaster.create({
				title: t("routes.heroes.catalog.toasts.deleteFailed"),
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
					title={t("routes.heroes.catalog.empty.title")}
					description={t("routes.heroes.catalog.empty.description")}
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
					const owned =
						item.kind === "cosmetic" &&
						inventory?.some(
							(inv) =>
								inv.shop_item_id === item.id &&
								inv.quantity > 0,
						);
					const disabled = locked || unaffordable || owned;

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
												{t(
													"routes.heroes.catalog.badges.reqLevel",
													{
														level: item.level_required,
													},
												)}
											</Badge>
										)}
										{item.system && (
											<Badge
												size="xs"
												rounded="pill"
												variant="subtle"
											>
												{t(
													"routes.heroes.catalog.badges.systemItem",
												)}
											</Badge>
										)}
										{item.expires_in_days &&
										item.expires_in_days > 0 ? (
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
														{item.expires_in_days}d
													</Text>
												</HStack>
											</Badge>
										) : expiryMatch ? (
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
														{t(
															"routes.heroes.catalog.badges.exp",
															{
																date: expiryMatch[1],
															},
														)}
													</Text>
												</HStack>
											</Badge>
										) : null}
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
										? t(
												"routes.heroes.catalog.buttons.locked",
												{
													level: item.level_required,
												},
											)
										: owned
											? t(
													"routes.heroes.catalog.buttons.owned",
												)
											: unaffordable
												? t(
														"routes.heroes.catalog.buttons.unaffordable",
													)
												: t(
														"routes.heroes.catalog.buttons.purchase",
													)}
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
				title={t("routes.heroes.catalog.dialogs.purchaseTitle")}
				description={t("routes.heroes.catalog.dialogs.purchaseDesc", {
					price:
						confirmPurchase.target?.price_px.toLocaleString() ??
						"0",
					name: confirmPurchase.target?.name ?? "",
				})}
				confirmLabel={t(
					"routes.heroes.catalog.dialogs.purchaseConfirm",
				)}
				loading={purchase.isPending}
				onConfirm={handlePurchaseConfirm}
			/>

			{/* Confirm Delete Dialog */}
			<ConfirmDialog
				open={confirmDelete.open}
				onOpenChange={confirmDelete.onOpenChange}
				title={t("routes.heroes.catalog.dialogs.deleteTitle")}
				description={t("routes.heroes.catalog.dialogs.deleteDesc")}
				confirmLabel={t("routes.heroes.catalog.dialogs.deleteConfirm")}
				destructive
				loading={deleteItem.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</>
	);
};

export default CatalogGrid;
