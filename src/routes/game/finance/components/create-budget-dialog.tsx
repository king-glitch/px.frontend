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

const EXPENSE_CATEGORIES: SearchableSelectItem[] = [
	{ label: "Rent", value: "Rent", description: "Housing & lease payments" },
	{
		label: "Groceries",
		value: "Groceries",
		description: "Supermarket & food supplies",
	},
	{
		label: "Dining Out",
		value: "Dining Out",
		description: "Restaurants & cafes",
	},
	{
		label: "Utilities",
		value: "Utilities",
		description: "Electricity, water, internet",
	},
	{
		label: "Transport",
		value: "Transport",
		description: "Fuel, transit, ride-sharing",
	},
	{
		label: "Entertainment",
		value: "Entertainment",
		description: "Movies, games, streaming",
	},
	{
		label: "Shopping",
		value: "Shopping",
		description: "Clothing, gadgets, misc goods",
	},
	{
		label: "Health",
		value: "Health",
		description: "Medical, gym, pharmacy",
	},
	{
		label: "Education",
		value: "Education",
		description: "Courses, books, tuition",
	},
	{ label: "Other", value: "Other", description: "Uncategorized expenses" },
];

const budgetFormSchema = z.object({
	category: z.string().min(1, "Category is required"),
	monthly_limit: z
		.number({ invalid_type_error: "Limit must be a number" })
		.positive("Limit must be positive"),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

interface CreateBudgetDialogProps {
	onClose: () => void;
}

export const CreateBudgetDialog: React.FC<CreateBudgetDialogProps> = ({
	onClose,
}) => {
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
				title: "Budget Target Created",
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
					label="Category"
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
						placeholder="Select expense category"
					/>
				</Field>

				<Field
					label="Monthly Limit ($)"
					required
					invalid={Boolean(errors.monthly_limit)}
					errorText={errors.monthly_limit?.message}
				>
					<Input
						type="number"
						placeholder="e.g. 500"
						rounded="pill"
						bg="bg.muted"
						{...register("monthly_limit", {
							valueAsNumber: true,
						})}
					/>
				</Field>

				<HStack justify="flex-end" gap={2} pt={2}>
					<Button variant="ghost" size="sm" onClick={onClose}>
						Cancel
					</Button>
					<Button
						variant="dark"
						size="sm"
						type="submit"
						loading={isSubmitting}
					>
						Set Target
					</Button>
				</HStack>
			</Stack>
		</form>
	);
};
