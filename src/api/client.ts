import axios, {
	type AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";
import { config } from "@/config";
import type { ApiErrorPayload, ApiResponse } from "@/api/types";

export class ApiError extends Error {
	public code: string;
	public status?: number;
	public violations?: ApiErrorPayload["violations"];
	public stackTrace?: string;

	constructor(payload: ApiErrorPayload, status?: number) {
		super(payload.message || "An unexpected error occurred");
		this.name = "ApiError";
		this.code = payload.code || "Service.Internal.Error";
		this.status = status;
		this.violations = payload.violations;
		this.stackTrace = payload.stack;
	}
}

/**
 * Creates and configures the centralized Axios client for the PX backend API.
 */
function createApiClient(): AxiosInstance {
	const instance = axios.create({
		baseURL: config.api.baseUrl,
		timeout: config.api.timeoutMs,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
	});

	// Attach session Bearer token from storage if present
	instance.interceptors.request.use(
		(requestConfig: InternalAxiosRequestConfig) => {
			if (typeof window !== "undefined") {
				const token = localStorage.getItem(config.storage.tokenKey);
				if (token && requestConfig.headers) {
					requestConfig.headers.Authorization = `Bearer ${token}`;
				}
			}
			return requestConfig;
		},
		(error) => Promise.reject(error),
	);

	// Handle standard envelope responses and map error envelopes
	instance.interceptors.response.use(
		(response: AxiosResponse) => {
			return response;
		},
		(error: AxiosError<ApiResponse<unknown>>) => {
			const status = error.response?.status;
			const errorPayload = error.response?.data?.errors;

			if (status === 401 && typeof window !== "undefined") {
				localStorage.removeItem(config.storage.tokenKey);
				localStorage.removeItem(config.storage.userKey);
				// Dispatch custom event for auth listeners
				window.dispatchEvent(new CustomEvent("px:unauthorized"));
			}

			if (errorPayload) {
				return Promise.reject(new ApiError(errorPayload, status));
			}

			const fallbackError: ApiErrorPayload = {
				code: status ? `HTTP.${status}` : "Network.Error",
				message: error.message || "Network request failed",
			};
			return Promise.reject(new ApiError(fallbackError, status));
		},
	);

	return instance;
}

export const apiClient = createApiClient();

/**
 * Generic typed HTTP request helpers that unwrap the envelope `data` field.
 */
export async function apiGet<T>(
	url: string,
	requestConfig?: AxiosRequestConfig,
): Promise<T> {
	const res = await apiClient.get<ApiResponse<T>>(url, requestConfig);
	return res.data.data;
}

export async function apiPost<T, B = unknown>(
	url: string,
	body?: B,
	requestConfig?: AxiosRequestConfig,
): Promise<T> {
	const res = await apiClient.post<ApiResponse<T>>(url, body, requestConfig);
	return res.data.data;
}

export async function apiPut<T, B = unknown>(
	url: string,
	body?: B,
	requestConfig?: AxiosRequestConfig,
): Promise<T> {
	const res = await apiClient.put<ApiResponse<T>>(url, body, requestConfig);
	return res.data.data;
}

export async function apiPatch<T, B = unknown>(
	url: string,
	body?: B,
	requestConfig?: AxiosRequestConfig,
): Promise<T> {
	const res = await apiClient.patch<ApiResponse<T>>(url, body, requestConfig);
	return res.data.data;
}

export async function apiDelete<T>(
	url: string,
	requestConfig?: AxiosRequestConfig,
): Promise<T> {
	const res = await apiClient.delete<ApiResponse<T>>(url, requestConfig);
	return res.data.data;
}
