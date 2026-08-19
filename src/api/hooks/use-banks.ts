import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { bankService } from "@/api/services/bank-service";
import type {
	Bank,
	CreateBankRequest,
	ListAccountsParams,
	ObjectID,
	UpdateBankRequest,
} from "@/api/types";

/**
 * Hook to fetch all banks.
 */
export function useBanks(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: queryKeys.banks.lists(),
		queryFn: async () => {
			const res = await bankService.listBanks();
			return res.banks;
		},
		enabled: options?.enabled,
	});
}

/**
 * Hook to fetch a single bank by ID.
 */
export function useBank(id?: ObjectID, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: queryKeys.banks.detail(id || ""),
		queryFn: async () => {
			if (!id) throw new Error("Bank ID is required");
			const res = await bankService.getBank(id);
			return res.bank;
		},
		enabled:
			Boolean(id) &&
			(options?.enabled !== undefined ? options.enabled : true),
	});
}

/**
 * Mutation to create a new bank.
 */
export function useCreateBank() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CreateBankRequest) => {
			const res = await bankService.createBank(payload);
			return res.bank;
		},
		onSuccess: (newBank: Bank) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.banks.all,
			});
			queryClient.setQueryData(
				queryKeys.banks.detail(newBank.id),
				newBank,
			);
		},
	});
}

/**
 * Mutation to update an existing bank.
 */
export function useUpdateBank() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: ObjectID;
			payload: UpdateBankRequest;
		}) => {
			const res = await bankService.updateBank(id, payload);
			return res.bank;
		},
		onSuccess: (updatedBank: Bank) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.banks.all,
			});
			queryClient.setQueryData(
				queryKeys.banks.detail(updatedBank.id),
				updatedBank,
			);
		},
	});
}

/**
 * Mutation to delete a bank.
 */
export function useDeleteBank() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: ObjectID) => {
			const res = await bankService.deleteBank(id);
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.banks.all,
			});
		},
	});
}

// ---------------------------------------------------------------------------
// Bank Accounts
// ---------------------------------------------------------------------------

/**
 * Hook to fetch all bank accounts for the user with optional filtering.
 */
export function useAccounts(
	params?: ListAccountsParams,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: queryKeys.accounts.list(params),
		queryFn: async () => {
			const res = await bankService.listAccounts(params);
			return res.accounts;
		},
		enabled: options?.enabled,
	});
}

/**
 * Hook to fetch a single bank account by ID.
 */
export function useAccount(id?: ObjectID, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: queryKeys.accounts.detail(id || ""),
		queryFn: async () => {
			if (!id) throw new Error("Account ID is required");
			const res = await bankService.getAccount(id);
			return res.account;
		},
		enabled:
			Boolean(id) &&
			(options?.enabled !== undefined ? options.enabled : true),
	});
}

/**
 * Mutation to create a new bank account.
 */
export function useCreateAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: import("@/api/types").CreateBankAccountRequest) => {
			const res = await bankService.createAccount(payload);
			return res.account;
		},
		onSuccess: (newAccount) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.accounts.all,
			});
			queryClient.setQueryData(
				queryKeys.accounts.detail(newAccount.id),
				newAccount,
			);
		},
	});
}

/**
 * Mutation to update an existing bank account.
 */
export function useUpdateAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: ObjectID;
			payload: import("@/api/types").UpdateBankAccountRequest;
		}) => {
			const res = await bankService.updateAccount(id, payload);
			return res.account;
		},
		onSuccess: (updatedAccount) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.accounts.all,
			});
			queryClient.setQueryData(
				queryKeys.accounts.detail(updatedAccount.id),
				updatedAccount,
			);
		},
	});
}

/**
 * Mutation to delete a bank account.
 */
export function useDeleteAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: ObjectID) => {
			const res = await bankService.deleteAccount(id);
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.accounts.all,
			});
		},
	});
}
