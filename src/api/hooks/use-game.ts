import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { gameService } from "@/api/services/game-service";
import type {
	AscensionPath,
	CreateCircleGoalInput,
	CreateCircleInput,
	CreateQuestRequest,
	CreateShopItemRequest,
	Goal,
	IngestHealthSamplesRequest,
	InviteMemberInput,
	Milestone,
	Project,
	QuestCadence,
	QuestCategory,
	QuestEffort,
	ReactToActivityInput,
	RolloverQuestsRequest,
	Routine,
	ShopItemKind,
	UpdateCircleInput,
	UpdateMemberSettingsInput,
	UpdateQuestRequest,
	ScheduleQuestInput,
	RescheduleQuestInput,
	UpdateWorkloadConfigInput,
	CloseGoalRetrospectiveInput,
} from "@/api/types";

function today(): string {
	return new Date().toISOString().split("T")[0];
}

/**
 * Hook to fetch the player's summary (level, exp, px, attributes, buffs, perks).
 */
export function usePlayerSummary() {
	return useQuery({
		queryKey: queryKeys.game.playerSummary(),
		queryFn: async () => {
			const res = await gameService.getPlayerSummary();
			return res.summary;
		},
	});
}

/**
 * Mutation to ascend the player once max level is reached.
 */
export function useAscendPlayer() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const res = await gameService.ascend();
			return res.player;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.playerSummary(),
			});
		},
	});
}

/**
 * Mutation to spend a skill point on a perk.
 */
export function useSpendPerk() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (perkId: string) => {
			const res = await gameService.spendPerk(perkId);
			return res.perk;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.playerSummary(),
			});
		},
	});
}

/**
 * Hook to fetch the paginated award ledger.
 */
export function useLedger(page = 1, limit = 20) {
	return useQuery({
		queryKey: queryKeys.game.ledger(page, limit),
		queryFn: async () => {
			const res = await gameService.listLedger(page, limit);
			return { ...res, entries: res.entries ?? [] };
		},
	});
}

/**
 * Mutation to create a quest.
 */
export function useCreateQuest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CreateQuestRequest) => {
			const res = await gameService.createQuest(payload);
			return res.quest;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

/**
 * Hook to fetch the paginated quest list.
 */
export function useQuests(page = 1, limit = 20) {
	return useQuery({
		queryKey: queryKeys.game.quests(page, limit),
		queryFn: async () => {
			const res = await gameService.listQuests(page, limit);
			return { ...res, quests: res.quests ?? [] };
		},
	});
}

/**
 * Hook to fetch today's quests.
 */
export function useTodayQuests(on?: string) {
	return useQuery({
		queryKey: queryKeys.game.todayQuests(on),
		queryFn: async () => {
			const res = await gameService.listTodayQuests(on);
			return res.quests ?? [];
		},
	});
}

/**
 * Hook to preview the exp/px price of a quest before creating it.
 */
export function useQuestPricePreview(
	effort: QuestEffort,
	cadence: QuestCadence,
	minutes: number,
) {
	return useQuery({
		queryKey: queryKeys.game.pricePreview(effort, cadence, minutes),
		queryFn: async () => {
			const res = await gameService.previewQuestPrice(
				effort,
				cadence,
				minutes,
			);
			return res.price;
		},
		enabled: Boolean(effort && cadence),
	});
}

/**
 * Mutation to update a quest.
 */
export function useUpdateQuest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateQuestRequest;
		}) => {
			const res = await gameService.updateQuest(id, payload);
			return res.quest;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

/**
 * Mutation to delete a quest.
 */
export function useDeleteQuest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => gameService.deleteQuest(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

/**
 * Mutation to complete a quest. Returns the AwardResult so the UI can
 * animate exp/px gains directly from the mutation's result.
 */
export function useCompleteQuest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, on }: { id: string; on?: string }) => {
			const res = await gameService.completeQuest(id, {
				on: on ?? today(),
			});
			return res.award;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.currency.all });
		},
	});
}

/**
 * Mutation to undo a quest completion.
 */
export function useUndoCompleteQuest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, on }: { id: string; on?: string }) =>
			gameService.undoCompleteQuest(id, on),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.currency.all });
		},
	});
}

/**
 * Mutation to roll over quests into a new cadence window.
 */
