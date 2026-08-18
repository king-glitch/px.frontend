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
        "Username can only contain lowercase letters, numbers, dots, and underscores"
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
 * Category Schemas
 */
export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;

/**
 * Transaction Schemas
 */
export const createTransactionSchema = z.object({
  direction: z.enum(["in", "out"]),
  amount: z.number().positive("Amount must be greater than 0"),
  fee: z.number().min(0).optional(),
  currency: z.string().optional(),
  occurred_at: z.string().optional(),
  transaction_number: z.string().optional(),
  from_account: z.string().optional(),
  bank_code: z.string().optional(),
  counterparty_type: z.enum(["account", "promptpay", "company", "card"]).optional(),
  counterparty_name: z.string().optional(),
  counterparty_account: z.string().optional(),
  counterparty_bank: z.string().optional(),
  category_id: z.string().optional(),
  note: z.string().optional(),
});

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").optional(),
  fee: z.number().min(0).optional(),
  occurred_at: z.string().optional(),
  from_account: z.string().optional(),
  note: z.string().optional(),
  category_id: z.string().optional(),
  direction: z.enum(["in", "out"]).optional(),
});

export type UpdateTransactionFormData = z.infer<typeof updateTransactionSchema>;

/**
 * Counterparty Schemas
 */
export const counterpartySchema = z.object({
  name: z.string().min(1, "Counterparty name is required").optional(),
  note: z.string().optional(),
});

export type CounterpartyFormData = z.infer<typeof counterpartySchema>;
