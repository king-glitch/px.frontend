import React from "react";
import { Badge, Box, Button, HStack, Stack, Text } from "@chakra-ui/react";
import type { CustomizationDef } from "./wardrobe-data";
import { useTranslation } from "@/lib/i18n";

interface WardrobeItemCardProps {
	item: CustomizationDef;
	isUnlocked: boolean;
	isEquipped: boolean;
	onToggle: (item: CustomizationDef) => void;
}

export const WardrobeItemCard: React.FC<WardrobeItemCardProps> = ({
	item,
	isUnlocked,
	isEquipped,
	onToggle,
}) => {
	const { t } = useTranslation();

	return (
		<Box
			p={3}
			rounded="card"
			bg="bg.muted"
			borderWidth="1px"
			borderColor={isEquipped ? "mint.fg" : "border.glass"}
		>
			<Stack gap={2} justify="space-between" h="full">
				<Stack gap={1}>
					<HStack justify="space-between">
						<Text fontWeight="bold" fontSize="xs">
							{item.name}
						</Text>
						{isEquipped && (
							<Badge
								size="xs"
								rounded="pill"
								colorPalette="mint"
								variant="solid"
							>
								{t("routes.heroes.wardrobe.itemCard.equipped")}
							</Badge>
						)}
						{item.requiredPerk && !isUnlocked && (
							<Badge size="xs" rounded="pill" variant="subtle">
								{t("routes.heroes.wardrobe.itemCard.perk", {
									perk: item.requiredPerk,
								})}
							</Badge>
						)}
					</HStack>
					<Text fontSize="11px" color="fg.muted">
						{item.description}
					</Text>
				</Stack>

				<Button
					size="xs"
					rounded="pill"
					variant={isEquipped ? "solid" : "outline"}
					colorPalette={isEquipped ? "mint" : undefined}
					disabled={!isUnlocked}
					onClick={() => onToggle(item)}
				>
					{!isUnlocked
						? t("routes.heroes.wardrobe.itemCard.locked")
						: isEquipped
							? t("routes.heroes.wardrobe.itemCard.unequip")
							: t("routes.heroes.wardrobe.itemCard.equip")}
				</Button>
			</Stack>
		</Box>
	);
};
