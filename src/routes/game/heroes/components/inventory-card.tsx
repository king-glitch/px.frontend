import React from "react";
import { Badge, Box, HStack, Stack, Text } from "@chakra-ui/react";
import { PillButton } from "@/components/ui/pill-button";
import type { Avatar, InventoryItem, ShopItem } from "@/api";
import { glassCard } from "./perks-data";
import { useTranslation } from "@/lib/i18n";

interface InventoryCardProps {
	item: InventoryItem;
	shopItem?: ShopItem;
	avatar?: Avatar;
	onUse: (itemId: string) => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
	item,
	shopItem,
	avatar,
	onUse,
}) => {
	const { t } = useTranslation();
	const isCosmetic = shopItem?.kind === "cosmetic";
	const slotType = shopItem?.slot?.split(":")[0] || "accessory";
	const isEquipped =
		Boolean(avatar?.equipped?.[slotType]) &&
		avatar?.equipped?.[slotType] === item.shop_item_id;

	return (
		<Box p={4} {...glassCard} bg="bg.panel">
			<Stack gap={3} justify="space-between" h="full">
				<Stack gap={1.5}>
					<HStack justify="space-between">
						<Text fontWeight="bold" fontSize="sm">
							{shopItem?.name ||
								t("routes.heroes.inventory.card.mysteryItem")}
						</Text>
						<HStack gap={1}>
							{item.quantity > 1 && (
								<Badge
									size="xs"
									rounded="pill"
									variant="subtle"
								>
									x{item.quantity}
								</Badge>
							)}
							{item.deprecated && (
								<Badge
									size="xs"
									rounded="pill"
									colorPalette="orange"
									variant="subtle"
								>
									{t(
										"routes.heroes.inventory.card.deprecated",
									)}
								</Badge>
							)}
							{isCosmetic && (
								<Badge
									size="xs"
									rounded="pill"
									colorPalette={isEquipped ? "mint" : "gray"}
									variant={isEquipped ? "solid" : "subtle"}
								>
									{isEquipped
										? t(
												"routes.heroes.inventory.card.equipped",
											)
										: t(
												"routes.heroes.inventory.card.cosmetic",
											)}
								</Badge>
							)}
						</HStack>
					</HStack>

					<Text fontSize="xs" color="fg.muted" lineHeight="tall">
						{shopItem?.description ||
							t("routes.heroes.inventory.card.noDesc")}
					</Text>
				</Stack>

				<PillButton
					size="xs"
					variant={isEquipped ? "outline" : "dark"}
					w="full"
					disabled={item.deprecated}
					onClick={() => onUse(item.id)}
				>
					{item.deprecated
						? t("routes.heroes.inventory.card.deprecated")
						: isCosmetic
							? isEquipped
								? t("routes.heroes.inventory.card.unequip")
								: t("routes.heroes.inventory.card.equipItem")
							: t("routes.heroes.inventory.card.useItem")}
				</PillButton>
			</Stack>
		</Box>
	);
};
