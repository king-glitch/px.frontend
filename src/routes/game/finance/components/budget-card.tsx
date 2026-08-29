import React from "react";
import { Badge, Box, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { LuTrash2 } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import type { FinanceBudget } from "@/api/types";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

interface BudgetCardProps {
	budget: FinanceBudget;
	spent: number;
	onDelete: (id: string) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
	budget,
	spent,
	onDelete,
}) => {
	const pct =
		budget.monthly_limit > 0
			? Math.round((spent / budget.monthly_limit) * 100)
			: 0;
	const isOver = spent > budget.monthly_limit;

	return (
		<Box {...glassCard} p={4} bg="bg.panel">
			<Stack gap={2.5}>
				<HStack justify="space-between">
					<Text fontWeight="bold" fontSize="sm">
						{budget.category}
					</Text>
					<Button
						variant="ghost"
						size="xs"
						colorPalette="red"
						onClick={() => onDelete(budget.id)}
					>
						<Icon as={LuTrash2} boxSize={3.5} />
					</Button>
				</HStack>

				<HStack justify="space-between" fontSize="xs">
					<Text color="fg.muted">
						${spent.toLocaleString()} / $
						{budget.monthly_limit.toLocaleString()}
					</Text>
					<Badge
						size="xs"
						colorPalette={
							isOver ? "red" : pct > 80 ? "orange" : "mint"
						}
					>
						{pct}%
					</Badge>
				</HStack>

				<Box h="2" rounded="pill" bg="bg.muted" overflow="hidden">
					<Box
						h="full"
						w={`${Math.min(pct, 100)}%`}
						bg={
							isOver
								? "red.solid"
								: pct > 80
									? "orange.solid"
									: "mint.solid"
						}
						rounded="pill"
					/>
				</Box>
			</Stack>
		</Box>
	);
};
