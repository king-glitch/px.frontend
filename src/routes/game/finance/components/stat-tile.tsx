import React from "react";
import { Box, HStack, Icon, Heading, Text } from "@chakra-ui/react";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

interface StatTileProps {
	label: string;
	value: React.ReactNode;
	icon: React.ElementType;
	iconColor?: string;
	tileRef?: React.RefObject<HTMLDivElement | null>;
}

export const StatTile: React.FC<StatTileProps> = ({
	label,
	value,
	icon,
	iconColor = "fg.muted",
	tileRef,
}) => (
	<Box {...glassCard} p={3.5} ref={tileRef}>
		<HStack justify="space-between" color="fg.muted">
			<Text
				fontSize="10px"
				fontWeight="semibold"
				textTransform="uppercase"
			>
				{label}
			</Text>
			<Icon as={icon} boxSize={3.5} color={iconColor} />
		</HStack>
		<Heading size="xl" mt={1}>
			{value}
		</Heading>
	</Box>
);

export default StatTile;