export function useRolloverQuests() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: RolloverQuestsRequest) =>
			gameService.rolloverQuests(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

/**
 * Hook to fetch the shop catalog, optionally filtered by kind.
 */
export function useShopCatalog(kind?: ShopItemKind) {
	return useQuery({
		queryKey: queryKeys.game.catalog(kind),
		queryFn: async () => {
			const res = await gameService.listCatalog(kind);
			return res.items ?? [];
		},
	});
}

/**
 * Hook to suggest a px price for a given real-world cost.
 */
export function useSuggestPrice(realCost: number) {
	return useQuery({
		queryKey: [...queryKeys.game.all, "suggest-price", realCost] as const,
		queryFn: async () => {
			const res = await gameService.suggestPrice(realCost);
			return res.price_px;
		},
		enabled: realCost > 0,
	});
}

/**
 * Mutation to create a shop item.
 */
export function useCreateShopItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CreateShopItemRequest) => {
			const res = await gameService.createShopItem(payload);
			return res.item;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

/**
 * Mutation to delete a shop item.
 */
export function useDeleteShopItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => gameService.deleteShopItem(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

/**
 * Mutation to purchase a shop item.
 */
export function usePurchaseItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await gameService.purchaseItem(id);
			return res.result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.currency.all });
		},
	});
}

/**
 * Hook to fetch the player's inventory.
 */
export function useInventory() {
	return useQuery({
		queryKey: queryKeys.game.inventory(),
		queryFn: async () => {
			const res = await gameService.listInventory();
			return res.items ?? [];
		},
	});
}

/**
 * Mutation to equip/unequip cosmetic items on the player's avatar.
 */
export function useUpdateAvatar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (equipped: Record<string, string>) => {
			const res = await gameService.updateAvatar(equipped);
			return res.avatar;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.playerSummary(),
			});
		},
	});
}

/**
 * Mutation to use a consumable inventory item.
 */
export function useUseInventoryItem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await gameService.useInventoryItem(id);
			return res.buff;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

/**
 * Hook to fetch pending/owned reward claims.
 */
export function useClaims() {
	return useQuery({
		queryKey: queryKeys.game.claims(),
		queryFn: async () => {
			const res = await gameService.listClaims();
			return res.claims ?? [];
		},
	});
}

/**
 * Mutation to redeem a claim.
 */
export function useRedeemClaim() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await gameService.redeemClaim(id);
			return res.claim;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

/**
 * Mutation to ingest health samples for a day.
 */
export function useIngestHealthSamples() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: IngestHealthSamplesRequest) => {
			const res = await gameService.ingestHealthSamples(payload);
			return res.inserted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

/**
 * Hook to fetch a day's health summary.
 */
export function useHealthDay(day?: string) {
	return useQuery({
		queryKey: queryKeys.game.healthSummary(day),
		queryFn: async () => {
			const res = await gameService.getHealthSummary(day);
			return res.summary;
		},
	});
}

/**
 * Mutation to award exp/px for a day's logged health metrics.
 */
export function useAwardHealthDay() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (day: string) => {
			const res = await gameService.awardHealth({ day });
			return res.award;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.currency.all });
		},
	});
}

// ==========================================
// Goals, Projects & Milestones Hooks
// ==========================================

export function useGoals() {
	return useQuery({
		queryKey: queryKeys.game.goals(),
		queryFn: async () => {
			const res = await gameService.listGoals();
			return res.goals;
		},
	});
}

export function useGoalSummary(id: string) {
	return useQuery({
		queryKey: queryKeys.game.goalSummary(id),
		queryFn: async () => {
			const res = await gameService.getGoalSummary(id);
			return res.goal;
		},
		enabled: !!id,
	});
}

export function useCreateGoal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: Partial<Goal>) => {
			const res = await gameService.createGoal(payload);
			return res.goal;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.goals() });
		},
	});
}

export function useUpdateGoal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: string;
			payload: Partial<Goal>;
		}) => {
			const res = await gameService.updateGoal(id, payload);
			return res.goal;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.goals() });
		},
	});
}

export function useDeleteGoal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await gameService.deleteGoal(id);
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.goals() });
		},
	});
}

export function useCompleteGoal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await gameService.completeGoal(id);
			return res.award;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.currency.all });
		},
	});
}

export function useCreateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: Partial<Project>) => {
			const res = await gameService.createProject(payload);
			return res.project;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.goals() });
		},
	});
}

