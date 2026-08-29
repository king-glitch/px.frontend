import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { financeService } from "@/api/services/finance-service";
import type {
	CreateFinanceBudgetRequest,
	CreateFinanceEntryRequest,
	UpdateFinanceBudgetRequest,
	UpdateFinanceEntryRequest,
} from "@/api/types";

/**
 * Hook to fetch the paginated finance entry list.
 */
export function useFinanceEntries(page = 1, limit = 20) {
	return useQuery({
		queryKey: queryKeys.finance.entries(page, limit),
		queryFn: async () => {
			const res = await financeService.listEntries(page, limit);
			return { ...res, entries: res.entries ?? [] };
		},
	});
}

/**
 * Mutation to create a finance entry.
 */
export function useCreateFinanceEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CreateFinanceEntryRequest) => {
			const res = await financeService.createEntry(payload);
			return res.entry;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
		},
	});
}

/**
 * Mutation to update a finance entry.
 */
export function useUpdateFinanceEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateFinanceEntryRequest;
		}) => {
			const res = await financeService.updateEntry(id, payload);
			return res.entry;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
		},
	});
}

/**
 * Mutation to delete a finance entry.
 */
export function useDeleteFinanceEntry() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => financeService.deleteEntry(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
		},
	});
}

/**
 * Hook to fetch the budget list.
 */
export function useFinanceBudgets() {
	return useQuery({
		queryKey: queryKeys.finance.budgets(),
		queryFn: async () => {
			const res = await financeService.listBudgets();
			return res.budgets ?? [];
		},
	});
}

/**
 * Mutation to create a budget.
 */
export function useCreateFinanceBudget() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CreateFinanceBudgetRequest) => {
			const res = await financeService.createBudget(payload);
			return res.budget;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.finance.budgets(),
			});
		},
	});
}

/**
 * Mutation to update a budget.
 */
export function useUpdateFinanceBudget() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateFinanceBudgetRequest;
		}) => {
			const res = await financeService.updateBudget(id, payload);
			return res.budget;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.finance.budgets(),
			});
		},
	});
}

/**
 * Mutation to delete a budget.
 */
export function useDeleteFinanceBudget() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => financeService.deleteBudget(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.finance.budgets(),
			});
		},
	});
}

/**
 * Hook to fetch the finance summary for a period (defaults to the current month).
 */
export function useFinanceSummary(period?: string) {
	return useQuery({
		queryKey: queryKeys.finance.summary(period),
		queryFn: async () => {
			const res = await financeService.getSummary(period);
			return res.summary;
		},
	});
}

/**
 * Mutation to convert a finance period into exp/px rewards.
 */
export function useConvertFinancePeriod() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (period: string) => {
			const res = await financeService.convertPeriod(period);
			return res.award;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.playerSummary(),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.currency.all });
		},
	});
}

/**
 * Hook to fetch the current px-per-unit conversion rate.
 */
export function useFinancePxPerUnit() {
	return useQuery({
		queryKey: queryKeys.finance.pxPerUnit(),
		queryFn: async () => {
			const res = await financeService.getPxPerUnit();
			return res.px_per_unit;
		},
	});
}
