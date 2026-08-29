import type {
	CurrencyType,
	QuestCadence,
	QuestEffort,
	ShopItemKind,
} from "./types";

export const queryKeys = {
	auth: {
		all: ["auth"] as const,
		me: () => [...queryKeys.auth.all, "me"] as const,
	},
	user: {
		all: ["user"] as const,
		me: () => [...queryKeys.user.all, "me"] as const,
	},
	duolingo: {
		all: ["duolingo"] as const,
		status: () => [...queryKeys.duolingo.all, "status"] as const,
	},
	currency: {
		all: ["currency"] as const,
		balance: (type?: CurrencyType) =>
			[...queryKeys.currency.all, "balance", type ?? "px"] as const,
		transactions: (type?: CurrencyType, page = 1, limit = 20) =>
			[
				...queryKeys.currency.all,
				"transactions",
				type ?? "px",
				page,
				limit,
			] as const,
	},
	game: {
		all: ["game"] as const,
		playerSummary: () => [...queryKeys.game.all, "player-summary"] as const,
		ledger: (page = 1, limit = 20) =>
			[...queryKeys.game.all, "ledger", page, limit] as const,
		quests: (page = 1, limit = 20) =>
			[...queryKeys.game.all, "quests", page, limit] as const,
		todayQuests: (on?: string) =>
			[...queryKeys.game.all, "today-quests", on ?? "today"] as const,
		pricePreview: (
			effort: QuestEffort,
			cadence: QuestCadence,
			minutes: number,
		) =>
			[
				...queryKeys.game.all,
				"price-preview",
				effort,
				cadence,
				minutes,
			] as const,
		catalog: (kind?: ShopItemKind) =>
			[...queryKeys.game.all, "catalog", kind ?? "all"] as const,
		inventory: () => [...queryKeys.game.all, "inventory"] as const,
		claims: () => [...queryKeys.game.all, "claims"] as const,
		healthSummary: (day?: string) =>
			[...queryKeys.game.all, "health-summary", day ?? "today"] as const,
	},
	finance: {
		all: ["finance"] as const,
		entries: (page = 1, limit = 20) =>
			[...queryKeys.finance.all, "entries", page, limit] as const,
		budgets: () => [...queryKeys.finance.all, "budgets"] as const,
		summary: (period?: string) =>
			[...queryKeys.finance.all, "summary", period ?? "current"] as const,
		pxPerUnit: () => [...queryKeys.finance.all, "px-per-unit"] as const,
	},
};
