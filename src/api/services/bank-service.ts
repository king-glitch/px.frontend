import { apiDelete, apiGet, apiPatch, apiPost } from "@/api/client";
import type {
	BankCategory,
	BankCounterparty,
	BankTransaction,
	Collection,
	CreateCategoryRequest,
	CreateTransactionRequest,
	ListTransactionsParams,
	MailInboxResponse,
	ObjectID,
	QueueItem,
	UpdateCategoryRequest,
	UpdateCounterpartyNoteRequest,
	UpdateTransactionRequest,
	UploadSlipResponse,
} from "@/api/types";

export const bankService = {
	// -------------------------------------------------------------------------
	// Categories
	// -------------------------------------------------------------------------

	/**
	 * List all categories for the authenticated user.
	 * Path: GET /api/v1/bank/categories
	 */
	async listCategories(): Promise<{ categories: BankCategory[] }> {
		return apiGet<{ categories: BankCategory[] }>("/bank/categories");
	},

	/**
	 * Create a new category.
	 * Path: POST /api/v1/bank/categories
	 */
	async createCategory(
		payload: CreateCategoryRequest,
	): Promise<{ category: BankCategory }> {
		return apiPost<{ category: BankCategory }, CreateCategoryRequest>(
			"/bank/categories",
			payload,
		);
	},

	/**
	 * Get category by ID.
	 * Path: GET /api/v1/bank/categories/:id
	 */
	async getCategory(id: ObjectID): Promise<{ category: BankCategory }> {
		return apiGet<{ category: BankCategory }>(`/bank/categories/${id}`);
	},

	/**
	 * Update category by ID.
	 * Path: PATCH /api/v1/bank/categories/:id
	 */
	async updateCategory(
		id: ObjectID,
		payload: UpdateCategoryRequest,
	): Promise<{ category: BankCategory }> {
		return apiPatch<{ category: BankCategory }, UpdateCategoryRequest>(
			`/bank/categories/${id}`,
			payload,
		);
	},

	/**
	 * Delete category by ID.
	 * Path: DELETE /api/v1/bank/categories/:id
	 */
	async deleteCategory(id: ObjectID): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(`/bank/categories/${id}`);
	},

	// -------------------------------------------------------------------------
	// Transactions
	// -------------------------------------------------------------------------

	/**
	 * List paginated transactions for the authenticated user.
	 * Path: GET /api/v1/bank/transactions
	 */
	async listTransactions(
		params?: ListTransactionsParams,
	): Promise<{ transactions: Collection<BankTransaction> }> {
		return apiGet<{ transactions: Collection<BankTransaction> }>(
			"/bank/transactions",
			{ params },
		);
	},

	/**
	 * Create a manual bank transaction.
	 * Path: POST /api/v1/bank/transactions
	 */
	async createTransaction(
		payload: CreateTransactionRequest,
	): Promise<{ transaction: BankTransaction }> {
		return apiPost<
			{ transaction: BankTransaction },
			CreateTransactionRequest
		>("/bank/transactions", payload);
	},

	/**
	 * Get transaction details by ID.
	 * Path: GET /api/v1/bank/transactions/:id
	 */
	async getTransaction(
		id: ObjectID,
	): Promise<{ transaction: BankTransaction }> {
		return apiGet<{ transaction: BankTransaction }>(
			`/bank/transactions/${id}`,
		);
	},

	/**
	 * Update transaction details by ID.
	 * Path: PATCH /api/v1/bank/transactions/:id
	 */
	async updateTransaction(
		id: ObjectID,
		payload: UpdateTransactionRequest,
	): Promise<{ transaction: BankTransaction }> {
		return apiPatch<
			{ transaction: BankTransaction },
			UpdateTransactionRequest
		>(`/bank/transactions/${id}`, payload);
	},

	/**
	 * Delete transaction by ID.
	 * Path: DELETE /api/v1/bank/transactions/:id
	 */
	async deleteTransaction(id: ObjectID): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(`/bank/transactions/${id}`);
	},

	// -------------------------------------------------------------------------
	// Counterparties
	// -------------------------------------------------------------------------

	/**
	 * Get counterparty details by ID.
	 * Path: GET /api/v1/bank/counterparties/:id
	 */
	async getCounterparty(
		id: ObjectID,
	): Promise<{ counterparty: BankCounterparty }> {
		return apiGet<{ counterparty: BankCounterparty }>(
			`/bank/counterparties/${id}`,
		);
	},

	/**
	 * Update counterparty user note.
	 * Path: PATCH /api/v1/bank/counterparties/:id/note
	 */
	async updateCounterpartyNote(
		id: ObjectID,
		payload: UpdateCounterpartyNoteRequest,
	): Promise<{ counterparty: BankCounterparty }> {
		return apiPatch<
			{ counterparty: BankCounterparty },
			UpdateCounterpartyNoteRequest
		>(`/bank/counterparties/${id}/note`, payload);
	},

	// -------------------------------------------------------------------------
	// Automated Slip Ingestion & Queue Polling
	// -------------------------------------------------------------------------

	/**
	 * Upload bank transfer slip image for background OCR ingestion.
	 * Path: POST /api/v1/bank/ingest-slip
	 */
	async uploadSlip(file: File | Blob): Promise<UploadSlipResponse> {
		const formData = new FormData();
		formData.append("image", file);
		return apiPost<UploadSlipResponse, FormData>(
			"/bank/ingest-slip",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);
	},

	/**
	 * Poll queue item status by queue ID.
	 * Path: GET /api/v1/queue/queues/:id
	 */
	async getQueueStatus(queueId: ObjectID): Promise<QueueItem> {
		return apiGet<QueueItem>(`/queue/queues/${queueId}`);
	},

	// -------------------------------------------------------------------------
	// Bank Mail Forwarding Ingestion
	// -------------------------------------------------------------------------

	/**
	 * Get user's unique forwarding email inbox address.
	 * Path: GET /api/v1/bank/mail-inbox
	 */
	async getMailInbox(): Promise<MailInboxResponse> {
		return apiGet<MailInboxResponse>("/bank/mail-inbox");
	},
};
