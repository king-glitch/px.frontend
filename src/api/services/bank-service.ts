import { apiDelete, apiGet, apiPatch, apiPost } from "@/api/client";
import type {
	BankCategory,
	BankCounterparty,
	BankSummary,
	BankTransaction,
	Collection,
	CreateCategoryRequest,
	CreateTransactionRequest,
	ListQueuesParams,
	ListQueuesResponse,
	ListTransactionsParams,
	MailInboxResponse,
	ObjectID,
	QueueItem,
	UpdateCategoryRequest,
	UpdateCounterpartyRequest,
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
	 * Get bank transactions summary.
	 * Path: GET /api/v1/bank/transactions/summary
	 */
	async getSummary(
		from?: string,
		to?: string,
	): Promise<{ summary: BankSummary }> {
		return apiGet<{ summary: BankSummary }>("/bank/transactions/summary", {
			params: { from, to },
		});
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
	 * List counterparties for authenticated user.
	 * Path: GET /api/v1/bank/counterparties
	 */
	async listCounterparties(): Promise<{ counterparties: BankCounterparty[] }> {
		return apiGet<{ counterparties: BankCounterparty[] }>("/bank/counterparties");
	},

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
	 * Update counterparty by ID.
	 * Path: PATCH /api/v1/bank/counterparties/:id
	 */
	async updateCounterparty(
		id: ObjectID,
		payload: UpdateCounterpartyRequest,
	): Promise<{ counterparty: BankCounterparty }> {
		return apiPatch<
			{ counterparty: BankCounterparty },
			UpdateCounterpartyRequest
		>(`/bank/counterparties/${id}`, payload);
	},

	/**
	 * Delete counterparty by ID.
	 * Path: DELETE /api/v1/bank/counterparties/:id
	 */
	async deleteCounterparty(id: ObjectID): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(`/bank/counterparties/${id}`);
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

	/**
	 * List queue items with optional filters.
	 * Path: GET /api/v1/queue/queues
	 */
	async listQueues(params?: ListQueuesParams): Promise<ListQueuesResponse> {
		return apiGet<ListQueuesResponse>("/queue/queues", { params });
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
