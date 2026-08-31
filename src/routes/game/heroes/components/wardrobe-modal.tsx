import React, { useMemo, useState } from "react";
import {
	Button,
	Grid,
	HStack,
	Icon,
	SimpleGrid,
	Stack,
	Text,
} from "@chakra-ui/react";
import {
	LuCrown,
	LuGlasses,
	LuPalette,
	LuShirt,
	LuSparkles,
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
	type Player,
	type PerkID,
	type ShopItem,
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
	summary?: { perks?: Array<{ perk_id: PerkID; rank: number }> };
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
	const [previewSlots, setPreviewSlots] =
		useState<Partial<Record<AvatarSlot, string>>>(equipped);
	const updateAvatar = useUpdateAvatar();
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
		],
		[t],
	);

	// Keep previewSlots synced when modal opens
	React.useEffect(() => {
		if (open) {
			setPreviewSlots(equipped);
		}
	}, [open, equipped]);

	const playerPerkMap = useMemo(() => {
		const res = new Map<PerkID, number>();
		summary?.perks?.forEach((p) => {
			res.set(p.perk_id, p.rank);
		});
		return res;
	}, [summary?.perks]);

	// ponytail: item is unlocked if default skin, or unlocked via perk rank, or owned in inventory
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

	const handleUnequipSlot = async (slot: AvatarSlot) => {
		if (!previewSlots[slot]) return;
		const nextSlots = { ...previewSlots };
		delete nextSlots[slot];

		const equippedPayload: Record<string, string> = {};
		for (const [s, id] of Object.entries(nextSlots)) {
			const match = cosmetics.find((c) => c.slot === `${s}:${id}`);
			if (match) equippedPayload[s] = match.id;
		}

		try {
			await updateAvatar.mutateAsync(equippedPayload);
			setPreviewSlots(nextSlots);
			toaster.create({
				title: t("routes.heroes.wardrobe.toasts.unequipped", {
					name: slot,
				}),
				type: "success",
			});
		} catch (err) {
			toaster.create({
				title: t("routes.heroes.wardrobe.toasts.failedEquip"),
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	const handleToggleSlot = async (item: CustomizationDef) => {
		const isCurrentlyEquipped = previewSlots[item.slot] === item.id;
		const nextSlots = { ...previewSlots };

		if (isCurrentlyEquipped) {
			delete nextSlots[item.slot];
		} else {
			nextSlots[item.slot] = item.id;
		}

		// Cosmetics backed by a real shop item persist to the avatar; pure
		// perk-unlock cosmetics stay local-only preview.
		const shopItem = cosmetics.find(
			(c) => c.slot === `${item.slot}:${item.id}`,
		);
		if (shopItem) {
			const equippedPayload: Record<string, string> = {};
			for (const [slot, id] of Object.entries(nextSlots)) {
				const match = cosmetics.find((c) => c.slot === `${slot}:${id}`);
				if (match) equippedPayload[slot] = match.id;
			}

			try {
				await updateAvatar.mutateAsync(equippedPayload);
				setPreviewSlots(nextSlots);
				toaster.create({
					title: isCurrentlyEquipped
						? t("routes.heroes.wardrobe.toasts.unequipped", {
								name: item.name,
							})
						: t("routes.heroes.wardrobe.toasts.equipped", {
								name: item.name,
							}),
					type: "success",
				});
			} catch (err) {
				toaster.create({
					title: t("routes.heroes.wardrobe.toasts.failedEquip"),
					description:
						err instanceof ApiError ? err.message : undefined,
					type: "error",
				});
			}
		} else if (item.requiredPerk) {
			setPreviewSlots(nextSlots);
			toaster.create({
				title: isCurrentlyEquipped
					? t("routes.heroes.wardrobe.toasts.unequipped", {
							name: item.name,
						})
					: t("routes.heroes.wardrobe.toasts.equippedPerk", {
							name: item.name,
						}),
				type: "success",
			});
		}
	};

	return (
		<DialogRoot
			open={open}
			onOpenChange={(details) => onOpenChange(details.open)}
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
					<Stack gap={0.5}>
						<DialogTitle fontSize="lg">
							{t("routes.heroes.wardrobe.title")}
						</DialogTitle>
						<DialogDescription fontSize="xs" color="fg.muted">
							{t("routes.heroes.wardrobe.subtitle")}
						</DialogDescription>
					</Stack>
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
							previewSlots={previewSlots}
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

							{/* Perk Mastery Tab */}
							{activeTab === "perks" ? (
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
												previewSlots[pDef.slot] ===
												pDef.itemId;

											return (
												<WardrobePerkCard
													key={perkId}
													perkId={perkId}
													perkDef={pDef}
													perkRank={perkRank}
													isEquipped={isEquipped}
													onToggle={handleToggleSlot}
												/>
											);
										},
									)}
								</SimpleGrid>
							) : (
								<Stack gap={2.5}>
									{previewSlots[activeTab as AvatarSlot] &&
										activeTab !== "skin" && (
											<HStack justify="flex-end">
												<Button
													size="2xs"
													variant="ghost"
													colorPalette="red"
													rounded="pill"
													onClick={() =>
														handleUnequipSlot(
															activeTab as AvatarSlot,
														)
													}
												>
													{t(
														"routes.heroes.wardrobe.itemCard.unequip",
													)}{" "}
													({activeTab})
												</Button>
											</HStack>
										)}
									<SimpleGrid
										columns={{ base: 1, sm: 2 }}
										gap={2.5}
									>
										{WARDROBE_CUSTOMIZATIONS.filter(
											(item) => item.slot === activeTab,
										).map((item) => (
											<WardrobeItemCard
												key={item.id}
												item={item}
												isUnlocked={isItemUnlocked(
													item,
												)}
												isEquipped={
													previewSlots[item.slot] ===
													item.id
												}
												onToggle={handleToggleSlot}
											/>
										))}
									</SimpleGrid>
								</Stack>
							)}
						</Stack>
					</Grid>
				</DialogBody>

				<DialogFooter pt={3}>
					<Button
						size="xs"
						variant="ghost"
						rounded="pill"
						onClick={() => onOpenChange(false)}
					>
						{t("routes.heroes.wardrobe.close")}
					</Button>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
};

export default WardrobeModal;
