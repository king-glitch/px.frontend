import { apiGet, apiPost } from "@/api/client";
import type {
	LoginRequest,
	RegisterRequest,
	User,
	UserSession,
} from "@/api/types";

export const authService = {
	/**
	 * Register a new user with username and password.
	 * Path: POST /api/v1/authentication/register
	 */
	async register(payload: RegisterRequest): Promise<{ user: User }> {
		return apiPost<{ user: User }, RegisterRequest>(
			"/authentication/register",
			payload,
		);
	},

	/**
	 * Login user and obtain 64-char session Bearer token.
	 * Path: POST /api/v1/authentication/login
	 */
	async login(payload: LoginRequest): Promise<{ session: UserSession }> {
		return apiPost<{ session: UserSession }, LoginRequest>(
			"/authentication/login",
			payload,
		);
	},

	/**
	 * Fetch authenticated user's profile (@me).
	 * Path: GET /api/v1/user/users/@me
	 */
	async getMe(): Promise<{ user: User }> {
		return apiGet<{ user: User }>("/user/users/@me");
	},
};
