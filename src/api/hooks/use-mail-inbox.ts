import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { bankService } from "@/api/services/bank-service";
import type { MailInboxResponse } from "@/api/types";

/**
 * Hook to fetch the authenticated user's unique forwarding email inbox address.
 */
export function useMailInbox(options?: { enabled?: boolean }) {
	return useQuery<MailInboxResponse>({
		queryKey: queryKeys.mailInbox.me(),
		queryFn: async () => {
			const res = await bankService.getMailInbox();
			return res;
		},
		enabled: options?.enabled,
	});
}
