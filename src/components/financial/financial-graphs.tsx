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
	Progress,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import {
	LuArrowDownLeft,
	LuArrowRight,
	LuArrowUpRight,
	LuCalendar,
	LuChartBar,
	LuChartPie,
	LuCreditCard,
	LuFlame,
	LuLayers,
	LuPiggyBank,
	LuReceipt,
	LuSparkles,
	LuTrendingDown,
	LuTrendingUp,
	LuWallet,
	LuZap,
} from "react-icons/lu";
import { Link } from "react-router";
import { useTimeSeries } from "@/api/hooks/use-summary";
import type { BankSummary } from "@/api/types";
import { SpendByAccountChart } from "@/components/financial/spend-by-account-chart";
import { TopReferencesChart } from "@/components/financial/top-references-chart";
import { WeekdaySpendingChart } from "@/components/financial/weekday-spending-chart";
import { glassCard } from "@/routes/financial/layout";

export interface FinancialGraphsProps {
	currentSummary?: BankSummary;
	isLoading?: boolean;
	from?: string;
	to?: string;
}

interface MonthPoint {
	monthKey: string;
	monthLabel: string;
	totalIn: number;
	totalOut: number;
	net: number;
	count: number;
}

export const FinancialGraphs: React.FC<FinancialGraphsProps> = ({
	currentSummary,
	isLoading = false,
	from,
	to,
}) => {
	// Always the trailing 6 calendar months, independent of the page's
	// selected month range.
	const trailingRange = useMemo(() => {
		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
		const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
		return { from: start.toISOString(), to: end.toISOString() };
	}, []);

	const { data: timeSeriesPoints = [], isLoading: isPastMonthsLoading } =
		useTimeSeries({ ...trailingRange, granularity: "month" });

	const past6Months: MonthPoint[] = useMemo(() => {
		return timeSeriesPoints.map((point) => {
			const d = new Date(point.bucket);
			return {
				monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
				monthLabel: d.toLocaleString("default", { month: "short" }),
				totalIn: point.in,
				totalOut: point.out,
				net: point.net,
				count: point.count,
			};
		});
	}, [timeSeriesPoints]);

	const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(
		null,
	);
	const [hoveredCategoryName, setHoveredCategoryName] = useState<string | null>(
		null,
	);

	// Compute max amount for 6-month scale
	const maxAmount = useMemo(() => {
		let max = 1000;
		past6Months.forEach((m) => {
			if (m.totalIn > max) max = m.totalIn;
			if (m.totalOut > max) max = m.totalOut;
		});
		return max * 1.15;
	}, [past6Months]);

	// Total 6-month metrics
	const total6MonthIn = useMemo(
		() => past6Months.reduce((acc, m) => acc + m.totalIn, 0),
		[past6Months],
	);
	const total6MonthOut = useMemo(
		() => past6Months.reduce((acc, m) => acc + m.totalOut, 0),
		[past6Months],
	);
	const total6MonthNet = total6MonthIn - total6MonthOut;

	// Savings rate (6-month)
	const savingsRate = useMemo(() => {
		if (total6MonthIn === 0) return 0;
		return Math.round((total6MonthNet / total6MonthIn) * 100);
	}, [total6MonthIn, total6MonthNet]);

	// Current month metrics
	const currentIn = currentSummary?.total_in || 0;
	const currentOut = currentSummary?.total_out || 0;
	const currentNet = currentSummary?.net || 0;
	const currentCount = currentSummary?.count || 0;

	const currentSavingsRate = useMemo(() => {
		if (currentIn === 0) return 0;
		return Math.round((currentNet / currentIn) * 100);
	}, [currentIn, currentNet]);

	const inflowPct = useMemo(() => {
		if (currentIn + currentOut === 0) return 50;
		return Math.round((currentIn / (currentIn + currentOut)) * 100);
	}, [currentIn, currentOut]);

	const categories = useMemo(() => {
		return currentSummary?.by_category || [];
	}, [currentSummary]);

	const totalCategoryExpense = useMemo(() => {
		return currentSummary?.total_out || 0;
	}, [currentSummary]);

	// Average spend per transaction
	const avgSpendPerTx = useMemo(() => {
		if (currentCount === 0) return 0;
		return Math.round(currentOut / currentCount);
	}, [currentOut, currentCount]);

	// Daily burn rate (approx 30 days)
	const dailyBurnRate = useMemo(() => {
		return Math.round(currentOut / 30);
	}, [currentOut]);

	// Donut calculations
	const radius = 62;
	const circumference = 2 * Math.PI * radius; // ~389.55

	const donutSegments = useMemo(() => {
		if (totalCategoryExpense <= 0 || categories.length === 0) return [];

		let accumulated = 0;
		return categories
			.filter((c) => c.out > 0)
			.map((cat) => {
				const pct = cat.out / totalCategoryExpense;
				const strokeDash = pct * circumference;
				const offset = -accumulated * circumference;
				accumulated += pct;

				return {
					name: cat.name,
					color: cat.color || "#888888",
					amount: cat.out,
					pct: Math.round(pct * 100),
					strokeDasharray: `${strokeDash} ${circumference}`,
					strokeDashoffset: offset,
				};
			});
	}, [categories, totalCategoryExpense, circumference]);

	const activeCategory = useMemo(() => {
		if (!hoveredCategoryName) return null;
		return categories.find((c) => c.name === hoveredCategoryName) || null;
	}, [hoveredCategoryName, categories]);

	// Sorted categories by expense descending
	const sortedCategories = useMemo(() => {
		return [...categories].sort((a, b) => b.out - a.out);
	}, [categories]);

	return (
		<Stack gap={6}>
			{/* 1. 6-Month Cash Flow Trend Graph Card */}
			<Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="2xl" p={{ base: 4, md: 6 }} position="relative">
				<Flex
					justify="space-between"
					align={{ base: "flex-start", sm: "center" }}
					wrap="wrap"
					gap={3}
					mb={6}
				>
					<VStack align="flex-start" gap={0}>
						<HStack gap={2}>
							<Icon as={LuChartBar} boxSize={4} color="mint.fg" />
							<Heading fontSize="sm" fontWeight="bold">
								6-Month Performance & Cash Flow Trend
							</Heading>
						</HStack>
						<Text fontSize="xs" color="fg.muted">
							Monthly comparison of Total Income, Expenses & Net Savings
						</Text>
					</VStack>

					{/* Legend */}
					<HStack gap={4} fontSize="xs">
						<HStack gap={1.5}>
							<Circle size="2.5" bg="green.solid" />
							<Text fontSize="11px" color="fg.muted">
								Income (In)
							</Text>
						</HStack>
						<HStack gap={1.5}>
							<Circle size="2.5" bg="fg" />
							<Text fontSize="11px" color="fg.muted">
								Expense (Out)
							</Text>
						</HStack>
						<HStack gap={1.5}>
							<Circle size="2.5" bg="mint.solid" />
							<Text fontSize="11px" color="fg.muted">
								Net Flow
							</Text>
						</HStack>
					</HStack>
				</Flex>

				{isPastMonthsLoading ? (
					<Stack gap={3}>
						<Skeleton h="200px" rounded="card" />
					</Stack>
				) : (
					<Box position="relative">
						{/* Hovered Month Tooltip */}
						{hoveredMonthIndex !== null && past6Months[hoveredMonthIndex] && (
							<Flex
								position="absolute"
								top="-8px"
								left="50%"
								transform="translateX(-50%)"
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border.glass"
								rounded="pill"
								px={4}
								py={1.5}
								shadow="float"
								zIndex={10}
								gap={4}
								align="center"
							>
								<Text fontSize="xs" fontWeight="bold">
									{past6Months[hoveredMonthIndex].monthLabel} (
									{past6Months[hoveredMonthIndex].count} tx)
								</Text>
								<HStack gap={2} fontSize="xs">
									<Text color="fg" fontWeight="semibold">
										+
										<FormatNumber
											value={past6Months[hoveredMonthIndex].totalIn}
											style="currency"
											currency="THB"
										/>
									</Text>
									<Text color="fg" fontWeight="semibold">
										-
										<FormatNumber
											value={past6Months[hoveredMonthIndex].totalOut}
											style="currency"
											currency="THB"
										/>
									</Text>
									<Text color="fg" fontWeight="bold">
										Net:{" "}
										<FormatNumber
											value={past6Months[hoveredMonthIndex].net}
											style="currency"
											currency="THB"
										/>
									</Text>
								</HStack>
							</Flex>
						)}

						{/* 6-Month Interactive Bar Graph */}
						<Box h="220px" w="full" pt={6} pb={2}>
							<Grid templateColumns="repeat(6, 1fr)" h="full" gap={3}>
								{past6Months.map((month, idx) => {
									const inHeight = Math.max(
										4,
										Math.round((month.totalIn / maxAmount) * 160),
									);
									const outHeight = Math.max(
										4,
										Math.round((month.totalOut / maxAmount) * 160),
									);
									const isHovered = hoveredMonthIndex === idx;

									return (
										<VStack
											key={month.monthKey}
											h="full"
											justify="flex-end"
											align="center"
											gap={2}
											cursor="pointer"
											onMouseEnter={() => setHoveredMonthIndex(idx)}
											onMouseLeave={() => setHoveredMonthIndex(null)}
											bg={isHovered ? "bg.muted" : "transparent"}
											p={1}
											rounded="card"
											transition="all 0.15s ease"
										>
											{/* Dual Bars container */}
											<HStack
												align="flex-end"
												justify="center"
												gap={1.5}
												h="160px"
												w="full"
											>
												{/* In Bar */}
												<Box
													w={{ base: "10px", sm: "16px", md: "22px" }}
													h={`${month.totalIn > 0 ? inHeight : 4}px`}
													bg={month.totalIn > 0 ? "green.solid" : "bg.muted"}
													roundedTop="pill"
													transition="all 0.25s ease"
													_hover={{ opacity: 0.85 }}
												/>

												{/* Out Bar */}
												<Box
													w={{ base: "10px", sm: "16px", md: "22px" }}
													h={`${month.totalOut > 0 ? outHeight : 4}px`}
													bg={month.totalOut > 0 ? "fg" : "bg.muted"}
													roundedTop="pill"
													transition="all 0.25s ease"
													_hover={{ opacity: 0.85 }}
												/>
											</HStack>

											{/* Month Label */}
											<Text
												fontSize={{ base: "10px", sm: "xs" }}
												fontWeight={isHovered ? "bold" : "medium"}
												color={isHovered ? "fg" : "fg.muted"}
											>
												{month.monthLabel}
											</Text>
										</VStack>
									);
								})}
							</Grid>
						</Box>
					</Box>
				)}

				{/* 6-Month Quick Metrics Footer */}
				<SimpleGrid
					columns={{ base: 1, sm: 3 }}
					gap={3}
					pt={4}
					mt={2}
					borderTopWidth="1px"
					borderColor="border"
				>
					<HStack justify="space-between" bg="bg.panel" p={3} rounded="pill">
						<HStack gap={2}>
							<Circle size="6" bg="bg.muted" color="fg">
								<Icon as={LuArrowDownLeft} boxSize={3} />
							</Circle>
							<Text fontSize="xs" color="fg.muted">
								6-Mo Total Income
							</Text>
						</HStack>
						<Text fontSize="xs" fontWeight="bold">
							<FormatNumber
								value={total6MonthIn}
								style="currency"
								currency="THB"
							/>
						</Text>
					</HStack>

					<HStack justify="space-between" bg="bg.panel" p={3} rounded="pill">
						<HStack gap={2}>
							<Circle size="6" bg="bg.muted" color="fg">
								<Icon as={LuArrowUpRight} boxSize={3} />
							</Circle>
							<Text fontSize="xs" color="fg.muted">
								6-Mo Total Spent
							</Text>
						</HStack>
						<Text fontSize="xs" fontWeight="bold">
							<FormatNumber
								value={total6MonthOut}
								style="currency"
								currency="THB"
							/>
						</Text>
					</HStack>

					<HStack justify="space-between" bg="bg.panel" p={3} rounded="pill">
						<HStack gap={2}>
							<Circle size="6" bg="bg.muted" color="fg">
								<Icon as={LuPiggyBank} boxSize={3} />
							</Circle>
							<Text fontSize="xs" color="fg.muted">
								6-Mo Net Savings
							</Text>
						</HStack>
						<HStack gap={1}>
							<Text fontSize="xs" fontWeight="bold">
								<FormatNumber
									value={total6MonthNet}
									style="currency"
									currency="THB"
								/>
							</Text>
							<Badge size="xs" rounded="pill" variant="outline">
								{savingsRate}%
							</Badge>
						</HStack>
					</HStack>
				</SimpleGrid>
			</Box>

			{/* 2. Redesigned Visual Intelligence Section: Donut Breakdown + Financial Velocity */}
			<Grid templateColumns={{ base: "1fr", lg: "1.4fr 1fr" }} gap={6}>
				{/* Category Visual Breakdown with Interactive SVG Donut */}
				<Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="2xl" p={{ base: 4, md: 5 }}>
					<Flex justify="space-between" align="center" mb={4}>
						<HStack gap={2}>
							<Icon as={LuChartPie} color="mint.fg" />
							<Heading fontSize="sm" fontWeight="bold">
								Category Expense Allocation
							</Heading>
						</HStack>
						<Button asChild size="xs" variant="ghost" rounded="pill">
							<Link to="/financial/categories">
								Manage
								<Icon as={LuArrowRight} boxSize={3} />
							</Link>
						</Button>
					</Flex>

					{isLoading ? (
						<Stack gap={3}>
							<Skeleton h="160px" rounded="card" />
						</Stack>
					) : categories.length === 0 || totalCategoryExpense === 0 ? (
						<VStack py={10} textAlign="center" color="fg.muted" gap={2}>
							<Icon as={LuLayers} boxSize={8} />
							<Text fontSize="sm">No category expenses recorded for this period.</Text>
							<Text fontSize="xs">
								Assign categories to transactions to view spending allocation.
							</Text>
						</VStack>
					) : (
						<Grid
							templateColumns={{ base: "1fr", sm: "160px 1fr" }}
							gap={{ base: 4, sm: 6 }}
							alignItems="center"
						>
							{/* SVG Donut Chart */}
							<Flex
								direction="column"
								align="center"
								justify="center"
								position="relative"
							>
								<Box w="150px" h="150px" position="relative">
									<svg
										width="150"
										height="150"
										viewBox="0 0 150 150"
										style={{ transform: "rotate(-90deg)" }}
									>
										{/* Background circle */}
										<circle
											cx="75"
											cy="75"
											r={radius}
											fill="transparent"
											stroke="var(--chakra-colors-bg-muted)"
											strokeWidth="14"
										/>
										{/* Segments */}
										{donutSegments.map((segment) => {
											const isHovered =
												hoveredCategoryName === segment.name;
											return (
												<circle
													key={segment.name}
													cx="75"
													cy="75"
													r={radius}
													fill="transparent"
													stroke={segment.color}
													strokeWidth={isHovered ? "18" : "14"}
													strokeDasharray={segment.strokeDasharray}
													strokeDashoffset={segment.strokeDashoffset}
													style={{
														transition: "all 0.2s ease",
														cursor: "pointer",
													}}
													onMouseEnter={() =>
														setHoveredCategoryName(segment.name)
													}
													onMouseLeave={() => setHoveredCategoryName(null)}
												/>
											);
										})}
									</svg>

									{/* Center Information */}
									<VStack
										position="absolute"
										top="0"
										left="0"
										w="full"
										h="full"
										justify="center"
										align="center"
										pointerEvents="none"
										gap={0}
									>
										<Text
											fontSize="10px"
											color="fg.muted"
											fontWeight="medium"
											maxW="90px"
											truncate
											textAlign="center"
										>
											{activeCategory ? activeCategory.name : "Total Outflow"}
										</Text>
										<Text fontSize="xs" fontWeight="bold" color="fg">
											<FormatNumber
												value={
													activeCategory
														? activeCategory.out
														: totalCategoryExpense
												}
												style="currency"
												currency="THB"
											/>
										</Text>
									</VStack>
								</Box>
							</Flex>

							{/* Category Ranked Items List */}
							<VStack align="stretch" gap={2.5} maxH="220px" overflowY="auto" pr={1}>
								{sortedCategories.map((cat) => {
									const pct = totalCategoryExpense > 0
										? Math.min(
												100,
												Math.round((cat.out / totalCategoryExpense) * 100),
											)
										: 0;
									const isHovered = hoveredCategoryName === cat.name;

									return (
										<Box
											key={cat.name}
											p={2}
											rounded="card"
											bg={isHovered ? "bg.muted" : "bg.panel"}
											borderWidth="1px"
											borderColor={isHovered ? "fg" : "border"}
											transition="all 0.15s ease"
											cursor="pointer"
											onMouseEnter={() => setHoveredCategoryName(cat.name)}
											onMouseLeave={() => setHoveredCategoryName(null)}
										>
											<Flex justify="space-between" align="center" mb={1}>
												<HStack gap={2} overflow="hidden">
													<Circle
														size="2.5"
														bg={cat.color || "fg.muted"}
														flexShrink={0}
													/>
													<Text fontSize="xs" fontWeight="semibold" truncate>
														{cat.name}
													</Text>
													<Text fontSize="10px" color="fg.muted">
														({cat.count} tx)
													</Text>
												</HStack>

												<HStack gap={2}>
													<Text fontSize="xs" fontWeight="bold">
														<FormatNumber
															value={cat.out}
															style="currency"
															currency="THB"
														/>
													</Text>
													<Badge
														size="xs"
														rounded="pill"
														variant={isHovered ? "solid" : "outline"}
													>
														{pct}%
													</Badge>
												</HStack>
											</Flex>

											{/* Subtle Progress Bar */}
											<Progress.Root value={pct} max={100} size="xs">
												<Progress.Track bg="bg.muted" rounded="pill">
													<Progress.Range
														bg={cat.color || "fg"}
														rounded="pill"
													/>
												</Progress.Track>
											</Progress.Root>
										</Box>
									);
								})}
							</VStack>
						</Grid>
					)}
				</Box>

				{/* Financial Velocity & Health Intelligence Card */}
				<Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="2xl" p={{ base: 4, md: 5 }}>
					<HStack gap={2} mb={4}>
						<Icon as={LuSparkles} color="mint.fg" />
						<Heading fontSize="sm" fontWeight="bold">
							Spending Intelligence
						</Heading>
					</HStack>

					<Stack gap={3.5}>
						{/* Daily Burn Rate & Average Transaction */}
						<SimpleGrid columns={2} gap={2.5}>
							<Box
								bg="bg.panel"
								p={3}
								rounded="card"
								borderWidth="1px"
								borderColor="border"
							>
								<HStack gap={1.5} color="fg.muted" mb={1}>
									<Icon as={LuFlame} boxSize={3.5} color="fg.muted" />
									<Text fontSize="10px" fontWeight="medium">
										Daily Burn Rate
									</Text>
								</HStack>
								<Text fontSize="sm" fontWeight="bold">
									<FormatNumber
										value={dailyBurnRate}
										style="currency"
										currency="THB"
									/>
									<Text as="span" fontSize="10px" color="fg.muted" fontWeight="normal">
										{" "}/day
									</Text>
								</Text>
							</Box>

							<Box
								bg="bg.panel"
								p={3}
								rounded="card"
								borderWidth="1px"
								borderColor="border"
							>
								<HStack gap={1.5} color="fg.muted" mb={1}>
									<Icon as={LuReceipt} boxSize={3.5} color="fg.muted" />
									<Text fontSize="10px" fontWeight="medium">
										Avg Ticket Size
									</Text>
								</HStack>
								<Text fontSize="sm" fontWeight="bold">
									<FormatNumber
										value={avgSpendPerTx}
										style="currency"
										currency="THB"
									/>
									<Text as="span" fontSize="10px" color="fg.muted" fontWeight="normal">
										{" "}/tx
									</Text>
								</Text>
							</Box>
						</SimpleGrid>

						{/* In vs Out Ratio Meter */}
						<Box
							p={3}
							bg="bg.panel"
							borderWidth="1px"
							borderColor="border"
							rounded="card"
						>
							<Flex justify="space-between" fontSize="xs" mb={1.5}>
								<HStack gap={1}>
									<Circle size="2" bg="fg" />
									<Text color="fg" fontWeight="semibold" fontSize="11px">
										Inflow ({currentIn + currentOut > 0 ? inflowPct : 0}%)
									</Text>
								</HStack>
								<HStack gap={1}>
									<Circle size="2" bg="fg.muted" />
									<Text color="fg.muted" fontWeight="semibold" fontSize="11px">
										Outflow ({currentIn + currentOut > 0 ? 100 - inflowPct : 0}%)
									</Text>
								</HStack>
							</Flex>
							<Progress.Root value={inflowPct} max={100} size="sm">
								<Progress.Track bg="fg" rounded="pill">
									<Progress.Range bg="fg" rounded="pill" transition="width 0.3s ease" />
								</Progress.Track>
							</Progress.Root>
						</Box>

						{/* Cashflow Efficiency Status */}
						<Box
							bg="bg.muted"
							p={3.5}
							rounded="card"
							borderWidth="1px"
							borderColor="border.glass"
						>
							<Flex justify="space-between" align="center">
								<VStack align="flex-start" gap={0}>
									<Text fontSize="10px" color="fg.muted" fontWeight="semibold">
										Period Savings Margin
									</Text>
									<Text fontSize="xl" fontWeight="bold">
										{currentSavingsRate}%
									</Text>
								</VStack>
								<Circle
									size="9"
									bg={currentSavingsRate >= 0 ? "mint.solid" : "red.solid"}
									color={
										currentSavingsRate >= 0 ? "mint.contrast" : "fg.inverted"
									}
								>
									<Icon
										as={currentSavingsRate >= 0 ? LuTrendingUp : LuTrendingDown}
										boxSize={4.5}
									/>
								</Circle>
							</Flex>
							<Text fontSize="11px" color="fg.muted" mt={1.5}>
								{currentSavingsRate >= 30
									? "🔥 Strong cash retention this month."
									: currentSavingsRate >= 0
										? "⚖️ Cash inflow balances your spending."
										: "⚠️ Net outflow exceeds incoming funds."}
							</Text>
						</Box>
					</Stack>
				</Box>
			</Grid>

			{/* 3. Spend-by-Account & Spend-by-Weekday */}
			<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
				<SpendByAccountChart from={from} to={to} />
				<WeekdaySpendingChart from={from} to={to} />
			</Grid>

			{/* 4. Top References */}
			<TopReferencesChart from={from} to={to} />
		</Stack>
	);
};

export default FinancialGraphs;
