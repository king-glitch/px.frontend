import type {
	DateRangeParams,
	DimensionBreakdownParams,
	ListAccountsParams,
	ListTransactionsParams,
	ObjectID,
	TimeSeriesParams,
} from "@/api/types";

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
	banks: {
		all: ["banks"] as const,
		lists: () => [...queryKeys.banks.all, "list"] as const,
		detail: (id: ObjectID) =>
			[...queryKeys.banks.all, "detail", id] as const,
	},
	accounts: {
		all: ["accounts"] as const,
		lists: () => [...queryKeys.accounts.all, "list"] as const,
		list: (params?: ListAccountsParams) =>
			[...queryKeys.accounts.lists(), params ?? {}] as const,
		detail: (id: ObjectID) =>
			[...queryKeys.accounts.all, "detail", id] as const,
	},
	summary: {
		all: ["summary"] as const,
		range: (params?: DateRangeParams) =>
			[...queryKeys.summary.all, "range", params ?? {}] as const,
		timeseries: (params?: TimeSeriesParams) =>
			[...queryKeys.summary.all, "timeseries", params ?? {}] as const,
		breakdown: (params: DimensionBreakdownParams) =>
			[...queryKeys.summary.all, "breakdown", params] as const,
	},
	queue: {
		all: ["queue"] as const,
		lists: () => [...queryKeys.queue.all, "list"] as const,
		list: (params?: Record<string, unknown>) =>
			[...queryKeys.queue.lists(), params ?? {}] as const,
		detail: (id: ObjectID) =>
			[...queryKeys.queue.all, "detail", id] as const,
	},
	mailInbox: {
		all: ["mail-inbox"] as const,
		me: () => [...queryKeys.mailInbox.all, "me"] as const,
	},
} as const;
