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
 * Bank Schemas
 */
export const createBankSchema = z.object({
  code: z.string().min(1, "Bank code is required"),
  name: z.string().min(1, "Bank name is required"),
});

export type CreateBankFormData = z.infer<typeof createBankSchema>;

export const updateBankSchema = z.object({
  code: z.string().min(1, "Bank code is required").optional(),
  name: z.string().min(1, "Bank name is required").optional(),
});

export type UpdateBankFormData = z.infer<typeof updateBankSchema>;

/**
 * Bank Account Schemas
 */
export const createBankAccountSchema = z.object({
  bank_id: z.string().min(1, "Bank is required"),
  account_number: z.string().min(1, "Account number is required"),
  name: z.string().min(1, "Account name / nickname is required"),
  color: z.string().optional(),
  note: z.string().optional(),
});

export type CreateBankAccountFormData = z.infer<typeof createBankAccountSchema>;

export const updateBankAccountSchema = z.object({
  bank_id: z.string().min(1, "Bank is required").optional(),
  account_number: z.string().min(1, "Account number is required").optional(),
  name: z.string().min(1, "Account name is required").optional(),
  color: z.string().optional(),
  note: z.string().optional(),
});

export type UpdateBankAccountFormData = z.infer<typeof updateBankAccountSchema>;

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
  from_bank_id: z.string().optional(),
  to_bank_id: z.string().optional(),
  from_account: z.string().optional(),
  to_account: z.string().optional(),
  bank_code: z.string().optional(),
  category_id: z.string().optional(),
  note: z.string().optional(),
});

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").optional(),
  fee: z.number().min(0).optional(),
  occurred_at: z.string().optional(),
  from_bank_id: z.string().optional(),
  to_bank_id: z.string().optional(),
  from_account: z.string().optional(),
  to_account: z.string().optional(),
  note: z.string().optional(),
  category_id: z.string().optional(),
  direction: z.enum(["in", "out"]).optional(),
});

export type UpdateTransactionFormData = z.infer<typeof updateTransactionSchema>;

