import { apiDelete, apiGet, apiPost, apiPut } from "@/api/client";
import type {
	Avatar,
	AwardHealthDayRequest,
	AwardResult,
	Buff,
	Claim,
	CompleteQuestRequest,
	CreateQuestRequest,
	CreateShopItemRequest,
	HealthDaySummary,
	IngestHealthSamplesRequest,
	InventoryItem,
	LedgerPage,
	Perk,
	Player,
	PlayerSummary,
	PurchaseResult,
	Quest,
	TodayQuest,
	QuestCadence,
	QuestEffort,
	QuestPage,
	QuestPrice,
	RolloverQuestsRequest,
	ShopItem,
	ShopItemKind,
	UpdateQuestRequest,
} from "@/api/types";

export const gameService = {
	/**
	 * Path: GET /api/v1/game/player/summary
	 */
	async getPlayerSummary(): Promise<{ summary: PlayerSummary }> {
		return apiGet<{ summary: PlayerSummary }>("/game/player/summary");
	},

	/**
	 * Path: POST /api/v1/game/player/ascend
	 */
	async ascend(): Promise<{ player: Player }> {
		return apiPost<{ player: Player }>("/game/player/ascend");
	},

	/**
	 * Path: POST /api/v1/game/player/perks/:perkId/spend
	 */
	async spendPerk(perkId: string): Promise<{ perk: Perk }> {
		return apiPost<{ perk: Perk }>(`/game/player/perks/${perkId}/spend`);
	},

	/**
	 * Path: GET /api/v1/game/player/ledger
	 */
	async listLedger(page = 1, limit = 20): Promise<LedgerPage> {
		return apiGet<LedgerPage>("/game/player/ledger", {
			params: { page, limit },
		});
	},

	/**
	 * Path: POST /api/v1/game/quests
	 */
	async createQuest(payload: CreateQuestRequest): Promise<{ quest: Quest }> {
		return apiPost<{ quest: Quest }, CreateQuestRequest>(
			"/game/quests",
			payload,
		);
	},

	/**
	 * Path: GET /api/v1/game/quests
	 */
	async listQuests(page = 1, limit = 20): Promise<QuestPage> {
		return apiGet<QuestPage>("/game/quests", { params: { page, limit } });
	},

	/**
	 * Path: GET /api/v1/game/quests/today
	 */
	async listTodayQuests(on?: string): Promise<{ quests: TodayQuest[] }> {
		return apiGet<{ quests: TodayQuest[] }>("/game/quests/today", {
			params: on ? { on } : undefined,
		});
	},

	/**
	 * Path: GET /api/v1/game/quests/price-preview
	 */
	async previewQuestPrice(
		effort: QuestEffort,
		cadence: QuestCadence,
		minutes: number,
	): Promise<{ price: QuestPrice }> {
		return apiGet<{ price: QuestPrice }>("/game/quests/price-preview", {
			params: { effort, cadence, minutes },
		});
	},

	/**
	 * Path: PUT /api/v1/game/quests/:id
	 */
	async updateQuest(
		id: string,
		payload: UpdateQuestRequest,
	): Promise<{ quest: Quest }> {
		return apiPut<{ quest: Quest }, UpdateQuestRequest>(
			`/game/quests/${id}`,
			payload,
		);
	},

	/**
	 * Path: DELETE /api/v1/game/quests/:id
	 */
	async deleteQuest(id: string): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(`/game/quests/${id}`);
	},

	/**
	 * Path: POST /api/v1/game/quests/:id/complete
	 */
	async completeQuest(
		id: string,
		payload: CompleteQuestRequest,
	): Promise<{ award: AwardResult }> {
		return apiPost<{ award: AwardResult }, CompleteQuestRequest>(
			`/game/quests/${id}/complete`,
			payload,
		);
	},

	/**
	 * Path: DELETE /api/v1/game/quests/:id/complete
	 */
	async undoCompleteQuest(
		id: string,
		on?: string,
	): Promise<{ undone: boolean }> {
		return apiDelete<{ undone: boolean }>(`/game/quests/${id}/complete`, {
			params: on ? { on } : undefined,
		});
	},

	/**
	 * Path: POST /api/v1/game/quests/rollover
	 */
	async rolloverQuests(
		payload: RolloverQuestsRequest,
	): Promise<{ rolled_over: boolean }> {
		return apiPost<{ rolled_over: boolean }, RolloverQuestsRequest>(
			"/game/quests/rollover",
			payload,
		);
	},

	/**
	 * Path: GET /api/v1/game/shop/catalog
	 */
	async listCatalog(kind?: ShopItemKind): Promise<{ items: ShopItem[] }> {
		return apiGet<{ items: ShopItem[] }>("/game/shop/catalog", {
			params: kind ? { kind } : undefined,
		});
	},

	/**
	 * Path: GET /api/v1/game/shop/suggest-price
	 */
	async suggestPrice(realCost: number): Promise<{ price_px: number }> {
		return apiGet<{ price_px: number }>("/game/shop/suggest-price", {
			params: { real_cost: realCost },
		});
	},

	/**
	 * Path: POST /api/v1/game/shop/items
	 */
	async createShopItem(
		payload: CreateShopItemRequest,
	): Promise<{ item: ShopItem }> {
		return apiPost<{ item: ShopItem }, CreateShopItemRequest>(
			"/game/shop/items",
			payload,
		);
	},

	/**
	 * Path: DELETE /api/v1/game/shop/items/:id
	 */
	async deleteShopItem(id: string): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(`/game/shop/items/${id}`);
	},

	/**
	 * Path: POST /api/v1/game/shop/items/:id/purchase
	 */
	async purchaseItem(id: string): Promise<{ result: PurchaseResult }> {
		return apiPost<{ result: PurchaseResult }>(
			`/game/shop/items/${id}/purchase`,
		);
	},

	/**
	 * Path: GET /api/v1/game/avatar
	 */
	async getAvatar(): Promise<{ avatar: Avatar }> {
		return apiGet<{ avatar: Avatar }>("/game/avatar");
	},

	/**
	 * Path: PUT /api/v1/game/avatar
	 */
	async updateAvatar(
		equipped: Record<string, string>,
	): Promise<{ avatar: Avatar }> {
		return apiPut<{ avatar: Avatar }>("/game/avatar", { equipped });
	},

	/**
	 * Path: GET /api/v1/game/shop/inventory
	 */
	async listInventory(): Promise<{ items: InventoryItem[] }> {
		return apiGet<{ items: InventoryItem[] }>("/game/shop/inventory");
	},

	/**
	 * Path: POST /api/v1/game/shop/inventory/:id/use
	 */
	async useInventoryItem(id: string): Promise<{ buff: Buff | null }> {
		return apiPost<{ buff: Buff | null }>(`/game/shop/inventory/${id}/use`);
	},

	/**
	 * Path: GET /api/v1/game/shop/claims
	 */
	async listClaims(): Promise<{ claims: Claim[] }> {
		return apiGet<{ claims: Claim[] }>("/game/shop/claims");
	},

	/**
	 * Path: POST /api/v1/game/shop/claims/:id/redeem
	 */
	async redeemClaim(id: string): Promise<{ claim: Claim }> {
		return apiPost<{ claim: Claim }>(`/game/shop/claims/${id}/redeem`);
	},

	/**
	 * Path: POST /api/v1/game/health/samples
	 */
	async ingestHealthSamples(
		payload: IngestHealthSamplesRequest,
	): Promise<{ inserted: number }> {
		return apiPost<{ inserted: number }, IngestHealthSamplesRequest>(
			"/game/health/samples",
			payload,
		);
	},

	/**
	 * Path: GET /api/v1/game/health/summary
	 */
	async getHealthSummary(
		day?: string,
	): Promise<{ summary: HealthDaySummary }> {
		return apiGet<{ summary: HealthDaySummary }>("/game/health/summary", {
			params: day ? { day } : undefined,
		});
	},

	/**
	 * Path: POST /api/v1/game/health/award
	 */
	async awardHealth(
		payload: AwardHealthDayRequest,
	): Promise<{ award: AwardResult }> {
		return apiPost<{ award: AwardResult }, AwardHealthDayRequest>(
			"/game/health/award",
			payload,
		);
	},
};
