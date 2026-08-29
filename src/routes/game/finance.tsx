import React, { useMemo, useState } from "react";
import {
	Badge,
	Box,
	Container,
	Flex,
	Grid,
	HStack,
	Heading,
	Icon,
	Input,
	Progress,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import {
	LuArrowDownRight,
	LuArrowUpRight,
	LuBanknote,
	LuCalendarDays,
	LuCoins,
	LuLayers,
	LuPercent,
	LuPiggyBank,
	LuPlus,
	LuRocket,
	LuSparkles,
	LuTrash2,
	LuTrendingDown,
	LuTrendingUp,
	LuWallet,
} from "react-icons/lu";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	ChartLegend,
	ChartRoot,
	ChartTooltip,
	useChart,
} from "@chakra-ui/charts";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import {
	SearchableSelect,
	type SearchableSelectItem,
} from "@/components/ui/searchable-select";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import {
	useConvertFinancePeriod,
	useCreateFinanceBudget,
	useCreateFinanceEntry,
	useDeleteFinanceBudget,
	useDeleteFinanceEntry,
	useFinanceBudgets,
	useFinanceEntries,
	useFinanceSummary,
} from "@/api";
import type { FinanceDirection, FinanceEntry } from "@/api/types";
import {
	RewardFlight,
	registerRewardFlightTarget,
	useRewardFlight,
} from "@/components/game";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

function currentPeriod(): string {
	return new Date().toISOString().slice(0, 7);
}

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

const INCOME_CATEGORIES: SearchableSelectItem[] = [
	{
		label: "Salary",
		value: "Salary",
		description: "Regular wages & compensation",
	},
	{
		label: "Freelance",
		value: "Freelance",
		description: "Contracting & client work",
	},
	{
		label: "Business",
		value: "Business",
		description: "Company & side business revenue",
	},
	{
		label: "Investments",
		value: "Investments",
		description: "Dividends, interest & capital gains",
	},
	{
		label: "Rental",
		value: "Rental",
		description: "Property & asset rental income",
	},
	{ label: "Gifts", value: "Gifts", description: "Monetary gifts received" },
	{
		label: "Refunds",
		value: "Refunds",
		description: "Tax & purchase reimbursements",
	},
	{
		label: "Other Income",
		value: "Other Income",
		description: "Miscellaneous earnings",
	},
];

const EXPENSE_CATEGORIES: SearchableSelectItem[] = [
	{ label: "Rent", value: "Rent", description: "Housing & lease payments" },
	{
		label: "Groceries",
		value: "Groceries",
		description: "Supermarket & food supplies",
	},
	{
		label: "Dining",
		value: "Dining",
		description: "Restaurants, cafes & takeout",
	},
	{
		label: "Transport",
		value: "Transport",
		description: "Fuel, transit & ride hailing",
	},
	{
		label: "Utilities",
		value: "Utilities",
		description: "Electricity, water, internet, phone",
	},
	{
		label: "Health",
		value: "Health",
		description: "Medical, gym, pharmacy & wellness",
	},
	{
		label: "Insurance",
		value: "Insurance",
		description: "Health, auto & property policies",
	},
	{
		label: "Subscriptions",
		value: "Subscriptions",
		description: "Digital services & memberships",
	},
	{
		label: "Shopping",
		value: "Shopping",
		description: "Clothing, gadgets & personal items",
	},
	{
		label: "Entertainment",
		value: "Entertainment",
		description: "Movies, games, events & hobbies",
	},
	{
		label: "Education",
		value: "Education",
		description: "Courses, books & tuition",
	},
	{
		label: "Travel",
		value: "Travel",
		description: "Flights, hotels & vacation",
	},
	{
		label: "Debt",
		value: "Debt",
		description: "Loans & credit card payments",
	},
	{
		label: "Savings",
		value: "Savings",
		description: "Emergency fund & transfers",
	},
	{ label: "Other", value: "Other", description: "Miscellaneous expenses" },
];

