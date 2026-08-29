import React from "react";
import { Badge, Box, HStack, Stack, Text } from "@chakra-ui/react";
import { PillButton } from "@/components/ui/pill-button";
import type { Avatar, InventoryItem, ShopItem } from "@/api";
import { glassCard } from "./perks-data";

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
	const isCosmetic = shopItem?.kind === "cosmetic";
	const slotType = shopItem?.slot?.split(":")[0] || "accessory";
	const isEquipped =
		Boolean(avatar?.equipped?.[slotType]) &&
		avatar?.equipped?.[slotType] === item.shop_item_id;

	return (
		<Box
			p={4}
			rounded="card"
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border.glass"
			{...glassCard}
		>
			<Stack gap={3} justify="space-between" h="full">
				<Stack gap={1.5}>
					<HStack justify="space-between">
						<Text fontWeight="bold" fontSize="sm">
							{shopItem?.name || "Mystery Item"}
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
							{isCosmetic && (
								<Badge
									size="xs"
									rounded="pill"
									colorPalette={isEquipped ? "mint" : "gray"}
									variant={isEquipped ? "solid" : "subtle"}
								>
									{isEquipped ? "Equipped" : "Cosmetic"}
								</Badge>
							)}
						</HStack>
					</HStack>

					<Text fontSize="xs" color="fg.muted" lineHeight="tall">
						{shopItem?.description ||
							"No item description available."}
					</Text>
				</Stack>

				<PillButton
					size="xs"
					variant={isEquipped ? "outline" : "dark"}
					w="full"
					onClick={() => onUse(item.id)}
				>
					{isCosmetic
						? isEquipped
							? "Unequip"
							: "Equip Item"
						: "Use Item"}
				</PillButton>
			</Stack>
		</Box>
	);
};
