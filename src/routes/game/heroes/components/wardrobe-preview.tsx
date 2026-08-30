import React from "react";
import { Badge, Box, HStack, Stack, Text } from "@chakra-ui/react";
import { HeroAvatar, type AvatarSlot } from "@/components/game";
import { useTranslation } from "@/lib/i18n";

interface WardrobePreviewProps {
	level: number;
	previewSlots: Partial<Record<AvatarSlot, string>>;
}

export const WardrobePreview: React.FC<WardrobePreviewProps> = ({
	level,
	previewSlots,
}) => {
	const { t } = useTranslation();

	return (
		<Box
			p={4}
			rounded="card"
			bg="bg.muted"
			borderWidth="1px"
			borderColor="border.glass"
			textAlign="center"
		>
			<Stack align="center" gap={3}>
				<Text
					fontSize="xs"
					fontWeight="bold"
					textTransform="uppercase"
					letterSpacing="0.06em"
					color="fg.muted"
				>
					{t("routes.heroes.wardrobe.preview.title")}
				</Text>
				<Box
					p={3}
					rounded="xl"
					bg="bg.panel"
					borderWidth="1px"
					borderColor="border.glass"
					boxSize="130px"
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					<HeroAvatar size={96} animated slots={previewSlots} />
				</Box>
				<Badge
					size="xs"
					rounded="pill"
					colorPalette="mint"
					variant="subtle"
				>
					{t("routes.heroes.wardrobe.preview.levelRabbit", { level })}
				</Badge>

				{/* Active Equipment Badges */}
				<Stack gap={1} w="full" pt={2} textAlign="left">
					<Text fontSize="10px" fontWeight="bold" color="fg.muted">
						{t("routes.heroes.wardrobe.preview.equippedSlots")}
					</Text>
					<HStack wrap="wrap" gap={1}>
						{Object.entries(previewSlots).map(([slot, id]) => (
							<Badge
								key={slot}
								size="xs"
								rounded="pill"
								variant="outline"
							>
								{slot}: {id}
							</Badge>
						))}
					</HStack>
				</Stack>
			</Stack>
		</Box>
	);
};
