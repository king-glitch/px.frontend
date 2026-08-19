import { apiDelete, apiGet, apiPatch, apiPost } from "@/api/client";
import type {
	Bank,
	BankAccount,
	BankCategory,
	BankSummary,
	BankTransaction,
	Collection,
	CreateBankAccountRequest,
	CreateBankRequest,
	CreateCategoryRequest,
	CreateTransactionRequest,
	DateRangeParams,
	ListQueuesParams,
	ListQueuesResponse,
	ListTransactionsParams,
	MailInboxResponse,
	ObjectID,
	QueueItem,
	UpdateBankAccountRequest,
	UpdateBankRequest,
	UpdateCategoryRequest,
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
	 * Aggregate totals and per-category breakdown for a date range.
	 * Path: GET /api/v1/bank/transactions/summary
	 */
	async getSummary(params?: DateRangeParams): Promise<{ summary: BankSummary }> {
		return apiGet<{ summary: BankSummary }>("/bank/transactions/summary", {
			params,
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
	// Banks
	// -------------------------------------------------------------------------

	/**
	 * List all banks.
	 * Path: GET /api/v1/bank/banks
	 */
	async listBanks(): Promise<{ banks: Bank[] }> {
		return apiGet<{ banks: Bank[] }>("/bank/banks");
	},

	/**
	 * Get bank by ID.
	 * Path: GET /api/v1/bank/banks/:id
	 */
	async getBank(id: ObjectID): Promise<{ bank: Bank }> {
		return apiGet<{ bank: Bank }>(`/bank/banks/${id}`);
	},

	/**
	 * Create a new bank.
	 * Path: POST /api/v1/bank/banks
	 */
	async createBank(
		payload: CreateBankRequest,
	): Promise<{ bank: Bank }> {
		return apiPost<{ bank: Bank }, CreateBankRequest>(
			"/bank/banks",
			payload,
		);
	},

	/**
	 * Update bank by ID.
	 * Path: PATCH /api/v1/bank/banks/:id
	 */
	async updateBank(
		id: ObjectID,
		payload: UpdateBankRequest,
	): Promise<{ bank: Bank }> {
		return apiPatch<{ bank: Bank }, UpdateBankRequest>(
			`/bank/banks/${id}`,
			payload,
		);
	},

	/**
	 * Delete bank by ID.
	 * Path: DELETE /api/v1/bank/banks/:id
	 */
	async deleteBank(id: ObjectID): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(`/bank/banks/${id}`);
	},

	// -------------------------------------------------------------------------
	// Bank Accounts
	// -------------------------------------------------------------------------

	/**
	 * List all bank accounts for the authenticated user.
	 * Path: GET /api/v1/bank/accounts
	 */
	async listAccounts(): Promise<{ accounts: BankAccount[] }> {
		return apiGet<{ accounts: BankAccount[] }>("/bank/accounts");
	},

	/**
	 * Create a new bank account.
	 * Path: POST /api/v1/bank/accounts
	 */
	async createAccount(
		payload: CreateBankAccountRequest,
	): Promise<{ account: BankAccount }> {
		return apiPost<{ account: BankAccount }, CreateBankAccountRequest>(
			"/bank/accounts",
			payload,
		);
	},

	/**
	 * Get bank account by ID.
	 * Path: GET /api/v1/bank/accounts/:id
	 */
	async getAccount(id: ObjectID): Promise<{ account: BankAccount }> {
		return apiGet<{ account: BankAccount }>(`/bank/accounts/${id}`);
	},

	/**
	 * Update bank account by ID.
	 * Path: PATCH /api/v1/bank/accounts/:id
	 */
	async updateAccount(
		id: ObjectID,
		payload: UpdateBankAccountRequest,
	): Promise<{ account: BankAccount }> {
		return apiPatch<{ account: BankAccount }, UpdateBankAccountRequest>(
			`/bank/accounts/${id}`,
			payload,
		);
	},

	/**
	 * Delete bank account by ID.
	 * Path: DELETE /api/v1/bank/accounts/:id
	 */
	async deleteAccount(id: ObjectID): Promise<{ deleted: boolean }> {
		return apiDelete<{ deleted: boolean }>(`/bank/accounts/${id}`);
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
