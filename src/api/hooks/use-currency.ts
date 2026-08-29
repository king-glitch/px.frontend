import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { currencyService } from "@/api/services/currency-service";
import type { AdjustCurrencyRequest, CurrencyType } from "@/api/types";

/**
 * Hook to fetch the current currency balance.
 */
export function useCurrencyBalance(type?: CurrencyType) {
	return useQuery({
		queryKey: queryKeys.currency.balance(type),
		queryFn: async () => {
			const res = await currencyService.getBalance(type);
			return res.balance;
		},
	});
}

/**
 * Hook to fetch the paginated currency transaction history.
 */
export function useCurrencyTransactions(
	type?: CurrencyType,
	page = 1,
	limit = 20,
) {
	return useQuery({
		queryKey: queryKeys.currency.transactions(type, page, limit),
		queryFn: async () => {
			const res = await currencyService.listTransactions(
				type,
				page,
				limit,
			);
			return { ...res, transactions: res.transactions ?? [] };
		},
	});
}

/**
 * Mutation to manually adjust the currency balance.
 */
export function useAdjustCurrency() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: AdjustCurrencyRequest) => {
			const res = await currencyService.adjustBalance(payload);
			return res.result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.currency.all });
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.playerSummary(),
			});
		},
	});
}
