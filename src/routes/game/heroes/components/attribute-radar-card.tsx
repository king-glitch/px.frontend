import React from "react";
import { Box, HStack, Heading, Icon, Stack, Text } from "@chakra-ui/react";
import { LuShield } from "react-icons/lu";
import { AttributeRadar } from "@/components/game";
import { glassCard } from "./perks-data";
import { useTranslation } from "@/lib/i18n";

interface AttributeRadarCardProps {
	attributes: Record<string, number>;
	maxAttribute: number;
}

export const AttributeRadarCard: React.FC<AttributeRadarCardProps> = ({
	attributes,
	maxAttribute,
}) => {
	const { t } = useTranslation();
	return (
		<Box {...glassCard} p={6} minW={0}>
			<Stack gap={4}>
				<HStack justify="space-between" w="full">
					<Stack gap={0.5}>
						<Heading size="sm">
							{t("routes.heroes.attribute.radar.card.title")}
						</Heading>
						<Text fontSize="xs" color="fg.muted">
							{t("routes.heroes.attribute.radar.card.subtitle")}
						</Text>
					</Stack>
					<Icon as={LuShield} boxSize={4} color="mint.fg" />
				</HStack>

				<AttributeRadar values={attributes} max={maxAttribute} />
			</Stack>
		</Box>
	);
};
