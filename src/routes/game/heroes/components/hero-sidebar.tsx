import React from "react";
import { Link } from "react-router";
import {
	Box,
	Button,
	HStack,
	Icon,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { LuPackage, LuShoppingBag, LuSwords } from "react-icons/lu";
import { HeroAvatar, type AvatarSlot } from "@/components/game";
import type { Player } from "@/api";
import { glassCard } from "./perks-data";

interface HeroSidebarProps {
	activeSection: "overview" | "shop" | "inventory";
	player: Player;
	username?: string;
	equippedCosmetics: Partial<Record<AvatarSlot, string>>;
}

export const HeroSidebar: React.FC<HeroSidebarProps> = ({
	activeSection,
	player,
	username,
	equippedCosmetics,
}) => {
	return (
		<Box {...glassCard} p={3}>
			<VStack gap={1.5} align="stretch">
				<Button
					asChild
					variant={activeSection === "overview" ? "solid" : "ghost"}
					justifyContent="flex-start"
					rounded="pill"
					size="sm"
					px={3.5}
					py={2}
				>
					<Link to="/game/heroes">
						<HStack gap={2.5}>
							<Icon
								as={LuSwords}
								boxSize={4}
								color={
									activeSection === "overview"
										? "inherit"
										: "fg.muted"
								}
							/>
							<Text fontWeight="semibold" fontSize="xs">
								Hero Overview
							</Text>
						</HStack>
					</Link>
				</Button>

				<Button
					asChild
					variant={activeSection === "shop" ? "solid" : "ghost"}
					justifyContent="flex-start"
					rounded="pill"
					size="sm"
					px={3.5}
					py={2}
				>
					<Link to="/game/heroes/shop">
						<HStack gap={2.5}>
							<Icon
								as={LuShoppingBag}
								boxSize={4}
								color={
									activeSection === "shop"
										? "inherit"
										: "fg.muted"
								}
							/>
							<Text fontWeight="semibold" fontSize="xs">
								Shop & Rewards
							</Text>
						</HStack>
					</Link>
				</Button>

				<Button
					asChild
					variant={activeSection === "inventory" ? "solid" : "ghost"}
					justifyContent="flex-start"
					rounded="pill"
					size="sm"
					px={3.5}
					py={2}
				>
					<Link to="/game/heroes/inventory">
						<HStack gap={2.5}>
							<Icon
								as={LuPackage}
								boxSize={4}
								color={
									activeSection === "inventory"
										? "inherit"
										: "fg.muted"
								}
							/>
							<Text fontWeight="semibold" fontSize="xs">
								Inventory & Claims
							</Text>
						</HStack>
					</Link>
				</Button>
			</VStack>

			{/* Mini Hero Profile Card in Sidebar */}
			<Box
				mt={4}
				pt={4}
				borderTopWidth="1px"
				borderColor="border.glass"
				px={1}
			>
				<HStack gap={3}>
					<HeroAvatar
						seed={player.user_id}
						size={42}
						animated
						equipped={equippedCosmetics}
					/>
					<Stack gap={0}>
						<Text fontSize="xs" fontWeight="bold">
							@{username || "Hero"}
						</Text>
						<Text fontSize="10px" color="fg.muted">
							{player.skill_points} skill pts available
						</Text>
					</Stack>
				</HStack>
			</Box>
		</Box>
	);
};
