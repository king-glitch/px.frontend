import {
	Badge,
	Box,
	Button,
	Field,
	Grid,
	HStack,
	Icon,
	Input,
	Stack,
	Text,
	Textarea,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
	LuArrowDownLeft,
	LuArrowRightLeft,
	LuArrowUpRight,
	LuCalendar,
	LuCreditCard,
	LuDollarSign,
	LuSave,
} from "react-icons/lu";
import {
	useAccounts,
	useBanks,
	useCategories,
	useCreateTransaction,
	useUpdateTransaction,
} from "@/api";
import {
	createTransactionSchema,
	type CreateTransactionFormData,
} from "@/api/schemas";
import type { BankAccount, BankTransaction } from "@/api/types";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toaster } from "@/components/ui/toaster";

export interface TransactionFormProps {
	/** If editing an existing transaction, pass it here */
	transaction?: BankTransaction | null;
	/** Callback when form submission finishes successfully */
	onSuccess?: (transaction: BankTransaction) => void;
	/** Callback to cancel or close dialog */
	onCancel?: () => void;
}

function toLocalDatetimeInput(isoString?: string): string {
	if (!isoString) {
		const now = new Date();
		now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
		return now.toISOString().slice(0, 16);
	}
	try {
		const d = new Date(isoString);
		d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
		return d.toISOString().slice(0, 16);
	} catch {
		return "";
	}
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
	transaction,
	onSuccess,
	onCancel,
}) => {
	const isEdit = Boolean(transaction?.id);

	const { data: categories = [], isLoading: isCategoriesLoading } =
		useCategories();
	const { data: banks = [], isLoading: isBanksLoading } = useBanks();
	const { data: accounts = [], isLoading: isAccountsLoading } = useAccounts();
	const createMutation = useCreateTransaction();
	const updateMutation = useUpdateTransaction();

	const isPending = createMutation.isPending || updateMutation.isPending;
	const banksMap = new Map(banks.map((b) => [b.id, b]));

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CreateTransactionFormData>({
		resolver: zodResolver(createTransactionSchema),
		defaultValues: {
			direction: transaction?.direction || "out",
			amount: transaction?.amount || 0,
			fee: transaction?.fee || 0,
			currency: transaction?.currency || "THB",
			occurred_at: toLocalDatetimeInput(transaction?.occurred_at),
			from_bank_account_id: transaction?.from_bank_account_id || "",
			to_bank_account_id: transaction?.to_bank_account_id || "",
			category_id: transaction?.category_id || "",
			note: transaction?.note || "",
		},
	});

	const currentDirection = watch("direction");

	useEffect(() => {
		if (transaction) {
			reset({
				direction: transaction.direction,
				amount: transaction.amount,
				fee: transaction.fee || 0,
				currency: transaction.currency || "THB",
				occurred_at: toLocalDatetimeInput(transaction.occurred_at),
				from_bank_account_id: transaction.from_bank_account_id || "",
				to_bank_account_id: transaction.to_bank_account_id || "",
				category_id: transaction.category_id || "",
				note: transaction.note || "",
			});
		}
	}, [transaction, reset]);

	const accountItems = accounts.map((acc: BankAccount) => {
		const b = banksMap.get(acc.bank_id);
		const bankLabel = b?.code || "Bank";
		const typeLabel = acc.is_third_party ? "Contact" : "My Acc";
		return {
			label: `${bankLabel} · ${acc.name} (${acc.account_number}) [${typeLabel}]`,
			value: acc.id,
			color: acc.color,
		};
	});

	const onSubmit = async (data: CreateTransactionFormData) => {
		try {
			const occurredAtIso = data.occurred_at
				? new Date(data.occurred_at).toISOString()
				: new Date().toISOString();

			if (isEdit && transaction) {
				const updated = await updateMutation.mutateAsync({
					id: transaction.id,
					payload: {
						amount: Number(data.amount),
						fee: Number(data.fee) || 0,
						direction: data.direction,
						occurred_at: occurredAtIso,
						from_bank_account_id: data.from_bank_account_id || undefined,
						to_bank_account_id: data.to_bank_account_id || undefined,
						note: data.note || "",
						category_id: data.category_id || "",
					},
				});
				toaster.create({
					title: "Transaction updated",
					type: "success",
				});
				onSuccess?.(updated);
			} else {
				const created = await createMutation.mutateAsync({
					direction: data.direction,
					amount: Number(data.amount),
					fee: Number(data.fee) || 0,
					currency: data.currency || "THB",
					occurred_at: occurredAtIso,
					from_bank_account_id: data.from_bank_account_id || undefined,
					to_bank_account_id: data.to_bank_account_id || undefined,
					category_id: data.category_id || undefined,
					note: data.note || undefined,
				});
				toaster.create({
					title: "Transaction created",
					type: "success",
				});
				onSuccess?.(created);
			}
		} catch (error: any) {
			toaster.create({
				title: isEdit ? "Failed to update transaction" : "Failed to create transaction",
				description: error?.message || "Something went wrong",
				type: "error",
			});
		}
	};

	return (
		<form noValidate onSubmit={handleSubmit(onSubmit)}>
			<Stack gap={4}>
				{/* Direction Selector */}
				<Field.Root invalid={!!errors.direction}>
					<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
						Type
					</Field.Label>
					<HStack gap={2} w="full">
						<Button
							type="button"
							flex="1"
							size="sm"
							rounded="pill"
							variant={currentDirection === "out" ? "solid" : "outline"}
							onClick={() => setValue("direction", "out")}
						>
							<Icon as={LuArrowUpRight} />
							Expense
						</Button>
						<Button
							type="button"
							flex="1"
							size="sm"
							rounded="pill"
							variant={currentDirection === "in" ? "solid" : "outline"}
							onClick={() => setValue("direction", "in")}
						>
							<Icon as={LuArrowDownLeft} />
							Income
						</Button>
						<Button
							type="button"
							flex="1"
							size="sm"
							rounded="pill"
							variant={currentDirection === "transfer" ? "solid" : "outline"}
							onClick={() => setValue("direction", "transfer")}
						>
							<Icon as={LuArrowRightLeft} />
							Transfer
						</Button>
					</HStack>
				</Field.Root>

				{/* Amount & Fee */}
				<Grid templateColumns={{ base: "1fr", sm: "2fr 1fr" }} gap={3}>
					<Field.Root invalid={!!errors.amount} required>
						<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
							Amount (THB)
						</Field.Label>
						<HStack
							bg="bg.muted"
							px={3}
							py={1}
							rounded="pill"
							borderWidth="1px"
							borderColor={errors.amount ? "red.500" : "transparent"}
						>
							<Icon as={LuDollarSign} color="fg.muted" boxSize={4} />
							<Input
								type="number"
								step="0.01"
								placeholder="0.00"
								border="none"
								bg="transparent"
								outline="none"
								fontSize="md"
								fontWeight="semibold"
								{...register("amount", { valueAsNumber: true })}
							/>
						</HStack>
						{errors.amount && (
							<Field.ErrorText fontSize="xs">
								{errors.amount.message}
							</Field.ErrorText>
						)}
					</Field.Root>

					<Field.Root invalid={!!errors.fee}>
						<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
							Fee (THB)
						</Field.Label>
						<HStack bg="bg.muted" px={3} py={1} rounded="pill" borderWidth="1px">
							<Input
								type="number"
								step="0.01"
								placeholder="0.00"
								border="none"
								bg="transparent"
								outline="none"
								fontSize="sm"
								{...register("fee", { valueAsNumber: true })}
							/>
						</HStack>
					</Field.Root>
				</Grid>

				{/* Date / Time */}
				<Field.Root invalid={!!errors.occurred_at}>
					<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
						Date & Time
					</Field.Label>
					<HStack bg="bg.muted" px={3} py={1} rounded="pill" borderWidth="1px">
						<Icon as={LuCalendar} color="fg.muted" boxSize={4} />
						<Input
							type="datetime-local"
							border="none"
							bg="transparent"
							outline="none"
							fontSize="sm"
							{...register("occurred_at")}
						/>
					</HStack>
				</Field.Root>

				{/* From Account & To Account */}
				<Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3}>
					<Field.Root invalid={!!errors.from_bank_account_id}>
						<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
							From Account
						</Field.Label>
						<SearchableSelect
							items={accountItems}
							value={watch("from_bank_account_id") || ""}
							placeholder={
								isAccountsLoading || isBanksLoading
									? "Loading accounts..."
									: "Select source account..."
							}
							clearLabel="(None / External)"
							searchPlaceholder="Search account..."
							width="100%"
							onValueChange={(val) =>
								setValue("from_bank_account_id", val, {
									shouldValidate: true,
									shouldDirty: true,
								})
							}
						/>
					</Field.Root>

					<Field.Root invalid={!!errors.to_bank_account_id}>
						<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
							To Account / Destination
						</Field.Label>
						<SearchableSelect
							items={accountItems}
							value={watch("to_bank_account_id") || ""}
							placeholder={
								isAccountsLoading || isBanksLoading
									? "Loading accounts..."
									: "Select destination account..."
							}
							clearLabel="(None / External)"
							searchPlaceholder="Search account..."
							width="100%"
							onValueChange={(val) =>
								setValue("to_bank_account_id", val, {
									shouldValidate: true,
									shouldDirty: true,
								})
							}
						/>
					</Field.Root>
				</Grid>

				{/* Category */}
				<Field.Root invalid={!!errors.category_id}>
					<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
						Category
					</Field.Label>
					<SearchableSelect
						items={categories.map((cat) => ({
							label: cat.name,
							value: cat.id,
							color: cat.color,
						}))}
						value={watch("category_id") || ""}
						placeholder={
							isCategoriesLoading
								? "Loading categories..."
								: categories.length === 0
									? "No categories created yet (create one in Categories tab)"
									: "Select or search category..."
						}
						clearLabel="(Uncategorized)"
						searchPlaceholder="Search category..."
						width="100%"
						onValueChange={(val) =>
							setValue("category_id", val, {
								shouldValidate: true,
								shouldDirty: true,
							})
						}
					/>
				</Field.Root>

				{/* Note */}
				<Field.Root invalid={!!errors.note}>
					<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
						Note / Description
					</Field.Label>
					<Textarea
						placeholder="What was this transaction for?"
						size="sm"
						rounded="card"
						bg="bg.muted"
						rows={2}
						{...register("note")}
					/>
				</Field.Root>

				{/* Action Buttons */}
				<HStack justify="flex-end" gap={2} pt={2}>
					{onCancel && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							rounded="pill"
							disabled={isPending}
							onClick={onCancel}
						>
							Cancel
						</Button>
					)}
					<Button
						type="submit"
						size="sm"
						rounded="pill"
						loading={isPending}
					>
						<Icon as={LuSave} />
						{isEdit ? "Update Transaction" : "Save Transaction"}
					</Button>
				</HStack>
			</Stack>
		</form>
	);
};

export default TransactionForm;
