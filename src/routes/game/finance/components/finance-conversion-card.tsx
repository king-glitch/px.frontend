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
	if (!summary) return null;

	return (
		<Box {...glassCard} p={{ base: 5, md: 6 }}>
			<Flex justify="space-between" align="center" wrap="wrap" gap={4}>
				<HStack gap={3}>
					<Box p={3} rounded="pill" bg="bg.muted" color="fg.muted">
						<Icon as={LuRocket} boxSize={5} />
					</Box>
					<Stack gap={0.5}>
						<Heading size="md">Convert Period to Hero EXP</Heading>
						<Text fontSize="xs" color="fg.muted">
							Converts logged financial discipline (+
							{summary.projected_exp} projected EXP) into
							character growth. One-time per monthly cycle.
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
								? "Converted"
								: `Convert Period (+${summary.projected_exp} EXP)`}
						</Text>
					</HStack>
				</Button>
			</Flex>
		</Box>
	);
};
