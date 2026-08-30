import React from "react";
import { Badge, Box, HStack, Stack, Text } from "@chakra-ui/react";
import { PillButton } from "@/components/ui/pill-button";
import type { Claim } from "@/api";
import { glassCard } from "./perks-data";
import { useTranslation } from "@/lib/i18n";

interface ClaimCardProps {
	claim: Claim;
	onRedeem: (claimId: string) => void;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, onRedeem }) => {
	const { t } = useTranslation();
	const isClaimed = Boolean(claim.redeemed_at) || claim.status === "redeemed";

	return (
		<Box p={4} {...glassCard} bg="bg.panel">
			<Stack gap={3} justify="space-between" h="full">
				<Stack gap={1.5}>
					<HStack justify="space-between">
						<Text fontWeight="bold" fontSize="sm">
							{claim.name}
						</Text>
						<Badge
							size="xs"
							rounded="pill"
							colorPalette={isClaimed ? "gray" : "mint"}
							variant={isClaimed ? "subtle" : "solid"}
						>
							{isClaimed
								? t("routes.heroes.claim.card.redeemed")
								: t("routes.heroes.claim.card.readyToClaim")}
						</Badge>
					</HStack>

					<HStack
						justify="space-between"
						fontSize="11px"
						color="fg.muted"
						pt={1}
					>
						<Text>
							{t("routes.heroes.claim.card.paid", {
								px: (claim.price_paid || 0).toLocaleString(),
							})}
						</Text>
					</HStack>
				</Stack>

				<PillButton
					size="xs"
					variant={isClaimed ? "outline" : "dark"}
					w="full"
					disabled={isClaimed}
					onClick={() => onRedeem(claim.id)}
				>
					{isClaimed
						? t("routes.heroes.claim.card.completed")
						: t("routes.heroes.claim.card.markRedeemed")}
				</PillButton>
			</Stack>
		</Box>
	);
};
