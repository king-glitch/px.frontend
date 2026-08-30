import React, { useState } from "react";
import { Flex, HStack, Icon, Stack, Tabs, Text } from "@chakra-ui/react";
import { LuGift, LuSparkles, LuShirt, LuPlus } from "react-icons/lu";
import { PillButton } from "@/components/ui/pill-button";
import type { Player } from "@/api";
import { CatalogGrid } from "./catalog-grid";
import { AddRewardDialog } from "./add-reward-dialog";
import { useTranslation } from "@/lib/i18n";

interface ShopSectionProps {
	player: Player;
}

export const ShopSection: React.FC<ShopSectionProps> = ({ player }) => {
	const { t } = useTranslation();
	const [shopTab, setShopTab] = useState<string>("reward");
	const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);

	return (
		<Stack gap={5}>
			<Flex justify="space-between" align="center" wrap="wrap" gap={3}>
				<Stack gap={0.5}>
					<Text fontSize="lg" fontWeight="bold">
						{t("routes.heroes.shop.title")}
					</Text>
					<Text fontSize="xs" color="fg.muted">
						{t("routes.heroes.shop.subtitle")}
					</Text>
				</Stack>

				<HStack gap={3} wrap="wrap">
					{/* Sliding Cyber-Pill Tabs with Tabs.Indicator */}
					<Tabs.Root
						value={shopTab}
						onValueChange={(details) =>
							details.value && setShopTab(details.value)
						}
						variant="plain"
						size="sm"
					>
						<Tabs.List
							bg="bg.panel"
							borderWidth="1px"
							borderColor="border.glass"
							rounded="pill"
							p={1}
							position="relative"
							gap={1}
						>
							<Tabs.Trigger
								value="reward"
								rounded="pill"
								px={4}
								py={1.5}
								fontSize="xs"
								fontWeight="bold"
								_selected={{
									bg: "bg.inverted",
									color: "fg.inverted",
								}}
							>
								<HStack gap={1.5}>
									<Icon as={LuGift} boxSize={3.5} />
									<Text>
										{t("routes.heroes.shop.tabs.reward")}
									</Text>
								</HStack>
							</Tabs.Trigger>

							<Tabs.Trigger
								value="consumable"
								rounded="pill"
								px={4}
								py={1.5}
								fontSize="xs"
								fontWeight="bold"
								_selected={{
									bg: "bg.inverted",
									color: "fg.inverted",
								}}
							>
								<HStack gap={1.5}>
									<Icon as={LuSparkles} boxSize={3.5} />
									<Text>
										{t(
											"routes.heroes.shop.tabs.consumable",
										)}
									</Text>
								</HStack>
							</Tabs.Trigger>

							<Tabs.Trigger
								value="cosmetic"
								rounded="pill"
								px={4}
								py={1.5}
								fontSize="xs"
								fontWeight="bold"
								_selected={{
									bg: "bg.inverted",
									color: "fg.inverted",
								}}
							>
								<HStack gap={1.5}>
									<Icon as={LuShirt} boxSize={3.5} />
									<Text>
										{t("routes.heroes.shop.tabs.cosmetic")}
									</Text>
								</HStack>
							</Tabs.Trigger>
						</Tabs.List>
					</Tabs.Root>

					{/* Bottom Sheet Dialog Trigger Button for Reward Creation */}
					<PillButton
						variant="dark"
						icon={LuPlus}
						onClick={() => setIsAddRewardOpen(true)}
					>
						{t("routes.heroes.shop.newReward")}
					</PillButton>
				</HStack>
			</Flex>

			{shopTab === "reward" && (
				<Stack gap={6}>
					<CatalogGrid kind="reward" player={player} />
				</Stack>
			)}

			{shopTab === "consumable" && (
				<Stack gap={6}>
					<CatalogGrid kind="consumable" player={player} />
				</Stack>
			)}

			{shopTab === "cosmetic" && (
				<Stack gap={6}>
					<CatalogGrid kind="cosmetic" player={player} />
				</Stack>
			)}

			{/* Chakra Bottom Sheet Dialog for Creating Custom Rewards */}
			<AddRewardDialog
				open={isAddRewardOpen}
				onOpenChange={setIsAddRewardOpen}
			/>
		</Stack>
	);
};

export default ShopSection;
