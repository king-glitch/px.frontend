import { apiDelete, apiGet, apiPost } from "@/api/client";
import type {
	ConnectDuolingoRequest,
	DuolingoLink,
	DuolingoStatus,
} from "@/api/types";

export const duolingoService = {
	/**
	 * Link the authenticated user's account to a Duolingo bot login.
	 * Path: POST /api/v1/duolingo/connect
	 */
	async connect(
		payload: ConnectDuolingoRequest,
	): Promise<{ link: DuolingoLink }> {
		return apiPost<{ link: DuolingoLink }, ConnectDuolingoRequest>(
			"/duolingo/connect",
			payload,
		);
	},

	/**
	 * Unlink the authenticated user's Duolingo account.
	 * Path: DELETE /api/v1/duolingo/connect
	 */
	async disconnect(): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>("/duolingo/connect");
	},

	/**
	 * Fetch the linked Duolingo account's XP/rank/streak stats.
	 * Path: GET /api/v1/duolingo/status
	 */
	async getStatus(): Promise<{ status: DuolingoStatus }> {
		return apiGet<{ status: DuolingoStatus }>("/duolingo/status");
	},
};
