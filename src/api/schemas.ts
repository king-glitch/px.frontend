import { z } from "zod";

/**
 * Auth Schemas
 */
export const loginSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
	.object({
		username: z
			.string()
			.min(1, "Username is required")
			.regex(
				/^[a-z0-9._]+$/,
				"Username can only contain lowercase letters, numbers, dots, and underscores",
			),
		password: z.string().min(1, "Password is required"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Duolingo Schemas
 */
export const connectDuolingoSchema = z.object({
	bot_username: z.string().min(1, "Duolingo username is required"),
	bot_password: z.string().min(1, "Duolingo password is required"),
});

export type ConnectDuolingoFormData = z.infer<typeof connectDuolingoSchema>;

export const subtaskSchema = z.object({
	title: z.string().min(1, "Subtask title is required"),
	completed: z.boolean(),
	order: z.number(),
});

export const questSchema = z.object({
	title: z.string().min(1, "Quest title is required"),
	notes: z.string().optional(),
	category: z.enum([
		"work",
		"health",
		"learning",
		"chores",
		"mindfulness",
		"social",
		"finance",
	]),
	cadence: z.enum(["daily", "weekly", "monthly", "one_off"]),
	effort: z.enum(["trivial", "light", "moderate", "hard", "grueling"]),
	minutes: z
		.number()
		.min(1, "Duration must be at least 1 minute")
		.max(720, "Duration cannot exceed 12 hours"),
	scored: z.boolean(),
	schedule_days: z.array(z.number()).optional(),
	subtasks: z.array(subtaskSchema).optional(),
	project_id: z.string().optional(),
	milestone_id: z.string().optional(),
	is_mvq: z.boolean().optional(),
	mvq_minutes: z.number().optional(),
});

export type QuestFormData = z.infer<typeof questSchema>;

/**
 * Goal & Project Schemas
 */
export const goalSchema = z.object({
	title: z.string().min(1, "Goal title is required"),
	description: z.string().optional(),
	area: z.enum(["health", "wealth", "mastery", "personal", "social"]),
	category: z.enum([
		"work",
		"health",
		"learning",
		"chores",
		"mindfulness",
		"social",
		"finance",
	]),
	target_date: z.string().optional(),
	target_metric: z.string().optional(),
	target_value: z.number().optional(),
	exp_reward: z.number().min(0),
	px_reward: z.number().min(0),
});

export type GoalFormData = z.infer<typeof goalSchema>;

export const projectSchema = z.object({
	goal_id: z.string().min(1, "Goal ID is required"),
	title: z.string().min(1, "Project title is required"),
	description: z.string().optional(),
	target_date: z.string().optional(),
	order: z.number(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export const milestoneSchema = z.object({
	goal_id: z.string().min(1, "Goal ID is required"),
	project_id: z.string().min(1, "Project ID is required"),
	title: z.string().min(1, "Milestone title is required"),
	order: z.number(),
	exp_reward: z.number().min(0),
	px_reward: z.number().min(0),
});

export type MilestoneFormData = z.infer<typeof milestoneSchema>;

/**
 * Routine Schemas
 */
export const routineStepSchema = z.object({
	title: z.string().min(1, "Step title is required"),
	minutes: z.number().min(1, "Minutes must be >= 1"),
	category: z.enum([
		"work",
		"health",
		"learning",
		"chores",
		"mindfulness",
		"social",
		"finance",
	]),
	effort: z.enum(["trivial", "light", "moderate", "hard", "grueling"]),
	order: z.number(),
});

export const routineSchema = z.object({
	title: z.string().min(1, "Routine title is required"),
	description: z.string().optional(),
	schedule_days: z.array(z.number()),
	estimated_m: z.number().min(0),
	steps: z.array(routineStepSchema),
	is_template: z.boolean(),
});

export type RoutineFormData = z.infer<typeof routineSchema>;

/**
 * Review Schemas
 */
export const finalizeReviewSchema = z.object({
	period_type: z.enum(["weekly", "monthly"]),
	period: z.string().min(1, "Period is required"),
	reflection_notes: z.string().optional().default(""),
	next_priorities: z.array(z.string()).default([]),
});

export type FinalizeReviewFormData = z.infer<typeof finalizeReviewSchema>;

/**
 * Shop Schemas
 */
export const customShopItemSchema = z.object({
	title: z.string().min(1, "Reward title is required"),
	description: z.string().optional(),
	cost_px: z.number().min(1, "PX price must be at least 1"),
	currency_symbol: z.string().optional(),
	currency_cost: z.number().min(0).optional(),
	expires_in_days: z.number().min(1).max(365).optional(),
});

export type CustomShopItemFormData = z.infer<typeof customShopItemSchema>;

/**
 * Finance Schemas
 */
export const financeTransactionSchema = z.object({
	title: z.string().min(1, "Transaction title is required"),
	amount: z.coerce.number().positive("Amount must be greater than 0"),
	direction: z.enum(["income", "expense"]),
	currency: z.string().min(1, "Currency is required"),
	category: z.string().min(1, "Category is required"),
	notes: z.string().optional(),
});

export type FinanceTransactionFormData = z.infer<
	typeof financeTransactionSchema
>;

export const financeConvertSchema = z.object({
	points: z.coerce.number().positive("Points must be greater than 0"),
});

export type FinanceConvertFormData = z.infer<typeof financeConvertSchema>;

export const scheduleQuestSchema = z.object({
	quest_id: z.string().min(1, "Quest is required"),
	scheduled_date: z.string().min(1, "Scheduled date is required"),
	start_time: z.string().optional(),
	end_time: z.string().optional(),
	estimated_minutes: z.coerce
		.number()
		.min(1, "Estimated minutes must be positive")
		.default(30),
	is_recurring_exception: z.boolean().default(false),
});

export type ScheduleQuestFormData = z.infer<typeof scheduleQuestSchema>;

export const rescheduleQuestSchema = z.object({
	schedule_id: z.string().min(1, "Schedule ID is required"),
	scheduled_date: z.string().min(1, "Scheduled date is required"),
	start_time: z.string().optional(),
	end_time: z.string().optional(),
});

export type RescheduleQuestFormData = z.infer<typeof rescheduleQuestSchema>;

export const updateWorkloadConfigSchema = z.object({
	daily_capacity_minutes: z.record(z.string(), z.coerce.number()).optional(),
	max_hard_quests_per_day: z.coerce.number().min(1).default(2),
	buffer_minutes: z.coerce.number().min(0).default(30),
});

export type UpdateWorkloadConfigFormData = z.infer<
	typeof updateWorkloadConfigSchema
>;

export const closeGoalRetrospectiveSchema = z.object({
	outcome: z.enum([
		"achieved",
		"partially_achieved",
		"abandoned",
		"replaced",
	]),
	obstacles: z.string().default(""),
	learnings: z.string().default(""),
	effective_routines: z.array(z.string()).default([]),
});

export type CloseGoalRetrospectiveFormData = z.infer<
	typeof closeGoalRetrospectiveSchema
>;

export const createCircleSchema = z.object({
	name: z.string().min(1, "Circle name is required").max(50),
	description: z.string().optional(),
	motto: z.string().optional(),
});

export type CreateCircleFormData = z.infer<typeof createCircleSchema>;

export const updateCircleSchema = z.object({
	name: z.string().min(1).max(50).optional(),
	description: z.string().optional(),
	motto: z.string().optional(),
	privacy: z.enum(["private", "invitation_only"]).optional(),
});

export type UpdateCircleFormData = z.infer<typeof updateCircleSchema>;

export const inviteMemberSchema = z.object({
	invitee_username: z.string().optional(),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

export const updateMemberSettingsSchema = z.object({
	status_visibility: z.enum(["minimal", "standard", "detailed"]).optional(),
	activity_visibility: z.enum(["public", "private"]).optional(),
});

export type UpdateMemberSettingsFormData = z.infer<
	typeof updateMemberSettingsSchema
>;

export const createCircleGoalSchema = z.object({
	goal_type: z.enum([
		"consistency",
		"balance",
		"routine",
		"progress",
		"recovery",
		"reflection",
	]),
});

export type CreateCircleGoalFormData = z.infer<typeof createCircleGoalSchema>;

export const reactToActivitySchema = z.object({
	activity_id: z.string().min(1),
	reaction: z.enum(["cheer", "fire", "clap", "heart", "muscle"]),
});

export type ReactToActivityFormData = z.infer<typeof reactToActivitySchema>;
