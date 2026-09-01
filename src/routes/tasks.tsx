import {
	useCompleteQuest,
	useCreateQuest,
	useDeclareRestDay,
	useDeleteQuest,
	usePlayerSummary,
	useQuestPricePreview,
	useRecovery,
	useTodayQuests,
	useToggleVacation,
	useUndoCompleteQuest,
	useUpdateQuest,
	type Quest,
	type QuestCadence,
	type QuestCategory,
	type QuestEffort,
	type TodayQuest,
} from "@/api";
import { ApiError } from "@/api/client";
import { questSchema, type QuestFormData } from "@/api/schemas";
import {
	RewardFlight,
	registerRewardFlightTarget,
	useRewardFlight,
} from "@/components/game";
import { useSearchParams } from "react-router";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import {
	MenuContent,
	MenuItem,
	MenuRoot,
	MenuTrigger,
} from "@/components/ui/menu";
import { PillButton } from "@/components/ui/pill-button";
import {
	SearchableSelect,
	type SearchableSelectItem,
} from "@/components/ui/searchable-select";
import { toaster } from "@/components/ui/toaster";
import type { TFunction } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n";
import { handleFormApiError } from "@/utils/form-error";
import {
	Badge,
	Box,
	Button,
	Circle,
	Flex,
	Grid,
	HStack,
	Heading,
	Icon,
	IconButton,
	Input,
	Skeleton,
	Spinner,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
	LuChevronDown,
	LuChevronUp,
	LuCircleAlert,
	LuCircleCheck,
	LuEllipsisVertical,
	LuFlame,
	LuPencil,
	LuPlus,
	LuSparkles,
	LuTarget,
	LuTrash2,
	LuZap,
} from "react-icons/lu";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

const CATEGORY_KEYS = [
	"work",
	"health",
	"learning",
	"chores",
	"mindfulness",
	"social",
	"finance",
] as const;

function getQuestCategories(t: TFunction): SearchableSelectItem[] {
	return CATEGORY_KEYS.map((key) => ({
		label: t(`routes.tasks.categories.${key}.label`),
		value: key,
		description: t(`routes.tasks.categories.${key}.fullDescription`),
	}));
}

function getFilterCategories(t: TFunction): SearchableSelectItem[] {
	return [
		{
			label: t("routes.tasks.filterAll.label"),
			value: "All",
			description: t("routes.tasks.filterAll.description"),
		},
		...CATEGORY_KEYS.map((key) => ({
			label: t(`routes.tasks.categories.${key}.label`),
			value: key,
			description: t(`routes.tasks.categories.${key}.filterDescription`),
		})),
	];
}

function getCadenceOptions(t: TFunction): SearchableSelectItem[] {
	return (["daily", "weekly", "monthly", "one_off"] as const).map((key) => ({
		label: t(`routes.tasks.cadence.${key}.label`),
		value: key,
		description: t(`routes.tasks.cadence.${key}.description`),
	}));
}

function getEffortOptions(t: TFunction): SearchableSelectItem[] {
	return (["trivial", "light", "moderate", "hard", "grueling"] as const).map(
		(key) => ({
			label: t(`routes.tasks.effort.${key}.label`),
			value: key,
			description: t(`routes.tasks.effort.${key}.description`),
		}),
	);
}

const WEEK_DAY_KEYS = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat",
] as const;

function formatScheduleBadge(
	t: TFunction,
	cadence: string,
	scheduleDays?: number[],
): string {
	if (
		!scheduleDays ||
		scheduleDays.length === 0 ||
		scheduleDays.length === 7
	) {
		if (cadence === "daily") return t("routes.tasks.schedule.daily");
		if (cadence === "weekly")
			return t("routes.tasks.schedule.weeklyFlexible");
		if (cadence === "monthly")
			return t("routes.tasks.schedule.monthlyFlexible");
		return t("routes.tasks.schedule.oneOff");
	}
	if (
		scheduleDays.length === 5 &&
		[1, 2, 3, 4, 5].every((d) => scheduleDays.includes(d))
	) {
		return t("routes.tasks.schedule.weekdays");
	}
	if (
		scheduleDays.length === 2 &&
		[0, 6].every((d) => scheduleDays.includes(d))
	) {
		return t("routes.tasks.schedule.weekends");
	}
	return scheduleDays
		.map((d) => t(`routes.tasks.schedule.days.${WEEK_DAY_KEYS[d]}`))
		.join(", ");
}

