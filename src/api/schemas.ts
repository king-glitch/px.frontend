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

/**
 * Quest Schemas
 */
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
});

export type QuestFormData = z.infer<typeof questSchema>;

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