export function useUpdateProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: string;
			payload: Partial<Project>;
		}) => {
			const res = await gameService.updateProject(id, payload);
			return res.project;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.goals() });
		},
	});
}

export function useDeleteProject() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await gameService.deleteProject(id);
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.goals() });
		},
	});
}

export function useCreateMilestone() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: Partial<Milestone>) => {
			const res = await gameService.createMilestone(payload);
			return res.milestone;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.goals() });
		},
	});
}

export function useUpdateMilestone() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: string;
			payload: Partial<Milestone>;
		}) => {
			const res = await gameService.updateMilestone(id, payload);
			return res.milestone;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.goals() });
		},
	});
}

export function useDeleteMilestone() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await gameService.deleteMilestone(id);
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.goals() });
		},
	});
}

export function useCompleteMilestone() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await gameService.completeMilestone(id);
			return res.award;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.currency.all });
		},
	});
}

// ==========================================
// Routines Hooks
// ==========================================

export function useRoutines() {
	return useQuery({
		queryKey: queryKeys.game.routines(),
		queryFn: async () => {
			const res = await gameService.listRoutines();
			return res.routines;
		},
	});
}

export function useCreateRoutine() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: Partial<Routine>) => {
			const res = await gameService.createRoutine(payload);
			return res.routine;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.routines(),
			});
		},
	});
}

export function useUpdateRoutine() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: string;
			payload: Partial<Routine>;
		}) => {
			const res = await gameService.updateRoutine(id, payload);
			return res.routine;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.routines(),
			});
		},
	});
}

export function useDeleteRoutine() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await gameService.deleteRoutine(id);
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.routines(),
			});
		},
	});
}

// ==========================================
// Recovery Hooks
// ==========================================

export function useRecovery(on?: string) {
	return useQuery({
		queryKey: queryKeys.game.recovery(on),
		queryFn: async () => {
			const res = await gameService.getRecoverySummary(on);
			return res.recovery;
		},
	});
}

export function useDeclareRestDay() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (on?: string) => {
			const res = await gameService.declareRestDay(on);
			return res.recovery;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

export function useToggleVacation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			enable,
			on,
		}: {
			enable: boolean;
			on?: string;
		}) => {
			const res = await gameService.toggleVacationMode(enable, on);
			return res.recovery;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

// ==========================================
// Reviews Hooks
// ==========================================

export function useReviewSummary(type: "weekly" | "monthly", period: string) {
	return useQuery({
		queryKey: queryKeys.game.reviewSummary(type, period),
		queryFn: async () => {
			const res = await gameService.getReviewSummary(type, period);
			return res.summary;
		},
		enabled: !!period,
	});
}

export function useFinalizeReview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: {
			period_type: "weekly" | "monthly";
			period: string;
			reflection_notes: string;
			next_priorities: string[];
		}) => {
			const res = await gameService.finalizeReview(payload);
			return res.review;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.currency.all });
		},
	});
}

export function useReviews(page = 1, limit = 20) {
	return useQuery({
		queryKey: queryKeys.game.reviews(page, limit),
		queryFn: async () => {
			return gameService.listReviews(page, limit);
		},
	});
}

// ==========================================
// Category Mastery & Ascension Hooks
// ==========================================

export function useCategoryMastery() {
	return useQuery({
		queryKey: queryKeys.game.masteries(),
		queryFn: async () => {
			const res = await gameService.getCategoryMasterySummary();
			return res.mastery;
		},
	});
}

export function useSetSpecialization() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			primary,
			secondary,
		}: {
			primary: QuestCategory;
			secondary: QuestCategory;
		}) => {
			const res = await gameService.setCategorySpecialization(
				primary,
				secondary,
			);
			return res.mastery;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.masteries(),
			});
		},
	});
}

export function useAscendWithPath() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (path: AscensionPath) => {
			const res = await gameService.ascendWithPath(path);
			return res.player;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.playerSummary(),
			});
		},
	});
}

// ==========================================
// Calendar & Workload Hooks
// ==========================================

export function useCalendarEvents(from?: string, to?: string) {
	return useQuery({
		queryKey: queryKeys.game.calendarEvents(from, to),
		queryFn: async () => {
			const res = await gameService.getCalendarEvents(from, to);
			return res.events;
		},
	});
}

