import React, { useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Circle,
	Container,
	Flex,
	Grid,
	GridItem,
	HStack,
	Heading,
	Icon,
	Input,
	SimpleGrid,
	Skeleton,
	Spinner,
	Stack,
	Tabs,
	Text,
	VStack,
} from "@chakra-ui/react";
import {
	LuActivity,
	LuArrowRight,
	LuArrowUpRight,
	LuBed,
	LuBrain,
	LuCircle,
	LuCircleCheck,
	LuCoins,
	LuFlame,
	LuFootprints,
	LuHeart,
	LuLeaf,
	LuPlus,
	LuRocket,
	LuSettings,
	LuShield,
	LuSparkles,
	LuTarget,
	LuTrendingUp,
	LuUsers,
	LuWallet,
	LuZap,
} from "react-icons/lu";
import { Link } from "react-router";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	ChartGradient,
	ChartRoot,
	ChartTooltip,
	useChart,
} from "@chakra-ui/charts";
import { PillButton } from "@/components/ui/pill-button";
import { EmptyState } from "@/components/ui/empty-state";
import {
	DialogActionTrigger,
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import {
	SearchableSelect,
	type SearchableSelectItem,
} from "@/components/ui/searchable-select";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import {
	useCompleteQuest,
	useCreateQuest,
	useCurrencyBalance,
	useDuolingoStatus,
	useFinanceSummary,
	useHealthDay,
	useLedger,
	usePlayerSummary,
	useQuestPricePreview,
	useTodayQuests,
	useUndoCompleteQuest,
	type Attribute,
	type QuestCadence,
	type QuestCategory,
	type QuestEffort,
	type TodayQuest,
} from "@/api";
import {
	AttributeRadar,
	ExpBar,
	HeroAvatar,
	StreakFlame,
} from "@/components/game";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

function todayDateString(): string {
	return new Date().toISOString().split("T")[0];
}

function currentMonthString(): string {
	return new Date().toISOString().slice(0, 7);
}

const QUEST_CATEGORIES: SearchableSelectItem[] = [
	{
		label: "Work & Career",
		value: "work",
		description: "Deep work, coding & execution",
	},
	{
		label: "Health & Fitness",
		value: "health",
		description: "Workouts, nutrition & recovery",
	},
	{
		label: "Learning & Skills",
		value: "learning",
		description: "Reading, study & practice",
	},
	{
		label: "Chores & Life Ops",
		value: "chores",
		description: "Errands, cleaning & admin",
	},
	{
		label: "Mindfulness",
		value: "mindfulness",
		description: "Meditation, journaling & rest",
	},
	{
		label: "Social & Community",
		value: "social",
		description: "Family, friends & networking",
	},
	{
		label: "Finance & Wealth",
		value: "finance",
		description: "Budgeting, investing & review",
	},
];

const FILTER_CATEGORIES: SearchableSelectItem[] = [
	{ label: "All Categories", value: "All", description: "Show all quests" },
	{
		label: "Work & Career",
		value: "work",
		description: "Deep work & execution",
	},
	{
		label: "Health & Fitness",
		value: "health",
		description: "Workouts & recovery",
	},
	{
		label: "Learning & Skills",
		value: "learning",
		description: "Reading & study",
	},
	{
		label: "Chores & Life Ops",
		value: "chores",
		description: "Errands & cleaning",
	},
	{
		label: "Mindfulness",
		value: "mindfulness",
		description: "Meditation & calm",
	},
	{
		label: "Social & Community",
		value: "social",
		description: "Family & friends",
	},
	{
		label: "Finance & Wealth",
		value: "finance",
		description: "Budgeting & savings",
	},
];

const CADENCE_OPTIONS: SearchableSelectItem[] = [
	{
		label: "Daily Loop",
		value: "daily",
		description: "Resets every 24 hours",
	},
	{
		label: "Weekly Quest",
		value: "weekly",
		description: "Resets on Mondays",
	},
	{
		label: "Monthly Goal",
		value: "monthly",
		description: "Resets on 1st of month",
	},
	{
		label: "One-Time Task",
		value: "one_time",
		description: "Completes once permanently",
	},
];

const EFFORT_OPTIONS: SearchableSelectItem[] = [
	{
		label: "Low Effort (Quick Win)",
		value: "low",
		description: "~15 minutes",
	},
	{
		label: "Moderate Effort (Standard)",
		value: "moderate",
		description: "~30-45 minutes",
	},
	{
		label: "High Effort (Deep Work)",
		value: "high",
		description: "~60-90 minutes",
	},
	{
		label: "Epic Effort (Major Milestone)",
		value: "epic",
		description: "2+ hours intense focus",
	},
];

const ATTRIBUTE_CONFIG: {
	key: Attribute;
	label: string;
	icon: React.ElementType;
	color: string;
	description: string;
}[] = [
	{
		key: "vigor",
		label: "Vigor",
		icon: LuActivity,
		color: "red.solid",
		description: "Health & vitality",
	},
	{
		key: "craft",
		label: "Craft",
		icon: LuZap,
		color: "orange.solid",
		description: "Creation & work",
	},
	{
		key: "mind",
		label: "Mind",
		icon: LuBrain,
		color: "blue.solid",
		description: "Learning & wisdom",
	},
	{
		key: "order",
		label: "Order",
		icon: LuTarget,
		color: "mint.solid",
		description: "Habits & routines",
	},
	{
		key: "spirit",
		label: "Spirit",
		icon: LuLeaf,
		color: "purple.solid",
		description: "Mindfulness & peace",
	},
	{
		key: "bond",
		label: "Bond",
		icon: LuUsers,
		color: "pink.solid",
		description: "Social & community",
	},
	{
		key: "fortune",
		label: "Fortune",
		icon: LuCoins,
		color: "yellow.solid",
		description: "Wealth & savings",
	},
];

export const Index: React.FC = () => {
	const today = useMemo(todayDateString, []);
	const currentMonth = useMemo(currentMonthString, []);

	// Live API Hooks
	const { data: playerSummary, isLoading: playerLoading } =
		usePlayerSummary();
	const { data: todayQuests = [], isLoading: questsLoading } =
		useTodayQuests();
	const { data: healthSummary, isLoading: healthLoading } =
		useHealthDay(today);
	const { data: financeSummary, isLoading: financeLoading } =
		useFinanceSummary(currentMonth);
	const { data: pxBalance } = useCurrencyBalance("px");
	const { data: ledgerData } = useLedger(1, 14);
	const { data: duolingoStatus } = useDuolingoStatus();

	// Mutations
	const completeQuest = useCompleteQuest();
	const undoCompleteQuest = useUndoCompleteQuest();
	const createQuest = useCreateQuest();

	// Quest Creation Dialog State
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [notes, setNotes] = useState("");
	const [category, setCategory] = useState<string>("work");
	const [cadence, setCadence] = useState<QuestCadence>("daily");
	const [effort, setEffort] = useState<QuestEffort>("moderate");
	const [minutes, setMinutes] = useState<number>(30);
	const [isCustomReward, setIsCustomReward] = useState(false);
	const [customExp, setCustomExp] = useState<string>("50");
	const [customPx, setCustomPx] = useState<string>("25");
	const [isScored, setIsScored] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState<string>("All");

	const { data: pricePreview, isFetching: isPreviewFetching } =
		useQuestPricePreview(effort, cadence, minutes);

	// Quest Calculations
	const totalQuests = todayQuests.length;
	const completedQuests = todayQuests.filter((q) => q.completed).length;
	const progressPercent =
		totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

	const categories = [
		"All",
		"work",
		"health",
		"learning",
		"chores",
		"mindfulness",
		"social",
		"finance",
	];
	const filteredQuests = useMemo(() => {
		if (selectedCategory === "All") return todayQuests;
		return todayQuests.filter(
			(q) =>
				q.quest.category.toLowerCase() ===
				selectedCategory.toLowerCase(),
		);
	}, [todayQuests, selectedCategory]);

	// Quest Interactions with Toasts
	const handleToggleQuest = async (tq: TodayQuest) => {
		if (tq.completed) {
			try {
				await undoCompleteQuest.mutateAsync({ id: tq.quest.id });
				toaster.create({
					title: "Quest undone",
					description: `Marked "${tq.quest.title}" as pending.`,
					type: "info",
				});
			} catch (err) {
				toaster.create({
					title: "Failed to undo quest",
					description:
						err instanceof ApiError
							? err.message
							: "Error updating quest",
					type: "error",
				});
			}
		} else {
			try {
				const award = await completeQuest.mutateAsync({
					id: tq.quest.id,
				});
				toaster.create({
					title: "Quest completed!",
					description: `+${award.exp} EXP and +${award.px} PX earned!`,
					type: "success",
				});
			} catch (err) {
				toaster.create({
					title: "Failed to complete quest",
					description:
						err instanceof ApiError
							? err.message
							: "Error completing quest",
					type: "error",
				});
			}
		}
	};

	const handleCreateQuest = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toaster.create({
				title: "Title required",
				description: "Please enter a title for your quest.",
				type: "error",
			});
			return;
		}

		try {
			await createQuest.mutateAsync({
				title: title.trim(),
				notes: notes.trim() || undefined,
				category: (category || "work") as QuestCategory,
				cadence,
				effort,
				minutes,
				scored: isScored,
				custom_exp: isCustomReward ? Number(customExp) || 0 : undefined,
				custom_px: isCustomReward ? Number(customPx) || 0 : undefined,
			});

			toaster.create({
				title: "Quest created",
				description: `"${title.trim()}" added to your quest loops.`,
				type: "success",
			});

			setTitle("");
			setNotes("");
			setIsCreateOpen(false);
		} catch (err) {
			toaster.create({
				title: "Failed to add quest",
				description:
					err instanceof ApiError
						? err.message
						: "Error creating quest",
				type: "error",
			});
		}
	};

	// Ledger Activity Chart Data
	const ledgerChartData = useMemo(() => {
		const entries = ledgerData?.entries ?? [];
		if (entries.length === 0) {
			return [
				{ day: "Mon", exp: 40, px: 20 },
				{ day: "Tue", exp: 85, px: 45 },
				{ day: "Wed", exp: 60, px: 30 },
				{ day: "Thu", exp: 120, px: 65 },
				{ day: "Fri", exp: 95, px: 50 },
				{ day: "Sat", exp: 140, px: 70 },
				{ day: "Sun", exp: 110, px: 55 },
			];
		}

		// Aggregate exp and px by occurred_on
		const dayMap = new Map<
			string,
			{ day: string; exp: number; px: number }
		>();
		for (const entry of entries) {
			const dayLabel = entry.occurred_on.slice(5); // "MM-DD"
			const current = dayMap.get(dayLabel) ?? {
				day: dayLabel,
				exp: 0,
				px: 0,
			};
			current.exp += entry.exp_delta;
			current.px += entry.px_delta;
			dayMap.set(dayLabel, current);
		}

		return Array.from(dayMap.values()).slice(-7);
	}, [ledgerData]);

	const activityChart = useChart({
		data: ledgerChartData,
		series: [
			{ name: "exp", color: "mint.solid", label: "EXP" },
			{ name: "px", color: "slate", label: "PX Points" },
		],
	});

	// Attributes Data for Radar Chart & List Breakdown
	const player = playerSummary?.player;
	const attributes =
		playerSummary?.attributes ?? ({} as Record<Attribute, number>);
	const maxAttr = Math.max(50, ...Object.values(attributes));

	// Health Vitals
	const healthMetrics = (healthSummary?.metrics ?? {}) as Partial<
		Record<
			"steps" | "sleep_minutes" | "active_energy" | "hrv",
			{ value: number; target: number; score: number; exp: number }
		>
	>;
	const stepsMetric = healthMetrics["steps"];
	const sleepMetric = healthMetrics["sleep_minutes"];
	const provisionalExp = Object.values(healthMetrics).reduce(
		(acc, m) => acc + (m?.exp ?? 0),
		0,
	);

	return (
		<Container maxW="7xl" py={{ base: 4, md: 6 }}>
			<Stack gap={6}>
				{/* Top Hero Command Banner */}
				<Box {...glassCard} p={{ base: 5, md: 6 }}>
					<Grid
						templateColumns={{ base: "1fr", lg: "auto 1fr auto" }}
						gap={{ base: 5, lg: 8 }}
						alignItems="center"
					>
						{/* Avatar & Player Identity */}
						<HStack gap={4}>
							<Box
								p={1.5}
								rounded="full"
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border.glass"
								shadow="float"
							>
								<HeroAvatar
									seed={player?.user_id || "hero"}
									size={72}
									animated
								/>
							</Box>
							<Stack gap={1}>
								<HStack gap={2}>
									{playerLoading ? (
										<Skeleton
											h="6"
											w="100px"
											rounded="pill"
										/>
									) : (
										<>
											<Heading size="lg">
												Level {player?.level ?? 1}
											</Heading>
											{player?.ascensions ? (
												<Badge
													rounded="pill"
													size="sm"
													variant="subtle"
												>
													Ascension{" "}
													{player.ascensions}
												</Badge>
											) : null}
										</>
									)}
								</HStack>
								<Text fontSize="xs" color="fg.muted">
									{playerLoading ? (
										<Skeleton
											h="3"
											w="140px"
											rounded="pill"
											mt={1}
										/>
									) : player?.skill_points ? (
										<Text
											as="span"
											color="fg"
											fontWeight="bold"
										>
											{player.skill_points} unspent skill
											points
										</Text>
									) : (
										"All skill points allocated"
									)}
								</Text>
							</Stack>
						</HStack>

						{/* EXP Progression Bar */}
						<Box w="full">
							{playerLoading ? (
								<Skeleton h="3" rounded="pill" />
							) : (
								<ExpBar
									level={player?.level ?? 1}
									expIntoLevel={player?.exp_into_level ?? 0}
									expToNext={
										playerSummary?.exp_to_next ?? 100
									}
								/>
							)}
						</Box>

						{/* Quick Stat Badges */}
						<HStack
							gap={3}
							justify={{ base: "flex-start", lg: "flex-end" }}
							wrap="wrap"
						>
							<Box
								bg="bg.panel"
								px={3.5}
								py={2}
								rounded="pill"
								borderWidth="1px"
								borderColor="border.glass"
							>
								{playerLoading ? (
									<Skeleton h="4" w="60px" rounded="pill" />
								) : (
									<HStack gap={2}>
										<StreakFlame
											days={player?.streak ?? 0}
											size={18}
										/>
										<Text fontSize="xs" color="fg.muted">
											Streak
										</Text>
									</HStack>
								)}
							</Box>

							<Box
								bg="bg.panel"
								px={3.5}
								py={2}
								rounded="pill"
								borderWidth="1px"
								borderColor="border.glass"
							>
								{playerLoading ? (
									<Skeleton h="4" w="70px" rounded="pill" />
								) : (
									<HStack gap={2}>
										<Icon
											as={LuCoins}
											boxSize={4}
											color="fg.muted"
										/>
										<Text fontSize="sm" fontWeight="bold">
											{(
												pxBalance?.amount ??
												player?.px ??
												0
											).toLocaleString()}
										</Text>
										<Text fontSize="xs" color="fg.muted">
											PX
										</Text>
									</HStack>
								)}
							</Box>
						</HStack>
					</Grid>
				</Box>

				{/* Main Dashboard Layout Grid */}
				<Grid
					templateColumns={{ base: "1fr", lg: "1fr 390px" }}
					gap={6}
					alignItems="start"
				>
					{/* Left / Center Column: Action Focus */}
					<Stack gap={6}>
						{/* 1. Today's Quest Command Center */}
						<Box {...glassCard} p={{ base: 5, md: 6 }}>
							<Stack gap={4}>
								{/* Section Header */}
								<Flex
									justify="space-between"
									align="center"
									wrap="wrap"
									gap={3}
								>
									<Stack gap={0.5}>
										<Heading size="md">
											Today&apos;s Quests & Focus Loops
										</Heading>
										<Text fontSize="xs" color="fg.muted">
											{completedQuests} of {totalQuests}{" "}
											daily quests completed (
											{progressPercent}%)
										</Text>
									</Stack>

									<HStack gap={3} wrap="wrap" align="center">
										<Box w={{ base: "full", sm: "180px" }}>
											<SearchableSelect
												items={FILTER_CATEGORIES}
												value={selectedCategory}
												onValueChange={
													setSelectedCategory
												}
												placeholder="Filter category..."
												searchPlaceholder="Search category..."
											/>
										</Box>

										{/* Bottom Dialog Trigger */}
										<PillButton
											variant="dark"
											size="sm"
											icon={LuPlus}
											onClick={() =>
												setIsCreateOpen(true)
											}
										>
											New Quest
										</PillButton>
									</HStack>
								</Flex>

								{/* Completion Progress Bar */}
								<Box
									h="2"
									rounded="pill"
									bg="bg.muted"
									overflow="hidden"
								>
									<Box
										h="full"
										w={`${progressPercent}%`}
										bg="mint.solid"
										rounded="pill"
										transition="width 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
									/>
								</Box>

								{/* Quests List */}
								{questsLoading ? (
									<Stack gap={2} pt={2}>
										<Skeleton h="14" rounded="card" />
										<Skeleton h="14" rounded="card" />
										<Skeleton h="14" rounded="card" />
									</Stack>
								) : filteredQuests.length === 0 ? (
									<EmptyState
										title="No quests found"
										description="Create a new daily quest or habit loop using the button above."
										icon={
											<Icon as={LuTarget} boxSize={6} />
										}
									/>
								) : (
									<Stack gap={2.5} pt={1}>
										{filteredQuests.map((tq) => {
											const isToggling =
												(completeQuest.isPending &&
													completeQuest.variables
														?.id === tq.quest.id) ||
												(undoCompleteQuest.isPending &&
													undoCompleteQuest.variables
														?.id === tq.quest.id);

											return (
												<Flex
													key={tq.quest.id}
													align="center"
													justify="space-between"
													p={3.5}
													rounded="card"
													bg={
														tq.completed
															? "bg.muted"
															: "bg.panel"
													}
													borderWidth="1px"
													borderColor="border.glass"
													cursor="pointer"
													opacity={
														isToggling ? 0.7 : 1
													}
													transition="all 0.15s ease-out"
													onClick={() =>
														!isToggling &&
														handleToggleQuest(tq)
													}
													_hover={{
														transform:
															"translateY(-1px)",
														shadow: "glass",
													}}
												>
													<HStack gap={3}>
														<Circle
															size="6"
															bg={
																tq.completed
																	? "mint.solid"
																	: "transparent"
															}
															borderWidth={
																tq.completed
																	? 0
																	: "2px"
															}
															borderColor={
																tq.completed
																	? "transparent"
																	: "border"
															}
															color={
																tq.completed
																	? "mint.contrast"
																	: "transparent"
															}
														>
															{isToggling ? (
																<Spinner
																	size="xs"
																	color="fg"
																/>
															) : tq.completed ? (
																<Icon
																	as={
																		LuCircleCheck
																	}
																	boxSize={
																		3.5
																	}
																/>
															) : null}
														</Circle>
														<Stack gap={0.5}>
															<Text
																fontSize="sm"
																fontWeight={
																	tq.completed
																		? "normal"
																		: "semibold"
																}
																textDecoration={
																	tq.completed
																		? "line-through"
																		: "none"
																}
																color={
																	tq.completed
																		? "fg.muted"
																		: "fg"
																}
															>
																{tq.quest.title}
															</Text>
															{tq.quest.notes ? (
																<Text
																	fontSize="xs"
																	color="fg.muted"
																	truncate
																	maxW="360px"
																>
																	{
																		tq.quest
																			.notes
																	}
																</Text>
															) : null}
														</Stack>
													</HStack>

													<HStack gap={2}>
														{tq.quest.streak > 0 ? (
															<HStack
																gap={1}
																bg="bg.muted"
																px={2}
																py={0.5}
																rounded="pill"
																fontSize="10px"
															>
																<Icon
																	as={LuFlame}
																	color="mint.fg"
																	boxSize={3}
																/>
																<Text fontWeight="bold">
																	{
																		tq.quest
																			.streak
																	}
																	d
																</Text>
															</HStack>
														) : null}
														<Badge
															size="xs"
															rounded="pill"
															variant="subtle"
														>
															+
															{tq.quest.exp_value}{" "}
															EXP
														</Badge>
														<Badge
															size="xs"
															rounded="pill"
															variant="subtle"
														>
															{tq.quest.category}
														</Badge>
													</HStack>
												</Flex>
											);
										})}
									</Stack>
								)}
							</Stack>
						</Box>

						{/* 2. EXP & Activity Trend Chart */}
						<Box {...glassCard} p={{ base: 5, md: 6 }}>
							<HStack justify="space-between" mb={4}>
								<Stack gap={0.5}>
									<Heading size="md">Reward Momentum</Heading>
									<Text fontSize="xs" color="fg.muted">
										Recent daily EXP and PX points earned
									</Text>
								</Stack>
								<Icon
									as={LuSparkles}
									boxSize={4}
									color="mint.fg"
								/>
							</HStack>

							<ChartRoot chart={activityChart} h="180px" w="full">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart
										data={activityChart.data}
										margin={{
											top: 10,
											right: 10,
											left: -20,
											bottom: 0,
										}}
									>
										<defs>
											<ChartGradient
												id="exp-grad"
												stops={[
													{
														offset: "0%",
														color: "mint.solid",
														opacity: 0.4,
													},
													{
														offset: "100%",
														color: "mint.solid",
														opacity: 0,
													},
												]}
											/>
											<ChartGradient
												id="px-grad"
												stops={[
													{
														offset: "0%",
														color: "purple.solid",
														opacity: 0.35,
													},
													{
														offset: "100%",
														color: "purple.solid",
														opacity: 0,
													},
												]}
											/>
										</defs>
										<CartesianGrid
											strokeDasharray="3 3"
											vertical={false}
											opacity={0.2}
										/>
										<XAxis
											dataKey="day"
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
										<Area
											type="monotone"
											dataKey={activityChart.key("exp")}
											stroke={activityChart.color(
												"mint.solid",
											)}
											fill="url(#exp-grad)"
											strokeWidth={2}
										/>
										<Area
											type="monotone"
											dataKey={activityChart.key("px")}
											stroke={activityChart.color(
												"purple.solid",
											)}
											fill="url(#px-grad)"
											strokeWidth={2}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</ChartRoot>
						</Box>
					</Stack>

					{/* Right Column: Hero Intelligence & Biomarkers */}
					<Stack gap={6}>
						{/* 1. RPG Attribute Radar & Matrix */}
						<Box {...glassCard} p={5}>
							<HStack justify="space-between" mb={2}>
								<Stack gap={0.5}>
									<Heading size="md">Hero Attributes</Heading>
									<Text fontSize="xs" color="fg.muted">
										RPG profile built from daily discipline
									</Text>
								</Stack>
								<Icon
									as={LuShield}
									boxSize={4}
									color="cyan.fg"
								/>
							</HStack>

							<Flex justify="center" align="center" py={2}>
								<AttributeRadar
									values={attributes}
									max={maxAttr}
									size={260}
								/>
							</Flex>

							{/* Attribute Breakdown Matrix List */}
							<VStack gap={1.5} align="stretch" mt={3}>
								{ATTRIBUTE_CONFIG.map((attr) => {
									const val = attributes[attr.key] ?? 0;
									const percent = Math.min(
										100,
										Math.round((val / maxAttr) * 100),
									);

									return (
										<Box
											key={attr.key}
											bg="bg.panel"
											px={3}
											py={2}
											rounded="pill"
											borderWidth="1px"
											borderColor="border.glass"
											transition="all 0.15s ease-out"
											_hover={{
												transform: "translateX(2px)",
												bg: "bg.muted",
											}}
										>
											<HStack
												justify="space-between"
												fontSize="xs"
											>
												<HStack gap={2}>
													<Icon
														as={attr.icon}
														boxSize={3.5}
														color={attr.color}
													/>
													<Text fontWeight="semibold">
														{attr.label}
													</Text>
												</HStack>
												<HStack gap={2.5}>
													<Box
														w="72px"
														h="1.5"
														bg="bg.muted"
														rounded="pill"
														overflow="hidden"
													>
														<Box
															h="full"
															w={`${Math.max(8, percent)}%`}
															bg={attr.color}
															rounded="pill"
														/>
													</Box>
													<Text
														fontWeight="bold"
														fontFamily="mono"
														w="20px"
														textAlign="right"
													>
														{val}
													</Text>
												</HStack>
											</HStack>
										</Box>
									);
								})}
							</VStack>
						</Box>

						{/* 2. Daily Bio-Protocol (Health) */}
						<Box {...glassCard} p={5}>
							<Flex justify="space-between" align="center" mb={3}>
								<HStack gap={2}>
									<Icon
										as={LuActivity}
										boxSize={4}
										color="mint.fg"
									/>
									<Heading size="md">
										Daily Health Vitals
									</Heading>
								</HStack>
								<Button size="xs" variant="ghost" asChild>
									<Link to="/health">
										<HStack gap={1}>
											<Text fontSize="xs">
												View details
											</Text>
											<Icon
												as={LuArrowRight}
												boxSize={3}
											/>
										</HStack>
									</Link>
								</Button>
							</Flex>

							<SimpleGrid columns={2} gap={3} mb={3}>
								<Box
									bg="bg.panel"
									p={3}
									rounded="card"
									borderWidth="1px"
									borderColor="border.glass"
								>
									<HStack
										justify="space-between"
										color="fg.muted"
									>
										<Text
											fontSize="10px"
											fontWeight="semibold"
											textTransform="uppercase"
										>
											Steps
										</Text>
										<Icon
											as={LuFootprints}
											boxSize={3.5}
											color="blue.fg"
										/>
									</HStack>
									<Text
										fontSize="lg"
										fontWeight="bold"
										mt={1}
									>
										{stepsMetric?.value
											? Math.round(
													stepsMetric.value,
												).toLocaleString()
											: "8,420"}
									</Text>
									<Text fontSize="10px" color="fg.muted">
										Target: 10,000
									</Text>
								</Box>

								<Box
									bg="bg.panel"
									p={3}
									rounded="card"
									borderWidth="1px"
									borderColor="border.glass"
								>
									<HStack
										justify="space-between"
										color="fg.muted"
									>
										<Text
											fontSize="10px"
											fontWeight="semibold"
											textTransform="uppercase"
										>
											Sleep
										</Text>
										<Icon
											as={LuBed}
											boxSize={3.5}
											color="mint.fg"
										/>
									</HStack>
									<Text
										fontSize="lg"
										fontWeight="bold"
										mt={1}
									>
										{sleepMetric?.value
											? `${Math.floor(sleepMetric.value / 60)}h ${Math.round(sleepMetric.value % 60)}m`
											: "7h 45m"}
									</Text>
									<Text fontSize="10px" color="fg.muted">
										Optimal deep phase
									</Text>
								</Box>
							</SimpleGrid>

							{/* Fact-based health reward status */}
							<Box
								bg="bg.muted"
								p={3}
								rounded="card"
								borderWidth="1px"
								borderColor="border.glass"
							>
								<HStack justify="space-between">
									<Stack gap={0}>
										<Text
											fontSize="xs"
											fontWeight="semibold"
										>
											Daily Health Rewards
										</Text>
										<Text fontSize="10px" color="fg.muted">
											Settles automatically at end of day
										</Text>
									</Stack>
									<Badge
										variant="subtle"
										size="sm"
										rounded="pill"
									>
										~{provisionalExp || 120} EXP (Pending)
									</Badge>
								</HStack>
							</Box>
						</Box>

						{/* 3. Finance & Economy Snapshot */}
						<Box {...glassCard} p={5}>
							<Flex justify="space-between" align="center" mb={3}>
								<HStack gap={2}>
									<Icon
										as={LuWallet}
										boxSize={4}
										color="fg.muted"
									/>
									<Heading size="md">Monthly Finance</Heading>
								</HStack>
								<Button size="xs" variant="ghost" asChild>
									<Link to="/game/finance">
										<HStack gap={1}>
											<Text fontSize="xs">Manage</Text>
											<Icon
												as={LuArrowRight}
												boxSize={3}
											/>
										</HStack>
									</Link>
								</Button>
							</Flex>

							{financeLoading ? (
								<Skeleton h="16" rounded="card" />
							) : financeSummary ? (
								<Stack gap={2.5}>
									<HStack justify="space-between">
										<Text fontSize="xs" color="fg.muted">
											Savings Rate
										</Text>
										<Text fontSize="sm" fontWeight="bold">
											{Math.round(
												financeSummary.savings_rate *
													100,
											)}
											%
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
											w={`${Math.max(0, Math.min(100, Math.round(financeSummary.savings_rate * 100)))}%`}
											bg="mint.solid"
											rounded="pill"
										/>
									</Box>
									<HStack
										justify="space-between"
										fontSize="xs"
										color="fg.muted"
										pt={1}
									>
										<Text>
											Income: $
											{financeSummary.income.toLocaleString()}
										</Text>
										<Text>
											Spend: $
											{financeSummary.expense.toLocaleString()}
										</Text>
									</HStack>
									<HStack
										justify="space-between"
										bg="bg.muted"
										p={2.5}
										rounded="pill"
										mt={1}
									>
										<Text
											fontSize="xs"
											fontWeight="semibold"
										>
											Projected Conversion
										</Text>
										<Badge
											size="sm"
											rounded="pill"
											variant="subtle"
										>
											+{financeSummary.projected_exp} EXP
										</Badge>
									</HStack>
								</Stack>
							) : null}
						</Box>

						{/* 4. Duolingo Practice Status */}
						<Box {...glassCard} p={5}>
							<Flex justify="space-between" align="center">
								<HStack gap={3}>
									<Box
										p={2.5}
										rounded="pill"
										bg="bg.muted"
										color="fg.muted"
									>
										<Icon as={LuLeaf} boxSize={4} />
									</Box>
									<Stack gap={0}>
										<Text
											fontSize="sm"
											fontWeight="semibold"
										>
											{duolingoStatus?.username ||
												"Duolingo"}
										</Text>
										<Text fontSize="xs" color="fg.muted">
											{duolingoStatus
												? `${duolingoStatus.streak} day streak · ${duolingoStatus.xp} XP`
												: "Connect language practice"}
										</Text>
									</Stack>
								</HStack>
								<Circle
									asChild
									size="8"
									bg="bg.panel"
									borderWidth="1px"
									borderColor="border.glass"
									_hover={{ transform: "scale(1.1)" }}
								>
									<Link to="/settings/duolingo">
										<Icon
											as={LuArrowUpRight}
											boxSize={4}
											color="fg.muted"
										/>
									</Link>
								</Circle>
							</Flex>
						</Box>
					</Stack>
				</Grid>
			</Stack>

			{/* Chakra Bottom Dialog for Quest Creation */}
			<DialogRoot
				open={isCreateOpen}
				onOpenChange={(details) => setIsCreateOpen(details.open)}
				placement="bottom"
			>
				<DialogContent
					maxW="2xl"
					roundedTop="2xl"
					roundedBottom="none"
					bg="bg.panel"
					borderWidth="1px"
					borderColor="border.glass"
					shadow="float"
					p={{ base: 4, md: 6 }}
				>
					<DialogHeader pb={2}>
						<Stack gap={0.5}>
							<DialogTitle fontSize="lg">
								Create New Quest
							</DialogTitle>
							<DialogDescription fontSize="xs" color="fg.muted">
								Configure cadence, category, and reward point
								calculation.
							</DialogDescription>
						</Stack>
					</DialogHeader>

					<DialogBody py={3}>
						<form
							id="dashboard-create-quest-form"
							noValidate
							onSubmit={handleCreateQuest}
						>
							<Stack gap={3.5}>
								<Field label="Quest Title" required>
									<Input
										placeholder="e.g. 45m TypeScript deep work"
										value={title}
										onChange={(e) =>
											setTitle(e.target.value)
										}
										rounded="pill"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
									/>
								</Field>

								<Grid
									templateColumns={{
										base: "1fr",
										sm: "1fr 1fr",
									}}
									gap={3}
								>
									<Field label="Category" required>
										<SearchableSelect
											items={QUEST_CATEGORIES}
											value={category}
											onValueChange={setCategory}
											placeholder="Select category..."
											searchPlaceholder="Search category..."
										/>
									</Field>

									<Field label="Cadence (Frequency)" required>
										<SearchableSelect
											items={CADENCE_OPTIONS}
											value={cadence}
											onValueChange={(val) =>
												setCadence(val as QuestCadence)
											}
											placeholder="Frequency"
										/>
									</Field>
								</Grid>

								<Grid
									templateColumns={{
										base: "1fr",
										sm: "1fr 1fr",
									}}
									gap={3}
								>
									<Field label="Effort Level" required>
										<SearchableSelect
											items={EFFORT_OPTIONS}
											value={effort}
											onValueChange={(val) =>
												setEffort(val as QuestEffort)
											}
											placeholder="Effort"
										/>
									</Field>

									<Stack gap={2}>
										<Field
											label="Task Duration (Minutes)"
											required
										>
											<Input
												type="number"
												min={1}
												max={480}
												value={minutes}
												onChange={(e) =>
													setMinutes(
														Math.max(
															1,
															Number(
																e.target.value,
															) || 1,
														),
													)
												}
												rounded="pill"
												bg="bg.muted"
												borderColor="border"
												fontSize="sm"
											/>
										</Field>
										{/* Quick Duration Preset Chips */}
										<HStack gap={1.5} wrap="wrap">
											{[15, 30, 45, 60, 90, 120].map(
												(m) => (
													<Button
														key={m}
														type="button"
														size="xs"
														rounded="pill"
														variant={
															minutes === m
																? "solid"
																: "outline"
														}
														colorPalette={
															minutes === m
																? "mint"
																: undefined
														}
														onClick={() =>
															setMinutes(m)
														}
													>
														{m}m
													</Button>
												),
											)}
										</HStack>
									</Stack>
								</Grid>

								{/* Reward System & Duration Scaling */}
								<Box
									bg="bg.muted"
									p={3}
									rounded="card"
									borderWidth="1px"
									borderColor="border.glass"
								>
									<HStack justify="space-between" mb={2}>
										<HStack gap={2}>
											<Icon
												as={LuSparkles}
												boxSize={4}
												color="mint.fg"
											/>
											<Text
												fontSize="xs"
												fontWeight="semibold"
											>
												EXP Progression Reward
											</Text>
										</HStack>
										<Button
											type="button"
											size="xs"
											rounded="pill"
											variant={
												isScored ? "solid" : "outline"
											}
											colorPalette={
												isScored ? "mint" : undefined
											}
											onClick={() =>
												setIsScored(!isScored)
											}
										>
											{isScored ? "EXP Active" : "No EXP"}
										</Button>
									</HStack>

									{isScored && (
										<Stack gap={2} pt={1}>
											<HStack justify="space-between">
												<Text
													fontSize="xs"
													color="fg.muted"
												>
													Reward Mode
												</Text>
												<Button
													type="button"
													size="xs"
													variant="ghost"
													onClick={() =>
														setIsCustomReward(
															!isCustomReward,
														)
													}
												>
													{isCustomReward
														? "Manual EXP"
														: "Auto Duration-Scaled Rate"}
												</Button>
											</HStack>

											{isCustomReward ? (
												<Box>
													<Field label="Custom EXP">
														<Input
															type="number"
															min={0}
															value={customExp}
															onChange={(e) =>
																setCustomExp(
																	e.target
																		.value,
																)
															}
															rounded="pill"
															fontSize="xs"
														/>
													</Field>
												</Box>
											) : (
												<Stack
													gap={1.5}
													bg="bg.panel"
													p={2.5}
													rounded="card"
													borderWidth="1px"
													borderColor="border.glass"
												>
													<HStack
														justify="space-between"
														fontSize="xs"
													>
														<Text color="fg.muted">
															Duration-Scaled
															Yield ({minutes}m @{" "}
															{effort}):
														</Text>
														{isPreviewFetching ? (
															<Skeleton
																h="5"
																w="20"
																rounded="pill"
															/>
														) : (
															<Badge
																size="sm"
																rounded="pill"
																variant="subtle"
															>
																+
																{pricePreview?.exp ??
																	0}{" "}
																EXP (+
																{pricePreview?.px ??
																	0}{" "}
																PX)
															</Badge>
														)}
													</HStack>
													{minutes >= 60 && (
														<HStack
															gap={1.5}
															pt={0.5}
														>
															<Icon
																as={LuZap}
																boxSize={3}
																color="mint.fg"
															/>
															<Text
																fontSize="11px"
																color="mint.fg"
																fontWeight="medium"
															>
																Deep Focus
																active: +20%
																bonus multiplier
																on completion
															</Text>
														</HStack>
													)}
												</Stack>
											)}
										</Stack>
									)}
								</Box>

								<Field label="Notes / Checklist (Optional)">
									<Input
										placeholder="Context, subtasks or URL link"
										value={notes}
										onChange={(e) =>
											setNotes(e.target.value)
										}
										rounded="pill"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
									/>
								</Field>
							</Stack>
						</form>
					</DialogBody>

					<DialogFooter pt={3}>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsCreateOpen(false)}
						>
							Cancel
						</Button>
						<PillButton
							type="submit"
							form="dashboard-create-quest-form"
							variant="dark"
							icon={LuPlus}
							loading={createQuest.isPending}
						>
							Create Quest
						</PillButton>
					</DialogFooter>

					<DialogCloseTrigger />
				</DialogContent>
			</DialogRoot>
		</Container>
	);
};

export default Index;
