import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { bankService } from "@/api/services/bank-service";
import type {
	BankTransaction,
	Collection,
	CreateTransactionRequest,
	ListTransactionsParams,
	ObjectID,
	UpdateTransactionRequest,
} from "@/api/types";

/**
 * Hook to fetch paginated bank transactions.
 */
export function useTransactions(
	params?: ListTransactionsParams,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: queryKeys.transactions.list(params),
		queryFn: async () => {
			const res = await bankService.listTransactions(params);
			return res.transactions;
		},
		placeholderData: keepPreviousData,
		enabled: options?.enabled,
	});
}

/**
 * Hook to fetch single transaction details.
 */
export function useTransaction(id?: ObjectID, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: queryKeys.transactions.detail(id || ""),
		queryFn: async () => {
			if (!id) throw new Error("Transaction ID is required");
			const res = await bankService.getTransaction(id);
			return res.transaction;
		},
		enabled:
			Boolean(id) &&
			(options?.enabled !== undefined ? options.enabled : true),
	});
}

/**
 * Mutation to create a transaction.
 */
export function useCreateTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CreateTransactionRequest) => {
			const res = await bankService.createTransaction(payload);
			return res.transaction;
		},
		onSuccess: (newTransaction: BankTransaction) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.transactions.all,
			});
			queryClient.setQueryData(
				queryKeys.transactions.detail(newTransaction.id),
				newTransaction,
			);
		},
	});
}

/**
 * Mutation to update a transaction.
 */
export function useUpdateTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: ObjectID;
			payload: UpdateTransactionRequest;
		}) => {
			const res = await bankService.updateTransaction(id, payload);
			return res.transaction;
		},
		onSuccess: (updatedTransaction: BankTransaction) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.transactions.all,
			});
			queryClient.setQueryData(
				queryKeys.transactions.detail(updatedTransaction.id),
				updatedTransaction,
			);
		},
	});
}

/**
 * Mutation to delete a transaction.
 */
export function useDeleteTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: ObjectID) => {
			const res = await bankService.deleteTransaction(id);
			return { id, deleted: res.deleted };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.transactions.all,
			});
		},
	});
}
