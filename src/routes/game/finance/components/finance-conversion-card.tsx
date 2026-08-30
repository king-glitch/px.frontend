import React from "react";
import {
	Box,
	Flex,
	HStack,
	Heading,
	Icon,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuRocket, LuSparkles } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import type { FinanceSummary } from "@/api/types";
import { useTranslation } from "@/lib/i18n";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

interface FinanceConversionCardProps {
	summary?: FinanceSummary;
	alreadyConverted: boolean;
	isPending: boolean;
	onConvert: () => void;
}

export const FinanceConversionCard: React.FC<FinanceConversionCardProps> = ({
	summary,
	alreadyConverted,
	isPending,
	onConvert,
}) => {
	const { t } = useTranslation();

	if (!summary) return null;

	return (
		<Box {...glassCard} p={{ base: 5, md: 6 }}>
			<Flex justify="space-between" align="center" wrap="wrap" gap={4}>
				<HStack gap={3}>
					<Box p={3} rounded="pill" bg="bg.muted" color="fg.muted">
						<Icon as={LuRocket} boxSize={5} />
					</Box>
					<Stack gap={0.5}>
						<Heading size="md">
							{t("routes.finance.conversionCard.heading")}
						</Heading>
						<Text fontSize="xs" color="fg.muted">
							{t("routes.finance.conversionCard.description", {
								exp: summary.projected_exp,
							})}
						</Text>
					</Stack>
				</HStack>
				<Button
					variant="dark"
					loading={isPending}
					disabled={alreadyConverted || summary.projected_exp === 0}
					onClick={onConvert}
				>
					<HStack gap={2}>
						<Icon as={LuSparkles} boxSize={4} />
						<Text>
							{alreadyConverted
								? t("routes.finance.conversionCard.converted")
								: t("routes.finance.conversionCard.convert", {
										exp: summary.projected_exp,
									})}
						</Text>
					</HStack>
				</Button>
			</Flex>
		</Box>
	);
};
