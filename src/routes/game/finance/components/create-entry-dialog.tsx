import React, { useState } from "react";
import { Grid, HStack, Icon, Input, Stack, Text } from "@chakra-ui/react";
import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";
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
import { useCreateFinanceEntry } from "@/api";
import type { FinanceDirection } from "@/api/types";

const INCOME_CATEGORIES: SearchableSelectItem[] = [
	{
		label: "Salary",
		value: "Salary",
		description: "Primary employment income",
	},
	{
		label: "Freelance",
		value: "Freelance",
		description: "Side gigs & contract work",
	},
	{
		label: "Investment",
		value: "Investment",
		description: "Dividends, interest, capital gains",
	},
	{
		label: "Gift",
		value: "Gift",
		description: "Received gifts & allowances",
	},
	{ label: "Other", value: "Other", description: "Uncategorized income" },
];

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

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

const entryFormSchema = z.object({
	direction: z.enum(["income", "expense"]),
	amount: z
		.number({ invalid_type_error: "Amount must be a number" })
		.positive("Amount must be positive"),
	category: z.string().min(1, "Category is required"),
	occurred_on: z.string().min(1, "Date is required"),
	note: z.string().optional(),
});

type EntryFormData = z.infer<typeof entryFormSchema>;

interface CreateEntryDialogProps {
	onClose: () => void;
}

export const CreateEntryDialog: React.FC<CreateEntryDialogProps> = ({
	onClose,
}) => {
	const createEntry = useCreateFinanceEntry();
	const [activeTab, setActiveTab] = useState<FinanceDirection>("expense");

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<EntryFormData>({
		resolver: zodResolver(entryFormSchema),
		defaultValues: {
			direction: "expense",
			category: "Dining Out",
			occurred_on: today(),
			amount: 0,
			note: "",
		},
	});

	const selectedCategory = watch("category") || "Dining Out";

	const onSubmit = async (values: EntryFormData) => {
		try {
			await createEntry.mutateAsync({
				direction: activeTab,
				amount: values.amount,
				category: values.category.trim(),
				occurred_on: values.occurred_on,
				note: values.note?.trim() || undefined,
			});
			toaster.create({
				title: "Entry Logged",
				description: `Logged $${values.amount} for ${values.category}`,
				type: "success",
			});
			reset({
				direction: activeTab,
				category: activeTab === "income" ? "Salary" : "Dining Out",
				occurred_on: today(),
				amount: 0,
				note: "",
			});
			onClose();
		} catch (err) {
			handleFormApiError(err, setError);
		}
	};

	const handleTabChange = (dir: FinanceDirection) => {
		setActiveTab(dir);
		setValue("direction", dir);
		setValue("category", dir === "income" ? "Salary" : "Dining Out", {
			shouldValidate: true,
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack gap={4}>
				{/* Income vs Expense Toggle */}
				<HStack gap={2}>
					<Button
						type="button"
						size="sm"
						variant={activeTab === "expense" ? "solid" : "outline"}
						colorPalette={
							activeTab === "expense" ? "slate" : undefined
						}
						onClick={() => handleTabChange("expense")}
					>
						<HStack gap={1.5}>
							<Icon as={LuTrendingDown} boxSize={3.5} />
							<Text>Expense</Text>
						</HStack>
					</Button>
					<Button
						type="button"
						size="sm"
						variant={activeTab === "income" ? "solid" : "outline"}
						colorPalette={
							activeTab === "income" ? "mint" : undefined
						}
						onClick={() => handleTabChange("income")}
					>
						<HStack gap={1.5}>
							<Icon as={LuTrendingUp} boxSize={3.5} />
							<Text>Income</Text>
						</HStack>
					</Button>
				</HStack>

				<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
					<Field
						label="Amount ($)"
						required
						invalid={Boolean(errors.amount)}
						errorText={errors.amount?.message}
					>
						<Input
							type="number"
							step="0.01"
							placeholder="e.g. 45.50"
							rounded="pill"
							bg="bg.muted"
							{...register("amount", { valueAsNumber: true })}
						/>
					</Field>

					<Field
						label="Category"
						required
						invalid={Boolean(errors.category)}
						errorText={errors.category?.message}
					>
						<SearchableSelect
							items={
								activeTab === "income"
									? INCOME_CATEGORIES
									: EXPENSE_CATEGORIES
							}
							value={selectedCategory}
							onValueChange={(val) =>
								setValue("category", val, {
									shouldValidate: true,
								})
							}
							placeholder="Select category"
						/>
					</Field>
				</Grid>

				<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
					<Field
						label="Date"
						required
						invalid={Boolean(errors.occurred_on)}
						errorText={errors.occurred_on?.message}
					>
						<Input
							type="date"
							rounded="pill"
							bg="bg.muted"
							{...register("occurred_on")}
						/>
					</Field>

					<Field label="Note / Merchant (Optional)">
						<Input
							placeholder="e.g. Dinner with team"
							rounded="pill"
							bg="bg.muted"
							{...register("note")}
						/>
					</Field>
				</Grid>

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
						Save Entry
					</Button>
				</HStack>
			</Stack>
		</form>
	);
};
