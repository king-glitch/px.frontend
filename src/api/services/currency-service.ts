import { apiGet, apiPost } from "@/api/client";
import type {
	AdjustCurrencyRequest,
	CurrencyBalance,
	CurrencyTransactionPage,
	CurrencyTransactionResult,
	CurrencyType,
} from "@/api/types";

export const currencyService = {
	/**
	 * Path: GET /api/v1/currency/balance
	 */
	async getBalance(
		type?: CurrencyType,
	): Promise<{ balance: CurrencyBalance }> {
		return apiGet<{ balance: CurrencyBalance }>("/currency/balance", {
			params: type ? { type } : undefined,
		});
	},

	/**
	 * Path: POST /api/v1/currency/adjust
	 */
	async adjustBalance(
		payload: AdjustCurrencyRequest,
	): Promise<{ result: CurrencyTransactionResult }> {
		return apiPost<
			{ result: CurrencyTransactionResult },
			AdjustCurrencyRequest
		>("/currency/adjust", payload);
	},

	/**
	 * Path: GET /api/v1/currency/transactions
	 */
	async listTransactions(
		type?: CurrencyType,
		page = 1,
		limit = 20,
	): Promise<CurrencyTransactionPage> {
		return apiGet<CurrencyTransactionPage>("/currency/transactions", {
			params: { type, page, limit },
		});
	},
};
