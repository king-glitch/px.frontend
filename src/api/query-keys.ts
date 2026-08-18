import type { ListTransactionsParams, ObjectID } from "@/api/types";

/**
 * Centralized Query Key factory for TanStack React Query.
 * Ensures consistent cache management and invalidation throughout the app.
 */
export const queryKeys = {
	auth: {
		all: ["auth"] as const,
		session: () => [...queryKeys.auth.all, "session"] as const,
	},
	user: {
		all: ["user"] as const,
		me: () => [...queryKeys.user.all, "me"] as const,
	},
	categories: {
		all: ["categories"] as const,
		lists: () => [...queryKeys.categories.all, "list"] as const,
		detail: (id: ObjectID) =>
			[...queryKeys.categories.all, "detail", id] as const,
	},
	transactions: {
		all: ["transactions"] as const,
		lists: () => [...queryKeys.transactions.all, "list"] as const,
		list: (params?: ListTransactionsParams) =>
			[...queryKeys.transactions.lists(), params ?? {}] as const,
		detail: (id: ObjectID) =>
			[...queryKeys.transactions.all, "detail", id] as const,
	},
	counterparties: {
		all: ["counterparties"] as const,
		detail: (id: ObjectID) =>
			[...queryKeys.counterparties.all, "detail", id] as const,
	},
	queue: {
		all: ["queue"] as const,
		detail: (id: ObjectID) =>
			[...queryKeys.queue.all, "detail", id] as const,
	},
	mailInbox: {
		all: ["mail-inbox"] as const,
		me: () => [...queryKeys.mailInbox.all, "me"] as const,
	},
} as const;
