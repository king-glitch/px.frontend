import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import { queryKeys } from "@/api/query-keys";
import { duolingoService } from "@/api/services/duolingo-service";
import type { ConnectDuolingoRequest } from "@/api/types";

/**
 * Hook to fetch the linked Duolingo account's stats.
 * A 404 (not yet connected) resolves to `data: null` instead of an error,
 * so callers can render a "connect your account" prompt.
 */
export function useDuolingoStatus() {
	return useQuery({
		queryKey: queryKeys.duolingo.status(),
		queryFn: async () => {
			try {
				const res = await duolingoService.getStatus();
				return res.status;
			} catch (err) {
				if (err instanceof ApiError && err.status === 404) {
					return null;
				}
				throw err;
			}
		},
	});
}

/**
 * Mutation to link the authenticated user's account to a Duolingo bot login.
 */
export function useConnectDuolingo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: ConnectDuolingoRequest) => {
			const res = await duolingoService.connect(payload);
			return res.link;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.duolingo.all });
		},
	});
}

/**
 * Mutation to unlink the authenticated user's Duolingo account.
 */
export function useDisconnectDuolingo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const res = await duolingoService.disconnect();
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.setQueryData(queryKeys.duolingo.status(), null);
			queryClient.invalidateQueries({ queryKey: queryKeys.duolingo.all });
		},
	});
}
