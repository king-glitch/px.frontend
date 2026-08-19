import { PillButton } from "@/components/ui/pill-button";
import {
	Badge,
	Box,
	Button,
	Circle,
	Flex,
	FormatNumber,
	Grid,
	HStack,
	Heading,
	Icon,
	SimpleGrid,
	Skeleton,
	Stack,
	Stat,
	Table,
	Text,
	VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import {
	LuArrowDownLeft,
	LuArrowRight,
	LuArrowUpRight,
	LuCreditCard,
	LuPlus,
	LuReceipt,
	LuTrendingDown,
	LuTrendingUp,
} from "react-icons/lu";
import { Link, useSearchParams } from "react-router";
import {
	useAccounts,
	useBanks,
	useCategories,
	useSummary,
	useTransactions,
} from "@/api";
import type { BankAccount } from "@/api/types";
import { FinancialGraphs } from "@/components/financial/financial-graphs";
import MonthRange from "@/components/financial/month-range";
import TransactionForm from "@/components/financial/transaction-form";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { glassCard } from "@/routes/financial/layout";

export const FinancialOverview: React.FC = () => {
	const [searchParams] = useSearchParams();
	const from = searchParams.get("from") || undefined;
	const to = searchParams.get("to") || undefined;

	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const { data: summary, isLoading: isSummaryLoading } = useSummary({ from, to });
	const { data: transactionsData, isLoading: isTransactionsLoading } =
		useTransactions({ page: 1, amount: 5, from, to });
	const { data: categories = [] } = useCategories();
	const { data: banks = [] } = useBanks();
	const { data: accounts = [] } = useAccounts();

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

	const recentTransactions = transactionsData?.collection || [];

	return (
		<Stack gap={6}>
			{/* Controls Row: Month Selector & Quick Actions */}
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
						variant="dark"
						icon={LuPlus}
						onClick={() => setIsCreateOpen(true)}
					>
						Add Transaction
					</PillButton>
				</HStack>
			</Flex>

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

			{/* Current Period Stat Summary - Ultra Minimal Redesign */}
			<VStack align="center" gap={8} py={8} mb={4}>
				<VStack gap={0} align="center">
					<Text fontSize="sm" color="fg.muted" fontWeight="medium" mb={2}>
						Net Cash Flow
					</Text>
					{isSummaryLoading ? (
						<Skeleton h="16" w="240px" rounded="pill" />
					) : (
						<Text
							fontSize={{ base: "5xl", md: "6xl" }}
							fontWeight="normal"
							letterSpacing="-0.04em"
							lineHeight="1"
							color="fg"
						>
							<FormatNumber value={summary?.net || 0} style="currency" currency="THB" />
						</Text>
					)}
				</VStack>

				<HStack gap={{ base: 6, md: 12 }} justify="center" wrap="wrap">
					<VStack gap={0} align="center">
						<Text fontSize="xs" color="fg.muted" mb={1}>
							In
						</Text>
						<Text fontSize="lg" fontWeight="medium" color="green.fg">
							<FormatNumber value={summary?.total_in || 0} style="currency" currency="THB" />
						</Text>
					</VStack>

					<Box w="1px" h="8" bg="border" />

					<VStack gap={0} align="center">
						<Text fontSize="xs" color="fg.muted" mb={1}>
							Out
						</Text>
						<Text fontSize="lg" fontWeight="medium" color="fg">
							<FormatNumber value={summary?.total_out || 0} style="currency" currency="THB" />
						</Text>
					</VStack>

					{((summary?.total_fee || 0) > 0) && (
						<>
							<Box w="1px" h="8" bg="border" />
							<VStack gap={0} align="center">
								<Text fontSize="xs" color="fg.muted" mb={1}>
									Fees
								</Text>
								<Text fontSize="lg" fontWeight="medium" color="fg.muted">
									<FormatNumber value={summary?.total_fee || 0} style="currency" currency="THB" />
								</Text>
							</VStack>
						</>
					)}
				</HStack>
			</VStack>

			{/* Comprehensive Multi-Month Graphs & Distribution Breakdown */}
			<FinancialGraphs
				currentSummary={summary}
				isLoading={isSummaryLoading}
			/>

			{/* Recent 5 Transactions Peek Card */}
			<Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="2xl" p={{ base: 5, md: 6 }} overflow="hidden">
				<Flex justify="space-between" align="center" mb={4}>
					<HStack gap={2}>
						<Icon as={LuReceipt} color="mint.fg" />
						<Heading fontSize="sm" fontWeight="bold">
							Recent Transactions
						</Heading>
					</HStack>
					<Button
						asChild
						size="xs"
						variant="ghost"
						rounded="pill"
					>
						<Link
							to={`/financial/transactions${
								from || to
									? `?${new URLSearchParams({
											...(from ? { from } : {}),
											...(to ? { to } : {}),
										}).toString()}`
									: ""
							}`}
						>
							View All ({transactionsData?.meta.total || 0})
							<Icon as={LuArrowRight} />
						</Link>
					</Button>
				</Flex>

				{isTransactionsLoading ? (
					<Stack gap={2}>
						<Skeleton h="10" rounded="pill" />
						<Skeleton h="10" rounded="pill" />
						<Skeleton h="10" rounded="pill" />
					</Stack>
				) : recentTransactions.length === 0 ? (
					<VStack py={8} textAlign="center" color="fg.muted">
						<Text fontSize="sm">No transactions found for this period.</Text>
						<PillButton
							size="xs"
							variant="dark"
							icon={LuPlus}
							mt={2}
							onClick={() => setIsCreateOpen(true)}
						>
							Add First Transaction
						</PillButton>
					</VStack>
				) : (
					<Table.ScrollArea>
						<Table.Root size="sm" variant="line">
							<Table.Header>
								<Table.Row bg="bg.muted">
									<Table.ColumnHeader fontSize="xs" w="40px"></Table.ColumnHeader>
									<Table.ColumnHeader fontSize="xs">Date</Table.ColumnHeader>
									<Table.ColumnHeader fontSize="xs">Payee / Description</Table.ColumnHeader>
									<Table.ColumnHeader fontSize="xs">Category</Table.ColumnHeader>
									<Table.ColumnHeader fontSize="xs" textAlign="right">
										Amount
									</Table.ColumnHeader>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{recentTransactions.map((tx) => {
									const category = tx.category_id
										? categoriesMap.get(tx.category_id)
										: undefined;
									const isExpense = tx.direction === "out";

									const dateLabel = tx.occurred_at
										? new Date(tx.occurred_at).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})
										: "-";

									return (
										<Table.Row
											key={tx.id}
											_hover={{ bg: "bg.muted", cursor: "pointer" }}
										>
											<Table.Cell>
												<Circle
													size="6"
													bg={isExpense ? "red.muted" : "green.muted"}
													color={isExpense ? "red.fg" : "green.fg"}
												>
													<Icon
														as={isExpense ? LuArrowUpRight : LuArrowDownLeft}
														boxSize={3}
													/>
												</Circle>
											</Table.Cell>
											<Table.Cell fontSize="xs" color="fg.muted">
												{dateLabel}
											</Table.Cell>
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
																	{tx.note ||
																		tx.transaction_number ||
																		"Transaction"}
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
											<Table.Cell>
												{category ? (
													<HStack gap={1.5}>
														<Circle
															size="2"
															bg={category.color || "fg.muted"}
															flexShrink={0}
														/>
														<Text fontSize="xs" fontWeight="medium" color="fg">
															{category.name}
														</Text>
													</HStack>
												) : (
													<Text fontSize="10px" color="fg.muted">
														-
													</Text>
												)}
											</Table.Cell>
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
											</Table.Cell>
										</Table.Row>
									);
								})}
							</Table.Body>
						</Table.Root>
					</Table.ScrollArea>
				)}
			</Box>
		</Stack>
	);
};

export default FinancialOverview;
