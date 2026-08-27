/**
 * Domain Models and API Request/Response Types
 * Strictly aligned with API.md
 */

// ---------------------------------------------------------------------------
// 1. Primitive & Base Domain Types
// ---------------------------------------------------------------------------

export type ObjectID = string; // 24-character hex MongoDB ObjectID string
export type ISO8601String = string; // e.g. "2026-08-18T10:00:00Z"

export interface ModelBase {
	id: ObjectID;
	created_at: ISO8601String;
	updated_at: ISO8601String;
}

// ---------------------------------------------------------------------------
// 2. User & Authentication Models
// ---------------------------------------------------------------------------

export interface User extends ModelBase {
	username: string;
}

export interface UserSession {
	user_id: ObjectID;
	token: string;
	expires_at: ISO8601String;
}

// ---------------------------------------------------------------------------
// 3. Duolingo Domain Models
// ---------------------------------------------------------------------------

export interface DuolingoLink extends ModelBase {
	bot_username: string;
	duolingo_account_id: string;
}

export interface DuolingoStatus {
	xp: number;
	rank: number;
	streak: number;
	longest_streak: number;
}

// ---------------------------------------------------------------------------
// 4. Pagination Collection Wrappers
// ---------------------------------------------------------------------------

export interface CollectionMeta {
	total: number;
	total_pages: number;
}

export interface Collection<T> {
	collection: T[];
	count: number;
	meta: CollectionMeta;
}

// ---------------------------------------------------------------------------
// 5. Envelope API Responses & Error Contracts
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
	data: T;
	errors?: ApiErrorPayload;
}

export interface ApiFieldError {
	code: string;
	message: string;
	stack?: string;
}

export interface ApiErrorPayload {
	message: string;
	code: string;
	stack?: string;
	violations?: Record<string, ApiFieldError>;
}

// ---------------------------------------------------------------------------
// 6. Request DTOs
// ---------------------------------------------------------------------------

// Auth
export interface RegisterRequest {
	username: string;
	password: string;
}

export interface LoginRequest {
	username: string;
	password: string;
}

// Duolingo
export interface ConnectDuolingoRequest {
	bot_username: string;
	bot_password: string;
}
