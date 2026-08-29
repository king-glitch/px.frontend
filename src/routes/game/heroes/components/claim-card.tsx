import React from "react";
import { Badge, Box, HStack, Stack, Text } from "@chakra-ui/react";
import { PillButton } from "@/components/ui/pill-button";
import type { Claim } from "@/api";
import { glassCard } from "./perks-data";

interface ClaimCardProps {
	claim: Claim;
	onRedeem: (claimId: string) => void;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, onRedeem }) => {
	const isClaimed = Boolean(claim.redeemed_at);

	return (
		<Box
			p={4}
			rounded="card"
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border.glass"
			{...glassCard}
		>
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
							{isClaimed ? "Redeemed" : "Ready to Claim"}
						</Badge>
					</HStack>

					{claim.description && (
						<Text fontSize="xs" color="fg.muted" lineHeight="tall">
							{claim.description}
						</Text>
					)}

					<HStack
						justify="space-between"
						fontSize="11px"
						color="fg.muted"
						pt={1}
					>
						<Text>Paid: {claim.price_px.toLocaleString()} PX</Text>
						{claim.real_cost && (
							<Text>
								Value: {claim.currency || "$"}
								{claim.real_cost}
							</Text>
						)}
					</HStack>
				</Stack>

				<PillButton
					size="xs"
					variant={isClaimed ? "outline" : "dark"}
					w="full"
					disabled={isClaimed}
					onClick={() => onRedeem(claim.id)}
				>
					{isClaimed ? "Claim Completed" : "Mark as Redeemed"}
				</PillButton>
			</Stack>
		</Box>
	);
};
