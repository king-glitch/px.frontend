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