const CURRENCY_OPTIONS: SearchableSelectItem[] = [
	{
		label: "THB (฿ - Thai Baht)",
		value: "THB",
		description: "Default Thai Baht",
	},
	{
		label: "USD ($ - US Dollar)",
		value: "USD",
		description: "United States Dollar",
	},
	{ label: "EUR (€ - Euro)", value: "EUR", description: "European Euro" },
	{
		label: "JPY (¥ - Japanese Yen)",
		value: "JPY",
		description: "Japanese Yen",
	},
	{
		label: "GBP (£ - British Pound)",
		value: "GBP",
		description: "British Pound",
	},
	{
		label: "SGD (S$ - Singapore Dollar)",
		value: "SGD",
		description: "Singapore Dollar",
	},
	{
		label: "AUD (A$ - Australian Dollar)",
		value: "AUD",
		description: "Australian Dollar",
	},
	{
		label: "CNY (¥ - Chinese Yuan)",
		value: "CNY",
		description: "Chinese Yuan",
	},
];

export const Finance: React.FC = () => {
	const [period, setPeriod] = useState(currentPeriod);
	const {
		data: summary,
		isLoading: summaryLoading,
		isError: summaryError,
	} = useFinanceSummary(period);
	const { data: entriesData, isLoading: entriesLoading } = useFinanceEntries(
		1,
		100,
	);
	const { data: budgets = [], isLoading: budgetsLoading } =
		useFinanceBudgets();

	const convert = useConvertFinancePeriod();
	const [convertedPeriods, setConvertedPeriods] = useState<Set<string>>(
		() => new Set(),
	);
	const targetRef = React.useRef<HTMLDivElement | null>(null);
	const { fly } = useRewardFlight();

	const confirmConvert = useConfirm<string>();

	React.useEffect(() => {
		registerRewardFlightTarget(targetRef.current);
		return () => registerRewardFlightTarget(null);
	}, []);

	const alreadyConverted = convertedPeriods.has(period);

	const handleExecuteConvert = async () => {
		if (!confirmConvert.target) return;
		try {
			const award = await convert.mutateAsync(confirmConvert.target);
			setConvertedPeriods((prev) => new Set(prev).add(period));
			if (targetRef.current) {
				void fly(targetRef.current, award.exp, "exp");
				void fly(targetRef.current, award.px, "px");
			}
			toaster.create({
				title: "Period converted to EXP",
				description: `+${award.exp} EXP and +${award.px} PX awarded!`,
				type: "success",
			});
			confirmConvert.close();
		} catch (err) {
			toaster.create({
				title: "Failed to convert period",
				description:
					err instanceof ApiError
						? err.message
						: "An error occurred while converting the period",
				type: "error",
			});
		}
	};

	// Compute Cashflow Chart Data from entries
	const periodEntries = useMemo(() => {
		const list = entriesData?.entries ?? [];
		return list.filter((e) => e.occurred_on.startsWith(period));
	}, [entriesData, period]);

	const dailyChartData = useMemo(() => {
		const dayMap = new Map<
			string,
			{ date: string; income: number; expense: number }
		>();

		for (const entry of periodEntries) {
			const dayKey = entry.occurred_on.slice(8, 10);
			const current = dayMap.get(dayKey) ?? {
				date: dayKey,
				income: 0,
				expense: 0,
			};
			if (entry.direction === "income") {
				current.income += entry.amount;
			} else {
				current.expense += entry.amount;
			}
			dayMap.set(dayKey, current);
		}

		return Array.from(dayMap.entries())
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([, val]) => val);
	}, [periodEntries]);

	const categoryChartData = useMemo(() => {
		const catMap = new Map<string, number>();
		for (const entry of periodEntries) {
			if (entry.direction === "expense") {
				catMap.set(
					entry.category,
					(catMap.get(entry.category) ?? 0) + entry.amount,
				);
			}
		}

		return Array.from(catMap.entries())
			.map(([category, amount]) => ({ category, amount }))
			.sort((a, b) => b.amount - a.amount)
			.slice(0, 8);
	}, [periodEntries]);

	const cashflowChart = useChart({
		data: dailyChartData,
		series: [
			{ name: "income", color: "mint.solid", label: "Income" },
			{ name: "expense", color: "slate", label: "Expense" },
		],
	});

	const categoryChart = useChart({
		data: categoryChartData,
		series: [{ name: "amount", color: "mint.solid", label: "Spend" }],
	});

	return (
		<Container maxW="6xl" py={{ base: 4, md: 8 }}>
			<RewardFlight />
			<Stack gap={6}>
				{/* Header Bar */}
				<Flex
					justify="space-between"
					align="flex-end"
					wrap="wrap"
					gap={3}
				>
					<Stack gap={1}>
						<Heading size="2xl">Finance & Economy</Heading>
						<Text color="fg.muted" fontSize="sm">
							Log transactions, track budget limits, and convert
							monthly discipline into hero EXP.
						</Text>
					</Stack>
					<Field label="Active Period" w="auto">
						<Input
							type="month"
							value={period}
							onChange={(e) => setPeriod(e.target.value)}
							rounded="pill"
							bg="bg.panel"
							borderColor="border"
							w="180px"
							fontSize="sm"
						/>
					</Field>
				</Flex>

				{/* Top Vital Matrix Stat Tiles */}
				{summaryLoading ? (
					<SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} gap={3}>
						{[0, 1, 2, 3, 4].map((i) => (
							<Skeleton key={i} h="96px" rounded="card" />
						))}
					</SimpleGrid>
				) : summaryError || !summary ? (
					<Box {...glassCard} p={6}>
						<Text color="fg.muted" fontSize="sm">
							Couldn&apos;t load the summary for period {period}.
						</Text>
					</Box>
				) : (
					<>
						<SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} gap={3}>
							<StatTile
								label="Total Income"
								value={`$${summary.income.toLocaleString()}`}
								icon={LuTrendingUp}
								iconColor="fg.muted"
							/>
							<StatTile
								label="Total Expense"
								value={`$${summary.expense.toLocaleString()}`}
								icon={LuTrendingDown}
								iconColor="fg.muted"
							/>
							<StatTile
								label="Savings Rate"
								value={`${Math.round(summary.savings_rate * 100)}%`}
								icon={LuPercent}
								iconColor="fg.muted"
							/>
							<StatTile
								label="Days Logged"
								value={`${summary.days_logged} / ${summary.days_in_period}`}
								icon={LuCalendarDays}
								iconColor="fg.muted"
							/>
							<StatTile
								label="Projected EXP"
								value={`+${summary.projected_exp}`}
								icon={LuSparkles}
								iconColor="fg.muted"
								tileRef={targetRef}
							/>
						</SimpleGrid>

						{/* Period Conversion Action Card */}
						<Box {...glassCard} p={{ base: 5, md: 6 }}>
							<Flex
								justify="space-between"
								align="center"
								wrap="wrap"
								gap={4}
							>
								<HStack gap={3}>
									<Box
										p={3}
										rounded="pill"
										bg="bg.muted"
										color="fg.muted"
									>
										<Icon as={LuRocket} boxSize={5} />
									</Box>
									<Stack gap={0.5}>
										<Heading size="md">
											Convert Period to Hero EXP
										</Heading>
										<Text fontSize="xs" color="fg.muted">
											Converts logged financial discipline
											(+{summary.projected_exp} projected
											EXP) into character growth. One-time
											per monthly cycle.
										</Text>
									</Stack>
								</HStack>
								<Button
									variant="dark"
									loading={convert.isPending}
									disabled={
										alreadyConverted ||
										summary.projected_exp === 0
									}
									onClick={() => confirmConvert.ask(period)}
								>
									<HStack gap={2}>
										<Icon as={LuSparkles} boxSize={4} />
										<Text>
											{alreadyConverted
												? "Converted"
												: `Convert Period (+${summary.projected_exp} EXP)`}
										</Text>
									</HStack>
								</Button>
							</Flex>
						</Box>
					</>
				)}

				{/* Charts Section */}
				<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
					{/* Daily Cashflow Trend */}
					<Box {...glassCard} p={{ base: 5, md: 6 }}>
						<HStack justify="space-between" mb={4}>
							<Stack gap={0.5}>
								<Heading size="md">Monthly Cashflow</Heading>
								<Text fontSize="xs" color="fg.muted">
									Daily income vs expense activity for{" "}
									{period}
								</Text>
							</Stack>
							<Icon
								as={LuBanknote}
								boxSize={4}
								color="fg.muted"
							/>
						</HStack>

						{dailyChartData.length === 0 ? (
							<Flex
								justify="center"
								align="center"
								h="220px"
								color="fg.muted"
							>
								<Text fontSize="xs">
									No transactions recorded for this period.
								</Text>
							</Flex>
						) : (
							<ChartRoot chart={cashflowChart} h="220px" w="full">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={cashflowChart.data}
										margin={{
											top: 10,
											right: 10,
											left: -20,
											bottom: 0,
										}}
									>
										<CartesianGrid
											strokeDasharray="3 3"
											vertical={false}
											opacity={0.3}
										/>
										<XAxis
											dataKey="date"
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 11 }}
										/>
										<YAxis
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 11 }}
										/>
										<Tooltip content={<ChartTooltip />} />
										<Bar
											dataKey={cashflowChart.key(
												"income",
											)}
											fill={cashflowChart.color(
												"mint.solid",
											)}
											radius={[4, 4, 0, 0]}
										/>
										<Bar
											dataKey={cashflowChart.key(
												"expense",
											)}
											fill={cashflowChart.color("slate")}
											radius={[4, 4, 0, 0]}
										/>
									</BarChart>
								</ResponsiveContainer>
							</ChartRoot>
						)}
					</Box>

					{/* Category Breakdown */}
					<Box {...glassCard} p={{ base: 5, md: 6 }}>
						<HStack justify="space-between" mb={4}>
							<Stack gap={0.5}>
								<Heading size="md">Expense Breakdown</Heading>
								<Text fontSize="xs" color="fg.muted">
									Top spending categories in {period}
								</Text>
							</Stack>
							<Icon as={LuLayers} boxSize={4} color="fg.muted" />
						</HStack>

						{categoryChartData.length === 0 ? (
							<Flex
								justify="center"
								align="center"
								h="220px"
								color="fg.muted"
							>
								<Text fontSize="xs">
									No expense categories recorded yet.
								</Text>
							</Flex>
						) : (
							<ChartRoot chart={categoryChart} h="220px" w="full">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={categoryChart.data}
										layout="vertical"
										margin={{
											top: 10,
											right: 10,
											left: 20,
											bottom: 0,
										}}
									>
										<CartesianGrid
											strokeDasharray="3 3"
											horizontal={false}
											opacity={0.3}
										/>
										<XAxis
											type="number"
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 11 }}
										/>
										<YAxis
											type="category"
											dataKey="category"
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 11 }}
										/>
										<Tooltip content={<ChartTooltip />} />
										<Bar
											dataKey={categoryChart.key(
												"amount",
											)}
											fill={categoryChart.color(
												"purple.solid",
											)}
											radius={[0, 4, 4, 0]}
										/>
									</BarChart>
								</ResponsiveContainer>
							</ChartRoot>
						)}
					</Box>
				</Grid>

				{/* Entries Section */}
				<EntriesSection period={period} />

				{/* Budgets Section */}
				<BudgetsSection periodEntries={periodEntries} />
			</Stack>

			{/* Confirm Period Conversion Dialog */}
			<ConfirmDialog
				open={confirmConvert.open}
				onOpenChange={confirmConvert.onOpenChange}
				title="Convert Period to Hero EXP"
				description={`Converting ${period} is irreversible and can only be performed once per month. This will award +${summary?.projected_exp ?? 0} EXP based on your logged income, expenses, and savings rate.`}
				confirmLabel="Convert to EXP"
				loading={convert.isPending}
				onConfirm={handleExecuteConvert}
			/>
		</Container>
	);
};

