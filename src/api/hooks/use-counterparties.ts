import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { bankService } from "@/api/services/bank-service";
import type {
	BankCounterparty,
	ObjectID,
	UpdateCounterpartyRequest,
} from "@/api/types";

/**
 * Hook to fetch all counterparties for authenticated user.
 */
export function useCounterparties(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: queryKeys.counterparties.lists(),
		queryFn: async () => {
			const res = await bankService.listCounterparties();
			return res.counterparties;
		},
		enabled: options?.enabled,
	});
}

/**
 * Hook to fetch counterparty details by ID.
 */
export function useCounterparty(
	id?: ObjectID,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: queryKeys.counterparties.detail(id || ""),
		queryFn: async () => {
			if (!id) throw new Error("Counterparty ID is required");
			const res = await bankService.getCounterparty(id);
			return res.counterparty;
		},
		enabled:
			Boolean(id) &&
			(options?.enabled !== undefined ? options.enabled : true),
	});
}

/**
 * Mutation to update a counterparty.
 */
export function useUpdateCounterparty() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: ObjectID;
			payload: UpdateCounterpartyRequest;
		}) => {
			const res = await bankService.updateCounterparty(id, payload);
			return res.counterparty;
		},
		onSuccess: (updatedCounterparty: BankCounterparty) => {
			queryClient.setQueryData(
				queryKeys.counterparties.detail(updatedCounterparty.id),
				updatedCounterparty,
			);
			queryClient.invalidateQueries({
				queryKey: queryKeys.counterparties.all,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.transactions.all,
			});
		},
	});
}

/**
 * Mutation to delete a counterparty.
 */
export function useDeleteCounterparty() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: ObjectID) => {
			const res = await bankService.deleteCounterparty(id);
			return { id, deleted: res.deleted };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.counterparties.all,
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.transactions.all,
			});
		},
	});
}
