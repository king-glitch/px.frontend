import React, { useState } from "react";
import {
	Button,
	Grid,
	HStack,
	Icon,
	Input,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";
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
import { useTranslation, type TFunction } from "@/lib/i18n";

const INCOME_CATEGORY_KEYS = [
	["salary", "Salary"],
	["freelance", "Freelance"],
	["investment", "Investment"],
	["gift", "Gift"],
	["other", "Other"],
] as const;

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

function getIncomeCategories(t: TFunction): SearchableSelectItem[] {
	return INCOME_CATEGORY_KEYS.map(([key, value]) => ({
		label: t(`routes.finance.categories.income.${key}.label`),
		value,
		description: t(`routes.finance.categories.income.${key}.description`),
	}));
}

function getExpenseCategories(t: TFunction): SearchableSelectItem[] {
	return EXPENSE_CATEGORY_KEYS.map(([key, value]) => ({
		label: t(`routes.finance.categories.expense.${key}.label`),
		value,
		description: t(`routes.finance.categories.expense.${key}.description`),
	}));
}

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

const entryFormSchema = z.object({
	direction: z.enum(["income", "expense"]),
	amount: z
		.number({ message: "Amount must be a number" })
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
	const { t } = useTranslation();
	const INCOME_CATEGORIES = React.useMemo(() => getIncomeCategories(t), [t]);
	const EXPENSE_CATEGORIES = React.useMemo(
		() => getExpenseCategories(t),
		[t],
	);
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
				currency: "USD",
				category: values.category.trim(),
				occurred_on: values.occurred_on,
				note: values.note?.trim() || undefined,
			});
			toaster.create({
				title: t("routes.finance.createEntry.logged"),
				description: t("routes.finance.createEntry.loggedDescription", {
					amount: values.amount,
					category: values.category,
				}),
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
							<Text>
								{t("routes.finance.createEntry.expense")}
							</Text>
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
							<Text>
								{t("routes.finance.createEntry.income")}
							</Text>
						</HStack>
					</Button>
				</HStack>

				<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
					<Field
						label={t("routes.finance.createEntry.amount")}
						required
						invalid={Boolean(errors.amount)}
						errorText={errors.amount?.message}
					>
						<Input
							type="number"
							step="0.01"
							placeholder={t(
								"routes.finance.createEntry.amountPlaceholder",
							)}
							rounded="pill"
							bg="bg.muted"
							{...register("amount", { valueAsNumber: true })}
						/>
					</Field>

					<Field
						label={t("routes.finance.createEntry.category")}
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
							placeholder={t(
								"routes.finance.createEntry.selectCategory",
							)}
						/>
					</Field>
				</Grid>

				<Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
					<Field
						label={t("routes.finance.createEntry.date")}
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

					<Field label={t("routes.finance.createEntry.note")}>
						<Input
							placeholder={t(
								"routes.finance.createEntry.notePlaceholder",
							)}
							rounded="pill"
							bg="bg.muted"
							{...register("note")}
						/>
					</Field>
				</Grid>

				<HStack justify="flex-end" gap={2} pt={2}>
					<Button variant="ghost" size="sm" onClick={onClose}>
						{t("routes.finance.createEntry.cancel")}
					</Button>
					<Button
						variant="solid"
						size="sm"
						type="submit"
						loading={isSubmitting}
					>
						{t("routes.finance.createEntry.saveEntry")}
					</Button>
				</HStack>
			</Stack>
		</form>
	);
};
