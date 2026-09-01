import {
	useFinalizeReview,
	useReviewSummary,
	useReviews,
	type ReviewPeriodType,
} from "@/api";
import { RewardFlight, useRewardFlight } from "@/components/game";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { PillButton } from "@/components/ui/pill-button";
import { toaster } from "@/components/ui/toaster";
import {
	Badge,
	Box,
	Button,
	Circle,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	Input,
	Progress,
	SimpleGrid,
	Skeleton,
	Text,
	Textarea,
	VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { LuAward, LuHistory, LuTrendingUp, LuX } from "react-icons/lu";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(20px)",
};

function getCurrentWeekPeriod(d: Date = new Date()): string {
	const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	const dayNum = date.getUTCDay() || 7;
	date.setUTCDate(date.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	const weekNo = Math.ceil(
		((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
	);
	return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getCurrentMonthPeriod(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const ReviewsRoute: React.FC = () => {
	const [periodType, setPeriodType] = useState<ReviewPeriodType>("weekly");
	const [selectedPeriod, setSelectedPeriod] = useState<string>(
		getCurrentWeekPeriod(),
	);
	const [viewMode, setViewMode] = useState<"current" | "history">("current");

	const { data: summary, isLoading } = useReviewSummary(
		periodType,
		selectedPeriod,
	);
	const { data: historyData } = useReviews(1, 50);
	const finalizeMutation = useFinalizeReview();
	const { triggerFlight } = useRewardFlight();

	const [reflection, setReflection] = useState("");
	const [priorityInput, setPriorityInput] = useState("");
	const [nextPriorities, setNextPriorities] = useState<string[]>([]);

	const existingReview = historyData?.reviews?.find(
		(r) => r.period_type === periodType && r.period === selectedPeriod,
	);
	const isFinalized = Boolean(existingReview);

	React.useEffect(() => {
		if (existingReview) {
			setReflection(existingReview.reflection_notes || "");
			setNextPriorities(existingReview.next_priorities || []);
		} else {
			setReflection("");
			setNextPriorities([]);
		}
	}, [existingReview, selectedPeriod, periodType]);

	const handlePeriodTypeChange = (type: ReviewPeriodType) => {
		setPeriodType(type);
		setSelectedPeriod(
			type === "weekly"
				? getCurrentWeekPeriod()
				: getCurrentMonthPeriod(),
		);
	};

	const addPriority = () => {
		if (!priorityInput.trim() || isFinalized) return;
		setNextPriorities((prev) => [...prev, priorityInput.trim()]);
		setPriorityInput("");
	};

	const removePriority = (index: number) => {
		if (isFinalized) return;
		setNextPriorities((prev) => prev.filter((_, i) => i !== index));
	};

	const handleFinalize = async (event?: React.MouseEvent) => {
		if (isFinalized) return;
		try {
			await finalizeMutation.mutateAsync({
				period_type: periodType,
				period: selectedPeriod,
				reflection_notes: reflection,
				next_priorities: nextPriorities,
			});

			if (event) {
				const rect = (
					event.target as HTMLElement
				).getBoundingClientRect();
				triggerFlight({
					sourceX: rect.left + rect.width / 2,
					sourceY: rect.top + rect.height / 2,
					exp: 200,
					px: 50,
				});
			}

			toaster.create({
				title: "Review Finalized!",
				description:
					"+200 EXP, +50 PX recorded into your personal ledger.",
				type: "success",
			});
		} catch (e: any) {
			toaster.create({
				title: "Failed to finalize review",
				description: e?.message || "Something went wrong",
				type: "error",
			});
		}
	};

	return (
		<Box flex="1" pb={12}>
			<RewardFlight />

			{/* Header */}
			<Flex
				direction={{ base: "column", md: "row" }}
				justify="space-between"
				align={{ base: "flex-start", md: "center" }}
				gap={4}
				mb={6}
			>
				<VStack align="flex-start" gap={1}>
					<HStack gap={2}>
						<Circle size="32px" bg="lime.500/15" color="lime.500">
							<Icon as={LuTrendingUp} boxSize={5} />
						</Circle>
						<Heading size="xl" fontWeight="bold">
							Progress Review Engine
						</Heading>
					</HStack>
					<Text color="fg.muted" fontSize="sm">
						Objective reflection on completion, consistency,
						category balance, and personal improvement.
					</Text>
				</VStack>

				<HStack gap={2}>
					<PillButton
						size="sm"
						variant={viewMode === "current" ? "mint" : "outline"}
						colorPalette="lime"
						onClick={() => setViewMode("current")}
					>
						<Icon as={LuTrendingUp} /> Review Period
					</PillButton>
					<PillButton
						size="sm"
						variant={viewMode === "history" ? "mint" : "outline"}
						colorPalette="gray"
						onClick={() => setViewMode("history")}
					>
						<Icon as={LuHistory} /> Past Reviews
					</PillButton>
				</HStack>
			</Flex>

			{viewMode === "history" ? (
				<VStack gap={4} align="stretch">
					{!historyData || historyData.reviews.length === 0 ? (
						<Box {...glassCard} p={10}>
							<EmptyState
								title="No Past Reviews"
								description="Finalize your first review to build a timeline of growth."
							/>
						</Box>
					) : (
						historyData.reviews.map((rev) => (
							<Box key={rev.id} {...glassCard} p={5}>
								<Flex
									justify="space-between"
									align="center"
									mb={2}
								>
									<HStack gap={2}>
										<Badge
											colorPalette="lime"
											textTransform="uppercase"
											size="sm"
											rounded="full"
										>
											{rev.period_type}
										</Badge>
										<Heading size="sm">
											{rev.period}
										</Heading>
									</HStack>
									<Text fontSize="xs" color="fg.muted">
										{new Date(
											rev.completed_at,
										).toLocaleDateString()}
									</Text>
								</Flex>

								<HStack gap={4} my={3} fontSize="xs">
									<Text>
										Completed:{" "}
										<strong>{rev.quests_completed}</strong>{" "}
										/ {rev.quests_planned}
									</Text>
									<Text>
										Effort:{" "}
										<strong>{rev.effort_minutes}m</strong>
									</Text>
									<Text>
										Streak:{" "}
										<strong>{rev.streak_days} days</strong>
									</Text>
								</HStack>

								{rev.reflection_notes && (
									<Text
										fontSize="sm"
										color="fg.muted"
										bg="bg.subtle"
										p={3}
										rounded="md"
										mt={2}
									>
										"{rev.reflection_notes}"
									</Text>
								)}
							</Box>
						))
					)}
				</VStack>
			) : (
				<VStack gap={6} align="stretch">
					{/* Period Selection Bar */}
					<HStack gap={3}>
						<PillButton
							size="sm"
							variant={
								periodType === "weekly" ? "mint" : "outline"
							}
							colorPalette="lime"
							onClick={() => handlePeriodTypeChange("weekly")}
						>
							Weekly Review
						</PillButton>
						<PillButton
							size="sm"
							variant={
								periodType === "monthly" ? "mint" : "outline"
							}
							colorPalette="lime"
							onClick={() => handlePeriodTypeChange("monthly")}
						>
							Monthly Review
						</PillButton>
						<Badge
							variant="subtle"
							size="md"
							px={3}
							py={1}
							rounded="full"
						>
							Period: {selectedPeriod}
						</Badge>
					</HStack>

					{isLoading || !summary ? (
						<VStack gap={6} align="stretch">
							{/* KPI Row Skeletons */}
							<SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
								{[1, 2, 3, 4].map((i) => (
									<Box key={i} {...glassCard} p={4}>
										<Skeleton h="12px" w="80px" rounded="md" mb={2} />
										<Skeleton h="28px" w="60px" rounded="md" mb={2} />
										<Skeleton h="10px" w="100px" rounded="md" />
									</Box>
								))}
							</SimpleGrid>

							{/* Category Distribution Skeleton */}
							<Box {...glassCard} p={5}>
								<Skeleton h="16px" w="160px" rounded="md" mb={4} />
								<VStack gap={3} align="stretch">
									{[1, 2, 3, 4].map((i) => (
										<Box key={i}>
											<Flex justify="space-between" mb={1}>
												<Skeleton h="12px" w="70px" rounded="md" />
												<Skeleton h="12px" w="40px" rounded="md" />
											</Flex>
											<Skeleton h="6px" w="100%" rounded="full" />
										</Box>
									))}
								</VStack>
							</Box>

							{/* Reflection Skeleton */}
							<Box {...glassCard} p={5}>
								<Skeleton h="16px" w="180px" rounded="md" mb={3} />
								<Skeleton h="80px" w="100%" rounded="xl" />
							</Box>
						</VStack>
					) : (
						<>
							{/* KPI Row */}
							<SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
								<Box {...glassCard} p={4}>
									<Text fontSize="xs" color="fg.muted" mb={1}>
										Completion Rate
									</Text>
									<Heading size="xl" color="lime.500">
										{Math.round(summary.completion_rate)}%
									</Heading>
									<Text
										fontSize="2xs"
										color="fg.muted"
										mt={1}
									>
										{summary.quests_completed} of{" "}
										{summary.quests_planned} quests
									</Text>
								</Box>

								<Box {...glassCard} p={4}>
									<Text fontSize="xs" color="fg.muted" mb={1}>
										Effort Invested
									</Text>
									<Heading size="xl" color="lime.500">
										{summary.effort_minutes}m
									</Heading>
									<Text
										fontSize="2xs"
										color="fg.muted"
										mt={1}
									>
										Focused action time
									</Text>
								</Box>

								<Box {...glassCard} p={4}>
									<Text fontSize="xs" color="fg.muted" mb={1}>
										Streak Consistency
									</Text>
									<Heading size="xl" color="lime.500">
										{summary.streak_days}d
									</Heading>
									<Text
										fontSize="2xs"
										color="fg.muted"
										mt={1}
									>
										{summary.grace_days_used} grace days
										used
									</Text>
								</Box>

								<Box {...glassCard} p={4}>
									<Text fontSize="xs" color="fg.muted" mb={1}>
										Health & Finance
									</Text>
									<Heading size="xl" color="lime.500">
										{summary.health_days_logged}d / ฿
										{summary.finance_saved}
									</Heading>
									<Text
										fontSize="2xs"
										color="fg.muted"
										mt={1}
									>
										Logged & saved
									</Text>
								</Box>
							</SimpleGrid>

							{/* Category Balance Breakdown */}
							<Box {...glassCard} p={5}>
								<Heading size="sm" mb={4}>
									Category Effort Distribution
								</Heading>
								<VStack gap={3} align="stretch">
									{Object.entries(
										summary.category_breakdown || {},
									).map(([cat, count]) => {
										const maxVal = Math.max(
											1,
											...Object.values(
												summary.category_breakdown ||
													{},
											),
										);
										const pct = (count / maxVal) * 100;

										return (
											<Box key={cat}>
												<Flex
													justify="space-between"
													fontSize="xs"
													mb={1}
												>
													<Text
														textTransform="capitalize"
														fontWeight="medium"
													>
														{cat}
													</Text>
													<Text color="fg.muted">
														{count} completions
													</Text>
												</Flex>
												<Progress.Root
													value={pct}
													max={100}
													size="xs"
												>
													<Progress.Track
														bg="bg.subtle"
														rounded="full"
													>
														<Progress.Range
															bg="lime.solid"
														/>
													</Progress.Track>
												</Progress.Root>
											</Box>
										);
									})}
								</VStack>
							</Box>

							{/* Neutral Evidence & Skipped Quests */}
							{summary.skipped_quest_titles &&
								summary.skipped_quest_titles.length > 0 && (
									<Box {...glassCard} p={5}>
										<Heading size="sm" mb={2}>
											Neutral Evidence (Quests to
											recalibrate)
										</Heading>
										<Text
											fontSize="xs"
											color="fg.muted"
											mb={3}
										>
											Items below were skipped or
											unfinished. Consider reducing
											duration, effort, or cadence.
										</Text>
										<HStack gap={2} wrap="wrap">
											{summary.skipped_quest_titles.map(
												(title, idx) => (
													<Badge
														key={idx}
														colorPalette="gray"
														variant="subtle"
														size="sm"
													>
														{title}
													</Badge>
												),
											)}
										</HStack>
									</Box>
								)}

							{/* Reflection & Next Priorities */}
							<Box {...glassCard} p={5}>
								<Flex justify="space-between" align="center" mb={3}>
									<Heading size="sm">
										Reflection & Next Period Focus
									</Heading>
									{isFinalized && (
										<Badge
											colorPalette="lime"
											variant="subtle"
											size="md"
											rounded="pill"
										>
											<Icon as={LuAward} mr={1} /> Finalized ({selectedPeriod})
										</Badge>
									)}
								</Flex>

								<VStack gap={4} align="stretch">
									<Field label="What went well? What will you adjust?">
										<Textarea
											value={reflection}
											readOnly={isFinalized}
											onChange={(e) =>
												setReflection(e.target.value)
											}
											placeholder={
												isFinalized
													? "No reflection notes recorded for this period."
													: "Write open reflections without judgment..."
											}
											rows={3}
											rounded="xl"
											bg="bg.muted"
											borderColor="border"
											fontSize="sm"
										/>
									</Field>

									<Field label="Top Priorities for Next Period">
										{!isFinalized && (
											<HStack gap={2} mb={2}>
												<Input
													size="sm"
													placeholder="Add a priority outcome..."
													value={priorityInput}
													onChange={(e) =>
														setPriorityInput(
															e.target.value,
														)
													}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															addPriority();
														}
													}}
													rounded="pill"
													bg="bg.muted"
													borderColor="border"
													fontSize="sm"
												/>
												<Button
													size="sm"
													variant="subtle"
													colorPalette="lime"
													onClick={addPriority}
												>
													Add
												</Button>
											</HStack>
										)}

										<HStack gap={2} wrap="wrap">
											{nextPriorities.length === 0 && isFinalized ? (
												<Text fontSize="xs" color="fg.muted">
													No priority goals recorded for this period.
												</Text>
											) : (
												nextPriorities.map((p, idx) => (
													<Badge
														key={idx}
														colorPalette="lime"
														variant="solid"
														size="md"
														rounded="full"
														px={3}
														py={1}
													>
														{idx + 1}. {p}
														{!isFinalized && (
															<IconButton
																size="2xs"
																variant="ghost"
																aria-label="Remove priority"
																onClick={() =>
																	removePriority(idx)
																}
																ml={1}
															>
																<Icon as={LuX} />
															</IconButton>
														)}
													</Badge>
												))
											)}
										</HStack>
									</Field>

									{isFinalized ? (
										<Button
											colorPalette="gray"
											variant="subtle"
											size="lg"
											mt={4}
											disabled
										>
											<Icon as={LuAward} /> Review Finalized (+200 EXP Claimed)
										</Button>
									) : (
										<Button
											colorPalette="lime"
											size="lg"
											mt={4}
											onClick={(e) => handleFinalize(e)}
											loading={finalizeMutation.isPending}
										>
											<Icon as={LuAward} /> Finalize Review
											(+200 EXP, +50 PX)
										</Button>
									)}
								</VStack>
							</Box>
						</>
					)}
				</VStack>
			)}
		</Box>
	);
};

export default ReviewsRoute;
