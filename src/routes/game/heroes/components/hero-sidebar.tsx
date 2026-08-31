import React from "react";
import { Link } from "react-router";
import {
	Box,
	Flex,
	HStack,
	Icon,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuPackage, LuShoppingBag, LuSparkles } from "react-icons/lu";
import { HeroAvatar, type AvatarSlot } from "@/components/game";
import { PillButton } from "@/components/ui/pill-button";
import type { Player } from "@/api";
import { glassCard } from "./perks-data";
import { useTranslation } from "@/lib/i18n";

interface HeroTopbarProps {
	activeSection: "overview" | "shop" | "inventory";
	player: Player;
	username?: string;
	equippedCosmetics: Partial<Record<AvatarSlot, string>>;
}

export const HeroTopbar: React.FC<HeroTopbarProps> = ({
	activeSection,
	player,
	username,
	equippedCosmetics,
}) => {
	const { t } = useTranslation();

	return (
		<Box {...glassCard} p={2.5}>
			<Flex
				justify="space-between"
				align="center"
				wrap="wrap"
				gap={3}
			>
				{/* Navigation Tabs */}
				<HStack gap={2} wrap="wrap">
					<PillButton
						asChild
						size="sm"
						variant={activeSection === "overview" ? "mint" : "outline"}
						colorPalette={activeSection === "overview" ? "lime" : "gray"}
						noIcon
					>
						<Link to="/game/heroes">
							<HStack gap={2}>
								<Icon as={LuSparkles} boxSize={3.5} />
								<Text>{t("routes.heroes.sidebar.overview")}</Text>
							</HStack>
						</Link>
					</PillButton>

					<PillButton
						asChild
						size="sm"
						variant={activeSection === "shop" ? "mint" : "outline"}
						colorPalette={activeSection === "shop" ? "lime" : "gray"}
						noIcon
					>
						<Link to="/game/heroes/shop">
							<HStack gap={2}>
								<Icon as={LuShoppingBag} boxSize={3.5} />
								<Text>{t("routes.heroes.sidebar.shop")}</Text>
							</HStack>
						</Link>
					</PillButton>

					<PillButton
						asChild
						size="sm"
						variant={activeSection === "inventory" ? "mint" : "outline"}
						colorPalette={activeSection === "inventory" ? "lime" : "gray"}
						noIcon
					>
						<Link to="/game/heroes/inventory">
							<HStack gap={2}>
								<Icon as={LuPackage} boxSize={3.5} />
								<Text>{t("routes.heroes.sidebar.inventory")}</Text>
							</HStack>
						</Link>
					</PillButton>
				</HStack>

				{/* Hero Companion Profile Stats */}
				<HStack gap={2.5} pr={2}>
					<HeroAvatar
						seed={player.user_id}
						size={32}
						animated
						equipped={equippedCosmetics}
					/>
					<Stack gap={0}>
						<Text fontSize="xs" fontWeight="bold">
							@{username || t("routes.heroes.sidebar.heroFallback")}
						</Text>
						<Text fontSize="10px" color="lime.500" fontWeight="semibold">
							{t("routes.heroes.sidebar.skillPointsAvailable", {
								count: player.skill_points,
							})}
						</Text>
					</Stack>
				</HStack>
			</Flex>
		</Box>
	);
};

export const HeroSidebar = HeroTopbar;

