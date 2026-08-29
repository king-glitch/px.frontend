import React, { useMemo, useState } from "react";
import {
	Badge,
	Box,
	Button,
	Circle,
	Container,
	Flex,
	Grid,
	HStack,
	Heading,
	Icon,
	IconButton,
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
	LuCalendar,
	LuCheck,
	LuCircle,
	LuCircleCheck,
	LuCoins,
	LuEllipsisVertical,
	LuFlame,
	LuLayers,
	LuPencil,
	LuPlus,
	LuRepeat,
	LuSparkles,
	LuTarget,
	LuTimer,
	LuTrash2,
	LuTrendingUp,
	LuZap,
} from "react-icons/lu";
import { PillButton } from "@/components/ui/pill-button";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
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
import {
	MenuContent,
	MenuItem,
	MenuRoot,
	MenuTrigger,
} from "@/components/ui/menu";
import { EmptyState } from "@/components/ui/empty-state";
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
	useDeleteQuest,
	usePlayerSummary,
	useQuestPricePreview,
	useTodayQuests,
	useUndoCompleteQuest,
	useUpdateQuest,
	type Quest,
	type QuestCadence,
	type QuestCategory,
	type QuestEffort,
	type TodayQuest,
} from "@/api";
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

export const TasksRoute: React.FC = () => {
	const { data: todayQuests = [], isLoading } = useTodayQuests();
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
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
	const [title, setTitle] = useState("");
	const [notes, setNotes] = useState("");
	const [category, setCategory] = useState<string>("work");
	const [cadence, setCadence] = useState<QuestCadence>("daily");
	const [effort, setEffort] = useState<QuestEffort>("moderate");
	const [minutes, setMinutes] = useState<number>(30);
	const [isScored, setIsScored] = useState(true);
	const [selectedTab, setSelectedTab] = useState<string>("All");

	// Estimated Reward Preview from Authoritative Backend Engine
	const { data: pricePreview, isFetching: isPreviewFetching } =
		useQuestPricePreview(effort, cadence, minutes);

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

	const handleOpenCreate = () => {
		setEditingQuest(null);
		setTitle("");
		setNotes("");
		setCategory("work");
		setCadence("daily");
		setEffort("moderate");
		setMinutes(30);
		setIsScored(true);
		setIsCreateOpen(true);
	};

	const handleOpenEdit = (quest: Quest) => {
		setEditingQuest(quest);
		setTitle(quest.title);
		setNotes(quest.notes || "");
		setCategory(quest.category);
		setCadence(quest.cadence);
		setEffort(quest.effort);
		setMinutes(quest.minutes || 30);
		setIsScored(quest.scored);
		setIsCreateOpen(true);
	};

	const handleToggleTask = async (tq: TodayQuest, el: HTMLElement) => {
		if (tq.completed) {
			try {
				await undoMutation.mutateAsync({ id: tq.quest.id });
				toaster.create({
					title: "Quest marked pending",
					description: `Undid "${tq.quest.title}".`,
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
				const award = await completeMutation.mutateAsync({
					id: tq.quest.id,
				});
				if (el) {
					void fly(el, award.exp, "exp");
					void fly(el, award.px, "px");
				}
				toaster.create({
					title: "Quest Completed!",
					description: `+${award.exp} EXP and +${award.px} PX points awarded!`,
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

	const handleSubmitTask = async (e: React.FormEvent) => {
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
			if (editingQuest) {
				await updateMutation.mutateAsync({
					id: editingQuest.id,
					payload: {
						title: title.trim(),
						notes: notes.trim() || undefined,
						category: (category || "work") as QuestCategory,
						cadence,
						effort,
						minutes,
						scored: isScored,
					},
				});

				toaster.create({
					title: "Quest Updated",
					description: `"${title.trim()}" updated successfully.`,
					type: "success",
				});
			} else {
				await createMutation.mutateAsync({
					title: title.trim(),
					notes: notes.trim() || undefined,
					category: (category || "work") as QuestCategory,
					cadence,
					effort,
					minutes,
					scored: isScored,
				});

				toaster.create({
					title: "Quest Created",
					description: `"${title.trim()}" added to your ${cadence} quest board.`,
					type: "success",
				});
			}

			setTitle("");
			setNotes("");
			setEditingQuest(null);
			setIsCreateOpen(false);
		} catch (err) {
			toaster.create({
				title: editingQuest
					? "Failed to update quest"
					: "Failed to create quest",
				description:
					err instanceof ApiError
						? err.message
						: "Error saving quest",
				type: "error",
			});
		}
	};

	const handleDeleteConfirm = async () => {
		if (!confirmDelete.target) return;
		try {
			await deleteMutation.mutateAsync(confirmDelete.target);
			toaster.create({
				title: "Quest Deleted",
				type: "success",
			});
			confirmDelete.close();
		} catch (err) {
			toaster.create({
				title: "Failed to delete quest",
				description:
					err instanceof ApiError
						? err.message
						: "Error deleting quest",
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
						sm: "repeat(2, 1fr)",
					}}
				>
					<Skeleton h="24" rounded="card" />
					<Skeleton h="24" rounded="card" />
				</Grid>
			) : (
				<Grid
					gap={4}
					templateColumns={{
						base: "1fr",
						sm: "repeat(2, 1fr)",
					}}
				>
					<Box {...glassCard} p={4}>
						<HStack justify="space-between" color="fg.muted">
							<Text
								fontSize="xs"
								fontWeight="semibold"
								textTransform="uppercase"
							>
								Today&apos;s Progress
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
								{completedCount}/{todayQuests.length} completed
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
								Active Streak
							</Text>
							<Icon as={LuFlame} boxSize={4} color="fg.muted" />
						</HStack>
						<HStack align="baseline" gap={2} mt={2}>
							<Heading size="2xl">
								{summary?.player?.streak ?? 0}
							</Heading>
							<Text fontSize="xs" color="fg.muted">
								days continuous
							</Text>
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
						<Heading size="lg">Tasks & Quest Loops</Heading>
						<Text fontSize="xs" color="fg.muted">
							Execute daily routines, habits, and recurring goals
							to earn EXP + PX rewards.
						</Text>
					</Stack>

					<HStack gap={3} wrap="wrap" align="center">
						<Box w={{ base: "full", sm: "200px" }}>
							<SearchableSelect
								items={FILTER_CATEGORIES}
								value={selectedTab}
								onValueChange={setSelectedTab}
								placeholder="Filter category..."
								searchPlaceholder="Search category..."
							/>
						</Box>

						{/* Centered Dialog Trigger Button */}
						<PillButton
							variant="dark"
							icon={LuPlus}
							onClick={handleOpenCreate}
						>
							New Quest
						</PillButton>
					</HStack>
				</Flex>

				{/* Task Rows List */}
				{isLoading ? (
					<Stack gap={2} pt={2}>
						<Skeleton h="14" rounded="card" />
						<Skeleton h="14" rounded="card" />
						<Skeleton h="14" rounded="card" />
					</Stack>
				) : filteredQuests.length === 0 ? (
					<EmptyState
						title="No quests found in this view"
						description="Create a new daily, weekly, or one-time quest using the button above."
						icon={<Icon as={LuTarget} boxSize={6} />}
					/>
				) : (
					<Stack gap={2.5} mt={1} flex="1">
						{filteredQuests.map((tq) => {
							const isCompleted = tq.completed;
							const isToggling =
								(completeMutation.isPending &&
									completeMutation.variables?.id ===
										tq.quest.id) ||
								(undoMutation.isPending &&
									undoMutation.variables?.id === tq.quest.id);

							return (
								<Flex
									key={tq.quest.id}
									align="center"
									justify="space-between"
									p={3.5}
									rounded="card"
									bg={isCompleted ? "bg.muted" : "bg.panel"}
									borderWidth="1px"
									borderColor="border.glass"
									opacity={isToggling ? 0.7 : 1}
									transition="all 0.15s ease-out"
									_hover={{
										transform: "translateY(-1px)",
										shadow: "glass",
									}}
								>
									<HStack
										gap={3}
										cursor="pointer"
										flex="1"
										onClick={(e) =>
											!isToggling &&
											handleToggleTask(
												tq,
												e.currentTarget,
											)
										}
									>
										<Circle
											size="6"
											bg={
												isCompleted
													? "mint.solid"
													: "transparent"
											}
											borderWidth={
												isCompleted ? 0 : "2px"
											}
											borderColor={
												isCompleted
													? "transparent"
													: "border"
											}
											color={
												isCompleted
													? "mint.contrast"
													: "transparent"
											}
										>
											{isToggling ? (
												<Spinner size="xs" color="fg" />
											) : isCompleted ? (
												<Icon
													as={LuCircleCheck}
													boxSize={3.5}
												/>
											) : null}
										</Circle>
										<Stack gap={0.5}>
											<Text
												fontSize="sm"
												fontWeight={
													isCompleted
														? "normal"
														: "semibold"
												}
												textDecoration={
													isCompleted
														? "line-through"
														: "none"
												}
												color={
													isCompleted
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
													maxW="540px"
												>
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
												<Icon
													as={LuFlame}
													color="mint.fg"
													boxSize={3}
												/>
												<Text fontWeight="bold">
													{tq.quest.streak}d
												</Text>
											</HStack>
										)}
										<Badge
											size="xs"
											rounded="pill"
											variant="subtle"
										>
											{tq.quest.cadence}
										</Badge>
										{tq.quest.scored && (
											<Badge
												size="xs"
												rounded="pill"
												variant="subtle"
											>
												+{tq.quest.exp_value} EXP
											</Badge>
										)}
										<Badge
											size="xs"
											rounded="pill"
											variant="subtle"
										>
											{tq.quest.category}
										</Badge>

										{/* 3-Dots Action Menu */}
										<MenuRoot
											positioning={{
												placement: "bottom-end",
											}}
										>
											<MenuTrigger asChild>
												<IconButton
													size="xs"
													variant="ghost"
													rounded="pill"
													aria-label="Quest actions"
												>
													<Icon
														as={LuEllipsisVertical}
														boxSize={4}
														color="fg.muted"
													/>
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
													onClick={() =>
														handleOpenEdit(tq.quest)
													}
												>
													<Icon
														as={LuPencil}
														boxSize={3.5}
														mr={2}
														color="mint.fg"
													/>
													Edit Quest
												</MenuItem>
												<MenuItem
													value="delete"
													cursor="pointer"
													rounded="pill"
													px={3}
													py={1.5}
													fontSize="xs"
													color="red.500"
													onClick={() =>
														confirmDelete.ask(
															tq.quest.id,
														)
													}
												>
													<Icon
														as={LuTrash2}
														boxSize={3.5}
														mr={2}
													/>
													Delete Quest
												</MenuItem>
											</MenuContent>
										</MenuRoot>
									</HStack>
								</Flex>
							);
						})}
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
									? "Edit Quest"
									: "Create New Quest"}
							</DialogTitle>
							<DialogDescription fontSize="xs" color="fg.muted">
								{editingQuest
									? "Update cadence, effort, duration or checklist notes."
									: "Configure cadence, category, and reward point calculation."}
							</DialogDescription>
						</Stack>
					</DialogHeader>

					<DialogBody py={3}>
						<form
							id="create-quest-form"
							noValidate
							onSubmit={handleSubmitTask}
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
													System reward ({minutes}m @{" "}
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
														{pricePreview?.exp ?? 0}{" "}
														EXP (+
														{pricePreview?.px ??
															0}{" "}
														PX)
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
														Deep Focus active: +20%
														bonus multiplier on
														completion
													</Text>
												</HStack>
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
							form="create-quest-form"
							variant="dark"
							icon={editingQuest ? LuPencil : LuPlus}
							loading={
								editingQuest
									? updateMutation.isPending
									: createMutation.isPending
							}
						>
							{editingQuest ? "Save Changes" : "Create Quest"}
						</PillButton>
					</DialogFooter>

					<DialogCloseTrigger />
				</DialogContent>
			</DialogRoot>

			{/* Confirm Delete Quest Dialog */}
			<ConfirmDialog
				open={confirmDelete.open}
				onOpenChange={confirmDelete.onOpenChange}
				title="Delete Quest"
				description="This quest will be permanently removed from your active quest board and progression schedule."
				confirmLabel="Delete Quest"
				destructive
				loading={deleteMutation.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</Box>
	);
};

export default TasksRoute;
