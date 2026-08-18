import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { config } from "@/config";
import {
	type LoginRequest,
	type RegisterRequest,
	type User,
	type UserSession,
} from "@/api/types";
import { queryKeys } from "@/api/query-keys";
import { authService } from "@/api/services/auth-service";

export interface AuthContextValue {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (payload: LoginRequest) => Promise<UserSession>;
	register: (payload: RegisterRequest) => Promise<User>;
	logout: () => void;
	refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const queryClient = useQueryClient();
	const [token, setToken] = useState<string | null>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem(config.storage.tokenKey);
		}
		return null;
	});
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const fetchProfile = useCallback(async () => {
		const storedToken = localStorage.getItem(config.storage.tokenKey);
		if (!storedToken) {
			setUser(null);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const res = await authService.getMe();
			setUser(res.user);
			queryClient.setQueryData(queryKeys.user.me(), res.user);
		} catch {
			// Failed to get user profile (token expired or invalid)
			localStorage.removeItem(config.storage.tokenKey);
			localStorage.removeItem(config.storage.userKey);
			setToken(null);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, [queryClient]);

	// Initial load
	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	// Listen for 401 unauthorized events from Axios interceptor
	useEffect(() => {
		const handleUnauthorized = () => {
			setToken(null);
			setUser(null);
			queryClient.clear();
		};

		window.addEventListener("px:unauthorized", handleUnauthorized);
		return () => {
			window.removeEventListener("px:unauthorized", handleUnauthorized);
		};
	}, [queryClient]);

	const login = useCallback(
		async (payload: LoginRequest): Promise<UserSession> => {
			setIsLoading(true);
			try {
				const res = await authService.login(payload);
				const session = res.session;
				localStorage.setItem(config.storage.tokenKey, session.token);
				setToken(session.token);

				// Fetch user profile immediately
				const userRes = await authService.getMe();
				setUser(userRes.user);
				queryClient.setQueryData(queryKeys.user.me(), userRes.user);

				return session;
			} finally {
				setIsLoading(false);
			}
		},
		[queryClient],
	);

	const register = useCallback(
		async (payload: RegisterRequest): Promise<User> => {
			setIsLoading(true);
			try {
				const res = await authService.register(payload);
				return res.user;
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const logout = useCallback(() => {
		if (typeof window !== "undefined") {
			localStorage.removeItem(config.storage.tokenKey);
			localStorage.removeItem(config.storage.userKey);
		}
		setToken(null);
		setUser(null);
		queryClient.clear();
	}, [queryClient]);

	const refetchUser = useCallback(async () => {
		await fetchProfile();
	}, [fetchProfile]);

	const value: AuthContextValue = {
		user,
		token,
		isAuthenticated: Boolean(token && user),
		isLoading,
		login,
		register,
		logout,
		refetchUser,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};

/**
 * Hook to access AuthContext.
 */
export function useAuthContext(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
}

export default AuthProvider;