interface StatTileProps {
	label: string;
	value: React.ReactNode;
	icon: React.ElementType;
	iconColor?: string;
	tileRef?: React.RefObject<HTMLDivElement | null>;
}

const StatTile: React.FC<StatTileProps> = ({
	label,
	value,
	icon,
	iconColor = "fg.muted",
	tileRef,
}) => (
	<Box {...glassCard} p={3.5} ref={tileRef}>
		<HStack justify="space-between" color="fg.muted">
			<Text
				fontSize="10px"
				fontWeight="semibold"
				textTransform="uppercase"
			>
				{label}
			</Text>
			<Icon as={icon} boxSize={3.5} color={iconColor} />
		</HStack>
		<Heading size="xl" mt={1}>
			{value}
		</Heading>
	</Box>
);

interface EntriesSectionProps {
	period: string;
}

const EntriesSection: React.FC<EntriesSectionProps> = ({ period }) => {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useFinanceEntries(page, 20);
	const createEntry = useCreateFinanceEntry();
	const deleteEntry = useDeleteFinanceEntry();

	const [direction, setDirection] = useState<FinanceDirection>("expense");
	const [amount, setAmount] = useState("");
	const [currency, setCurrency] = useState("THB");
	const [category, setCategory] = useState("");
	const [occurredOn, setOccurredOn] = useState(today);
	const [note, setNote] = useState("");

	const confirmDelete = useConfirm<string>();

	const categoryItems = useMemo(() => {
		return direction === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
	}, [direction]);

	const handleDirectionChange = (newDir: FinanceDirection) => {
		setDirection(newDir);
		setCategory("");
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!amount || !category.trim()) {
			toaster.create({
				title: "Missing required fields",
				description: "Please enter both an amount and a category.",
				type: "error",
			});
			return;
		}

		try {
			await createEntry.mutateAsync({
				direction,
				amount: Number(amount),
				currency,
				category: category.trim(),
				occurred_on: occurredOn,
				note: note.trim() || undefined,
			});
			toaster.create({
				title: "Entry logged",
				description: `${direction === "income" ? "+" : "-"}${amount} ${currency} in ${category}`,
				type: "success",
			});
			setAmount("");
			setCategory("");
			setNote("");
		} catch (err) {
			toaster.create({
				title: "Failed to add entry",
				description:
					err instanceof ApiError
						? err.message
						: "Error creating transaction entry",
				type: "error",
			});
		}
	};

	const handleDeleteConfirm = async () => {
		if (!confirmDelete.target) return;
		try {
			await deleteEntry.mutateAsync(confirmDelete.target);
			toaster.create({
				title: "Entry deleted",
				type: "success",
			});
			confirmDelete.close();
		} catch (err) {
			toaster.create({
				title: "Failed to delete entry",
				description:
					err instanceof ApiError
						? err.message
						: "Error deleting entry",
				type: "error",
			});
		}
	};

	return (
		<Stack gap={3}>
			<HStack justify="space-between">
				<Heading
					size="md"
					color="fg.muted"
					textTransform="uppercase"
					letterSpacing="0.05em"
					fontSize="xs"
				>
					Transaction Entries
				</Heading>
				<Badge size="sm" rounded="pill" variant="subtle">
					{data?.count ?? 0} total entries
				</Badge>
			</HStack>

			<Box {...glassCard} p={{ base: 5, md: 6 }}>
				<Stack gap={5}>
					{/* Add Entry Form */}
					<form noValidate onSubmit={onSubmit}>
						<Stack gap={3.5}>
							<HStack gap={2}>
								<Button
									type="button"
									size="xs"
									rounded="pill"
									variant={
										direction === "income"
											? "mint"
											: "outline"
									}
									onClick={() =>
										handleDirectionChange("income")
									}
								>
									<HStack gap={1.5}>
										<Icon as={LuArrowUpRight} boxSize={3} />
										<Text>Income</Text>
									</HStack>
								</Button>
								<Button
									type="button"
									size="xs"
									rounded="pill"
									variant={
										direction === "expense"
											? "dark"
											: "outline"
									}
									onClick={() =>
										handleDirectionChange("expense")
									}
								>
									<HStack gap={1.5}>
										<Icon
											as={LuArrowDownRight}
											boxSize={3}
										/>
										<Text>Expense</Text>
									</HStack>
								</Button>
							</HStack>

							<Grid
								gap={3}
								templateColumns={{
									base: "1fr",
									sm: "repeat(2, 1fr)",
									lg: "repeat(5, 1fr)",
								}}
							>
								<Field label="Amount" required>
									<Input
										type="number"
										min={0}
										step="any"
										placeholder="0.00"
										value={amount}
										onChange={(e) =>
											setAmount(e.target.value)
										}
										rounded="pill"
										bg="bg.panel"
										borderColor="border"
										fontSize="sm"
									/>
								</Field>
								<Field label="Currency" required>
									<SearchableSelect
										items={CURRENCY_OPTIONS}
										value={currency}
										onValueChange={setCurrency}
										placeholder="Select currency..."
										searchPlaceholder="Search currency..."
									/>
								</Field>
								<Field label="Category" required>
									<SearchableSelect
										items={categoryItems}
										value={category}
										onValueChange={setCategory}
										placeholder="Select category..."
										searchPlaceholder="Filter categories..."
									/>
								</Field>
								<Field label="Date">
									<Input
										type="date"
										value={occurredOn}
										onChange={(e) =>
											setOccurredOn(e.target.value)
										}
										rounded="pill"
										bg="bg.panel"
										borderColor="border"
										fontSize="sm"
									/>
								</Field>
								<Field label="Note">
									<Input
										placeholder="Optional description"
										value={note}
										onChange={(e) =>
											setNote(e.target.value)
										}
										rounded="pill"
										bg="bg.panel"
										borderColor="border"
										fontSize="sm"
									/>
								</Field>
							</Grid>

							<Button
								type="submit"
								variant="dark"
								alignSelf="flex-start"
								loading={createEntry.isPending}
							>
								<HStack gap={1.5}>
									<Icon as={LuPlus} boxSize={4} />
									<Text>Add Transaction</Text>
								</HStack>
							</Button>
						</Stack>
					</form>

					{/* Entries List */}
					{isLoading ? (
						<Stack gap={2}>
							<Skeleton h="12" rounded="card" />
							<Skeleton h="12" rounded="card" />
							<Skeleton h="12" rounded="card" />
						</Stack>
					) : !data || data.entries.length === 0 ? (
						<EmptyState
							title="No transactions logged yet"
							description="Record your first income or expense entry above to build your financial tracking ledger."
							icon={<Icon as={LuBanknote} boxSize={6} />}
						/>
					) : (
						<Stack gap={2}>
							{data.entries.map((entry) => (
								<Flex
									key={entry.id}
									justify="space-between"
									align="center"
									p={3.5}
									rounded="card"
									bg="bg.panel"
									borderWidth="1px"
									borderColor="border.glass"
									transition="all 0.15s ease-out"
									_hover={{
										transform: "translateY(-1px)",
										shadow: "glass",
									}}
								>
									<HStack gap={3}>
										<Box
											p={2}
											rounded="pill"
											bg="bg.muted"
											color="fg.muted"
										>
											<Icon
												as={
													entry.direction === "income"
														? LuTrendingUp
														: LuTrendingDown
												}
												boxSize={4}
											/>
										</Box>
										<Stack gap={0}>
											<HStack gap={2}>
												<Text
													fontWeight="semibold"
													fontSize="sm"
												>
													{entry.category}
												</Text>
												<Badge
													size="xs"
													rounded="pill"
													variant="subtle"
												>
													{entry.direction}
												</Badge>
											</HStack>
											<Text
												fontSize="xs"
												color="fg.muted"
											>
												{entry.occurred_on}
												{entry.note
													? ` · ${entry.note}`
													: ""}
											</Text>
										</Stack>
									</HStack>

									<HStack gap={3}>
										<Text fontSize="sm" fontWeight="bold">
											{entry.direction === "income"
												? "+"
												: "-"}
											{entry.amount.toLocaleString()}{" "}
											{entry.currency}
										</Text>
										<Button
											size="xs"
											variant="ghost"
											onClick={() =>
												confirmDelete.ask(entry.id)
											}
										>
											<Icon
												as={LuTrash2}
												boxSize={3.5}
												color="fg.muted"
											/>
										</Button>
									</HStack>
								</Flex>
							))}

							{/* Pagination Controls */}
							<HStack justify="space-between" pt={2}>
								<Button
									size="xs"
									variant="outline"
									rounded="pill"
									disabled={page <= 1}
									onClick={() =>
										setPage((p) => Math.max(1, p - 1))
									}
								>
									Previous
								</Button>
								<Text fontSize="xs" color="fg.muted">
									Page {page} of{" "}
									{Math.max(1, data.total_pages)}
								</Text>
								<Button
									size="xs"
									variant="outline"
									rounded="pill"
									disabled={page >= data.total_pages}
									onClick={() => setPage((p) => p + 1)}
								>
									Next
								</Button>
							</HStack>
						</Stack>
					)}
				</Stack>
			</Box>

			{/* Confirm Delete Entry Dialog */}
			<ConfirmDialog
				open={confirmDelete.open}
				onOpenChange={confirmDelete.onOpenChange}
				title="Delete Transaction"
				description="This transaction will be permanently removed from your finance ledger."
				confirmLabel="Delete"
				destructive
				loading={deleteEntry.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</Stack>
	);
};

