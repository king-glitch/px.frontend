/**
 * Domain Models and API Request/Response Types
 * Strictly aligned with Backend Hexagonal Architecture and API Contract
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
	username?: string;
	xp: number;
	rank: number;
	streak: number;
	longest_streak: number;
}

// ---------------------------------------------------------------------------
// 4. Currency Models & Enums
// ---------------------------------------------------------------------------

export type CurrencyType = "px";

export type CurrencySource =
	| "game_quest"
	| "game_shop"
	| "game_health"
	| "game_streak"
	| "game_boss"
	| "game_wager"
	| "finance"
	| "system"
	| "admin";

export interface CurrencyBalance extends ModelBase {
	user_id: ObjectID;
	type: CurrencyType;
	amount: number;
}

export interface CurrencyTransaction extends ModelBase {
	user_id: ObjectID;
	currency_type: CurrencyType;
	amount: number;
	before_amount: number;
	after_amount: number;
	source: CurrencySource;
	reason: string;
	ref_id?: ObjectID;
}

export interface CurrencyTransactionResult {
	balance: CurrencyBalance;
	transaction: CurrencyTransaction;
}

export interface CurrencyTransactionPage {
	transactions: CurrencyTransaction[];
	count: number;
	total_pages: number;
}

// ---------------------------------------------------------------------------
// 5. Game Models & Enums
// ---------------------------------------------------------------------------

export type QuestCadence = "daily" | "weekly" | "monthly" | "one_off";
export type QuestEffort =
	"trivial" | "light" | "moderate" | "hard" | "grueling";
export type QuestCategory =
	| "health"
	| "work"
	| "learning"
	| "chores"
	| "mindfulness"
	| "social"
	| "finance";
export type Attribute =
	"vigor" | "craft" | "mind" | "order" | "spirit" | "bond" | "fortune";
export type LedgerSource =
	| "quest"
	| "health"
	| "finance"
	| "shop"
	| "boss"
	| "wager"
	| "streak"
	| "system";
export type HealthMetric =
	| "steps"
	| "active_energy"
	| "workout_minutes"
	| "sleep_minutes"
	| "hrv"
	| "resting_hr";
export type HealthSource = "healthkit" | "googlefit" | "manual";
export type ShopItemKind = "reward" | "consumable" | "cosmetic";
export type ClaimStatus = "pending" | "owned" | "redeemed" | "expired";
export type BuffKind = "exp" | "px";
export type ConsumableEffect =
	| "streak_shield"
	| "streak_repair"
	| "focus_elixir"
	| "coin_charm"
	| "quest_reroll"
	| "rest_day";
export type PerkID =
	| "diligence"
	| "merchant"
	| "vitality"
	| "resolve"
	| "ledger"
	| "deep_focus"
	| "bargain"
	| "second_wind";

export interface Player extends ModelBase {
	user_id: ObjectID;
	level: number;
	exp: number;
	exp_into_level: number;
	px: number;
	skill_points: number;
	streak: number;
	longest_streak: number;
	last_active_on: string;
	category_exp: Record<QuestCategory, number>;
	ascensions: number;
	time_zone: string;
	reset_hour: number;
}

export interface LedgerEntry extends ModelBase {
	user_id: ObjectID;
	source: LedgerSource;
	reason: string;
	exp_delta: number;
	px_delta: number;
	multiplier: number;
	decay_factor: number;
	ref_id?: ObjectID;
	occurred_on: string;
}

export interface Quest extends ModelBase {
	user_id: ObjectID;
	title: string;
	notes: string;
	category: QuestCategory;
	cadence: QuestCadence;
	effort: QuestEffort;
	minutes: number;
	scored: boolean;
	active: boolean;
	schedule_days: number[];
	streak: number;
	longest_streak: number;
	exp_value: number;
	px_value: number;
	archived_at?: ISO8601String;
}

/**
 * A quest scheduled for a given day, paired with whether it has already been
 * completed on that day. Completions live in their own collection, so a bare
 * Quest cannot answer that and a checkbox rendered from one is always empty.
 */
export interface TodayQuest {
	quest: Quest;
	completed: boolean;
	exp_awarded: number;
	px_awarded: number;
}

export interface ShopItem extends ModelBase {
	user_id: ObjectID;
	kind: ShopItemKind;
	name: string;
	description: string;
	price_px: number;
	level_required: number;
	system: boolean;
	effect?: ConsumableEffect;
	slot?: string;
	real_cost: number;
	currency: string;
	expires_in_days?: number;
	archived: boolean;
}

export interface InventoryItem extends ModelBase {
	user_id: ObjectID;
	shop_item_id: ObjectID;
	effect: ConsumableEffect;
	quantity: number;
	deprecated: boolean;
}

