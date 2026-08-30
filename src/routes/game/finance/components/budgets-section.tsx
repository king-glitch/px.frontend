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
import { useTranslation } from "@/lib/i18n";

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
	const { t } = useTranslation();
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
				title: t("routes.finance.budgets.deleted"),
				type: "success",
			});
			confirmDeleteBudget.close();
		} catch (err) {
			toaster.create({
				title: t("routes.finance.budgets.failedToDelete"),
				description:
					err instanceof ApiError
						? err.message
						: t("routes.finance.budgets.failedToDeleteDescription"),
				type: "error",
			});
		}
	};

	return (
		<Box {...glassCard} p={{ base: 5, md: 6 }}>
			<Stack gap={5}>
				<HStack justify="space-between" align="center">
					<Stack gap={0.5}>
						<Heading size="md">
							{t("routes.finance.budgets.heading")}
						</Heading>
						<Text fontSize="xs" color="fg.muted">
							{t("routes.finance.budgets.subtitle")}
						</Text>
					</Stack>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsAdding(!isAdding)}
					>
						<HStack gap={1.5}>
							<Icon as={LuPlus} boxSize={3.5} />
							<Text>{t("routes.finance.budgets.addTarget")}</Text>
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
						title={t("routes.finance.budgets.emptyTitle")}
						description={t(
							"routes.finance.budgets.emptyDescription",
						)}
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
				title={t("routes.finance.budgets.deleteDialogTitle")}
				description={t(
					"routes.finance.budgets.deleteDialogDescription",
				)}
				confirmLabel={t("routes.finance.budgets.deleteConfirmLabel")}
				destructive
				loading={deleteBudget.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</Box>
	);
};
