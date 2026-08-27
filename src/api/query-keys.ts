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
	duolingo: {
		all: ["duolingo"] as const,
		status: () => [...queryKeys.duolingo.all, "status"] as const,
		link: () => [...queryKeys.duolingo.all, "link"] as const,
	},
} as const;