export interface Claim extends ModelBase {
	user_id: ObjectID;
	shop_item_id: ObjectID;
	name: string;
	status: ClaimStatus;
	price_paid: number;
	redeemable_at: ISO8601String;
	redeemed_at?: ISO8601String;
	expires_at?: ISO8601String;
}

export interface Buff extends ModelBase {
	user_id: ObjectID;
	kind: BuffKind;
	effect: ConsumableEffect;
	multiplier: number;
	expires_at: ISO8601String;
}

export interface Perk extends ModelBase {
	user_id: ObjectID;
	perk_id: PerkID;
	rank: number;
}

export interface Avatar extends ModelBase {
	user_id: ObjectID;
	seed: string;
	equipped: Record<string, string>;
	palette_id?: string;
	title?: string;
}

export interface PlayerSummary {
	player: Player;
	exp_to_next: number;
	attributes: Record<Attribute, number>;
	active_buffs: Buff[];
	perks: Perk[];
	avatar?: Avatar;
}

export interface QuestPrice {
	exp: number;
	px: number;
}

export interface AwardResult {
	exp: number;
	px: number;
	multiplier: number;
	decay_factor: number;
	leveled_to: number;
	skill_points_gained: number;
}

export interface HealthMetricSummary {
	metric: HealthMetric;
	value: number;
	target: number;
	score: number;
	exp: number;
	source: HealthSource;
}

export interface HealthDaySummary {
	day: string;
	metrics: Record<HealthMetric, HealthMetricSummary>;
	exp_awarded: number;
	px_awarded: number;
}

export interface PurchaseResult {
	item: ShopItem;
	claim?: Claim;
	inventory?: InventoryItem;
	px_spent: number;
	px_remaining: number;
}

export interface LedgerPage {
	entries: LedgerEntry[];
	count: number;
	total_pages: number;
}

export interface QuestPage {
	quests: Quest[];
	count: number;
	total_pages: number;
}

// ---------------------------------------------------------------------------
// 6. Finance Models & Enums
// ---------------------------------------------------------------------------

export type FinanceDirection = "income" | "expense";

export interface FinanceEntry extends ModelBase {
	user_id: ObjectID;
	direction: FinanceDirection;
	amount: number;
	currency: string;
	category: string;
	occurred_on: string;
	note: string;
}

export interface FinanceBudget extends ModelBase {
	user_id: ObjectID;
	category: string;
	monthly_limit: number;
}

export interface FinanceSummary {
	period: string;
	income: number;
	expense: number;
	savings_rate: number;
	days_logged: number;
	days_in_period: number;
	projected_exp: number;
}

export interface FinanceEntryPage {
	entries: FinanceEntry[];
	count: number;
	total_pages: number;
}

// ---------------------------------------------------------------------------
// 7. Pagination Collection Wrappers
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
// 8. Envelope API Responses & Error Contracts
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
// 9. Request DTOs
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

// Currency
export interface AdjustCurrencyRequest {
	type: CurrencyType;
	delta: number;
	source: CurrencySource;
	reason?: string;
	ref_id?: ObjectID;
}

// Game / Quest
export interface CreateQuestRequest {
	title: string;
	notes?: string;
	category: QuestCategory;
	cadence: QuestCadence;
	effort: QuestEffort;
	minutes: number;
	scored?: boolean;
	schedule_days?: number[];
}

export interface UpdateQuestRequest {
	title?: string;
	notes?: string;
	category?: QuestCategory;
	cadence?: QuestCadence;
	effort?: QuestEffort;
	minutes?: number;
	scored?: boolean;
	active?: boolean;
	schedule_days?: number[];
}

export interface CompleteQuestRequest {
	on: string;
}

export interface RolloverQuestsRequest {
	on: string;
}

// Game / Shop
export interface CreateShopItemRequest {
	kind: ShopItemKind;
	name: string;
	description?: string;
	price_px: number;
	level_required?: number;
	system?: boolean;
	effect?: ConsumableEffect;
	slot?: string;
	real_cost?: number;
	currency?: string;
	expires_in_days?: number;
}

// Game / Health
export interface IngestHealthSampleItem {
	metric: HealthMetric;
	value: number;
	unit?: string;
	day: string;
	source: HealthSource;
}

export interface IngestHealthSamplesRequest {
	samples: IngestHealthSampleItem[];
}

export interface AwardHealthDayRequest {
	day: string;
}

// Finance
export interface CreateFinanceEntryRequest {
	direction: FinanceDirection;
	amount: number;
	currency: string;
	category: string;
	occurred_on: string;
	note?: string;
}

export interface UpdateFinanceEntryRequest {
	direction?: FinanceDirection;
	amount?: number;
	currency?: string;
	category?: string;
	occurred_on?: string;
	note?: string;
}

export interface CreateFinanceBudgetRequest {
	category: string;
	monthly_limit: number;
}

export interface UpdateFinanceBudgetRequest {
	monthly_limit: number;
}
