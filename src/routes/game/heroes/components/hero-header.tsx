import React from "react";
import {
	Badge,
	Flex,
	HStack,
	Heading,
	Icon,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuClipboardList, LuCoins } from "react-icons/lu";
import { PillButton } from "@/components/ui/pill-button";
import type { Player } from "@/api";
import { glassCard } from "./perks-data";

interface HeroHeaderProps {
	player: Player;
	onOpenLedger: () => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
	player,
	onOpenLedger,
}) => {
	return (
		<Flex justify="space-between" align="center" wrap="wrap" gap={3}>
			<Stack gap={1}>
				<HStack gap={3}>
					<Heading size="2xl">Hero Command Hub</Heading>
					<Badge size="md" rounded="pill" variant="subtle">
						Lv {player.level}
					</Badge>
					{player.ascensions > 0 && (
						<Badge size="md" rounded="pill" variant="subtle">
							Ascension {player.ascensions}
						</Badge>
					)}
				</HStack>
				<Text color="fg.muted" fontSize="sm">
					Progression, talent perks, reward shop, and cyber inventory.
				</Text>
			</Stack>

			<HStack gap={3} wrap="wrap">
				<PillButton
					size="sm"
					variant="dark"
					icon={LuClipboardList}
					onClick={onOpenLedger}
				>
					Ledger History
				</PillButton>

				<HStack {...glassCard} px={4} py={2} gap={2} bg="bg.panel">
					<Icon as={LuCoins} boxSize={4} color="fg.muted" />
					<Text fontWeight="bold" fontSize="md">
						{player.px.toLocaleString()} PX
					</Text>
					<Text fontSize="xs" color="fg.muted">
						available
					</Text>
				</HStack>
			</HStack>
		</Flex>
	);
};
