import React, { useMemo, useState } from "react";
import {
	Box,
	HStack,
	Heading,
	Icon,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuPlus, LuPiggyBank } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import { useDeleteFinanceBudget, useFinanceBudgets } from "@/api";
import type { FinanceEntry } from "@/api/types";
import { BudgetCard } from "./budget-card";
import { CreateBudgetDialog } from "./create-budget-dialog";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

interface BudgetsSectionProps {
	periodEntries: FinanceEntry[];
}

export const BudgetsSection: React.FC<BudgetsSectionProps> = ({
	periodEntries,
}) => {
	const [isAdding, setIsAdding] = useState(false);
	const { data: budgets = [], isLoading: budgetsLoading } =
		useFinanceBudgets();
	const deleteBudget = useDeleteFinanceBudget();
	const confirmDeleteBudget = useConfirm<string>();

	const categorySpendMap = useMemo(() => {
		const map = new Map<string, number>();
		for (const entry of periodEntries) {
			if (entry.direction === "expense") {
				map.set(
					entry.category,
					(map.get(entry.category) ?? 0) + entry.amount,
				);
			}
		}
		return map;
	}, [periodEntries]);

	const handleDeleteConfirm = async () => {
		if (!confirmDeleteBudget.target) return;
		try {
			await deleteBudget.mutateAsync(confirmDeleteBudget.target);
			toaster.create({
				title: "Budget target deleted",
				type: "success",
			});
			confirmDeleteBudget.close();
		} catch (err) {
			toaster.create({
				title: "Failed to delete budget",
				description:
					err instanceof ApiError
						? err.message
						: "An error occurred while deleting the budget target",
				type: "error",
			});
		}
	};

	return (
		<Box {...glassCard} p={{ base: 5, md: 6 }}>
			<Stack gap={5}>
				<HStack justify="space-between" align="center">
					<Stack gap={0.5}>
						<Heading size="md">Monthly Budget Targets</Heading>
						<Text fontSize="xs" color="fg.muted">
							Set spending limits per category to stay on track.
						</Text>
					</Stack>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsAdding(!isAdding)}
					>
						<HStack gap={1.5}>
							<Icon as={LuPlus} boxSize={3.5} />
							<Text>Add Target</Text>
						</HStack>
					</Button>
				</HStack>

				{/* Add Budget Form Card */}
				{isAdding && (
					<Box
						p={4}
						rounded="card"
						bg="bg.panel"
						borderWidth="1px"
						borderColor="border.glass"
					>
						<CreateBudgetDialog
							onClose={() => setIsAdding(false)}
						/>
					</Box>
				)}

				{budgetsLoading ? (
					<SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={3}>
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} h="100px" rounded="card" />
						))}
					</SimpleGrid>
				) : budgets.length === 0 ? (
					<EmptyState
						title="No budget targets set"
						description="Add monthly limits for categories like Groceries or Rent to monitor your discipline."
						icon={<Icon as={LuPiggyBank} boxSize={6} />}
					/>
				) : (
					<SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={3}>
						{budgets.map((b) => (
							<BudgetCard
								key={b.id}
								budget={b}
								spent={categorySpendMap.get(b.category) ?? 0}
								onDelete={(id) => confirmDeleteBudget.ask(id)}
							/>
						))}
					</SimpleGrid>
				)}
			</Stack>

			{/* Confirm Delete Budget Dialog */}
			<ConfirmDialog
				open={confirmDeleteBudget.open}
				onOpenChange={confirmDeleteBudget.onOpenChange}
				title="Delete Budget Target"
				description="Are you sure you want to remove this category budget limit?"
				confirmLabel="Delete"
				confirmColorPalette="red"
				loading={deleteBudget.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</Box>
	);
};
