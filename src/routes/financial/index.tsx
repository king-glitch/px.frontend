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
	useCategories,
	useCounterparties,
	useSummary,
	useTransactions,
} from "@/api";
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

	const { data: summary, isLoading: isSummaryLoading } = useSummary(from, to);
	const { data: transactionsData, isLoading: isTransactionsLoading } =
		useTransactions({ page: 1, amount: 5, from, to });
	const { data: categories = [] } = useCategories();
	const { data: counterparties = [] } = useCounterparties();

	const categoriesMap = new Map(categories.map((c) => [c.id, c]));
	const counterpartiesMap = new Map(counterparties.map((cp) => [cp.id, cp]));

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

			{/* Current Period Stat Cards Grid */}
			<SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
				{/* Total In */}
				<Box {...glassCard} p={5} position="relative" overflow="hidden">
					<Stat.Root>
						<HStack justify="space-between" align="flex-start">
							<Stat.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
								Total Income (In)
							</Stat.Label>
							<Circle size="7" bg="green.muted" color="green.fg">
								<Icon as={LuArrowDownLeft} boxSize={3.5} />
							</Circle>
						</HStack>
						{isSummaryLoading ? (
							<Skeleton h="8" mt={2} rounded="pill" />
						) : (
							<Stat.ValueText
								fontSize={{ base: "xl", md: "2xl" }}
								fontWeight="bold"
								color="green.fg"
								mt={1}
							>
								<FormatNumber
									value={summary?.total_in || 0}
									style="currency"
									currency="THB"
								/>
							</Stat.ValueText>
						)}
						<Text fontSize="11px" color="fg.muted" mt={1}>
							{summary?.count || 0} recorded transactions
						</Text>
					</Stat.Root>
				</Box>

				{/* Total Out */}
				<Box {...glassCard} p={5} position="relative" overflow="hidden">
					<Stat.Root>
						<HStack justify="space-between" align="flex-start">
							<Stat.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
								Total Expenses (Out)
							</Stat.Label>
							<Circle size="7" bg="red.muted" color="red.fg">
								<Icon as={LuArrowUpRight} boxSize={3.5} />
							</Circle>
						</HStack>
						{isSummaryLoading ? (
							<Skeleton h="8" mt={2} rounded="pill" />
						) : (
							<Stat.ValueText
								fontSize={{ base: "xl", md: "2xl" }}
								fontWeight="bold"
								color="red.fg"
								mt={1}
							>
								<FormatNumber
									value={summary?.total_out || 0}
									style="currency"
									currency="THB"
								/>
							</Stat.ValueText>
						)}
						<Text fontSize="11px" color="fg.muted" mt={1}>
							Excluding fees
						</Text>
					</Stat.Root>
				</Box>

				{/* Total Fees */}
				<Box {...glassCard} p={5} position="relative" overflow="hidden">
					<Stat.Root>
						<HStack justify="space-between" align="flex-start">
							<Stat.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
								Total Transfer Fees
							</Stat.Label>
							<Circle size="7" bg="bg.muted" color="fg.muted">
								<Icon as={LuCreditCard} boxSize={3.5} />
							</Circle>
						</HStack>
						{isSummaryLoading ? (
							<Skeleton h="8" mt={2} rounded="pill" />
						) : (
							<Stat.ValueText
								fontSize={{ base: "xl", md: "2xl" }}
								fontWeight="bold"
								mt={1}
							>
								<FormatNumber
									value={summary?.total_fee || 0}
									style="currency"
									currency="THB"
								/>
							</Stat.ValueText>
						)}
						<Text fontSize="11px" color="fg.muted" mt={1}>
							Bank / promptpay processing
						</Text>
					</Stat.Root>
				</Box>

				{/* Net Balance */}
				<Box
					{...glassCard}
					p={5}
					position="relative"
					overflow="hidden"
					borderColor={
						(summary?.net || 0) >= 0 ? "mint.solid" : "red.500"
					}
				>
					<Stat.Root>
						<HStack justify="space-between" align="flex-start">
							<Stat.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
								Net Cash Flow
							</Stat.Label>
							<Circle
								size="7"
								bg={(summary?.net || 0) >= 0 ? "mint.solid" : "red.solid"}
								color={(summary?.net || 0) >= 0 ? "mint.contrast" : "fg.inverted"}
							>
								<Icon
									as={(summary?.net || 0) >= 0 ? LuTrendingUp : LuTrendingDown}
									boxSize={3.5}
								/>
							</Circle>
						</HStack>
						{isSummaryLoading ? (
							<Skeleton h="8" mt={2} rounded="pill" />
						) : (
							<Stat.ValueText
								fontSize={{ base: "xl", md: "2xl" }}
								fontWeight="bold"
								color={(summary?.net || 0) >= 0 ? "mint.fg" : "red.fg"}
								mt={1}
							>
								<FormatNumber
									value={summary?.net || 0}
									style="currency"
									currency="THB"
								/>
							</Stat.ValueText>
						)}
						<Text fontSize="11px" color="fg.muted" mt={1}>
							Income − Expenses − Fees
						</Text>
					</Stat.Root>
				</Box>
			</SimpleGrid>

			{/* Comprehensive Multi-Month Graphs & Distribution Breakdown */}
			<FinancialGraphs
				currentSummary={summary}
				isLoading={isSummaryLoading}
			/>

			{/* Recent 5 Transactions Peek Card */}
			<Box {...glassCard} p={5}>
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
								<Table.Row>
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
									const counterparty = tx.counterparty_id
										? counterpartiesMap.get(tx.counterparty_id)
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
												<VStack align="flex-start" gap={0}>
													<Text fontSize="xs" fontWeight="semibold">
														<Link to={`/financial/transactions/${tx.id}`}>
															{counterparty?.note ||
																counterparty?.name ||
																tx.note ||
																"Transaction"}
														</Link>
													</Text>
													{tx.note && counterparty?.name && (
														<Text fontSize="10px" color="fg.muted">
															{tx.note}
														</Text>
													)}
												</VStack>
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
