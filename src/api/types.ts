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

export type LifeArea = "health" | "wealth" | "mastery" | "personal" | "social";

export type GoalStatus = "active" | "completed" | "paused" | "archived";
export type ProjectStatus = "active" | "completed" | "archived";
export type MilestoneStatus = "pending" | "in_progress" | "completed";
export type QuestStatus =
	| "draft"
	| "active"
	| "completed"
	| "skipped"
	| "rescheduled"
	| "paused"
	| "archived";
export type AscensionPath =
	"none" | "sage" | "vanguard" | "steward" | "connector";
export type ReviewPeriodType = "weekly" | "monthly";

export type CircleRole = "owner" | "co_owner" | "member";
export type CirclePrivacy = "private" | "invitation_only";
export type CircleStatusVisibility = "minimal" | "standard" | "detailed";
export type CircleActivityVisibility = "public" | "private";
export type CircleInviteStatus =
	"pending" | "accepted" | "declined" | "expired";
export type CircleContributionSource =
	"quest" | "routine" | "goal" | "review" | "recovery";
export type CircleMomentumTier =
	"none" | "connected" | "steady" | "strong" | "thriving";
export type CircleGoalType =
	| "consistency"
	| "balance"
	| "routine"
	| "progress"
	| "recovery"
	| "reflection";
export type CircleGoalStatus = "active" | "completed" | "failed";
export type CircleRewardStatus = "pending" | "claimed" | "expired";
export type CircleReactionType = "cheer" | "fire" | "clap" | "heart" | "muscle";
export type AvatarSlot =
	| "head"
	| "glasses"
	| "accessory"
	| "skin"
	| "outfit"
	| "handheld"
	| "background"
	| "aura"
	| "body";

export interface QuestSubtask {
	title: string;
	completed: boolean;
	order: number;
}

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
	rolled_over_on: string;
	category_exp: Record<QuestCategory, number>;
	ascensions: number;
	ascension_path?: AscensionPath;
	rest_days?: number;
	vacation_mode?: boolean;
	vacation_start_on?: string;
	grace_days?: number;
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
	status?: QuestStatus;
	subtasks?: QuestSubtask[];
	project_id?: ObjectID;
	milestone_id?: ObjectID;
	pause_reason?: string;
	is_mvq?: boolean;
	mvq_minutes?: number;
	schedule_days: number[];
	streak: number;
	longest_streak: number;
	exp_value: number;
	px_value: number;
	reward_formula_version?: number;
	base_exp_reward?: number;
	base_px_reward?: number;
	mvq_exp_reward?: number;
	mvq_px_reward?: number;
	archived_at?: ISO8601String;
}

export interface QuestRewardPreview {
	exp: number;
	px: number;
	mvq_exp?: number;
	mvq_px?: number;
	formula_version: number;
}

export interface Goal extends ModelBase {
	user_id: ObjectID;
	title: string;
	description: string;
	area: LifeArea;
	category: QuestCategory;
	status: GoalStatus;
	target_date?: string;
	target_metric?: string;
	current_value?: number;
	target_value?: number;
	completed_at?: ISO8601String;
}

export interface Project extends ModelBase {
	user_id: ObjectID;
	goal_id: ObjectID;
	title: string;
	description: string;
	status: ProjectStatus;
	target_date?: string;
	order: number;
}

export interface Milestone extends ModelBase {
	user_id: ObjectID;
	project_id: ObjectID;
	goal_id: ObjectID;
	title: string;
	status: MilestoneStatus;
	order: number;
	exp_reward: number;
	px_reward: number;
	completed_at?: ISO8601String;
}

export interface ProjectSummary {
	project: Project;
	milestones: Milestone[];
	progress: number;
}

export interface GoalSummary {
	goal: Goal;
	projects: ProjectSummary[];
	milestones: Milestone[];
	progress: number;
}

export interface RecoverySummary {
	rest_days_count: number;
	vacation_mode: boolean;
	vacation_start_on?: string;
	grace_days_available: number;
	streak_safe: boolean;
}

export interface ReviewSummary {
	period_type: ReviewPeriodType;
	period: string;
	quests_completed: number;
	quests_planned: number;
	completion_rate: number;
	effort_minutes: number;
	streak_days: number;
	grace_days_used: number;
	category_breakdown: Record<QuestCategory, number>;
	skipped_quest_titles: string[];
	finance_saved: number;
	health_days_logged: number;
}

export interface Review extends ModelBase {
	user_id: ObjectID;
	period_type: ReviewPeriodType;
	period: string;
	quests_completed: number;
	quests_planned: number;
	effort_minutes: number;
	streak_days: number;
	grace_days_used: number;
	category_breakdown: Record<QuestCategory, number>;
	skipped_quest_titles: string[];
	finance_saved: number;
	health_days_logged: number;
	reflection_notes: string;
	next_priorities: string[];
	completed_at: ISO8601String;
}

export interface CategoryMastery extends ModelBase {
	user_id: ObjectID;
	category: QuestCategory;
	mastery_level: number;
	mastery_exp: number;
	is_primary: boolean;
	is_secondary: boolean;
	custom_name?: string;
	milestones_unlocked?: string[];
}

export interface CategoryMasterySummary {
	masteries: CategoryMastery[];
	primary?: QuestCategory;
	secondary?: QuestCategory;
	total_levels: number;
}

export type GoalRetrospectiveOutcome =
	"achieved" | "partially_achieved" | "abandoned" | "replaced";
export type WorkloadFatigueScore = "low" | "balanced" | "heavy" | "overloaded";

