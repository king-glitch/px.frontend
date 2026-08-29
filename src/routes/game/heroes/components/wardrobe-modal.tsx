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
	useUseInventoryItem,
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

interface WardrobeModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	player: Player;
	summary?: { perks?: Array<{ perk_id: PerkID; rank: number }> };
	cosmetics?: ShopItem[];
	equipped: Partial<Record<AvatarSlot, string>>;
}

const CATEGORIES = [
	{ id: "head", label: "Hats (11)", icon: LuCrown },
	{ id: "glasses", label: "Glasses (7)", icon: LuGlasses },
	{ id: "accessory", label: "Accessories (7)", icon: LuShirt },
	{ id: "skin", label: "Skins (8)", icon: LuPalette },
	{ id: "perks", label: "Perk Mastery (8)", icon: LuSparkles },
];

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
	open,
	onOpenChange,
	player,
	summary,
	cosmetics = [],
	equipped,
}) => {
	const [activeTab, setActiveTab] = useState<string>("head");
	const [previewSlots, setPreviewSlots] =
		useState<Partial<Record<AvatarSlot, string>>>(equipped);
	const useItem = useUseInventoryItem();
	const { data: inventory = [] } = useInventory();

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

	const isItemUnlocked = (item: CustomizationDef): boolean => {
		if (!item.requiredPerk) return true;
		const rank = playerPerkMap.get(item.requiredPerk) || 0;
		return rank > 0;
	};

	const handleToggleSlot = async (item: CustomizationDef) => {
		const isCurrentlyEquipped = previewSlots[item.slot] === item.id;
		const nextSlots = { ...previewSlots };

		if (isCurrentlyEquipped) {
			delete nextSlots[item.slot];
		} else {
			nextSlots[item.slot] = item.id;
		}
		setPreviewSlots(nextSlots);

		// If this item corresponds to an inventory cosmetic, trigger backend equip/unequip
		const shopItem = cosmetics.find(
			(c) => c.slot === `${item.slot}:${item.id}`,
		);
		if (shopItem) {
			const invItem = inventory.find(
				(i) => i.shop_item_id === shopItem.id,
			);
			if (invItem) {
				try {
					await useItem.mutateAsync(invItem.id);
					toaster.create({
						title: isCurrentlyEquipped
							? `Unequipped ${item.name}`
							: `Equipped ${item.name}!`,
						type: "success",
					});
				} catch (err) {
					toaster.create({
						title: "Failed to equip item",
						description:
							err instanceof ApiError ? err.message : undefined,
						type: "error",
					});
				}
			}
		} else if (item.requiredPerk) {
			toaster.create({
				title: isCurrentlyEquipped
					? `Unequipped ${item.name}`
					: `Equipped Perk Cosmetic: ${item.name}!`,
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
							Wardrobe & Perk Customization
						</DialogTitle>
						<DialogDescription fontSize="xs" color="fg.muted">
							Equip pixel-art hats, glasses, skins, and unlock
							exclusive perk prestige customizations for your
							13×13 rabbit.
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
											isUnlocked={isItemUnlocked(item)}
											isEquipped={
												previewSlots[item.slot] ===
												item.id
											}
											onToggle={handleToggleSlot}
										/>
									))}
								</SimpleGrid>
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
						Close
					</Button>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
};

export default WardrobeModal;
