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
// 3. Bank Domain Enums & Models
// ---------------------------------------------------------------------------

export type BankTransactionDirection = "in" | "out";

export type BankCounterpartyType = "account" | "promptpay" | "company" | "card";

export type QueueItemStatus =
	| "unknown"
	| "pending"
	| "dequeued"
	| "completed"
	| "failed"
	| "canceled"
	| "retry";

export type Priority = 0 | 1 | 2 | 3 | 4; // 0=Lowest, 2=Normal, 4=Highest

export interface BankCategory extends ModelBase {
	user_id: ObjectID;
	name: string;
	color?: string;
	icon?: string;
}

export interface BankCounterparty extends ModelBase {
	user_id: ObjectID;
	bank_id?: ObjectID;
	type: BankCounterpartyType;
	name: string;
	fingerprint: string;
	account_number?: string;
	prompt_pay_id?: string;
	card_number?: string;
	note: string;
}

export interface BankTransaction extends ModelBase {
	user_id: ObjectID;
	bank_id: ObjectID;
	transaction_number: string;
	direction: BankTransactionDirection;
	from_account?: string;
	counterparty_id?: ObjectID;
	amount: number;
	fee: number;
	currency: string;
	reference?: string;
	occurred_at: ISO8601String;
	raw_text: string;
	note?: string;
	category_id?: ObjectID;
}

export interface BankMailInbox extends ModelBase {
	user_id: ObjectID;
	token: string;
}

export interface QueueItem {
	id: ObjectID;
	action_type: string;
	data: Record<string, unknown>;
	status: QueueItemStatus;
	message?: string;
	priority: Priority;
	scheduled_at: ISO8601String | null;
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

// Bank Categories
export interface CreateCategoryRequest {
	name: string;
	color?: string;
	icon?: string;
}

export interface UpdateCategoryRequest {
	name?: string;
	color?: string;
	icon?: string;
}

// Bank Transactions
export interface ListTransactionsParams {
	page?: number;
	amount?: number;
	from?: string;
	to?: string;
}

export interface BankCategorySummary {
	category_id?: ObjectID;
	name: string;
	color?: string;
	in: number;
	out: number;
	count: number;
}

export interface BankSummary {
	from?: ISO8601String;
	to?: ISO8601String;
	total_in: number;
	total_out: number;
	total_fee: number;
	net: number;
	count: number;
	by_category: BankCategorySummary[];
}

export interface CreateTransactionRequest {
	direction: BankTransactionDirection;
	amount: number;
	fee?: number;
	currency?: string;
	occurred_at?: ISO8601String;
	transaction_number?: string;
	from_account?: string;
	bank_code?: string;
	counterparty_type?: BankCounterpartyType;
	counterparty_name?: string;
	counterparty_account?: string;
	counterparty_bank?: string;
	category_id?: ObjectID;
	note?: string;
}

export interface UpdateTransactionRequest {
	amount?: number;
	fee?: number;
	occurred_at?: ISO8601String;
	from_account?: string;
	note?: string;
	category_id?: ObjectID; // empty string "" clears assigned category
	direction?: BankTransactionDirection;
}

// Bank Counterparty
export interface UpdateCounterpartyRequest {
	name?: string;
	note?: string;
}

export interface UpdateCounterpartyNoteRequest {
	note: string;
}

// Slip Ingestion
export interface UploadSlipResponse {
	queue_id: ObjectID;
	status: QueueItemStatus;
}

export interface ListQueuesParams {
	tag?: string;
	type?: string;
	action_type?: string;
	status?: string;
	limit?: number;
}

export interface ListQueuesResponse {
	queues: QueueItem[];
}

export interface MailInboxResponse {
	address: string;
	inbox: BankMailInbox;
}
