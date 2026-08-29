import React from "react";
import {
	Badge,
	Box,
	Button,
	Flex,
	HStack,
	Icon,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuArrowUp, LuShirt } from "react-icons/lu";
import { PillButton } from "@/components/ui/pill-button";
import {
	ExpBar,
	HeroAvatar,
	LevelRing,
	type AvatarSlot,
} from "@/components/game";
import type { Player } from "@/api";
import { glassCard } from "./perks-data";

interface HeroProgressionCardProps {
	player: Player;
	expToNext: number;
	equippedCosmetics: Partial<Record<AvatarSlot, string>>;
	onOpenAscend: () => void;
	onOpenWardrobe: () => void;
}

export const HeroProgressionCard: React.FC<HeroProgressionCardProps> = ({
	player,
	expToNext,
	equippedCosmetics,
	onOpenAscend,
	onOpenWardrobe,
}) => {
	const expFraction = expToNext > 0 ? player.exp_into_level / expToNext : 0;
	const canAscend = player.level >= 50;

	return (
		<Box {...glassCard} p={4.5} flex="1">
			<Stack align="center" gap={3}>
				<Box position="relative" boxSize="110px">
					<Box position="absolute" inset={0}>
						<LevelRing
							level={player.level}
							progress={expFraction}
							size={110}
						/>
					</Box>
					<Flex
						position="absolute"
						inset={0}
						align="center"
						justify="center"
					>
						<HeroAvatar
							seed={player.user_id}
							size={72}
							animated
							equipped={equippedCosmetics}
						/>
					</Flex>
				</Box>

				<HStack gap={2}>
					<Badge size="sm" rounded="pill" variant="subtle">
						Level {player.level}
					</Badge>
					{player.ascensions > 0 && (
						<Badge size="sm" rounded="pill" variant="subtle">
							Ascension {player.ascensions}
						</Badge>
					)}
				</HStack>

				<Box w="full">
					<ExpBar
						level={player.level}
						expIntoLevel={player.exp_into_level}
						expToNext={expToNext}
					/>
				</Box>

				{canAscend && (
					<PillButton
						variant="dark"
						icon={LuArrowUp}
						w="full"
						size="xs"
						onClick={onOpenAscend}
					>
						Ascend Hero
					</PillButton>
				)}

				<Button
					variant="outline"
					size="xs"
					rounded="pill"
					w="full"
					onClick={onOpenWardrobe}
				>
					<HStack gap={1.5}>
						<Icon as={LuShirt} boxSize={3.5} color="mint.fg" />
						<Text>Wardrobe & Perks</Text>
					</HStack>
				</Button>
			</Stack>
		</Box>
	);
};
