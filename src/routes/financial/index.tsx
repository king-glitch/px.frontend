import { PillButton } from "@/components/ui/pill-button";
import { Avatar } from "@/components/ui/avatar";
import {
	Box,
	Circle,
	Flex,
	FormatNumber,
	Grid,
	HStack,
	Heading,
	Icon,
	Skeleton,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import {
	LuArrowRight,
	LuPlus,
	LuReceipt,
} from "react-icons/lu";
import { Link, useSearchParams } from "react-router";
import {
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
		useTransactions({ page: 1, amount: 4, from, to });
	const { data: categories = [] } = useCategories();

	const categoriesMap = new Map(categories.map((c) => [c.id, c]));

	const recentTransactions = transactionsData?.collection || [];

	return (
		<Stack gap={8} maxW="1200px" mx="auto">
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

			{/* Top Bar: Month Picker */}
			<Flex justify="center" mt={2} mb={-4}>
				<Box {...glassCard} p={2} rounded="full">
					<MonthRange />
				</Box>
			</Flex>

			{/* Top Dashboard Row: Balance & Activity */}
			<Grid templateColumns={{ base: "1fr", lg: "1.2fr 1fr" }} gap={8}>
				
				{/* LEFT: Total Balance */}
				<VStack align="center" justify="center" gap={8} p={8} {...glassCard} h="full">
					<VStack gap={0} align="center">
						<Text fontSize="sm" color="fg.muted" fontWeight="medium" mb={2}>
							Net Cash Flow
						</Text>
						{isSummaryLoading ? (
							<Skeleton h="16" w="240px" rounded="pill" />
						) : (
							<Text
								fontSize={{ base: "5xl", md: "6xl" }}
								fontWeight='bolder'
								letterSpacing="-0.04em"
								lineHeight="1"
								color="fg"
							>
								<FormatNumber value={summary?.net || 0} style="currency" currency="THB" />
							</Text>
						)}
					</VStack>

					<HStack gap={{ base: 6, md: 10 }} justify="center" wrap="wrap">
						<VStack gap={0} align="center">
							<Text fontSize="xs" color="fg.muted" mb={1}>
								In
							</Text>
							<Text fontSize="lg" fontWeight="medium" color="fg">
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

					<PillButton
						size="sm"
						variant="dark"
						icon={LuPlus}
						mt={4}
						onClick={() => setIsCreateOpen(true)}
					>
						Add Transaction
					</PillButton>
				</VStack>

				{/* RIGHT: Recent Activity */}
				<Box {...glassCard} p={{ base: 4, md: 6 }} overflow="hidden" h="full" display="flex" flexDir="column">
					<Flex justify="space-between" align="center" mb={6}>
						<Heading fontSize="md" fontWeight="bold">Recent Activity</Heading>
						<Link to="/financial/transactions">
							<Text fontSize="sm" fontWeight="semibold" color="fg.muted">
								View All <Icon as={LuArrowRight} ml={1} verticalAlign="middle" />
							</Text>
						</Link>
					</Flex>

					{isTransactionsLoading ? (
						<Stack gap={5} flex="1" justify="center">
							{[1, 2, 3, 4].map(i => (
								<Flex key={i} justify="space-between" align="center">
									<HStack gap={4}>
										<Skeleton boxSize="10" rounded="full" />
										<VStack align="flex-start" gap={1}>
											<Skeleton h="4" w="120px" />
											<Skeleton h="3" w="80px" />
										</VStack>
									</HStack>
									<Skeleton h="4" w="60px" />
								</Flex>
							))}
						</Stack>
					) : recentTransactions.length === 0 ? (
						<VStack py={12} color="fg.muted" flex="1" justify="center">
							<Circle size="16" bg="bg.muted" mb={2}>
								<Icon as={LuReceipt} boxSize={6} color="fg.muted" />
							</Circle>
							<Text fontSize="sm" fontWeight="medium">No activity found.</Text>
						</VStack>
					) : (
						<Stack gap={3} flex="1" justify="center">
							{recentTransactions.map((tx) => {
								const category = tx.category_id ? categoriesMap.get(tx.category_id) : undefined;
								const isExpense = tx.direction === "out";
								const isTransfer = tx.direction === "transfer";
								const dateLabel = tx.occurred_at 
									? new Date(tx.occurred_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) 
									: "-";

								return (
									<Link key={tx.id} to={`/financial/transactions/${tx.id}`}>
										<Flex 
											justify="space-between" 
											align="center" 
											_hover={{ bg: "bg.muted" }} 
											p={2} 
											mx={-2} 
											rounded="xl" 
											transition="all 0.2s"
										>
											<HStack gap={4}>
												<Avatar 
													name={tx.note || "Transaction"} 
													size="sm" 
													shape="full"
													src={isExpense || isTransfer ? undefined : "https://i.pravatar.cc/150?u=" + tx.id}
													colorPalette={isTransfer ? "purple" : isExpense ? "gray" : "mint"} 
												/>
												<VStack align="flex-start" gap={0.5}>
													<Text fontSize="sm" fontWeight="semibold" color="fg" truncate maxW="150px">
														{tx.note || tx.transaction_number || "Transaction"}
													</Text>
													<Text fontSize="xs" color="fg.muted" fontWeight="medium">
														{category ? category.name : isTransfer ? "Transfer" : "General"} • {dateLabel}
													</Text>
												</VStack>
											</HStack>
											<Text fontSize="sm" fontWeight="bold" color="fg">
												{isTransfer ? "⇄ " : isExpense ? "-" : "+"}<FormatNumber value={tx.amount} style="currency" currency={tx.currency || "THB"} />
											</Text>
										</Flex>
									</Link>
								);
							})}
						</Stack>
					)}
				</Box>
			</Grid>

			{/* Embedded Graphs (Trend & Category Breakdown) */}
			<Box mb={8}>
				<FinancialGraphs
					currentSummary={summary}
					isLoading={isSummaryLoading}
					from={from}
					to={to}
				/>
			</Box>
		</Stack>
	);
};

export default FinancialOverview;
