import { apiDelete, apiGet, apiPost, apiPut } from "@/api/client";
import type {
	AwardResult,
	CreateFinanceBudgetRequest,
	CreateFinanceEntryRequest,
	FinanceBudget,
	FinanceEntry,
	FinanceEntryPage,
	FinanceSummary,
	UpdateFinanceBudgetRequest,
	UpdateFinanceEntryRequest,
} from "@/api/types";

export const financeService = {
	/**
	 * Path: POST /api/v1/finance/entries
	 */
	async createEntry(
		payload: CreateFinanceEntryRequest,
	): Promise<{ entry: FinanceEntry }> {
		return apiPost<{ entry: FinanceEntry }, CreateFinanceEntryRequest>(
			"/finance/entries",
			payload,
		);
	},

	/**
	 * Path: GET /api/v1/finance/entries
	 */
	async listEntries(page = 1, limit = 20): Promise<FinanceEntryPage> {
		return apiGet<FinanceEntryPage>("/finance/entries", {
			params: { page, limit },
		});
	},

	/**
	 * Path: PUT /api/v1/finance/entries/:id
	 */
	async updateEntry(
		id: string,
		payload: UpdateFinanceEntryRequest,
	): Promise<{ entry: FinanceEntry }> {
		return apiPut<{ entry: FinanceEntry }, UpdateFinanceEntryRequest>(
			`/finance/entries/${id}`,
			payload,
		);
	},

	/**
	 * Path: DELETE /api/v1/finance/entries/:id
	 */
	async deleteEntry(id: string): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(`/finance/entries/${id}`);
	},

	/**
	 * Path: POST /api/v1/finance/budgets
	 */
	async createBudget(
		payload: CreateFinanceBudgetRequest,
	): Promise<{ budget: FinanceBudget }> {
		return apiPost<{ budget: FinanceBudget }, CreateFinanceBudgetRequest>(
			"/finance/budgets",
			payload,
		);
	},

	/**
	 * Path: GET /api/v1/finance/budgets
	 */
	async listBudgets(): Promise<{ budgets: FinanceBudget[] }> {
		return apiGet<{ budgets: FinanceBudget[] }>("/finance/budgets");
	},

	/**
	 * Path: PUT /api/v1/finance/budgets/:id
	 */
	async updateBudget(
		id: string,
		payload: UpdateFinanceBudgetRequest,
	): Promise<{ budget: FinanceBudget }> {
		return apiPut<{ budget: FinanceBudget }, UpdateFinanceBudgetRequest>(
			`/finance/budgets/${id}`,
			payload,
		);
	},

	/**
	 * Path: DELETE /api/v1/finance/budgets/:id
	 */
	async deleteBudget(id: string): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(`/finance/budgets/${id}`);
	},

	/**
	 * Path: GET /api/v1/finance/summary
	 */
	async getSummary(period?: string): Promise<{ summary: FinanceSummary }> {
		return apiGet<{ summary: FinanceSummary }>("/finance/summary", {
			params: period ? { period } : undefined,
		});
	},

	/**
	 * Path: POST /api/v1/finance/periods/:period/convert
	 */
	async convertPeriod(period: string): Promise<{ award: AwardResult }> {
		return apiPost<{ award: AwardResult }>(
			`/finance/periods/${period}/convert`,
		);
	},

	/**
	 * Path: GET /api/v1/finance/px-per-unit
	 */
	async getPxPerUnit(): Promise<{ px_per_unit: number }> {
		return apiGet<{ px_per_unit: number }>("/finance/px-per-unit");
	},
};