interface BudgetsSectionProps {
	periodEntries: FinanceEntry[];
}

const BudgetsSection: React.FC<BudgetsSectionProps> = ({ periodEntries }) => {
	const { data: budgets = [], isLoading } = useFinanceBudgets();
	const createBudget = useCreateFinanceBudget();
	const deleteBudget = useDeleteFinanceBudget();

	const [category, setCategory] = useState("");
	const [monthlyLimit, setMonthlyLimit] = useState("");

	const confirmDeleteBudget = useConfirm<string>();

	// Calculate spent per budget category
	const spendByCategory = useMemo(() => {
		const map = new Map<string, number>();
		for (const entry of periodEntries) {
			if (entry.direction === "expense") {
				map.set(
					entry.category,
					(map.get(entry.category) ?? 0) + entry.amount,
				);
			}
		}
		return map;
	}, [periodEntries]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!category.trim() || !monthlyLimit) {
			toaster.create({
				title: "Missing budget details",
				description:
					"Please select a category and specify a monthly spending limit.",
				type: "error",
			});
			return;
		}

		try {
			await createBudget.mutateAsync({
				category: category.trim(),
				monthly_limit: Number(monthlyLimit),
			});
			toaster.create({
				title: "Budget created",
				description: `Monthly limit for ${category} set to $${monthlyLimit}`,
				type: "success",
			});
			setCategory("");
			setMonthlyLimit("");
		} catch (err) {
			toaster.create({
				title: "Failed to create budget",
				description:
					err instanceof ApiError
						? err.message
						: "Error creating budget target",
				type: "error",
			});
		}
	};

	const handleDeleteBudgetConfirm = async () => {
		if (!confirmDeleteBudget.target) return;
		try {
			await deleteBudget.mutateAsync(confirmDeleteBudget.target);
			toaster.create({
				title: "Budget deleted",
				type: "success",
			});
			confirmDeleteBudget.close();
		} catch (err) {
			toaster.create({
				title: "Failed to delete budget",
				description:
					err instanceof ApiError
						? err.message
						: "Error deleting budget",
				type: "error",
			});
		}
	};

	return (
		<Stack gap={3}>
			<HStack justify="space-between">
				<Heading
					size="md"
					color="fg.muted"
					textTransform="uppercase"
					letterSpacing="0.05em"
					fontSize="xs"
				>
					Category Budgets & Limits
				</Heading>
				<Badge size="sm" rounded="pill" variant="subtle">
					{budgets.length} active budgets
				</Badge>
			</HStack>

			<Box {...glassCard} p={{ base: 5, md: 6 }}>
				<Stack gap={5}>
					{/* Add Budget Form */}
					<form noValidate onSubmit={onSubmit}>
						<HStack gap={3} wrap="wrap" align="flex-end">
							<Field label="Category" required w="240px">
								<SearchableSelect
									items={EXPENSE_CATEGORIES}
									value={category}
									onValueChange={setCategory}
									placeholder="Select category..."
									searchPlaceholder="Search expense category..."
								/>
							</Field>
							<Field label="Monthly Limit" required w="180px">
								<Input
									type="number"
									min={0}
									placeholder="500"
									value={monthlyLimit}
									onChange={(e) =>
										setMonthlyLimit(e.target.value)
									}
									rounded="pill"
									bg="bg.panel"
									borderColor="border"
									fontSize="sm"
								/>
							</Field>
							<Button
								type="submit"
								variant="dark"
								loading={createBudget.isPending}
							>
								<HStack gap={1.5}>
									<Icon as={LuPlus} boxSize={4} />
									<Text>Add Budget</Text>
								</HStack>
							</Button>
						</HStack>
					</form>

					{/* Budget Progress Tiles */}
					{isLoading ? (
						<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
							<Skeleton h="20" rounded="card" />
							<Skeleton h="20" rounded="card" />
							<Skeleton h="20" rounded="card" />
						</SimpleGrid>
					) : budgets.length === 0 ? (
						<EmptyState
							title="No category budgets configured"
							description="Set monthly spending targets to earn bonus EXP during monthly period conversions."
							icon={<Icon as={LuPiggyBank} boxSize={6} />}
						/>
					) : (
						<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
							{budgets.map((budget) => {
								const spent =
									spendByCategory.get(budget.category) ?? 0;
								const percent = Math.min(
									100,
									Math.round(
										(spent / budget.monthly_limit) * 100,
									),
								);
								const isExceeded = spent > budget.monthly_limit;

								return (
									<Box
										key={budget.id}
										p={4}
										rounded="card"
										bg="bg.panel"
										borderWidth="1px"
										borderColor="border.glass"
										transition="all 0.15s ease-out"
										_hover={{
											transform: "translateY(-1px)",
											shadow: "glass",
										}}
									>
										<HStack justify="space-between" mb={2}>
											<Text
												fontWeight="semibold"
												fontSize="sm"
											>
												{budget.category}
											</Text>
											<HStack gap={2}>
												<Badge
													size="xs"
													rounded="pill"
													variant="surface"
													colorPalette={
														isExceeded
															? "red"
															: percent > 80
																? "orange"
																: "mint"
													}
												>
													{percent}%
												</Badge>
												<Button
													size="xs"
													variant="ghost"
													onClick={() =>
														confirmDeleteBudget.ask(
															budget.id,
														)
													}
												>
													<Icon
														as={LuTrash2}
														boxSize={3.5}
														color="fg.muted"
													/>
												</Button>
											</HStack>
										</HStack>

										<HStack
											justify="space-between"
											fontSize="xs"
											color="fg.muted"
											mb={1.5}
										>
											<Text>
												Spent: ${spent.toLocaleString()}
											</Text>
											<Text>
												Limit: $
												{budget.monthly_limit.toLocaleString()}
											</Text>
										</HStack>

										<Box
											h="2"
											rounded="pill"
											bg="bg.muted"
											overflow="hidden"
										>
											<Box
												h="full"
												w={`${percent}%`}
												bg={
													isExceeded
														? "red.solid"
														: percent > 80
															? "orange.solid"
															: "mint.solid"
												}
												rounded="pill"
											/>
										</Box>
									</Box>
								);
							})}
						</SimpleGrid>
					)}
				</Stack>
			</Box>

			{/* Confirm Delete Budget Dialog */}
			<ConfirmDialog
				open={confirmDeleteBudget.open}
				onOpenChange={confirmDeleteBudget.onOpenChange}
				title="Delete Budget"
				description="This will permanently delete this category budget limit."
				confirmLabel="Delete"
				destructive
				loading={deleteBudget.isPending}
				onConfirm={handleDeleteBudgetConfirm}
			/>
		</Stack>
	);
};

export default Finance;
