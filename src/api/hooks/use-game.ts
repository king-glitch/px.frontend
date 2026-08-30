import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { gameService } from "@/api/services/game-service";
import type {
	CreateQuestRequest,
	CreateShopItemRequest,
	IngestHealthSamplesRequest,
	QuestCadence,
	QuestEffort,
	RolloverQuestsRequest,
	ShopItemKind,
	UpdateQuestRequest,
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
