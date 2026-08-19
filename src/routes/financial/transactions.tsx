import { PillButton } from "@/components/ui/pill-button";
import { Avatar } from "@/components/ui/avatar";
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
	LuList,
	LuPlus,
	LuReceipt,
	LuTable,
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
import { Tooltip } from "@/components/ui/tooltip";
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
	const [viewMode, setViewMode] = useState<"list" | "table">("list");

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
	const accountsMap = new Map(accounts.map((a) => [a.id, a]));

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
				<DialogContent {...glassCard}  p={6}>
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
				<DialogContent {...glassCard}  p={6}>
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

					<HStack>
						<Text fontSize="xs" color="fg.muted" display={{ base: "none", md: "inline" }} mr={2}>
							💡 Click on Note or Payee to edit inline
						</Text>
						<HStack bg="bg.muted" p={1} rounded="pill">
							<IconButton
								size="xs"
								variant={viewMode === "list" ? "surface" : "ghost"}
								rounded="pill"
								onClick={() => setViewMode("list")}
								aria-label="List View"
							>
								<Icon as={LuList} />
							</IconButton>
							<IconButton
								size="xs"
								variant={viewMode === "table" ? "surface" : "ghost"}
								rounded="pill"
								onClick={() => setViewMode("table")}
								aria-label="Table View"
							>
								<Icon as={LuTable} />
							</IconButton>
						</HStack>
					</HStack>
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
						{viewMode === "table" ? (
							<Box overflowX="auto" borderWidth={1} borderColor="border.subtle" rounded="xl">
								<Table.Root size="sm" variant="line" interactive>
									<Table.Header>
										<Table.Row bg="bg.muted">
											<Table.ColumnHeader py={3} px={4}>Date</Table.ColumnHeader>
											<Table.ColumnHeader py={3} px={4}>Transaction</Table.ColumnHeader>
											<Table.ColumnHeader py={3} px={4}>Note</Table.ColumnHeader>
											<Table.ColumnHeader py={3} px={4}>Category</Table.ColumnHeader>
											<Table.ColumnHeader py={3} px={4} textAlign="right">Amount</Table.ColumnHeader>
											<Table.ColumnHeader py={3} px={4} w="4"></Table.ColumnHeader>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{transactions.map((tx) => {
											const category = tx.category_id ? categoriesMap.get(tx.category_id) : undefined;
											const isExpense = tx.direction === "out";
											const isTransfer = tx.direction === "transfer";
											const dateLabel = tx.occurred_at ? new Date(tx.occurred_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
											const fromAccount = tx.from_bank_account_id ? accountsMap.get(tx.from_bank_account_id) : undefined;
											const toAccount = tx.to_bank_account_id ? accountsMap.get(tx.to_bank_account_id) : undefined;

											return (
												<Table.Row key={tx.id}>
													<Table.Cell px={4} color="fg.muted" fontSize="sm" whiteSpace="nowrap">{dateLabel}</Table.Cell>
													<Table.Cell px={4}>
														<HStack gap={2}>
															<Badge size="xs" variant="surface" colorPalette={isTransfer ? "purple" : isExpense ? "gray" : "green"}>
																{isTransfer ? "Transfer" : isExpense ? "Out" : "In"}
															</Badge>
															<Link to={`/financial/transactions/${tx.id}`}>
																<Text fontSize="sm" fontWeight="bold" color="fg">{tx.transaction_number || "Tx"}</Text>
															</Link>
														</HStack>
														{(fromAccount || toAccount) && (
															<HStack gap={1} fontSize="xs" color="fg.muted" mt={1}>
																{fromAccount && <Text>{fromAccount.name}</Text>}
																{fromAccount && toAccount && <Text>→</Text>}
																{toAccount && <Text>{toAccount.name}</Text>}
															</HStack>
														)}
													</Table.Cell>
													<Table.Cell px={4} minW="200px">
														<Editable.Root
															key={tx.id + (tx.note || "")}
															defaultValue={tx.note || ""}
															placeholder="Add note..."
															onValueCommit={(details) => {
																if (details.value !== (tx.note || "")) {
																	updateTxMutation.mutate({ id: tx.id, payload: { note: details.value } });
																}
															}}
														>
															<Editable.Area>
																<Editable.Preview fontSize="sm" _hover={{ bg: "bg.muted", rounded: "sm", px: 1, ml: -1 }} cursor="pointer" />
																<Editable.Input fontSize="sm" bg="bg.muted" px={2} py={1} rounded="md" />
															</Editable.Area>
														</Editable.Root>
													</Table.Cell>
													<Table.Cell px={4}>
														<Box w="140px">
															<SearchableSelect
																size="sm"
																items={categories.map((c) => ({ label: c.name, value: c.id, color: c.color }))}
																value={tx.category_id || ""}
																placeholder="Category..."
																clearLabel="Clear"
																searchPlaceholder="Search..."
																onValueChange={(newCategoryId) => {
																	updateTxMutation.mutate({ id: tx.id, payload: { category_id: newCategoryId } });
																}}
															/>
														</Box>
													</Table.Cell>
													<Table.Cell px={4} textAlign="right" whiteSpace="nowrap">
														<Text fontSize="sm" fontWeight="bold" color="fg">
															{isTransfer ? "⇄ " : isExpense ? "-" : "+"}
															<FormatNumber value={tx.amount} style="currency" currency={tx.currency || "THB"} />
														</Text>
														{tx.fee > 0 && <Text fontSize="xs" color="fg.muted">Fee: {tx.fee}</Text>}
													</Table.Cell>
													<Table.Cell px={4}>
														<IconButton size="xs" variant="ghost" colorPalette="red" aria-label="Delete" rounded="full" onClick={() => setDeletingTransactionId(tx.id)}>
															<Icon as={LuTrash2} />
														</IconButton>
													</Table.Cell>
												</Table.Row>
											);
										})}
									</Table.Body>
								</Table.Root>
							</Box>
						) : (
							<Stack gap={3}>
								{transactions.map((tx) => {
								const category = tx.category_id
									? categoriesMap.get(tx.category_id)
									: undefined;
								const isExpense = tx.direction === "out";
								const isTransfer = tx.direction === "transfer";

								const dateLabel = tx.occurred_at
									? new Date(tx.occurred_at).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})
									: "-";

								const fromAccount = tx.from_bank_account_id
									? accountsMap.get(tx.from_bank_account_id)
									: undefined;
								const toAccount = tx.to_bank_account_id
									? accountsMap.get(tx.to_bank_account_id)
									: undefined;

								return (
									<Flex
										key={tx.id}
										justify="space-between"
										align="center"
										wrap="wrap"
										gap={4}
										
										_hover={{ bg: "bg.muted" }}
										p={4}
										rounded="2xl"
										
										
										transition="all 0.2s"
									>
										{/* Left Side: Avatar & Details */}
										<HStack gap={4} flex="1" minW="300px">
											<Avatar
												name={tx.note || "Transaction"}
												size="md"
												shape="full"
												src={isExpense || isTransfer ? undefined : "https://i.pravatar.cc/150?u=" + tx.id}
												colorPalette={isTransfer ? "purple" : isExpense ? "gray" : "mint"}
											/>
											<VStack align="flex-start" gap={1} flex="1">
												<HStack gap={2} wrap="wrap">
													<Text fontSize="sm" fontWeight="bold" color="fg">
														<Link to={`/financial/transactions/${tx.id}`}>
															{tx.transaction_number || "Transaction"}
														</Link>
													</Text>
													<Badge
														size="xs"
														rounded="pill"
														variant="surface"
														colorPalette={isTransfer ? "purple" : isExpense ? "gray" : "green"}
													>
														{isTransfer ? "Transfer" : isExpense ? "Out" : "In"}
													</Badge>
													<Text fontSize="10px" color="fg.muted" fontWeight="medium">
														• {dateLabel}
													</Text>
												</HStack>

												<HStack gap={3} w="full" wrap="wrap">
													{/* Editable Note */}
													<Tooltip content={tx.note ? "Click to edit note" : "Click to add note"} showArrow positioning={{ placement: "top-start" }}>
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
															<Editable.Area>
																<Editable.Preview
																	fontSize="sm"
																	color="fg.muted"
																	fontWeight="medium"
																	cursor="pointer"
																	_hover={{ bg: "bg.muted", rounded: "sm", px: 1, ml: -1 }}
																/>
																<Editable.Input fontSize="sm" rounded="pill" bg="bg.muted" px={3} py={1} />
															</Editable.Area>
														</Editable.Root>
													</Tooltip>
												</HStack>

												{/* Accounts Flow */}
												{(fromAccount || toAccount) && (
													<HStack gap={1} fontSize="10px" color="fg.muted" flexWrap="wrap" mt={1}>
														{fromAccount && (
															<Text>
																{fromAccount.name} ({fromAccount.account_number.slice(-4)})
															</Text>
														)}
														{fromAccount && toAccount && <Text>→</Text>}
														{toAccount && (
															<Text>
																{toAccount.name} ({toAccount.account_number.slice(-4)})
															</Text>
														)}
													</HStack>
												)}
											</VStack>
										</HStack>

										{/* Right Side: Category, Amount, Actions */}
										<HStack gap={{ base: 4, md: 8 }} align="center" flexWrap="wrap">
											{/* Category Dropdown */}
											<Box w="140px">
												<SearchableSelect
													size="sm"
													items={categories.map((c) => ({
														label: c.name,
														value: c.id,
														color: c.color,
													}))}
													value={tx.category_id || ""}
													placeholder="Category..."
													clearLabel="Clear"
													searchPlaceholder="Search..."
													onValueChange={(newCategoryId) => {
															updateTxMutation.mutate({
																id: tx.id,
																payload: { category_id: newCategoryId },
															});
													}}
												/>
											</Box>

											{/* Amount */}
											<VStack align="flex-end" gap={0} minW="100px">
												<Text
													fontSize="md"
													fontWeight="bold"
													color="fg"
												>
													{isTransfer ? "⇄ " : isExpense ? "-" : "+"}
													<FormatNumber value={tx.amount} style="currency" currency={tx.currency || "THB"} />
												</Text>
												{tx.fee > 0 && (
													<Text fontSize="10px" color="fg.muted" fontWeight="medium">
														Fee: {tx.fee}
													</Text>
												)}
											</VStack>

											{/* Actions */}
											<IconButton
												size="sm"
												variant="ghost"
												colorPalette="red"
												aria-label="Delete transaction"
												title="Delete"
												rounded="full"
												onClick={() => setDeletingTransactionId(tx.id)}
											>
												<Icon as={LuTrash2} boxSize={4} />
											</IconButton>
										</HStack>
									</Flex>
								);
							})}
						</Stack>
						)}

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