export interface WorkloadDaySummary {
	date: string;
	total_planned_minutes: number;
	capacity_minutes: number;
	hard_quests_count: number;
	max_hard_quests: number;
	fatigue_score: WorkloadFatigueScore;
	sustainable: boolean;
	warnings: string[];
}

export interface WorkloadConfig extends ModelBase {
	user_id: ObjectID;
	daily_capacity_minutes: Record<string, number>;
	max_hard_quests_per_day: number;
	buffer_minutes: number;
}

export interface GoalRetrospective extends ModelBase {
	user_id: ObjectID;
	goal_id: ObjectID;
	outcome: GoalRetrospectiveOutcome;
	obstacles: string;
	learnings: string;
	effective_routines: string[];
	completed_at: ISO8601String;
}

export interface GoalRetrospectiveSummary {
	retrospective: GoalRetrospective;
	goal: Goal;
	planned_days: number;
	actual_days: number;
	completed_milestones_count: number;
	total_milestones_count: number;
}

export interface ScheduleQuestInput {
	quest_id: ObjectID;
	scheduled_date: string;
	start_time?: string;
	end_time?: string;
	estimated_minutes?: number;
	is_recurring_exception?: boolean;
}

export interface RescheduleQuestInput {
	schedule_id: ObjectID;
	scheduled_date: string;
	start_time?: string;
	end_time?: string;
}

export interface UpdateWorkloadConfigInput {
	daily_capacity_minutes?: Record<string, number>;
	max_hard_quests_per_day?: number;
	buffer_minutes?: number;
}

export interface CloseGoalRetrospectiveInput {
	outcome: GoalRetrospectiveOutcome;
	obstacles?: string;
	learnings?: string;
	effective_routines?: string[];
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

export interface AvatarPreset {
	id: string;
	name: string;
	equipped: Record<string, string>;
	palette_id?: string;
}

export interface Avatar extends ModelBase {
	user_id: ObjectID;
	seed: string;
	equipped: Record<string, string>;
	palette_id?: string;
	title?: string;
	presets?: AvatarPreset[];
}

export interface WardrobeItem {
	cosmetic_key: string;
	shop_item_id?: string;
	slot: string;
	name: string;
	description: string;
	price_px: number;
	owned: boolean;
	equipped: boolean;
	unlock_type: "default" | "purchase" | "perk" | "achievement";
	required_perk?: PerkID;
	required_level: number;
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

export interface RewardBreakdown {
	base_exp: number;
	base_px: number;
	streak_multiplier: number;
	perk_multiplier: number;
	buff_multiplier: number;
	decay_factor: number;
	final_exp: number;
	final_px: number;
}

export interface AwardResult {
	exp: number;
	px: number;
	multiplier: number;
	decay_factor: number;
	leveled_to: number;
	skill_points_gained: number;
	breakdown?: RewardBreakdown;
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

// Circles
export interface Circle extends ModelBase {
	name: string;
	description: string;
	motto: string;
	owner_user_id: ObjectID;
	level: number;
	bond_xp: number;
	privacy: CirclePrivacy;
	member_limit: number;
}

export interface CircleMember extends ModelBase {
	user_id: ObjectID;
	circle_id: ObjectID;
	role: CircleRole;
	status_visibility: CircleStatusVisibility;
	activity_visibility: CircleActivityVisibility;
	joined_at: ISO8601String;
	reward_eligible_at: ISO8601String;
	last_contribution_at?: ISO8601String;
	left_at?: ISO8601String;
}

export interface CircleInvite extends ModelBase {
	circle_id: ObjectID;
	inviter_id: ObjectID;
	invitee_id?: ObjectID;
	invite_code: string;
	status: CircleInviteStatus;
	expires_at: ISO8601String;
	accepted_at?: ISO8601String;
}

export interface CircleWeek extends ModelBase {
	circle_id: ObjectID;
	week_id: string;
	contribution_days: number;
	momentum_tier: CircleMomentumTier;
	reward_status: CircleRewardStatus;
}

export interface CircleGoal extends ModelBase {
	circle_id: ObjectID;
	week_id: string;
	goal_type: CircleGoalType;
	target: number;
	current_progress: number;
	reward_xp: number;
	reward_px: number;
	status: CircleGoalStatus;
	claimed_at?: ISO8601String;
}

export interface CircleActivity extends ModelBase {
	user_id: ObjectID;
	circle_id: ObjectID;
	message_template: string;
	reactions: Record<CircleReactionType, number>;
	user_reactions: Record<string, CircleReactionType>;
}

export interface CircleMemberSummary {
	member: CircleMember;
	username: string;
	avatar_equipped: Record<string, string>;
	broad_status: string;
	contribution_count_this_week: number;
	is_active_today: boolean;
	is_eligible_for_reward: boolean;
}

export interface CircleSummary {
	circle: Circle;
	members: CircleMemberSummary[];
	current_week: CircleWeek;
	active_goal?: CircleGoal;
	supporting_members_count: number;
	together_bonus_percent: number;
	pending_invites_count: number;
	my_role: CircleRole;
}

export interface CircleActivitySummary {
	activity: CircleActivity;
	username: string;
	avatar_equipped: Record<string, string>;
}

export interface CreateCircleInput {
	name: string;
	description?: string;
	motto?: string;
}

export interface UpdateCircleInput {
	name?: string;
	description?: string;
	motto?: string;
	privacy?: CirclePrivacy;
}

export interface InviteMemberInput {
	invitee_username?: string;
}

export interface UpdateMemberSettingsInput {
	status_visibility?: CircleStatusVisibility;
	activity_visibility?: CircleActivityVisibility;
}

export interface CreateCircleGoalInput {
	goal_type: CircleGoalType;
}

export interface ReactToActivityInput {
	activity_id: ObjectID;
	reaction: CircleReactionType;
}
