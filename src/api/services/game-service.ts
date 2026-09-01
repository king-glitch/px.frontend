import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/api/client";
import type {
	AscensionPath,
	Avatar,
	AwardHealthDayRequest,
	AwardResult,
	Buff,
	CategoryMasterySummary,
	Circle,
	CircleActivity,
	CircleActivitySummary,
	CircleGoal,
	CircleInvite,
	CircleMember,
	CircleSummary,
	Claim,
	CompleteQuestRequest,
	CreateCircleGoalInput,
	CreateCircleInput,
	CreateQuestRequest,
	CreateShopItemRequest,
	Goal,
	GoalSummary,
	HealthDaySummary,
	IngestHealthSamplesRequest,
	InventoryItem,
	InviteMemberInput,
	LedgerPage,
	Milestone,
	Perk,
	Player,
	PlayerSummary,
	Project,
	PurchaseResult,
	Quest,
	QuestCadence,
	QuestCategory,
	QuestEffort,
	QuestPage,
	QuestPrice,
	ReactToActivityInput,
	RecoverySummary,
	Review,
	ReviewSummary,
	RolloverQuestsRequest,
	ShopItem,
	ShopItemKind,
	TodayQuest,
	UpdateCircleInput,
	UpdateMemberSettingsInput,
	UpdateQuestRequest,
	CloseGoalRetrospectiveInput,
	GoalRetrospectiveSummary,
	WardrobeItem,
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
	 * Path: POST /api/v1/game/shop/items/:id/buy-and-equip
	 */
	async buyAndEquipItem(id: string): Promise<{ result: PurchaseResult }> {
		return apiPost<{ result: PurchaseResult }>(
			`/game/shop/items/${id}/buy-and-equip`,
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
	 * Path: GET /api/v1/game/avatar/wardrobe
	 */
	async listWardrobe(): Promise<{ wardrobe: WardrobeItem[] }> {
		return apiGet<{ wardrobe: WardrobeItem[] }>("/game/avatar/wardrobe");
	},

	/**
	 * Path: POST /api/v1/game/avatar/presets
	 */
	async saveAvatarPreset(name: string): Promise<{ avatar: Avatar }> {
		return apiPost<{ avatar: Avatar }>("/game/avatar/presets", { name });
	},

	/**
	 * Path: POST /api/v1/game/avatar/presets/:presetId/apply
	 */
	async applyAvatarPreset(presetId: string): Promise<{ avatar: Avatar }> {
		return apiPost<{ avatar: Avatar }>(
			`/game/avatar/presets/${presetId}/apply`,
		);
	},

	/**
	 * Path: DELETE /api/v1/game/avatar/presets/:presetId
	 */
	async deleteAvatarPreset(presetId: string): Promise<{ avatar: Avatar }> {
		return apiDelete<{ avatar: Avatar }>(
			`/game/avatar/presets/${presetId}`,
		);
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

	// --- Goals, Projects, Milestones ---
	async listGoals(): Promise<{ goals: GoalSummary[] }> {
		return apiGet<{ goals: GoalSummary[] }>("/game/goals");
	},

	async getGoalSummary(id: string): Promise<{ goal: GoalSummary }> {
		return apiGet<{ goal: GoalSummary }>(`/game/goals/${id}`);
	},

	async createGoal(payload: Partial<Goal>): Promise<{ goal: Goal }> {
		return apiPost<{ goal: Goal }>("/game/goals", payload);
	},

	async updateGoal(
		id: string,
		payload: Partial<Goal>,
	): Promise<{ goal: Goal }> {
		return apiPut<{ goal: Goal }>(`/game/goals/${id}`, payload);
	},

	async deleteGoal(id: string): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(`/game/goals/${id}`);
	},

	async completeGoal(id: string): Promise<{ award: AwardResult }> {
		return apiPost<{ award: AwardResult }>(`/game/goals/${id}/complete`);
	},

	async createProject(
		payload: Partial<Project>,
	): Promise<{ project: Project }> {
		return apiPost<{ project: Project }>("/game/projects", payload);
	},

	async updateProject(
		id: string,
		payload: Partial<Project>,
	): Promise<{ project: Project }> {
		return apiPut<{ project: Project }>(`/game/projects/${id}`, payload);
	},

	async deleteProject(id: string): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(`/game/projects/${id}`);
	},

	async createMilestone(
		payload: Partial<Milestone>,
	): Promise<{ milestone: Milestone }> {
		return apiPost<{ milestone: Milestone }>("/game/milestones", payload);
	},

	async updateMilestone(
		id: string,
		payload: Partial<Milestone>,
	): Promise<{ milestone: Milestone }> {
		return apiPut<{ milestone: Milestone }>(
			`/game/milestones/${id}`,
			payload,
		);
	},

	async deleteMilestone(id: string): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(`/game/milestones/${id}`);
	},

	async completeMilestone(id: string): Promise<{ award: AwardResult }> {
		return apiPost<{ award: AwardResult }>(
			`/game/milestones/${id}/complete`,
		);
	},



	// --- Recovery ---
	async getRecoverySummary(
		on?: string,
	): Promise<{ recovery: RecoverySummary }> {
		return apiGet<{ recovery: RecoverySummary }>("/game/recovery", {
			params: on ? { on } : undefined,
		});
	},

	async declareRestDay(on?: string): Promise<{ recovery: RecoverySummary }> {
		return apiPost<{ recovery: RecoverySummary }>(
			"/game/recovery/rest-day",
			{ on },
		);
	},

	async toggleVacationMode(
		enable: boolean,
		on?: string,
	): Promise<{ recovery: RecoverySummary }> {
		return apiPost<{ recovery: RecoverySummary }>(
			"/game/recovery/vacation",
			{ enable, on },
		);
	},

	// --- Reviews ---
	async getReviewSummary(
		type: "weekly" | "monthly",
		period: string,
	): Promise<{ summary: ReviewSummary }> {
		return apiGet<{ summary: ReviewSummary }>("/game/reviews/summary", {
			params: { type, period },
		});
	},

	async finalizeReview(payload: {
		period_type: "weekly" | "monthly";
		period: string;
		reflection_notes: string;
		next_priorities: string[];
	}): Promise<{ review: Review }> {
		return apiPost<{ review: Review }>("/game/reviews", payload);
	},

	async listReviews(
		page = 1,
		limit = 20,
	): Promise<{ reviews: Review[]; count: number; total_pages: number }> {
		return apiGet<{
			reviews: Review[];
			count: number;
			total_pages: number;
		}>("/game/reviews", {
			params: { page, limit },
		});
	},

	// --- Mastery & Ascension ---
	async getCategoryMasterySummary(): Promise<{
		mastery: CategoryMasterySummary;
	}> {
		return apiGet<{ mastery: CategoryMasterySummary }>("/game/masteries");
	},

	async setCategorySpecialization(
		primary: QuestCategory,
		secondary: QuestCategory,
	): Promise<{ mastery: CategoryMasterySummary }> {
		return apiPost<{ mastery: CategoryMasterySummary }>(
			"/game/masteries/specialize",
			{
				primary,
				secondary,
			},
		);
	},

	async ascendWithPath(path: AscensionPath): Promise<{ player: Player }> {
		return apiPost<{ player: Player }>("/game/player/ascend-path", {
			path,
		});
	},



	// --- Goal Retrospectives ---
	async closeGoalWithRetrospective(
		goalId: string,
		payload: CloseGoalRetrospectiveInput,
	): Promise<{ summary: GoalRetrospectiveSummary }> {
		return apiPost<{ summary: GoalRetrospectiveSummary }>(
			`/game/goals/${goalId}/retrospective`,
			payload,
		);
	},

	async getGoalRetrospective(
		goalId: string,
	): Promise<{ summary: GoalRetrospectiveSummary }> {
		return apiGet<{ summary: GoalRetrospectiveSummary }>(
			`/game/goals/${goalId}/retrospective`,
		);
	},

	// --- Circles (Persistent Co-op) ---
	async getCurrentCircle(): Promise<{ circle: CircleSummary }> {
		return apiGet<{ circle: CircleSummary }>("/game/circles/current");
	},

	async createCircle(
		payload: CreateCircleInput,
	): Promise<{ circle: CircleSummary }> {
		return apiPost<{ circle: CircleSummary }>("/game/circles", payload);
	},

	async updateCircle(
		payload: UpdateCircleInput,
	): Promise<{ circle: CircleSummary }> {
		return apiPatch<{ circle: CircleSummary }>(
			"/game/circles/current",
			payload,
		);
	},

	async leaveCircle(): Promise<{ deleted: boolean }> {
		return apiPost<{ deleted: boolean }>("/game/circles/current/leave");
	},

	async removeCircleMember(memberId: string): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(
			`/game/circles/current/members/${memberId}`,
		);
	},

	async updateMemberSettings(
		payload: UpdateMemberSettingsInput,
	): Promise<{ member: CircleMember }> {
		return apiPatch<{ member: CircleMember }>(
			"/game/circles/current/members/me",
			payload,
		);
	},

	async createCircleInvite(
		payload: InviteMemberInput,
	): Promise<{ invite: CircleInvite }> {
		return apiPost<{ invite: CircleInvite }>(
			"/game/circles/current/invites",
			payload,
		);
	},

	async listCircleInvites(): Promise<{ invites: CircleInvite[] }> {
		return apiGet<{ invites: CircleInvite[] }>(
			"/game/circles/current/invites",
		);
	},

	async acceptCircleInvite(code: string): Promise<{ circle: CircleSummary }> {
		return apiPost<{ circle: CircleSummary }>(
			`/game/circles/invites/${code}/accept`,
		);
	},

	async declineCircleInvite(code: string): Promise<{ deleted: boolean }> {
		return apiPost<{ deleted: boolean }>(
			`/game/circles/invites/${code}/decline`,
		);
	},

	async cancelCircleInvite(inviteId: string): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(
			`/game/circles/current/invites/${inviteId}`,
		);
	},

	async listCircleActivities(): Promise<{
		activities: CircleActivitySummary[];
	}> {
		return apiGet<{ activities: CircleActivitySummary[] }>(
			"/game/circles/current/activity",
		);
	},

	async reactToActivity(
		payload: ReactToActivityInput,
	): Promise<{ activity: CircleActivity }> {
		return apiPost<{ activity: CircleActivity }>(
			"/game/circles/current/reactions",
			payload,
		);
	},

	async nudgeMember(receiverUserId: string): Promise<{ deleted: boolean }> {
		return apiPost<{ deleted: boolean }>("/game/circles/current/nudges", {
			receiver_user_id: receiverUserId,
		});
	},

	async setCircleGoal(
		payload: CreateCircleGoalInput,
	): Promise<{ goal: CircleGoal }> {
		return apiPost<{ goal: CircleGoal }>(
			"/game/circles/current/goals",
			payload,
		);
	},

	async claimWeeklyCircleReward(
		weekId: string,
	): Promise<{ award: AwardResult }> {
		return apiPost<{ award: AwardResult }>(
			`/game/circles/current/rewards/${weekId}/claim`,
		);
	},
};
