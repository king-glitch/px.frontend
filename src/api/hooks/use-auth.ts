import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { config } from "@/config";
import { queryKeys } from "@/api/query-keys";
import { authService } from "@/api/services/auth-service";
import type {
	LoginRequest,
	RegisterRequest,
	User,
	UserSession,
} from "@/api/types";

/**
 * Hook to fetch current user's profile (@me).
 */
export function useCurrentUser(options?: { enabled?: boolean }) {
	const hasToken =
		typeof window !== "undefined"
			? Boolean(localStorage.getItem(config.storage.tokenKey))
			: false;

	return useQuery({
		queryKey: queryKeys.user.me(),
		queryFn: async () => {
			const res = await authService.getMe();
			return res.user;
		},
		enabled: options?.enabled !== undefined ? options.enabled : hasToken,
		staleTime: 5 * 60 * 1000,
		retry: false,
	});
}

/**
 * Mutation for user registration.
 */
export function useRegisterMutation() {
	return useMutation({
		mutationFn: async (payload: RegisterRequest) => {
			const res = await authService.register(payload);
			return res.user;
		},
	});
}

/**
 * Mutation for user login.
 * Automatically saves session token and invalidates current user cache.
 */
export function useLoginMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: LoginRequest) => {
			const res = await authService.login(payload);
			return res.session;
		},
		onSuccess: (session: UserSession) => {
			if (typeof window !== "undefined") {
				localStorage.setItem(config.storage.tokenKey, session.token);
			}
			queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
		},
	});
}
