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
		wardrobe: () => [...queryKeys.game.all, "wardrobe"] as const,
		presets: () => [...queryKeys.game.all, "presets"] as const,
		inventory: () => [...queryKeys.game.all, "inventory"] as const,
		claims: () => [...queryKeys.game.all, "claims"] as const,
		healthSummary: (day?: string) =>
			[...queryKeys.game.all, "health-summary", day ?? "today"] as const,
		goals: () => [...queryKeys.game.all, "goals"] as const,
		goalSummary: (id: string) =>
			[...queryKeys.game.all, "goal", id] as const,
		recovery: (on?: string) =>
			[...queryKeys.game.all, "recovery", on ?? "today"] as const,
		reviewSummary: (type: string, period: string) =>
			[...queryKeys.game.all, "review-summary", type, period] as const,
		reviews: (page = 1, limit = 20) =>
			[...queryKeys.game.all, "reviews", page, limit] as const,
		masteries: () => [...queryKeys.game.all, "masteries"] as const,
		goalRetrospective: (goalId: string) =>
			[...queryKeys.game.all, "goal-retrospective", goalId] as const,
		circle: () => [...queryKeys.game.all, "circle"] as const,
		circleInvites: () => [...queryKeys.game.all, "circle-invites"] as const,
		circleActivities: () =>
			[...queryKeys.game.all, "circle-activities"] as const,
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
