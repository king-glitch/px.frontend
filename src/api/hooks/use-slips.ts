import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { config } from "@/config";
import { queryKeys } from "@/api/query-keys";
import { bankService } from "@/api/services/bank-service";
import type { ObjectID, QueueItem, UploadSlipResponse } from "@/api/types";

/**
 * Mutation to upload a bank transfer slip image.
 */
export function useUploadSlip() {
	return useMutation({
		mutationFn: async (file: File | Blob) => {
			const res = await bankService.uploadSlip(file);
			return res;
		},
	});
}

/**
 * Hook to poll the queue status of a bank slip OCR job.
 * Automatically polls every interval until completed, failed, or canceled.
 */
export function useQueueStatus(
	queueId?: ObjectID,
	options?: {
		enabled?: boolean;
		onCompleted?: (item: QueueItem) => void;
		onFailed?: (item: QueueItem) => void;
	},
) {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: queryKeys.queue.detail(queueId || ""),
		queryFn: async () => {
			if (!queueId) throw new Error("Queue ID is required");
			const item = await bankService.getQueueStatus(queueId);

			if (item.status === "completed") {
				queryClient.invalidateQueries({
					queryKey: queryKeys.transactions.all,
				});
				options?.onCompleted?.(item);
			} else if (item.status === "failed" || item.status === "canceled") {
				options?.onFailed?.(item);
			}

			return item;
		},
		enabled:
			Boolean(queueId) &&
			(options?.enabled !== undefined ? options.enabled : true),
		refetchInterval: (query) => {
			const status = query.state.data?.status;
			if (
				!status ||
				status === "pending" ||
				status === "dequeued" ||
				status === "retry"
			) {
				return config.polling.queueIntervalMs;
			}
			// Stop polling when completed, failed, canceled, or unknown
			return false;
		},
		refetchIntervalInBackground: true,
	});
}
