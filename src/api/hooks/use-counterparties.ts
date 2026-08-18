import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { bankService } from "@/api/services/bank-service";
import type {
	BankCounterparty,
	ObjectID,
	UpdateCounterpartyNoteRequest,
} from "@/api/types";

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
 * Mutation to update counterparty note.
 */
export function useUpdateCounterpartyNote() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: ObjectID;
			payload: UpdateCounterpartyNoteRequest;
		}) => {
			const res = await bankService.updateCounterpartyNote(id, payload);
			return res.counterparty;
		},
		onSuccess: (updatedCounterparty: BankCounterparty) => {
			queryClient.setQueryData(
				queryKeys.counterparties.detail(updatedCounterparty.id),
				updatedCounterparty,
			);
			queryClient.invalidateQueries({
				queryKey: queryKeys.transactions.all,
			});
		},
	});
}
