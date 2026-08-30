import React from "react";
import {
	Badge,
	Box,
	Button,
	HStack,
	Icon,
	Stack,
	Text,
} from "@chakra-ui/react";
import type { PerkID } from "@/api";
import type { AvatarSlot } from "@/components/game";
import { useTranslation } from "@/lib/i18n";

interface WardrobePerkCardProps {
	perkId: PerkID;
	perkDef: {
		slot: AvatarSlot;
		itemId: string;
		name: string;
		description: string;
		icon: React.ElementType;
	};
	perkRank: number;
	isEquipped: boolean;
	onToggle: (item: {
		slot: AvatarSlot;
		id: string;
		name: string;
		description: string;
		requiredPerk: PerkID;
	}) => void;
}

export const WardrobePerkCard: React.FC<WardrobePerkCardProps> = ({
	perkId,
	perkDef,
	perkRank,
	isEquipped,
	onToggle,
}) => {
	const { t } = useTranslation();
	const isUnlocked = perkRank > 0;

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
						<HStack gap={1.5}>
							<Icon
								as={perkDef.icon}
								boxSize={4}
								color={isUnlocked ? "mint.fg" : "fg.muted"}
							/>
							<Text fontWeight="bold" fontSize="xs">
								{perkDef.name}
							</Text>
						</HStack>
						<Badge
							size="xs"
							rounded="pill"
							colorPalette={isUnlocked ? "mint" : "gray"}
							variant="subtle"
						>
							{isUnlocked
								? t("routes.heroes.wardrobe.perkCard.rank", {
										rank: perkRank,
									})
								: t("routes.heroes.wardrobe.perkCard.locked")}
						</Badge>
					</HStack>
					<Text fontSize="11px" color="fg.muted">
						{perkDef.description}
					</Text>
				</Stack>

				<Button
					size="xs"
					rounded="pill"
					variant={isEquipped ? "solid" : "outline"}
					colorPalette={isEquipped ? "mint" : undefined}
					disabled={!isUnlocked}
					onClick={() =>
						onToggle({
							slot: perkDef.slot,
							id: perkDef.itemId,
							name: perkDef.name,
							description: perkDef.description,
							requiredPerk: perkId,
						})
					}
				>
					{!isUnlocked
						? t("routes.heroes.wardrobe.perkCard.unlockInTree")
						: isEquipped
							? t("routes.heroes.wardrobe.perkCard.unequip")
							: t(
									"routes.heroes.wardrobe.perkCard.equipToRabbit",
								)}
				</Button>
			</Stack>
		</Box>
	);
};
