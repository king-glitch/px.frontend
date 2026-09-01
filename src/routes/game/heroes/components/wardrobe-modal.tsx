import React, { useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Grid,
	HStack,
	Icon,
	IconButton,
	Input,
	SimpleGrid,
	Spinner,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import {
	LuCheck,
	LuCrown,
	LuGlasses,
	LuPalette,
	LuPlus,
	LuSave,
	LuShirt,
	LuSparkles,
	LuTrash2,
	LuUndo2,
} from "react-icons/lu";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { toaster } from "@/components/ui/toaster";
import { type AvatarSlot } from "@/components/game";
import { ApiError } from "@/api/client";
import {
	useUpdateAvatar,
	useInventory,
	useBuyAndEquipItem,
	useSaveAvatarPreset,
	useApplyAvatarPreset,
	useDeleteAvatarPreset,
	type Player,
	type PerkID,
	type ShopItem,
	type Avatar,
} from "@/api";
import {
	WARDROBE_CUSTOMIZATIONS,
	type CustomizationDef,
} from "./wardrobe-data";
import { PERK_COSMETIC_MAP } from "./perks-data";
import { WardrobePreview } from "./wardrobe-preview";
import { WardrobeItemCard } from "./wardrobe-item-card";
import { WardrobePerkCard } from "./wardrobe-perk-card";
import { useTranslation } from "@/lib/i18n";

interface WardrobeModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	player: Player;
	summary?: {
		perks?: Array<{ perk_id: PerkID; rank: number }>;
		avatar?: Avatar;
	};
	cosmetics?: ShopItem[];
	equipped: Partial<Record<AvatarSlot, string>>;
}

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
	open,
	onOpenChange,
	player,
	summary,
	cosmetics = [],
	equipped,
}) => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<string>("head");
	const [statusFilter, setStatusFilter] = useState<"all" | "owned" | "locked">("all");
	const [draftSlots, setDraftSlots] =
		useState<Partial<Record<AvatarSlot, string>>>(equipped);
	const [newPresetName, setNewPresetName] = useState("");

	const updateAvatar = useUpdateAvatar();
	const buyAndEquip = useBuyAndEquipItem();
	const savePreset = useSaveAvatarPreset();
	const applyPreset = useApplyAvatarPreset();
	const deletePreset = useDeleteAvatarPreset();
	const { data: inventory = [] } = useInventory();

	const CATEGORIES = useMemo(
		() => [
			{
				id: "head",
				label: t("routes.heroes.wardrobe.categories.head"),
				icon: LuCrown,
			},
			{
				id: "glasses",
				label: t("routes.heroes.wardrobe.categories.glasses"),
				icon: LuGlasses,
			},
			{
				id: "accessory",
				label: t("routes.heroes.wardrobe.categories.accessory"),
				icon: LuShirt,
			},
			{
				id: "skin",
				label: t("routes.heroes.wardrobe.categories.skin"),
				icon: LuPalette,
			},
			{
				id: "perks",
				label: t("routes.heroes.wardrobe.categories.perks"),
				icon: LuSparkles,
			},
			{
				id: "presets",
				label: "Presets",
				icon: LuSave,
			},
		],
		[t],
	);

	// Sync draftSlots when modal opens
	React.useEffect(() => {
		if (open) {
			setDraftSlots(equipped);
		}
	}, [open, equipped]);

	const playerPerkMap = useMemo(() => {
		const res = new Map<PerkID, number>();
		summary?.perks?.forEach((p) => {
			res.set(p.perk_id, p.rank);
		});
		return res;
	}, [summary?.perks]);

	const isItemUnlocked = (item: CustomizationDef): boolean => {
		if (item.id === "obsidian") return true;
		if (item.requiredPerk) {
			const rank = playerPerkMap.get(item.requiredPerk) || 0;
			return rank > 0;
		}
		const shopItem = cosmetics.find(
			(c) => c.slot === `${item.slot}:${item.id}`,
		);
		if (shopItem) {
			return inventory.some(
				(inv) => inv.shop_item_id === shopItem.id && inv.quantity > 0,
			);
		}
		return false;
	};

	const hasUnsavedChanges = useMemo(() => {
		const equippedKeys = Object.keys(equipped) as AvatarSlot[];
		const draftKeys = Object.keys(draftSlots) as AvatarSlot[];
		if (equippedKeys.length !== draftKeys.length) return true;
		for (const key of draftKeys) {
			if (draftSlots[key] !== equipped[key]) return true;
		}
		return false;
	}, [equipped, draftSlots]);

	const handleToggleDraftSlot = (item: CustomizationDef) => {
		const isCurrentlyEquipped = draftSlots[item.slot] === item.id;
		const nextSlots = { ...draftSlots };

		if (isCurrentlyEquipped) {
			delete nextSlots[item.slot];
		} else {
			nextSlots[item.slot] = item.id;
		}
		setDraftSlots(nextSlots);
	};

	const handleUnequipSlot = (slot: AvatarSlot) => {
		if (!draftSlots[slot]) return;
		const nextSlots = { ...draftSlots };
		delete nextSlots[slot];
		setDraftSlots(nextSlots);
	};

	const handleSaveOutfit = async () => {
		const equippedPayload: Record<string, string> = {};
		for (const [slot, id] of Object.entries(draftSlots)) {
			const match = cosmetics.find((c) => c.slot === `${slot}:${id}`);
			if (match) {
				equippedPayload[slot] = match.id;
			}
		}

		try {
			await updateAvatar.mutateAsync(equippedPayload);
			toaster.create({
				title: "Outfit saved successfully",
				type: "success",
			});
			onOpenChange(false);
		} catch (err) {
			toaster.create({
				title: t("routes.heroes.wardrobe.toasts.failedEquip"),
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	const handleCancel = () => {
		setDraftSlots(equipped);
		onOpenChange(false);
	};

	const handleBuyAndEquip = async (item: CustomizationDef, shopItem: ShopItem) => {
		try {
			await buyAndEquip.mutateAsync(shopItem.id);
			setDraftSlots((prev) => ({
				...prev,
				[item.slot]: item.id,
			}));
			toaster.create({
				title: `Purchased and equipped ${item.name}!`,
				type: "success",
			});
		} catch (err) {
			toaster.create({
				title: "Purchase failed",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	const handleSavePreset = async () => {
		if (!newPresetName.trim()) return;
		try {
			await savePreset.mutateAsync(newPresetName.trim());
			setNewPresetName("");
			toaster.create({
				title: "Preset saved",
				type: "success",
			});
		} catch (err) {
			toaster.create({
				title: "Failed to save preset",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	const handleApplyPreset = async (presetId: string) => {
		try {
			const res = await applyPreset.mutateAsync(presetId);
			if (res.equipped) {
				// Reconstruct slot -> customization ID map
				const nextSlots: Partial<Record<AvatarSlot, string>> = {};
				for (const [slot, shopItemId] of Object.entries(res.equipped)) {
					const match = cosmetics.find((c) => c.id === shopItemId);
					if (match && match.slot) {
						const parts = match.slot.split(":");
						nextSlots[slot as AvatarSlot] = parts[1] || parts[0];
					}
				}
				setDraftSlots(nextSlots);
			}
			toaster.create({
				title: "Preset applied",
				type: "success",
			});
		} catch (err) {
			toaster.create({
				title: "Failed to apply preset",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	const handleDeletePreset = async (presetId: string) => {
		try {
			await deletePreset.mutateAsync(presetId);
			toaster.create({
				title: "Preset deleted",
				type: "info",
			});
		} catch (err) {
			toaster.create({
				title: "Failed to delete preset",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	const presets = summary?.avatar?.presets ?? [];

	const filteredCustomizations = useMemo(() => {
		const items = WARDROBE_CUSTOMIZATIONS.filter(
			(item) => item.slot === activeTab,
		);
		if (statusFilter === "all") return items;
		if (statusFilter === "owned") {
			return items.filter((item) => isItemUnlocked(item));
		}
		return items.filter((item) => !isItemUnlocked(item));
	}, [activeTab, statusFilter, inventory, playerPerkMap, cosmetics]);

	return (
		<DialogRoot
			open={open}
			onOpenChange={(details) => {
				if (!details.open) {
					handleCancel();
				}
			}}
			placement="center"
		>
			<DialogContent
				maxW="4xl"
				rounded="2xl"
				bg="bg.panel"
				borderWidth="1px"
				borderColor="border.glass"
				shadow="float"
				p={{ base: 4, md: 6 }}
			>
				<DialogHeader pb={2}>
					<HStack justify="space-between" align="center">
						<Stack gap={0.5}>
							<HStack gap={2}>
								<DialogTitle fontSize="lg">
									{t("routes.heroes.wardrobe.title")}
								</DialogTitle>
								{hasUnsavedChanges && (
									<Badge size="xs" colorPalette="amber" variant="subtle">
										Unsaved Draft
									</Badge>
								)}
							</HStack>
							<DialogDescription fontSize="xs" color="fg.muted">
								{t("routes.heroes.wardrobe.subtitle")}
							</DialogDescription>
						</Stack>
					</HStack>
				</DialogHeader>

				<DialogBody py={3} maxH="65vh" overflowY="auto">
					<Grid
						templateColumns={{ base: "1fr", md: "240px 1fr" }}
						gap={6}
						alignItems="start"
					>
						{/* Left: Live Rabbit Avatar Preview */}
						<WardrobePreview
							level={player.level}
							previewSlots={draftSlots}
						/>

						{/* Right: Category Tabs & Customization Grid */}
						<Stack gap={3}>
							{/* Category Navigation Pills */}
							<HStack wrap="wrap" gap={1.5}>
								{CATEGORIES.map((cat) => (
									<Button
										key={cat.id}
										size="xs"
										rounded="pill"
										variant={
											activeTab === cat.id
												? "solid"
												: "outline"
										}
										colorPalette={
											activeTab === cat.id
												? "mint"
												: undefined
										}
										onClick={() => setActiveTab(cat.id)}
									>
										<HStack gap={1.5}>
											<Icon as={cat.icon} boxSize={3.5} />
											<Text>{cat.label}</Text>
										</HStack>
									</Button>
								))}
							</HStack>

							{/* Presets Tab */}
							{activeTab === "presets" ? (
								<Stack gap={3}>
									<HStack gap={2}>
										<Input
											size="xs"
											rounded="pill"
											placeholder="New preset name..."
											value={newPresetName}
											onChange={(e) => setNewPresetName(e.target.value)}
										/>
										<Button
											size="xs"
											rounded="pill"
											colorPalette="mint"
											disabled={!newPresetName.trim() || savePreset.isPending}
											onClick={handleSavePreset}
										>
											<Icon as={LuPlus} mr={1} /> Save Current
										</Button>
									</HStack>

									{presets.length === 0 ? (
										<Text fontSize="xs" color="fg.muted" py={4} textAlign="center">
											No saved presets yet. Save your favorite combination above!
										</Text>
									) : (
										<SimpleGrid columns={{ base: 1, sm: 2 }} gap={2.5}>
											{presets.map((preset) => (
												<Box
													key={preset.id}
													p={3}
													rounded="card"
													bg="bg.muted"
													borderWidth="1px"
													borderColor="border.glass"
												>
													<HStack justify="space-between" align="center">
														<VStack align="flex-start" gap={0}>
															<Text fontSize="xs" fontWeight="bold">
																{preset.name}
															</Text>
															<Text fontSize="10px" color="fg.muted">
																{Object.keys(preset.equipped ?? {}).length} items
															</Text>
														</VStack>
														<HStack gap={1}>
															<Button
																size="2xs"
																rounded="pill"
																colorPalette="mint"
																variant="outline"
																onClick={() => handleApplyPreset(preset.id)}
															>
																Load
															</Button>
															<IconButton
																size="2xs"
																variant="ghost"
																colorPalette="red"
																aria-label="Delete preset"
																onClick={() => handleDeletePreset(preset.id)}
															>
																<Icon as={LuTrash2} boxSize={3} />
															</IconButton>
														</HStack>
													</HStack>
												</Box>
											))}
										</SimpleGrid>
									)}
								</Stack>
							) : activeTab === "perks" ? (
								/* Perk Mastery Tab */
								<SimpleGrid
									columns={{ base: 1, sm: 2 }}
									gap={2.5}
								>
									{Object.entries(PERK_COSMETIC_MAP).map(
										([perkKey, pDef]) => {
											const perkId = perkKey as PerkID;
											const perkRank =
												playerPerkMap.get(perkId) || 0;
											const isEquipped =
												draftSlots[pDef.slot] ===
												pDef.itemId;

											return (
												<WardrobePerkCard
													key={perkId}
													perkId={perkId}
													perkDef={pDef}
													perkRank={perkRank}
													isEquipped={isEquipped}
													onToggle={handleToggleDraftSlot}
												/>
											);
										},
									)}
								</SimpleGrid>
							) : (
								/* Standard Cosmetic Slots */
								<Stack gap={2.5}>
									<HStack justify="space-between" align="center">
										<HStack gap={1}>
											{(["all", "owned", "locked"] as const).map((filter) => (
												<Button
													key={filter}
													size="2xs"
													rounded="pill"
													variant={statusFilter === filter ? "subtle" : "ghost"}
													colorPalette={statusFilter === filter ? "mint" : "gray"}
													onClick={() => setStatusFilter(filter)}
													textTransform="capitalize"
												>
													{filter}
												</Button>
											))}
										</HStack>

										{draftSlots[activeTab as AvatarSlot] && activeTab !== "skin" && (
											<Button
												size="2xs"
												variant="ghost"
												colorPalette="red"
												rounded="pill"
												onClick={() => handleUnequipSlot(activeTab as AvatarSlot)}
											>
												{t("routes.heroes.wardrobe.itemCard.unequip")} ({activeTab})
											</Button>
										)}
									</HStack>

									<SimpleGrid
										columns={{ base: 1, sm: 2 }}
										gap={2.5}
									>
										{filteredCustomizations.map((item) => {
											const shopItem = cosmetics.find(
												(c) => c.slot === `${item.slot}:${item.id}`,
											);
											const isUnlocked = isItemUnlocked(item);
											const isEquipped = draftSlots[item.slot] === item.id;

											return (
												<WardrobeItemCard
													key={item.id}
													item={item}
													shopItem={shopItem}
													isUnlocked={isUnlocked}
													isEquipped={isEquipped}
													onToggle={handleToggleDraftSlot}
													onBuyAndEquip={handleBuyAndEquip}
													isPurchasing={
														buyAndEquip.isPending &&
														buyAndEquip.variables === shopItem?.id
													}
												/>
											);
										})}
									</SimpleGrid>
								</Stack>
							)}
						</Stack>
					</Grid>
				</DialogBody>

				<DialogFooter pt={3}>
					<HStack justify="flex-end" gap={2}>
						<Button
							size="xs"
							variant="ghost"
							rounded="pill"
							onClick={handleCancel}
						>
							<Icon as={LuUndo2} mr={1} />
							{hasUnsavedChanges ? "Cancel & Discard" : t("routes.heroes.wardrobe.close")}
						</Button>
						<Button
							size="xs"
							colorPalette="mint"
							variant="solid"
							rounded="pill"
							disabled={!hasUnsavedChanges || updateAvatar.isPending}
							onClick={handleSaveOutfit}
						>
							{updateAvatar.isPending ? (
								<Spinner size="xs" />
							) : (
								<>
									<Icon as={LuCheck} mr={1} /> Save Outfit
								</>
							)}
						</Button>
					</HStack>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
};

export default WardrobeModal;
