/**
 * Centralized Application Configuration
 * Contains static constants, API base URLs, storage keys, and pagination defaults.
 */

export const config = {
	api: {
		baseUrl: import.meta.env.VITE_BACKEND_ENDPOINT || "/api/v1",
		timeoutMs: 15000,
	},
	storage: {
		tokenKey: "px_session_token",
		userKey: "px_user_data",
	},
	pagination: {
		defaultPage: 1,
		defaultLimit: 10,
		pageSizes: [10, 20, 50, 100],
	},
	dateFormat: {
		displayDate: "dd MMM yyyy",
		displayDateTime: "dd MMM yyyy, HH:mm",
		isoDate: "yyyy-MM-dd",
	},
	polling: {
		queueIntervalMs: 1500,
		queueMaxRetries: 30,
	},
} as const;

export type AppConfig = typeof config;