export const TasksRoute: React.FC = () => {
	const { t } = useTranslation();
	const QUEST_CATEGORIES = React.useMemo(() => getQuestCategories(t), [t]);
	const FILTER_CATEGORIES = React.useMemo(() => getFilterCategories(t), [t]);
	const CADENCE_OPTIONS = React.useMemo(() => getCadenceOptions(t), [t]);
	const EFFORT_OPTIONS = React.useMemo(() => getEffortOptions(t), [t]);
	const { data: todayQuests = [], isLoading, isError, error, refetch } = useTodayQuests();
	const { data: summary } = usePlayerSummary();

	const completeMutation = useCompleteQuest();
	const undoMutation = useUndoCompleteQuest();
	const createMutation = useCreateQuest();
	const updateMutation = useUpdateQuest();
	const deleteMutation = useDeleteQuest();

	const confirmDelete = useConfirm<string>();
	const targetRef = React.useRef<HTMLDivElement | null>(null);
	const { fly } = useRewardFlight();

	React.useEffect(() => {
		registerRewardFlightTarget(targetRef.current);
		return () => registerRewardFlightTarget(null);
	}, []);

	// Dialog & Form State
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedTab = searchParams.get("tab") || "All";
	const setSelectedTab = (tab: string) => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (tab === "All") {
				next.delete("tab");
			} else {
				next.set("tab", tab);
			}
			return next;
		});
	};

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
	const [scheduleDays, setScheduleDays] = useState<number[]>([]);
	const [showCompleted, setShowCompleted] = useState(false);
	const [completingQuestIds, setCompletingQuestIds] = useState<Set<string>>(
		() => new Set(),
	);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		setError,
		formState: { errors },
	} = useForm<QuestFormData>({
		resolver: zodResolver(questSchema),
		defaultValues: {
			title: "",
			notes: "",
			category: "work",
			cadence: "daily",
			effort: "moderate",
			minutes: 30,
			scored: true,
		},
	});

	const effort = watch("effort");
	const cadence = watch("cadence");
	const minutes = watch("minutes");
	const category = watch("category");
	const scored = watch("scored");

	// Estimated Reward Preview from Authoritative Backend Engine
	const { data: pricePreview, isFetching: isPreviewFetching } =
		useQuestPricePreview(effort, cadence, minutes);

	const { data: recovery } = useRecovery();
	const declareRestDayMutation = useDeclareRestDay();
	const toggleVacationMutation = useToggleVacation();

	const completedCount = todayQuests.filter((q) => q.completed).length;
	const totalCount = todayQuests.length || 1;
	const progressPercent = Math.round((completedCount / totalCount) * 100);

	const filterCategories = [
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
		if (selectedTab === "All") return todayQuests;
		return todayQuests.filter(
			(q) => q.quest.category.toLowerCase() === selectedTab.toLowerCase(),
		);
	}, [todayQuests, selectedTab]);

	const incompleteQuests = useMemo(
		() => filteredQuests.filter((q) => !q.completed),
		[filteredQuests],
	);
	const completedQuests = useMemo(
		() => filteredQuests.filter((q) => q.completed),
		[filteredQuests],
	);
	const nextQuest = incompleteQuests[0];
	const remainingQuests = incompleteQuests.slice(1);

	const handleOpenCreate = () => {
		setEditingQuest(null);
		setScheduleDays([]);
		reset({
			title: "",
			notes: "",
			category: "work",
			cadence: "daily",
			effort: "moderate",
			minutes: 30,
			scored: true,
		});
		setIsCreateOpen(true);
	};

	const handleOpenEdit = (quest: Quest) => {
		setEditingQuest(quest);
		setScheduleDays(quest.schedule_days ?? []);
		reset({
			title: quest.title,
			notes: quest.notes || "",
			category: quest.category,
			cadence: quest.cadence,
			effort: quest.effort,
			minutes: quest.minutes || 30,
			scored: quest.scored,
		});
		setIsCreateOpen(true);
	};

	const handleToggleTask = async (tq: TodayQuest, el: HTMLElement) => {
		if (
			completingQuestIds.has(tq.quest.id) ||
			completeMutation.isPending ||
			undoMutation.isPending
		) {
			return;
		}

		setCompletingQuestIds((prev) => new Set(prev).add(tq.quest.id));

		try {
			if (tq.completed) {
				await undoMutation.mutateAsync({ id: tq.quest.id });
			} else {
				const award = await completeMutation.mutateAsync({
					id: tq.quest.id,
				});
				if (el) {
					void fly(el, award.exp, "exp");
					void fly(el, award.px, "px");
				}
				let breakdownDetails = `+${award.exp} EXP · +${award.px} PX`;
				if (award.breakdown && award.breakdown.streak_multiplier > 1.0) {
					const bonus = Math.round((award.breakdown.streak_multiplier - 1.0) * 100);
					breakdownDetails += ` (${bonus}% streak bonus!)`;
				}
				toaster.create({
					title: `${tq.quest.title} Complete!`,
					description: breakdownDetails,
					type: "success",
				});
			}
		} catch (err) {
			if (err instanceof ApiError && err.violations?._error) {
				toaster.create({
					title: t("routes.tasks.toasts.validationError"),
					description: err.violations._error.message,
					type: "error",
				});
			}
		} finally {
			setCompletingQuestIds((prev) => {
				const next = new Set(prev);
				next.delete(tq.quest.id);
				return next;
			});
		}
	};

	const onSubmitQuest = async (data: QuestFormData) => {
		const daysPayload =
			scheduleDays.length > 0 && scheduleDays.length < 7
				? scheduleDays
				: undefined;

		try {
			if (editingQuest) {
				await updateMutation.mutateAsync({
					id: editingQuest.id,
					payload: {
						title: data.title.trim(),
						notes: data.notes?.trim() || undefined,
						category: data.category as QuestCategory,
						cadence: data.cadence,
						effort: data.effort,
						minutes: data.minutes,
						scored: data.scored,
						schedule_days: daysPayload,
					},
				});
			} else {
				await createMutation.mutateAsync({
					title: data.title.trim(),
					notes: data.notes?.trim() || undefined,
					category: data.category as QuestCategory,
					cadence: data.cadence,
					effort: data.effort,
					minutes: data.minutes,
					scored: data.scored,
					schedule_days: daysPayload,
				});
			}

			reset();
			setEditingQuest(null);
			setIsCreateOpen(false);
		} catch (err) {
			handleFormApiError(err, setError);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!confirmDelete.target) return;
		try {
			await deleteMutation.mutateAsync(confirmDelete.target);
			toaster.create({
				title: t("routes.tasks.toasts.questDeleted"),
				type: "success",
			});
			confirmDelete.close();
		} catch (err) {
			toaster.create({
				title: t("routes.tasks.toasts.failedToDelete"),
				description:
					err instanceof ApiError
						? err.message
						: t("routes.tasks.toasts.errorDeleting"),
				type: "error",
			});
		}
	};

	return (
		<Box
			position="relative"
			flex="1"
			display="flex"
			flexDirection="column"
			gap={5}
		>
			<RewardFlight />

			{/* Top Banner Stats */}
			{isLoading ? (
				<Grid
					gap={4}
					templateColumns={{
						base: "1fr",
						sm: "repeat(3, 1fr)",
					}}
				>
					{[1, 2, 3].map((i) => (
						<Box key={i} {...glassCard} p={4}>
							<Flex justify="space-between" align="center" mb={2}>
								<Skeleton h="12px" w="80px" rounded="md" />
								<Skeleton h="16px" w="16px" rounded="full" />
							</Flex>
							<Skeleton h="28px" w="90px" rounded="md" mb={2} />
							<Skeleton h="10px" w="110px" rounded="md" />
						</Box>
					))}
				</Grid>
			) : (
				<Grid
					gap={4}
					templateColumns={{
						base: "1fr",
						sm: "repeat(3, 1fr)",
					}}
				>
					<Box {...glassCard} p={4}>
						<HStack justify="space-between" color="fg.muted">
							<Text
								fontSize="xs"
								fontWeight="semibold"
								textTransform="uppercase"
							>
								{t("routes.tasks.progressCard.title")}
							</Text>
							<Icon
								as={LuCircleCheck}
								boxSize={4}
								color="fg.muted"
							/>
						</HStack>
						<HStack align="baseline" gap={2} mt={2}>
							<Heading size="2xl">{progressPercent}%</Heading>
							<Text fontSize="xs" color="fg.muted">
								{completedCount}/{todayQuests.length}{" "}
								{t("routes.tasks.progressCard.completed")}
							</Text>
						</HStack>
					</Box>

					<Box {...glassCard} p={4}>
						<HStack justify="space-between" color="fg.muted">
							<Text
								fontSize="xs"
								fontWeight="semibold"
								textTransform="uppercase"
							>
								{t("routes.tasks.streakCard.title")}
							</Text>
							<Icon as={LuFlame} boxSize={4} color="fg.muted" />
						</HStack>
						<HStack align="baseline" gap={2} mt={2}>
							<Heading size="2xl">
								{summary?.player?.streak ?? 0}
							</Heading>
							<Text fontSize="xs" color="fg.muted">
								{t("routes.tasks.streakCard.daysContinuous")}
							</Text>
						</HStack>
					</Box>

					<Box {...glassCard} p={4}>
						<HStack justify="space-between" color="fg.muted">
							<Text
								fontSize="xs"
								fontWeight="semibold"
								textTransform="uppercase"
							>
								Recovery & Rest
							</Text>
							<Badge
								size="xs"
								colorPalette={
									recovery?.streak_safe ? "lime" : "gray"
								}
								variant="subtle"
							>
								{recovery?.streak_safe
									? "Streak Protected"
									: "Active"}
							</Badge>
						</HStack>
						<HStack align="center" justify="space-between" mt={2}>
							<VStack align="flex-start" gap={0}>
								<Heading size="2xl">
									{recovery?.rest_days_count ?? 0}
								</Heading>
								<Text fontSize="xs" color="fg.muted">
									Rest days banked
								</Text>
							</VStack>
							<HStack gap={1}>
								<Button
									size="2xs"
									variant="subtle"
									colorPalette="gray"
									disabled={
										(recovery?.rest_days_count ?? 0) <= 0
									}
									onClick={async () => {
										await declareRestDayMutation.mutateAsync();
										toaster.create({
											title: "Rest Day Declared",
											description:
												"Streak protected for today.",
											type: "info",
										});
									}}
								>
									Rest Day
								</Button>
								<Button
									size="2xs"
									variant={
										recovery?.vacation_mode
											? "solid"
											: "outline"
									}
									colorPalette={
										recovery?.vacation_mode
											? "lime"
											: "gray"
									}
									onClick={async () => {
										const next = !recovery?.vacation_mode;
										await toggleVacationMutation.mutateAsync(
											{ enable: next },
										);
										toaster.create({
											title: next
												? "Vacation Mode ON"
												: "Vacation Mode OFF",
											type: "info",
										});
									}}
								>
									Vacation
								</Button>
							</HStack>
						</HStack>
					</Box>
				</Grid>
			)}

			{/* Main Task Manager Layout */}
			<Box
				{...glassCard}
				p={{ base: 4, md: 6 }}
				display="flex"
				flexDirection="column"
				gap={4}
				flex="1"
			>
				{/* Header Toolbar */}
				<Flex
					justify="space-between"
					align="center"
					wrap="wrap"
					gap={3}
				>
					<Stack gap={0.5}>
						<Heading size="lg">
							{t("routes.tasks.header.heading")}
						</Heading>
						<Text fontSize="xs" color="fg.muted">
							{t("routes.tasks.header.subtitle")}
						</Text>
					</Stack>

					<HStack gap={3} wrap="wrap" align="center">
						<Box w={{ base: "full", sm: "200px" }}>
							<SearchableSelect
								items={FILTER_CATEGORIES}
								value={selectedTab}
								onValueChange={setSelectedTab}
								placeholder={t(
									"routes.tasks.header.filterPlaceholder",
								)}
								searchPlaceholder={t(
									"routes.tasks.header.searchPlaceholder",
								)}
							/>
						</Box>

						{/* Centered Dialog Trigger Button */}
						<PillButton
							variant="dark"
							icon={LuPlus}
							onClick={handleOpenCreate}
						>
							{t("routes.tasks.header.newQuest")}
						</PillButton>
					</HStack>
				</Flex>

				{/* Task Rows List */}
				{isError ? (
					<Box p={8} textAlign="center" {...glassCard} my={2}>
						<Icon as={LuCircleAlert} boxSize={8} color="red.fg" mb={2} />
						<Heading size="md" mb={1}>Failed to load daily quests</Heading>
						<Text fontSize="xs" color="fg.muted" mb={4}>
							{error instanceof Error ? error.message : "An unexpected server or network error occurred."}
						</Text>
						<Button size="xs" colorPalette="mint" rounded="pill" onClick={() => refetch()}>
							Retry
						</Button>
					</Box>
				) : isLoading ? (
					<Stack gap={2.5} mt={1} flex="1">
						{[1, 2, 3, 4].map((i) => (
							<Flex
								key={i}
								justify="space-between"
								align="center"
								p={3.5}
								{...glassCard}
							>
								<HStack gap={3} flex="1">
									<Skeleton h="20px" w="20px" rounded="full" />
									<VStack align="flex-start" gap={1.5} flex="1">
										<Skeleton h="14px" w="40%" rounded="md" />
										<Skeleton h="10px" w="25%" rounded="md" />
									</VStack>
								</HStack>
								<HStack gap={2}>
									<Skeleton h="20px" w="50px" rounded="pill" />
									<Skeleton h="20px" w="60px" rounded="pill" />
									<Skeleton h="28px" w="28px" rounded="full" />
								</HStack>
							</Flex>
						))}
					</Stack>
				) : filteredQuests.length === 0 ? (
					<EmptyState
						title={t("routes.tasks.empty.title")}
						description={t("routes.tasks.empty.description")}
						icon={<Icon as={LuTarget} boxSize={6} />}
					>
						<Button
							size="xs"
							colorPalette="mint"
							variant="solid"
							rounded="pill"
							mt={3}
							onClick={handleOpenCreate}
						>
							<Icon as={LuPlus} mr={1} /> {t("routes.tasks.header.newQuest")}
						</Button>
					</EmptyState>
				) : (
					<Stack gap={3} mt={1} flex="1">
						{/* Next Up Priority Action Card */}
						{nextQuest && (
							<Flex
								align="center"
								justify="space-between"
								p={3.5}
								rounded="card"
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border.glass"
								shadow="glass"
								transition="all 0.15s ease-out"
								_hover={{
									transform: "translateY(-1px)",
									shadow: "float",
								}}
							>
								<HStack
									gap={3}
									cursor="pointer"
									flex="1"
									onClick={(e) =>
										!completeMutation.isPending &&
										handleToggleTask(nextQuest, e.currentTarget)
									}
								>
									<Circle
										size="6"
										bg="transparent"
										borderWidth="2px"
										borderColor="border"
										color="transparent"
									>
										{completeMutation.isPending &&
										completeMutation.variables?.id === nextQuest.quest.id ? (
											<Spinner size="xs" color="fg" />
										) : null}
									</Circle>
									<Stack gap={0.5}>
										<HStack gap={2}>
											<Badge size="xs" rounded="pill" variant="solid" colorPalette="mint">
												Next
											</Badge>
											<Text fontSize="sm" fontWeight="semibold" color="fg">
												{nextQuest.quest.title}
											</Text>
										</HStack>
										{nextQuest.quest.notes ? (
											<Text fontSize="xs" color="fg.muted" truncate maxW="540px">
												{nextQuest.quest.notes}
											</Text>
										) : null}
									</Stack>
								</HStack>

								<HStack gap={2}>
									{nextQuest.quest.streak > 0 && (
										<HStack
											gap={1}
											bg="bg.muted"
											px={2}
											py={0.5}
											rounded="pill"
											fontSize="10px"
										>
											<Icon as={LuFlame} color="mint.fg" boxSize={3} />
											<Text fontWeight="bold">{nextQuest.quest.streak}d</Text>
										</HStack>
									)}
									{nextQuest.quest.is_mvq && (
										<Badge
											size="xs"
											rounded="pill"
											variant="outline"
											colorPalette="lime"
										>
											MVQ {nextQuest.quest.mvq_minutes}m
										</Badge>
									)}
									{nextQuest.quest.minutes && (
										<Badge size="xs" rounded="pill" variant="subtle">
											{nextQuest.quest.minutes}m
										</Badge>
									)}
									<Badge size="xs" rounded="pill" variant="subtle">
										{formatScheduleBadge(t, nextQuest.quest.cadence, nextQuest.quest.schedule_days)}
									</Badge>
									{nextQuest.quest.scored && (
										<Badge size="xs" rounded="pill" variant="subtle">
											+{nextQuest.quest.exp_value} {t("common.units.exp")}
										</Badge>
									)}
									<Badge size="xs" rounded="pill" variant="subtle">
										{nextQuest.quest.category}
									</Badge>

									<MenuRoot positioning={{ placement: "bottom-end" }}>
										<MenuTrigger asChild>
											<IconButton
												size="xs"
												variant="ghost"
												rounded="pill"
												aria-label={t("routes.tasks.row.questActions")}
											>
												<Icon as={LuEllipsisVertical} boxSize={4} color="fg.muted" />
											</IconButton>
										</MenuTrigger>
										<MenuContent
											bg="bg.panel"
											rounded="card"
											p={1}
											minW="140px"
											shadow="float"
											borderWidth="1px"
											borderColor="border.glass"
										>
											<MenuItem
												value="edit"
												cursor="pointer"
												rounded="pill"
												px={3}
												py={1.5}
												fontSize="xs"
												onClick={() => handleOpenEdit(nextQuest.quest)}
											>
												<Icon as={LuPencil} boxSize={3.5} mr={2} color="mint.fg" />
												{t("routes.tasks.row.editQuest")}
											</MenuItem>
											<MenuItem
												value="delete"
												cursor="pointer"
												rounded="pill"
												px={3}
												py={1.5}
												fontSize="xs"
												color="red.fg"
												onClick={() => confirmDelete.ask(nextQuest.quest.id)}
											>
												<Icon as={LuTrash2} boxSize={3.5} mr={2} />
												{t("routes.tasks.row.deleteQuest")}
											</MenuItem>
										</MenuContent>
									</MenuRoot>
								</HStack>
							</Flex>
						)}

						{/* Remaining Incomplete Tasks */}
						{remainingQuests.length > 0 && (
							<Stack gap={2}>
								{nextQuest && (
									<Text fontSize="xs" fontWeight="semibold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
										Remaining Today ({remainingQuests.length})
									</Text>
								)}
								{remainingQuests.map((tq) => {
									const isToggling =
										(completeMutation.isPending &&
											completeMutation.variables?.id === tq.quest.id) ||
										(undoMutation.isPending &&
											undoMutation.variables?.id === tq.quest.id);

									return (
										<Flex
											key={tq.quest.id}
											align="center"
											justify="space-between"
											p={3.5}
											rounded="card"
											bg="bg.panel"
											borderWidth="1px"
											borderColor="border.glass"
											opacity={isToggling ? 0.7 : 1}
											transition="all 0.15s ease-out"
											_hover={{ transform: "translateY(-1px)", shadow: "glass" }}
										>
											<HStack
												gap={3}
												cursor="pointer"
												flex="1"
												onClick={(e) =>
													!isToggling &&
													handleToggleTask(tq, e.currentTarget)
												}
											>
												<Circle
													size="6"
													bg="transparent"
													borderWidth="2px"
													borderColor="border"
													color="transparent"
												>
													{isToggling ? (
														<Spinner size="xs" color="fg" />
													) : null}
												</Circle>
												<Stack gap={0.5}>
													<Text fontSize="sm" fontWeight="semibold" color="fg">
														{tq.quest.title}
													</Text>
													{tq.quest.notes ? (
														<Text fontSize="xs" color="fg.muted" truncate maxW="540px">
															{tq.quest.notes}
														</Text>
													) : null}
												</Stack>
											</HStack>

											<HStack gap={2}>
												{tq.quest.streak > 0 && (
													<HStack
														gap={1}
														bg="bg.muted"
														px={2}
														py={0.5}
														rounded="pill"
														fontSize="10px"
													>
														<Icon as={LuFlame} color="mint.fg" boxSize={3} />
														<Text fontWeight="bold">{tq.quest.streak}d</Text>
													</HStack>
												)}
												{tq.quest.is_mvq && (
													<Badge size="xs" rounded="pill" variant="outline" colorPalette="lime">
														MVQ {tq.quest.mvq_minutes}m
													</Badge>
												)}
												<Badge size="xs" rounded="pill" variant="subtle">
													{formatScheduleBadge(t, tq.quest.cadence, tq.quest.schedule_days)}
												</Badge>
												{tq.quest.scored && (
													<Badge size="xs" rounded="pill" variant="subtle">
														+{tq.quest.exp_value} {t("common.units.exp")}
													</Badge>
												)}
												<Badge size="xs" rounded="pill" variant="subtle">
													{tq.quest.category}
												</Badge>

												<MenuRoot positioning={{ placement: "bottom-end" }}>
													<MenuTrigger asChild>
														<IconButton
															size="xs"
															variant="ghost"
															rounded="pill"
															aria-label={t("routes.tasks.row.questActions")}
														>
															<Icon as={LuEllipsisVertical} boxSize={4} color="fg.muted" />
														</IconButton>
													</MenuTrigger>
													<MenuContent
														bg="bg.panel"
														rounded="card"
														p={1}
														minW="140px"
														shadow="float"
														borderWidth="1px"
														borderColor="border.glass"
													>
														<MenuItem
															value="edit"
															cursor="pointer"
															rounded="pill"
															px={3}
															py={1.5}
															fontSize="xs"
															onClick={() => handleOpenEdit(tq.quest)}
														>
															<Icon as={LuPencil} boxSize={3.5} mr={2} color="mint.fg" />
															{t("routes.tasks.row.editQuest")}
														</MenuItem>
														<MenuItem
															value="delete"
															cursor="pointer"
															rounded="pill"
															px={3}
															py={1.5}
															fontSize="xs"
															color="red.fg"
															onClick={() => confirmDelete.ask(tq.quest.id)}
														>
															<Icon as={LuTrash2} boxSize={3.5} mr={2} />
															{t("routes.tasks.row.deleteQuest")}
														</MenuItem>
													</MenuContent>
												</MenuRoot>
											</HStack>
										</Flex>
									);
								})}
							</Stack>
						)}

						{/* Completed Tasks Accordion */}
						{completedQuests.length > 0 && (
							<Stack gap={2} mt={2}>
								<Button
									size="xs"
									variant="ghost"
									colorPalette="gray"
									rounded="pill"
									alignSelf="flex-start"
									onClick={() => setShowCompleted(!showCompleted)}
								>
									<Icon as={showCompleted ? LuChevronUp : LuChevronDown} mr={1} />
									Completed ({completedQuests.length})
								</Button>

								{showCompleted && (
									<Stack gap={2}>
										{completedQuests.map((tq) => {
											const isToggling =
												undoMutation.isPending &&
												undoMutation.variables?.id === tq.quest.id;

											return (
												<Flex
													key={tq.quest.id}
													align="center"
													justify="space-between"
													p={3.5}
													rounded="card"
													bg="bg.muted"
													borderWidth="1px"
													borderColor="border.glass"
													opacity={isToggling ? 0.7 : 0.85}
													transition="all 0.15s ease-out"
												>
													<HStack
														gap={3}
														cursor="pointer"
														flex="1"
														onClick={(e) =>
															!isToggling &&
															handleToggleTask(tq, e.currentTarget)
														}
													>
														<Circle
															size="6"
															bg="mint.solid"
															borderWidth={0}
															color="mint.contrast"
														>
															{isToggling ? (
																<Spinner size="xs" color="fg" />
															) : (
																<Icon as={LuCircleCheck} boxSize={3.5} />
															)}
														</Circle>
														<Stack gap={0.5}>
															<Text
																fontSize="sm"
																fontWeight="normal"
																textDecoration="line-through"
																color="fg.muted"
															>
																{tq.quest.title}
															</Text>
															{tq.quest.notes ? (
																<Text fontSize="xs" color="fg.muted" truncate maxW="540px">
																	{tq.quest.notes}
																</Text>
															) : null}
														</Stack>
													</HStack>

													<HStack gap={2}>
														<Badge size="xs" rounded="pill" variant="subtle" colorPalette="gray">
															Completed
														</Badge>
														<Badge size="xs" rounded="pill" variant="subtle">
															{tq.quest.category}
														</Badge>

														<MenuRoot positioning={{ placement: "bottom-end" }}>
															<MenuTrigger asChild>
																<IconButton
																	size="xs"
																	variant="ghost"
																	rounded="pill"
																	aria-label={t("routes.tasks.row.questActions")}
																>
																	<Icon as={LuEllipsisVertical} boxSize={4} color="fg.muted" />
																</IconButton>
															</MenuTrigger>
															<MenuContent
																bg="bg.panel"
																rounded="card"
																p={1}
																minW="140px"
																shadow="float"
																borderWidth="1px"
																borderColor="border.glass"
															>
																<MenuItem
																	value="edit"
																	cursor="pointer"
																	rounded="pill"
																	px={3}
																	py={1.5}
																	fontSize="xs"
																	onClick={() => handleOpenEdit(tq.quest)}
																>
																	<Icon as={LuPencil} boxSize={3.5} mr={2} color="mint.fg" />
																	{t("routes.tasks.row.editQuest")}
																</MenuItem>
																<MenuItem
																	value="delete"
																	cursor="pointer"
																	rounded="pill"
																	px={3}
																	py={1.5}
																	fontSize="xs"
																	color="red.fg"
																	onClick={() => confirmDelete.ask(tq.quest.id)}
																>
																	<Icon as={LuTrash2} boxSize={3.5} mr={2} />
																	{t("routes.tasks.row.deleteQuest")}
																</MenuItem>
															</MenuContent>
														</MenuRoot>
													</HStack>
												</Flex>
											);
										})}
									</Stack>
								)}
							</Stack>
						)}
					</Stack>
				)}
			</Box>

			{/* Chakra Centered Dialog for Quest Creation / Editing */}
			<DialogRoot
				open={isCreateOpen}
				onOpenChange={(details) => setIsCreateOpen(details.open)}
				placement="center"
			>
				<DialogContent
					maxW="2xl"
					rounded="card"
					bg="bg.panel"
					borderWidth="1px"
					borderColor="border.glass"
					shadow="float"
					p={{ base: 4, md: 6 }}
				>
					<DialogHeader pb={2}>
						<Stack gap={0.5}>
							<DialogTitle fontSize="lg">
								{editingQuest
									? t("routes.tasks.dialog.editTitle")
									: t("routes.tasks.dialog.createTitle")}
							</DialogTitle>
							<DialogDescription fontSize="xs" color="fg.muted">
								{editingQuest
									? t("routes.tasks.dialog.editSubtitle")
									: t("routes.tasks.dialog.createSubtitle")}
							</DialogDescription>
						</Stack>
					</DialogHeader>

					<DialogBody py={3}>
						<form
							id="create-quest-form"
							noValidate
							onSubmit={handleSubmit(onSubmitQuest)}
						>
							<Stack gap={3.5}>
								{errors.root?.message && (
									<Text color="red.500" fontSize="xs">
										{errors.root.message}
									</Text>
								)}

								<Field
									label={t("routes.tasks.dialog.questTitle")}
									required
									invalid={Boolean(errors.title)}
									errorText={errors.title?.message}
								>
									<Input
										placeholder={t(
											"routes.tasks.dialog.questTitlePlaceholder",
										)}
										{...register("title")}
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
									<Field
										label={t(
											"routes.tasks.dialog.category",
										)}
										required
										invalid={Boolean(errors.category)}
										errorText={errors.category?.message}
									>
										<SearchableSelect
											items={QUEST_CATEGORIES}
											value={category}
											onValueChange={(val) =>
												setValue(
													"category",
													val as QuestCategory,
													{ shouldValidate: true },
												)
											}
											placeholder={t(
												"routes.tasks.dialog.selectCategory",
											)}
											searchPlaceholder={t(
												"routes.tasks.header.searchPlaceholder",
											)}
										/>
									</Field>

									<Field
										label={t(
											"routes.tasks.dialog.cadenceFrequency",
										)}
										required
										invalid={Boolean(errors.cadence)}
										errorText={errors.cadence?.message}
									>
										<SearchableSelect
											items={CADENCE_OPTIONS}
											value={cadence}
											onValueChange={(val) =>
												setValue(
													"cadence",
													val as QuestCadence,
													{ shouldValidate: true },
												)
											}
											placeholder={t(
												"routes.tasks.dialog.frequency",
											)}
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
									<Field
										label={t(
											"routes.tasks.dialog.effortLevel",
										)}
										required
										invalid={Boolean(errors.effort)}
										errorText={errors.effort?.message}
									>
										<SearchableSelect
											items={EFFORT_OPTIONS}
											value={effort}
											onValueChange={(val) =>
												setValue(
													"effort",
													val as QuestEffort,
													{ shouldValidate: true },
												)
											}
											placeholder={t(
												"routes.tasks.dialog.effort",
											)}
										/>
									</Field>

									<Stack gap={2}>
										<Field
											label={t(
												"routes.tasks.dialog.durationMinutes",
											)}
											required
											invalid={Boolean(errors.minutes)}
											errorText={errors.minutes?.message}
										>
											<Input
												type="number"
												min={5}
												max={120}
												{...register("minutes", {
													valueAsNumber: true,
												})}
												rounded="pill"
												bg="bg.muted"
												borderColor="border"
												fontSize="sm"
											/>
										</Field>
										{/* Quick Duration Preset Chips */}
										<HStack gap={1.5} wrap="wrap">
											{[5, 15, 30, 45, 60, 90, 120].map(
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
															setValue(
																"minutes",
																m,
																{
																	shouldValidate: true,
																},
															)
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
												{t(
													"routes.tasks.dialog.expReward",
												)}
											</Text>
										</HStack>
										<Button
											type="button"
											size="xs"
											rounded="pill"
											variant={
												scored ? "solid" : "outline"
											}
											colorPalette={
												scored ? "mint" : undefined
											}
											onClick={() =>
												setValue("scored", !scored)
											}
										>
											{scored
												? t(
														"routes.tasks.dialog.expActive",
													)
												: t(
														"routes.tasks.dialog.noExp",
													)}
										</Button>
									</HStack>

									{scored && (
										<Stack
											gap={1.5}
											pt={1}
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
													{t(
														"routes.tasks.dialog.systemReward",
														{ minutes, effort },
													)}
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
														{pricePreview?.exp ?? 0}{" "}
														{t("common.units.exp")}{" "}
														(+
														{pricePreview?.px ??
															0}{" "}
														{t("common.units.px")})
													</Badge>
												)}
											</HStack>
											{minutes >= 60 && (
												<HStack gap={1.5} pt={0.5}>
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
														{t(
															"routes.tasks.dialog.deepFocusActive",
														)}
													</Text>
												</HStack>
											)}
										</Stack>
									)}
								</Box>

								{/* Active Schedule & Flexible Recurrence */}
								<Field
									label={t(
										"routes.tasks.dialog.activeSchedule",
									)}
								>
									<Stack gap={2}>
										<HStack
											justify="space-between"
											wrap="wrap"
										>
											<Text
												fontSize="xs"
												color="fg.muted"
											>
												{cadence === "daily"
													? t(
															"routes.tasks.dialog.dailyHelp",
														)
													: cadence === "weekly"
														? t(
																"routes.tasks.dialog.weeklyHelp",
															)
														: t(
																"routes.tasks.dialog.monthlyHelp",
															)}
											</Text>
											<HStack gap={1.5}>
												<Button
													type="button"
													size="xs"
													rounded="pill"
													variant={
														scheduleDays.length ===
															0 ||
														scheduleDays.length ===
															7
															? "solid"
															: "outline"
													}
													onClick={() =>
														setScheduleDays([])
													}
												>
													{cadence === "daily"
														? t(
																"routes.tasks.dialog.everyDay",
															)
														: t(
																"routes.tasks.dialog.anyDayFlexible",
															)}
												</Button>
												<Button
													type="button"
													size="xs"
													rounded="pill"
													variant={
														scheduleDays.length ===
															5 &&
														[1, 2, 3, 4, 5].every(
															(d) =>
																scheduleDays.includes(
																	d,
																),
														)
															? "solid"
															: "outline"
													}
													onClick={() =>
														setScheduleDays([
															1, 2, 3, 4, 5,
														])
													}
												>
													{t(
														"routes.tasks.schedule.weekdays",
													)}
												</Button>
												<Button
													type="button"
													size="xs"
													rounded="pill"
													variant={
														scheduleDays.length ===
															2 &&
														[0, 6].every((d) =>
															scheduleDays.includes(
																d,
															),
														)
															? "solid"
															: "outline"
													}
													onClick={() =>
														setScheduleDays([0, 6])
													}
												>
													{t(
														"routes.tasks.schedule.weekends",
													)}
												</Button>
											</HStack>
										</HStack>

										<HStack
											gap={1.5}
											justify="space-between"
										>
											{WEEK_DAY_KEYS.map((key, day) => ({
												label: t(
													`routes.tasks.schedule.daysShort.${key}`,
												),
												day,
												title: t(
													`routes.tasks.schedule.daysFull.${key}`,
												),
											})).map((item) => {
												const isSelected =
													scheduleDays.length === 0 ||
													scheduleDays.includes(
														item.day,
													);
												return (
													<Button
														key={item.day}
														type="button"
														size="xs"
														rounded="circle"
														w="32px"
														h="32px"
														p={0}
														variant={
															scheduleDays.includes(
																item.day,
															)
																? "solid"
																: scheduleDays.length ===
																	  0
																	? "subtle"
																	: "outline"
														}
														colorPalette={
															isSelected
																? "mint"
																: undefined
														}
														title={item.title}
														onClick={() => {
															if (
																scheduleDays.length ===
																0
															) {
																setScheduleDays(
																	[item.day],
																);
															} else if (
																scheduleDays.includes(
																	item.day,
																)
															) {
																const next =
																	scheduleDays.filter(
																		(d) =>
																			d !==
																			item.day,
																	);
																setScheduleDays(
																	next,
																);
															} else {
																setScheduleDays(
																	[
																		...scheduleDays,
																		item.day,
																	].sort(),
																);
															}
														}}
													>
														{item.label}
													</Button>
												);
											})}
										</HStack>
									</Stack>
								</Field>

								<Field
									label={t("routes.tasks.dialog.notes")}
									invalid={Boolean(errors.notes)}
									errorText={errors.notes?.message}
								>
									<Input
										placeholder={t(
											"routes.tasks.dialog.notesPlaceholder",
										)}
										{...register("notes")}
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
							{t("routes.tasks.dialog.cancel")}
						</Button>
						<PillButton
							type="submit"
							form="create-quest-form"
							variant="dark"
							icon={editingQuest ? LuPencil : LuPlus}
							loading={
								editingQuest
									? updateMutation.isPending
									: createMutation.isPending
							}
						>
							{editingQuest
								? t("routes.tasks.dialog.saveChanges")
								: t("routes.tasks.dialog.createQuest")}
						</PillButton>
					</DialogFooter>

					<DialogCloseTrigger />
				</DialogContent>
			</DialogRoot>

			{/* Confirm Delete Quest Dialog */}
			<ConfirmDialog
				open={confirmDelete.open}
				onOpenChange={confirmDelete.onOpenChange}
				title={t("routes.tasks.deleteDialog.title")}
				description={t("routes.tasks.deleteDialog.description")}
				confirmLabel={t("routes.tasks.deleteDialog.confirmLabel")}
				destructive
				loading={deleteMutation.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</Box>
	);
};

export default TasksRoute;
