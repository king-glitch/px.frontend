import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { queryKeys } from "@/api/query-keys";
import { bankService } from "@/api/services/bank-service";
import type { QueueItem } from "@/api/types";

export interface UseActiveQueuesOptions {
	tag?: string;
	onFinished?: () => void;
}

/**
 * Hook to monitor and poll active in-progress queue jobs (pending, dequeued, retry).
 * Automatically polls while items are in-progress and stops when queue is cleared.
 */
export function useActiveQueues(options: UseActiveQueuesOptions = {}) {
	const { tag = "bank.slip", onFinished } = options;
	const queryClient = useQueryClient();
	const prevCountRef = useRef<number>(0);

	const query = useQuery({
		queryKey: queryKeys.queue.list({
			tag,
			status: "pending,dequeued,retry",
		}),
		queryFn: async () => {
			const res = await bankService.listQueues({
				tag,
				status: "pending,dequeued,retry",
				limit: 100,
			});
			return res.queues || [];
		},
		// Poll every 2s if there are active items, otherwise don't poll
		refetchInterval: (queryState) => {
			const activeCount = queryState.state.data?.length ?? 0;
			return activeCount > 0 ? 2000 : false;
		},
	});

	const activeQueues: QueueItem[] = query.data || [];
	const hasActiveQueues = activeQueues.length > 0;

	// Invalidate transactions and summary when active items finish
	useEffect(() => {
		if (prevCountRef.current > 0 && activeQueues.length === 0) {
			queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.summary.all });
			onFinished?.();
		}
		prevCountRef.current = activeQueues.length;
	}, [activeQueues.length, queryClient, onFinished]);

	return {
		activeQueues,
		hasActiveQueues,
		isLoading: query.isLoading,
		refetch: query.refetch,
	};
}