export function useScheduleQuest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: ScheduleQuestInput) => {
			const res = await gameService.scheduleQuest(payload);
			return res.event;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

export function useRescheduleQuest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: RescheduleQuestInput) => {
			const res = await gameService.rescheduleQuest(payload);
			return res.event;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

export function useDeleteScheduledEvent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await gameService.deleteScheduledEvent(id);
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

export function useWorkloadCapacity(from?: string, to?: string) {
	return useQuery({
		queryKey: queryKeys.game.workloadCapacity(from, to),
		queryFn: async () => {
			const res = await gameService.getWorkloadCapacity(from, to);
			return res.workload;
		},
	});
}

export function useUpdateWorkloadConfig() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: UpdateWorkloadConfigInput) => {
			const res = await gameService.updateWorkloadConfig(payload);
			return res.config;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

// ==========================================
// Goal Retrospective Hooks
// ==========================================

export function useCloseGoalWithRetrospective() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			goalId,
			payload,
		}: {
			goalId: string;
			payload: CloseGoalRetrospectiveInput;
		}) => {
			const res = await gameService.closeGoalWithRetrospective(
				goalId,
				payload,
			);
			return res.summary;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.game.goals() });
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
		},
	});
}

export function useGoalRetrospective(goalId: string) {
	return useQuery({
		queryKey: queryKeys.game.goalRetrospective(goalId),
		queryFn: async () => {
			const res = await gameService.getGoalRetrospective(goalId);
			return res.summary;
		},
		enabled: !!goalId,
	});
}

// ==========================================
// Circle (Persistent Co-op) Hooks
// ==========================================

export function useCurrentCircle() {
	return useQuery({
		queryKey: queryKeys.game.circle(),
		queryFn: async () => {
			const res = await gameService.getCurrentCircle();
			return res.circle;
		},
		retry: false,
	});
}

export function useCreateCircle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CreateCircleInput) => {
			const res = await gameService.createCircle(payload);
			return res.circle;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circle(),
			});
		},
	});
}

export function useUpdateCircle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: UpdateCircleInput) => {
			const res = await gameService.updateCircle(payload);
			return res.circle;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circle(),
			});
		},
	});
}

export function useLeaveCircle() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const res = await gameService.leaveCircle();
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circle(),
			});
		},
	});
}

export function useRemoveCircleMember() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (memberId: string) => {
			const res = await gameService.removeCircleMember(memberId);
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circle(),
			});
		},
	});
}

export function useUpdateMemberSettings() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: UpdateMemberSettingsInput) => {
			const res = await gameService.updateMemberSettings(payload);
			return res.member;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circle(),
			});
		},
	});
}

export function useCircleInvites() {
	return useQuery({
		queryKey: queryKeys.game.circleInvites(),
		queryFn: async () => {
			const res = await gameService.listCircleInvites();
			return res.invites;
		},
	});
}

export function useCreateCircleInvite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: InviteMemberInput) => {
			const res = await gameService.createCircleInvite(payload);
			return res.invite;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circleInvites(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circle(),
			});
		},
	});
}

export function useAcceptCircleInvite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (code: string) => {
			const res = await gameService.acceptCircleInvite(code);
			return res.circle;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circle(),
			});
		},
	});
}

export function useDeclineCircleInvite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (code: string) => {
			const res = await gameService.declineCircleInvite(code);
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circleInvites(),
			});
		},
	});
}

export function useCancelCircleInvite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (inviteId: string) => {
			const res = await gameService.cancelCircleInvite(inviteId);
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circleInvites(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circle(),
			});
		},
	});
}

export function useCircleActivities() {
	return useQuery({
		queryKey: queryKeys.game.circleActivities(),
		queryFn: async () => {
			const res = await gameService.listCircleActivities();
			return res.activities;
		},
		refetchInterval: 15000,
	});
}

export function useReactToActivity() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: ReactToActivityInput) => {
			const res = await gameService.reactToActivity(payload);
			return res.activity;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circleActivities(),
			});
		},
	});
}

export function useNudgeMember() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (receiverUserId: string) => {
			const res = await gameService.nudgeMember(receiverUserId);
			return res.deleted;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circle(),
			});
		},
	});
}

export function useSetCircleGoal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CreateCircleGoalInput) => {
			const res = await gameService.setCircleGoal(payload);
			return res.goal;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circle(),
			});
		},
	});
}

export function useClaimWeeklyCircleReward() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (weekId: string) => {
			const res = await gameService.claimWeeklyCircleReward(weekId);
			return res.award;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.game.circle(),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.game.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.currency.all });
		},
	});
}
