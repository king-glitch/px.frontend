import { PillButton } from "@/components/ui/pill-button";
import {
	Badge,
	Box,
	Button,
	Circle,
	Editable,
	Flex,
	FormatNumber,
	HStack,
	Heading,
	Icon,
	IconButton,
	Pagination,
	Skeleton,
	Spinner,
	Stack,
	Table,
	Text,
	VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import {
	LuArrowDownLeft,
	LuArrowLeft,
	LuArrowRight,
	LuArrowUpRight,
	LuChevronLeft,
	LuChevronRight,
	LuCloudUpload,
	LuEye,
	LuFilter,
	LuPlus,
	LuReceipt,
	LuTrash2,
} from "react-icons/lu";
import { Link, useSearchParams } from "react-router";
import {
	useActiveQueues,
	useAccounts,
	useBanks,
	useCategories,
	useDeleteTransaction,
	useTransactions,
	useUpdateTransaction,
} from "@/api";
import type { BankAccount } from "@/api/types";
import MonthRange from "@/components/financial/month-range";
import SlipDropzone from "@/components/financial/slip-dropzone";
import TransactionForm from "@/components/financial/transaction-form";
import {
	DialogActionTrigger,
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toaster } from "@/components/ui/toaster";
import { glassCard } from "@/routes/financial/layout";

export const FinancialTransactions: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const page = parseInt(searchParams.get("page") || "1", 10);
	const amount = parseInt(searchParams.get("amount") || "10", 10);
	const from = searchParams.get("from") || undefined;
	const to = searchParams.get("to") || undefined;

	const { hasActiveQueues, activeQueues } = useActiveQueues({
		tag: "bank.slip",
	});

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isDropzoneOpen, setIsDropzoneOpen] = useState(false);
	const [deletingTransactionId, setDeletingTransactionId] =
		useState<string | null>(null);

	const isDropzoneVisible = isDropzoneOpen || hasActiveQueues;

	const { data: transactionsData, isLoading } = useTransactions({
		page,
		amount,
		from,
		to,
	});
	const { data: categories = [] } = useCategories();
	const { data: banks = [] } = useBanks();
	const { data: accounts = [] } = useAccounts();

	const updateTxMutation = useUpdateTransaction();
	const deleteTxMutation = useDeleteTransaction();

	const categoriesMap = new Map(categories.map((c) => [c.id, c]));
	const banksMap = new Map(banks.map((b) => [b.id, b]));

	const findAccountName = (bankId?: string, accNum?: string) => {
		if (!accNum) return undefined;
		const match = accounts.find((a: BankAccount) => {
			if (bankId && a.bank_id !== bankId) return false;
			return a.account_number === accNum || accNum.endsWith(a.account_number.slice(-4));
		});
		return match?.name;
	};

	const transactions = transactionsData?.collection || [];
	const totalPages = transactionsData?.meta?.total_pages || 1;
	const totalCount = transactionsData?.meta?.total || 0;

	const handlePageChange = (newPage: number) => {
		const newParams = new URLSearchParams(searchParams);
		newParams.set("page", String(newPage));
		setSearchParams(newParams);
	};

	const handleDelete = async () => {
		if (!deletingTransactionId) return;
		try {
			await deleteTxMutation.mutateAsync(deletingTransactionId);
			toaster.create({ title: "Transaction deleted", type: "success" });
			setDeletingTransactionId(null);
		} catch (err: any) {
			toaster.create({
				title: "Failed to delete transaction",
				description: err?.message,
				type: "error",
			});
		}
	};

	return (
		<Stack gap={6}>
			{/* Top Controls: Date Range & Action Buttons */}
			<Flex
				align="center"
				justify="space-between"
				gap={3}
				wrap={{ base: "wrap", md: "nowrap" }}
			>
				<MonthRange />

				<HStack gap={2}>
					<PillButton
						size="sm"
						variant={isDropzoneVisible ? "dark" : "outline"}
						icon={LuCloudUpload}
						loading={hasActiveQueues}
						onClick={() => setIsDropzoneOpen((prev) => !prev)}
					>
						{hasActiveQueues
							? `Processing ${activeQueues.length} slip${
									activeQueues.length > 1 ? "s" : ""
								}`
							: isDropzoneOpen
								? "Hide Slips"
								: "Upload Slips"}
					</PillButton>
					<PillButton
						size="sm"
						variant="dark"
						icon={LuPlus}
						onClick={() => setIsCreateOpen(true)}
					>
						Add Transaction
					</PillButton>
				</HStack>
			</Flex>

			{/* Slip Dropzone Drawer / Section */}
			{isDropzoneVisible && (
				<Box>
					<SlipDropzone
						onSuccess={() => {
							// Kept open so user can drop more or close
						}}
					/>
				</Box>
			)}

			{/* Create Transaction Modal Dialog */}
			<DialogRoot
				open={isCreateOpen}
				onOpenChange={(details) => setIsCreateOpen(details.open)}
				size="lg"
			>
				<DialogContent {...glassCard} bg="bg.panel" p={6}>
					<DialogHeader p={0} mb={4}>
						<DialogTitle fontSize="lg" fontWeight="bold">
							Add Transaction
						</DialogTitle>
					</DialogHeader>
					<DialogCloseTrigger />
					<DialogBody p={0}>
						<TransactionForm
							onSuccess={() => setIsCreateOpen(false)}
							onCancel={() => setIsCreateOpen(false)}
						/>
					</DialogBody>
				</DialogContent>
			</DialogRoot>

			{/* Delete Confirmation Dialog */}
			<DialogRoot
				open={Boolean(deletingTransactionId)}
				onOpenChange={(details) => {
					if (!details.open) setDeletingTransactionId(null);
				}}
				size="sm"
			>
				<DialogContent {...glassCard} bg="bg.panel" p={6}>
					<DialogHeader p={0} mb={2}>
						<DialogTitle fontSize="md" fontWeight="bold">
							Delete Transaction
						</DialogTitle>
					</DialogHeader>
					<DialogCloseTrigger />
					<DialogBody p={0} mb={4}>
						<Text fontSize="sm" color="fg.muted">
							Are you sure you want to delete this transaction? This action cannot be undone.
						</Text>
					</DialogBody>
					<DialogFooter p={0} gap={2}>
						<DialogActionTrigger asChild>
							<Button variant="ghost" size="sm" rounded="pill">
								Cancel
							</Button>
						</DialogActionTrigger>
						<Button
							colorPalette="red"
							size="sm"
							rounded="pill"
							loading={deleteTxMutation.isPending}
							onClick={handleDelete}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</DialogRoot>

			{/* Main Transactions Table Card */}
			<Box {...glassCard} p={{ base: 4, md: 6 }} overflow="hidden">
				<Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
					<VStack align="flex-start" gap={0}>
						<Heading fontSize="md" fontWeight="bold">
							All Transactions
						</Heading>
						<Text fontSize="xs" color="fg.muted">
							Showing {transactions.length} of {totalCount} transactions
						</Text>
					</VStack>

					<Text fontSize="xs" color="fg.muted" display={{ base: "none", md: "inline" }}>
						💡 Click on Note or Payee to edit inline
					</Text>
				</Flex>

				{isLoading ? (
					<Stack gap={3}>
						<Skeleton h="12" rounded="pill" />
						<Skeleton h="12" rounded="pill" />
						<Skeleton h="12" rounded="pill" />
						<Skeleton h="12" rounded="pill" />
						<Skeleton h="12" rounded="pill" />
					</Stack>
				) : transactions.length === 0 ? (
					<VStack py={12} textAlign="center" color="fg.muted">
						<Icon as={LuReceipt} boxSize={10} color="fg.muted" />
						<Text fontSize="sm" fontWeight="medium">
							No transactions found for this date range.
						</Text>
						<PillButton
							size="xs"
							variant="dark"
							icon={LuPlus}
							mt={2}
							onClick={() => setIsCreateOpen(true)}
						>
							Add Transaction
						</PillButton>
					</VStack>
				) : (
					<Stack gap={4}>
						<Table.ScrollArea>
							<Table.Root size="sm" variant="line">
								<Table.Header>
									<Table.Row bg="bg.muted">
										<Table.ColumnHeader fontSize="xs" w="130px">
											Date
										</Table.ColumnHeader>
										<Table.ColumnHeader fontSize="xs" w="80px">
											Type
										</Table.ColumnHeader>
										<Table.ColumnHeader fontSize="xs" minW="180px">
											Transaction / Ref
										</Table.ColumnHeader>
										<Table.ColumnHeader fontSize="xs" minW="180px">
											Note / Description
										</Table.ColumnHeader>
										<Table.ColumnHeader fontSize="xs" w="160px">
											Category
										</Table.ColumnHeader>
										<Table.ColumnHeader fontSize="xs" textAlign="right" w="120px">
											Amount
										</Table.ColumnHeader>
										<Table.ColumnHeader fontSize="xs" textAlign="center" w="80px">
											Actions
										</Table.ColumnHeader>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{transactions.map((tx) => {
										const category = tx.category_id
											? categoriesMap.get(tx.category_id)
											: undefined;
										const isExpense = tx.direction === "out";

										const dateLabel = tx.occurred_at
											? new Date(tx.occurred_at).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})
											: "-";

										return (
											<Table.Row
												key={tx.id}
												_hover={{ bg: "bg.muted" }}
												transition="background 0.15s ease"
											>
												{/* Date */}
												<Table.Cell fontSize="xs" color="fg.muted">
													{dateLabel}
												</Table.Cell>

												{/* Direction Badge */}
												<Table.Cell>
													<Badge
														size="xs"
														rounded="pill"
														colorPalette={isExpense ? "red" : "green"}
													>
														<Icon
															as={isExpense ? LuArrowUpRight : LuArrowDownLeft}
															boxSize={3}
														/>
														{isExpense ? "Out" : "In"}
													</Badge>
												</Table.Cell>

												{/* Transaction Number, Bank & Account */}
												<Table.Cell>
													{(() => {
														const fromBank = tx.from_bank_id
															? banksMap.get(tx.from_bank_id)
															: undefined;
														const toBank = tx.to_bank_id
															? banksMap.get(tx.to_bank_id)
															: undefined;

														const fromAccName = findAccountName(tx.from_bank_id, tx.from_account);
														const toAccName = findAccountName(tx.to_bank_id, tx.to_account);

														return (
															<VStack align="flex-start" gap={0.5}>
																<Text fontSize="xs" fontWeight="semibold">
																	<Link to={`/financial/transactions/${tx.id}`}>
																		{tx.transaction_number || "Transaction"}
																	</Link>
																</Text>
																<HStack gap={1} fontSize="10px" color="fg.muted" flexWrap="wrap">
																	{fromBank && (
																		<Badge size="xs" variant="surface">
																			{fromBank.code}
																		</Badge>
																	)}
																	{tx.from_account && (
																		<Text>
																			{fromAccName ? `${fromAccName} (${tx.from_account})` : tx.from_account}
																		</Text>
																	)}
																	{(toBank || tx.to_account) && (
																		<>
																			<Text>→</Text>
																			{toBank && (
																				<Badge size="xs" variant="surface">
																					{toBank.code}
																				</Badge>
																			)}
																			{tx.to_account && (
																				<Text>
																					{toAccName ? `${toAccName} (${tx.to_account})` : tx.to_account}
																				</Text>
																			)}
																		</>
																	)}
																</HStack>
															</VStack>
														);
													})()}
												</Table.Cell>

												{/* Note Editable */}
												<Table.Cell>
													<Editable.Root
														key={tx.id + (tx.note || "")}
														defaultValue={tx.note || ""}
														placeholder="Click to add note..."
														onValueCommit={(details) => {
															if (details.value !== (tx.note || "")) {
																updateTxMutation.mutate({
																	id: tx.id,
																	payload: { note: details.value },
																});
															}
														}}
													>
														<Editable.Preview
															fontSize="xs"
															cursor="pointer"
															_hover={{
																bg: "bg.panel",
																rounded: "sm",
																px: 1,
															}}
														/>
														<Editable.Input
															fontSize="xs"
															rounded="pill"
															bg="bg.panel"
															px={2}
															py={1}
														/>
													</Editable.Root>
												</Table.Cell>

												{/* Category Searchable Dropdown */}
												<Table.Cell>
													<SearchableSelect
														size="xs"
														width="150px"
														items={categories.map((c) => ({
															label: c.name,
															value: c.id,
															color: c.color,
														}))}
														value={tx.category_id || ""}
														placeholder="(Uncategorized)"
														clearLabel="(Uncategorized)"
														searchPlaceholder="Search category..."
														onValueChange={(newCategoryId) => {
															updateTxMutation.mutate({
																id: tx.id,
																payload: { category_id: newCategoryId },
															});
														}}
													/>
												</Table.Cell>

												{/* Amount */}
												<Table.Cell textAlign="right">
													<Text
														fontSize="xs"
														fontWeight="bold"
														color={isExpense ? "red.fg" : "green.fg"}
													>
														{isExpense ? "-" : "+"}
														<FormatNumber
															value={tx.amount}
															style="currency"
															currency={tx.currency || "THB"}
														/>
													</Text>
													{tx.fee > 0 && (
														<Text fontSize="10px" color="fg.muted">
															Fee: {tx.fee}
														</Text>
													)}
												</Table.Cell>

												{/* Actions */}
												<Table.Cell textAlign="center">
													<HStack justify="center" gap={1}>
														<IconButton
															asChild
															size="xs"
															variant="ghost"
															aria-label="View details"
															title="View details"
															rounded="full"
														>
															<Link to={`/financial/transactions/${tx.id}`}>
																<Icon as={LuEye} boxSize={3.5} />
															</Link>
														</IconButton>
														<IconButton
															size="xs"
															variant="ghost"
															colorPalette="red"
															aria-label="Delete transaction"
															title="Delete"
															rounded="full"
															onClick={() => setDeletingTransactionId(tx.id)}
														>
															<Icon as={LuTrash2} boxSize={3.5} />
														</IconButton>
													</HStack>
												</Table.Cell>
											</Table.Row>
										);
									})}
								</Table.Body>
							</Table.Root>
						</Table.ScrollArea>

						{/* Pagination Controls */}
						{totalPages > 1 && (
							<Flex justify="space-between" align="center" pt={3} wrap="wrap" gap={2}>
								<Text fontSize="xs" color="fg.muted">
									Page {page} of {totalPages} ({totalCount} total)
								</Text>
								<HStack gap={2}>
									<Button
										size="xs"
										variant="outline"
										rounded="pill"
										disabled={page <= 1}
										onClick={() => handlePageChange(page - 1)}
									>
										<Icon as={LuChevronLeft} />
										Previous
									</Button>
									<Button
										size="xs"
										variant="outline"
										rounded="pill"
										disabled={page >= totalPages}
										onClick={() => handlePageChange(page + 1)}
									>
										Next
										<Icon as={LuChevronRight} />
									</Button>
								</HStack>
							</Flex>
						)}
					</Stack>
				)}
			</Box>
		</Stack>
	);
};

export default FinancialTransactions;
