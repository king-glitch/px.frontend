import React from "react";
import { HStack, Input, Stack } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
	SearchableSelect,
	type SearchableSelectItem,
} from "@/components/ui/searchable-select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toaster } from "@/components/ui/toaster";
import { handleFormApiError } from "@/utils/form-error";
import { useCreateFinanceBudget } from "@/api";
import { useTranslation, type TFunction } from "@/lib/i18n";

const EXPENSE_CATEGORY_KEYS = [
	["rent", "Rent"],
	["groceries", "Groceries"],
	["diningOut", "Dining Out"],
	["utilities", "Utilities"],
	["transport", "Transport"],
	["entertainment", "Entertainment"],
	["shopping", "Shopping"],
	["health", "Health"],
	["education", "Education"],
	["other", "Other"],
] as const;

function getExpenseCategories(t: TFunction): SearchableSelectItem[] {
	return EXPENSE_CATEGORY_KEYS.map(([key, value]) => ({
		label: t(`routes.finance.categories.expense.${key}.label`),
		value,
		description: t(`routes.finance.categories.expense.${key}.description`),
	}));
}

const budgetFormSchema = z.object({
	category: z.string().min(1, "Category is required"),
	monthly_limit: z
		.number({ message: "Limit must be a number" })
		.positive("Limit must be positive"),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

interface CreateBudgetDialogProps {
	onClose: () => void;
}

export const CreateBudgetDialog: React.FC<CreateBudgetDialogProps> = ({
	onClose,
}) => {
	const { t } = useTranslation();
	const EXPENSE_CATEGORIES = React.useMemo(
		() => getExpenseCategories(t),
		[t],
	);
	const createBudget = useCreateFinanceBudget();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<BudgetFormData>({
		resolver: zodResolver(budgetFormSchema),
		defaultValues: { category: "Groceries", monthly_limit: 0 },
	});

	const selectedCategory = watch("category") || "Groceries";

	const onSubmit = async (values: BudgetFormData) => {
		try {
			await createBudget.mutateAsync({
				category: values.category.trim(),
				monthly_limit: values.monthly_limit,
			});
			toaster.create({
				title: t("routes.finance.createBudget.created"),
				type: "success",
			});
			reset();
			onClose();
		} catch (err) {
			handleFormApiError(err, setError);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack gap={3}>
				<Field
					label={t("routes.finance.createBudget.category")}
					required
					invalid={Boolean(errors.category)}
					errorText={errors.category?.message}
				>
					<SearchableSelect
						items={EXPENSE_CATEGORIES}
						value={selectedCategory}
						onValueChange={(val) =>
							setValue("category", val, {
								shouldValidate: true,
							})
						}
						placeholder={t(
							"routes.finance.createBudget.selectCategory",
						)}
					/>
				</Field>

				<Field
					label={t("routes.finance.createBudget.monthlyLimit")}
					required
					invalid={Boolean(errors.monthly_limit)}
					errorText={errors.monthly_limit?.message}
				>
					<Input
						type="number"
						placeholder={t(
							"routes.finance.createBudget.limitPlaceholder",
						)}
						rounded="pill"
						bg="bg.muted"
						{...register("monthly_limit", {
							valueAsNumber: true,
						})}
					/>
				</Field>

				<HStack justify="flex-end" gap={2} pt={2}>
					<Button variant="ghost" size="sm" onClick={onClose}>
						{t("routes.finance.createBudget.cancel")}
					</Button>
					<Button
						variant="dark"
						size="sm"
						type="submit"
						loading={isSubmitting}
					>
						{t("routes.finance.createBudget.setTarget")}
					</Button>
				</HStack>
			</Stack>
		</form>
	);
};
