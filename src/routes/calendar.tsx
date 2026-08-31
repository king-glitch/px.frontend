import {
	useCalendarEvents,
	useCompleteQuest,
	useDeleteScheduledEvent,
	useQuests,
	useRescheduleQuest,
	useScheduleQuest,
	useUpdateWorkloadConfig,
	useWorkloadCapacity,
} from "@/api/hooks/use-game";
import type {
	CalendarEventSummary,
	Quest,
	WorkloadDaySummary,
} from "@/api/types";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import {
	NativeSelectField,
	NativeSelectRoot,
} from "@/components/ui/native-select";
import { FocusSessionModal } from "@/components/game/focus-session-modal";
import {
	Badge,
	Box,
	Button,
	Card,
	Circle,
	Container,
	HStack,
	Heading,
	Icon,
	Input,
	Progress,
	SimpleGrid,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import {
	LuCalendar,
	LuChevronLeft,
	LuChevronRight,
	LuClock,
	LuPlay,
	LuPlus,
	LuSettings,
	LuTrash2,
	LuTriangleAlert,
	LuX,
} from "react-icons/lu";

export default function CalendarPage() {
	const today = new Date();
	const [currentDate, setCurrentDate] = useState<Date>(today);
	const [viewMode, setViewMode] = useState<"week" | "month">("week");

	// Dialog States
	const [isScheduleOpen, setIsScheduleOpen] = useState(false);
	const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
	const [isConfigOpen, setIsConfigOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] =
		useState<CalendarEventSummary | null>(null);

	// Focus Session Modal State
	const [focusQuest, setFocusQuest] = useState<Quest | null>(null);
	const [focusMVQ, setFocusMVQ] = useState(false);
	const [isFocusOpen, setIsFocusOpen] = useState(false);

	// Schedule Form State
	const [scheduleQuestId, setScheduleQuestId] = useState("");
	const [scheduleDate, setScheduleDate] = useState(
		today.toISOString().split("T")[0],
	);
	const [scheduleStartTime, setScheduleStartTime] = useState("09:00");
	const [scheduleMinutes, setScheduleMinutes] = useState(30);

	// Config Form State
	const [maxHardQuests, setMaxHardQuests] = useState(2);
	const [weekdayCapacity, setWeekdayCapacity] = useState(240);
	const [weekendCapacity, setWeekendCapacity] = useState(120);

	// Calculate Week Boundaries
	const weekDays = useMemo(() => {
		const curr = new Date(currentDate);
		const first =
			curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1); // Monday start
		const days: Date[] = [];
		for (let i = 0; i < 7; i++) {
			const d = new Date(curr.setDate(first + i));
			days.push(new Date(d));
		}
		return days;
	}, [currentDate]);

	const fromDateStr = weekDays[0].toISOString().split("T")[0];
	const toDateStr = weekDays[6].toISOString().split("T")[0];

	// API Hooks
	const { data: events = [] } = useCalendarEvents(fromDateStr, toDateStr);
	const { data: workload = [] } = useWorkloadCapacity(fromDateStr, toDateStr);
	const { data: questsData } = useQuests(1, 100);
	const activeQuests =
		questsData?.quests?.filter((q: Quest) => q.active) || [];

	const scheduleQuestMutation = useScheduleQuest();
	const rescheduleQuestMutation = useRescheduleQuest();
	const deleteScheduleMutation = useDeleteScheduledEvent();
	const updateConfigMutation = useUpdateWorkloadConfig();
	const completeQuestMutation = useCompleteQuest();

	// Navigation handlers
	const handlePrevWeek = () => {
		const prev = new Date(currentDate);
		prev.setDate(prev.getDate() - 7);
		setCurrentDate(prev);
	};

	const handleNextWeek = () => {
		const next = new Date(currentDate);
		next.setDate(next.getDate() + 7);
		setCurrentDate(next);
	};

	const handleToday = () => {
		setCurrentDate(new Date());
	};

	const handleCreateSchedule = async () => {
		if (!scheduleQuestId) return;
		await scheduleQuestMutation.mutateAsync({
			quest_id: scheduleQuestId,
			scheduled_date: scheduleDate,
			start_time: scheduleStartTime,
			estimated_minutes: scheduleMinutes,
		});
		setIsScheduleOpen(false);
	};

	const handleReschedule = async () => {
		if (!selectedEvent) return;
		await rescheduleQuestMutation.mutateAsync({
			schedule_id: selectedEvent.schedule_id,
			scheduled_date: scheduleDate,
			start_time: scheduleStartTime,
		});
		setIsRescheduleOpen(false);
	};

	const handleSaveConfig = async () => {
		await updateConfigMutation.mutateAsync({
			daily_capacity_minutes: {
				"0": weekendCapacity,
				"1": weekdayCapacity,
				"2": weekdayCapacity,
				"3": weekdayCapacity,
				"4": weekdayCapacity,
				"5": weekdayCapacity,
				"6": weekendCapacity,
			},
			max_hard_quests_per_day: maxHardQuests,
			buffer_minutes: 30,
		});
		setIsConfigOpen(false);
	};

	const handleOpenFocus = (ev: CalendarEventSummary) => {
		const q = activeQuests.find((item: Quest) => item.id === ev.quest_id);
		if (q) {
			setFocusQuest(q);
			setFocusMVQ(ev.is_mvq || false);
			setIsFocusOpen(true);
		}
	};

	const workloadMap = useMemo(() => {
		const map: Record<string, WorkloadDaySummary> = {};
		for (const w of workload) {
			map[w.date] = w;
		}
		return map;
	}, [workload]);

	const eventsByDate = useMemo(() => {
		const map: Record<string, CalendarEventSummary[]> = {};
		for (const ev of events) {
			if (!map[ev.scheduled_date]) {
				map[ev.scheduled_date] = [];
			}
			map[ev.scheduled_date].push(ev);
		}
		return map;
	}, [events]);

	return (
		<Container maxW="7xl" py={8}>
			<VStack gap={6} align="stretch">
				{/* Top Header & Workload Banner */}
				<Card.Root
					bg="bg.glass"
					borderWidth="1px"
					borderColor="border.glass"
					rounded="2xl"
					p={6}
					backdropFilter="blur(20px)"
				>
					<HStack
						justify="space-between"
						align={{ base: "flex-start", md: "center" }}
						flexWrap="wrap"
						gap={4}
					>
						<VStack align="flex-start" gap={1}>
							<HStack gap={2}>
								<Circle
									size="36px"
									bg="purple.500/15"
									color="purple.400"
								>
									<Icon as={LuCalendar} boxSize={5} />
								</Circle>
								<Heading size="xl" fontWeight="bold">
									Quest Calendar & Workload Planning
								</Heading>
							</HStack>
							<Text fontSize="sm" color="fg.muted">
								Plan daily execution, prevent burnout, and
								manage sustainable quest load
							</Text>
						</VStack>

						<HStack gap={2}>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsConfigOpen(true)}
							>
								<Icon as={LuSettings} mr={1} /> Capacity Limits
							</Button>
							<Button
								colorPalette="purple"
								size="sm"
								onClick={() => setIsScheduleOpen(true)}
							>
								<Icon as={LuPlus} mr={1} /> Schedule Quest
							</Button>
						</HStack>
					</HStack>
				</Card.Root>

				{/* Controls & Date Range Navigation */}
				<HStack
					justify="space-between"
					align="center"
					flexWrap="wrap"
					gap={4}
				>
					<HStack gap={2}>
						<Button
							variant="outline"
							size="sm"
							onClick={handlePrevWeek}
						>
							<Icon as={LuChevronLeft} />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleToday}
						>
							Today
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleNextWeek}
						>
							<Icon as={LuChevronRight} />
						</Button>
						<Heading size="md" fontWeight="semibold" ml={2}>
							{weekDays[0].toLocaleDateString(undefined, {
								month: "short",
								day: "numeric",
							})}{" "}
							–{" "}
							{weekDays[6].toLocaleDateString(undefined, {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</Heading>
					</HStack>

					<HStack gap={2}>
						<Button
							size="xs"
							variant={viewMode === "week" ? "solid" : "subtle"}
							colorPalette="purple"
							onClick={() => setViewMode("week")}
						>
							Week Matrix
						</Button>
						<Button
							size="xs"
							variant={viewMode === "month" ? "solid" : "subtle"}
							colorPalette="purple"
							onClick={() => setViewMode("month")}
						>
							Capacity Heatmap
						</Button>
					</HStack>
				</HStack>

				{/* Week Matrix View */}
				<SimpleGrid columns={{ base: 1, md: 7 }} gap={3}>
					{weekDays.map((dayDate) => {
						const dateKey = dayDate.toISOString().split("T")[0];
						const dayEvents = eventsByDate[dateKey] || [];
						const dayWorkload = workloadMap[dateKey];
						const isCurrentDay =
							today.toISOString().split("T")[0] === dateKey;

						const fatigueColor =
							dayWorkload?.fatigue_score === "overloaded"
								? "red"
								: dayWorkload?.fatigue_score === "heavy"
									? "amber"
									: dayWorkload?.fatigue_score === "balanced"
										? "teal"
										: "blue";

						const loadRatio = dayWorkload?.capacity_minutes
							? Math.min(
									100,
									Math.round(
										(dayWorkload.total_planned_minutes /
											dayWorkload.capacity_minutes) *
											100,
									),
								)
							: 0;

						return (
							<Card.Root
								key={dateKey}
								bg={isCurrentDay ? "purple.500/5" : "bg.glass"}
								borderWidth="1px"
								borderColor={
									isCurrentDay
										? "purple.500/40"
										: "border.glass"
								}
								rounded="xl"
								p={3}
								backdropFilter="blur(20px)"
								minH="420px"
								display="flex"
								flexDirection="column"
							>
								{/* Day Column Header */}
								<VStack
									align="stretch"
									gap={2}
									mb={3}
									pb={2}
									borderBottomWidth="1px"
									borderColor="border.glass"
								>
									<HStack
										justify="space-between"
										align="center"
									>
										<Text
											fontSize="xs"
											fontWeight="bold"
											textTransform="uppercase"
											color={
												isCurrentDay
													? "purple.400"
													: "fg.muted"
											}
										>
											{dayDate.toLocaleDateString(
												undefined,
												{ weekday: "short" },
											)}
										</Text>
										<Badge
											size="sm"
											variant={
												isCurrentDay
													? "solid"
													: "subtle"
											}
											colorPalette={
												isCurrentDay ? "purple" : "gray"
											}
										>
											{dayDate.getDate()}
										</Badge>
									</HStack>

									{/* Capacity Meter */}
									<VStack align="stretch" gap={1}>
										<HStack
											justify="space-between"
											fontSize="xs"
										>
											<Text color="fg.muted">
												{dayWorkload?.total_planned_minutes ||
													0}
												m /{" "}
												{dayWorkload?.capacity_minutes ||
													180}
												m
											</Text>
											<Badge
												size="xs"
												colorPalette={fatigueColor}
												variant="subtle"
											>
												{dayWorkload?.fatigue_score ||
													"low"}
											</Badge>
										</HStack>
										<Progress.Root
											value={loadRatio}
											colorPalette={fatigueColor}
											size="xs"
										>
											<Progress.Track
												bg="whiteAlpha.100"
												rounded="full"
											>
												<Progress.Range rounded="full" />
											</Progress.Track>
										</Progress.Root>
									</VStack>

									{/* Warnings */}
									{dayWorkload?.warnings &&
										dayWorkload.warnings.length > 0 && (
											<HStack
												gap={1}
												bg="red.500/10"
												p={1.5}
												rounded="md"
											>
												<Icon
													as={LuTriangleAlert}
													color="red.400"
													boxSize={3}
												/>
												<Text
													fontSize="xs"
													color="red.400"
													lineClamp={1}
												>
													{dayWorkload.warnings[0]}
												</Text>
											</HStack>
										)}
								</VStack>

								{/* Events List */}
								<VStack
									align="stretch"
									gap={2}
									flex={1}
									overflowY="auto"
								>
									{dayEvents.length === 0 ? (
										<Box
											textAlign="center"
											py={8}
											color="fg.muted"
										>
											<Text fontSize="xs">
												No scheduled quests
											</Text>
										</Box>
									) : (
										dayEvents.map((ev) => (
											<Card.Root
												key={ev.schedule_id}
												bg={
													ev.completed
														? "teal.500/5"
														: "bg.surface"
												}
												borderWidth="1px"
												borderColor={
													ev.completed
														? "teal.500/30"
														: "border.glass"
												}
												p={2.5}
												rounded="lg"
											>
												<VStack
													align="flex-start"
													gap={1.5}
												>
													<HStack
														justify="space-between"
														width="full"
													>
														<HStack gap={1}>
															<Badge
																size="xs"
																colorPalette="purple"
																variant="subtle"
															>
																{ev.category}
															</Badge>
															{ev.is_mvq && (
																<Badge
																	size="xs"
																	colorPalette="amber"
																	variant="solid"
																>
																	MVQ
																</Badge>
															)}
														</HStack>
														{ev.start_time && (
															<HStack
																gap={0.5}
																fontSize="xs"
																color="fg.muted"
															>
																<Icon
																	as={LuClock}
																	boxSize={
																		2.5
																	}
																/>
																<Text>
																	{
																		ev.start_time
																	}
																</Text>
															</HStack>
														)}
													</HStack>

													<Text
														fontSize="xs"
														fontWeight="semibold"
														lineBreak="anywhere"
														textDecoration={
															ev.completed
																? "line-through"
																: "none"
														}
														color={
															ev.completed
																? "fg.muted"
																: "inherit"
														}
													>
														{ev.title}
													</Text>

													{ev.goal_title && (
														<Text
															fontSize="xs"
															color="teal.400"
															lineClamp={1}
														>
															🎯 {ev.goal_title}
														</Text>
													)}

													<HStack
														justify="space-between"
														width="full"
														pt={1}
													>
														<Text
															fontSize="2xs"
															color="fg.muted"
														>
															{
																ev.estimated_minutes
															}
															m
														</Text>
														<HStack gap={1}>
															{!ev.completed && (
																<Button
																	size="2xs"
																	variant="solid"
																	colorPalette="purple"
																	onClick={() =>
																		handleOpenFocus(
																			ev,
																		)
																	}
																>
																	<Icon
																		as={
																			LuPlay
																		}
																	/>
																</Button>
															)}
															<Button
																size="2xs"
																variant="ghost"
																onClick={() => {
																	setSelectedEvent(
																		ev,
																	);
																	setScheduleDate(
																		ev.scheduled_date,
																	);
																	setScheduleStartTime(
																		ev.start_time ||
																			"09:00",
																	);
																	setIsRescheduleOpen(
																		true,
																	);
																}}
															>
																Shift
															</Button>
															<Button
																size="2xs"
																variant="ghost"
																colorPalette="red"
																onClick={() =>
																	deleteScheduleMutation.mutate(
																		ev.schedule_id,
																	)
																}
															>
																<Icon
																	as={
																		LuTrash2
																	}
																/>
															</Button>
														</HStack>
													</HStack>
												</VStack>
											</Card.Root>
										))
									)}
								</VStack>
							</Card.Root>
						);
					})}
				</SimpleGrid>

				{/* Schedule Quest Dialog */}
				<DialogRoot
					open={isScheduleOpen}
					onOpenChange={(e) => setIsScheduleOpen(e.open)}
					size="md"
					placement="center"
				>
					<DialogContent
						bg="bg.panel"
						borderWidth="1px"
						borderColor="border.glass"
						rounded="2xl"
						p={6}
						shadow="float"
					>
						<DialogHeader p={0} mb={4}>
							<DialogTitle fontSize="md" fontWeight="bold">
								Schedule Quest
							</DialogTitle>
							<DialogCloseTrigger />
						</DialogHeader>

						<DialogBody p={0}>
							<VStack gap={4} align="stretch">
								<Field label="Select Quest">
									<NativeSelectRoot>
										<NativeSelectField
											value={scheduleQuestId}
											onChange={(e) =>
												setScheduleQuestId(
													e.target.value,
												)
											}
											bg="bg.surface"
										>
											<option value="">
												-- Choose active quest --
											</option>
											{activeQuests.map((q: Quest) => (
												<option key={q.id} value={q.id}>
													{q.title} ({q.minutes}m - {q.category})
												</option>
											))}
										</NativeSelectField>
									</NativeSelectRoot>
								</Field>

								<Field label="Date">
									<Input
										type="date"
										value={scheduleDate}
										onChange={(e) =>
											setScheduleDate(e.target.value)
										}
										bg="bg.surface"
									/>
								</Field>

								<HStack gap={4}>
									<Field label="Start Time" flex={1}>
										<Input
											type="time"
											value={scheduleStartTime}
											onChange={(e) =>
												setScheduleStartTime(
													e.target.value,
												)
											}
											bg="bg.surface"
										/>
									</Field>
									<Field label="Estimated Minutes" flex={1}>
										<Input
											type="number"
											value={scheduleMinutes}
											onChange={(e) =>
												setScheduleMinutes(
													Number(e.target.value),
												)
											}
											bg="bg.surface"
										/>
									</Field>
								</HStack>
							</VStack>
						</DialogBody>

						<DialogFooter p={0} mt={6}>
							<HStack justify="flex-end" gap={2} width="full">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsScheduleOpen(false)}
								>
									Cancel
								</Button>
								<Button
									colorPalette="purple"
									size="sm"
									onClick={handleCreateSchedule}
									loading={
										scheduleQuestMutation.isPending
									}
								>
									Schedule
								</Button>
							</HStack>
						</DialogFooter>
					</DialogContent>
				</DialogRoot>

				{/* Reschedule Shift Dialog */}
				<DialogRoot
					open={isRescheduleOpen}
					onOpenChange={(e) => setIsRescheduleOpen(e.open)}
					size="md"
					placement="center"
				>
					<DialogContent
						bg="bg.panel"
						borderWidth="1px"
						borderColor="border.glass"
						rounded="2xl"
						p={6}
						shadow="float"
					>
						<DialogHeader p={0} mb={4}>
							<DialogTitle fontSize="md" fontWeight="bold">
								Shift / Reschedule Quest
							</DialogTitle>
							<DialogCloseTrigger />
						</DialogHeader>

						<DialogBody p={0}>
							<VStack gap={4} align="stretch">
								<Text fontSize="sm" color="fg.muted">
									Shift {selectedEvent?.title} to a different day or time.
								</Text>

								<Field label="New Date">
									<Input
										type="date"
										value={scheduleDate}
										onChange={(e) =>
											setScheduleDate(e.target.value)
										}
										bg="bg.surface"
									/>
								</Field>

								<Field label="New Start Time">
									<Input
										type="time"
										value={scheduleStartTime}
										onChange={(e) =>
											setScheduleStartTime(
												e.target.value,
											)
										}
										bg="bg.surface"
									/>
								</Field>
							</VStack>
						</DialogBody>

						<DialogFooter p={0} mt={6}>
							<HStack justify="flex-end" gap={2} width="full">
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setIsRescheduleOpen(false)
									}
								>
									Cancel
								</Button>
								<Button
									colorPalette="purple"
									size="sm"
									onClick={handleReschedule}
									loading={
										rescheduleQuestMutation.isPending
									}
								>
									Confirm Shift
								</Button>
							</HStack>
						</DialogFooter>
					</DialogContent>
				</DialogRoot>

				{/* Workload Capacity Limits Dialog */}
				<DialogRoot
					open={isConfigOpen}
					onOpenChange={(e) => setIsConfigOpen(e.open)}
					size="md"
					placement="center"
				>
					<DialogContent
						bg="bg.panel"
						borderWidth="1px"
						borderColor="border.glass"
						rounded="2xl"
						p={6}
						shadow="float"
					>
						<DialogHeader p={0} mb={4}>
							<DialogTitle fontSize="md" fontWeight="bold">
								Workload Capacity Settings
							</DialogTitle>
							<DialogCloseTrigger />
						</DialogHeader>

						<DialogBody p={0}>
							<VStack gap={4} align="stretch">
								<Field label="Weekday Capacity (minutes/day)">
									<Input
										type="number"
										value={weekdayCapacity}
										onChange={(e) =>
											setWeekdayCapacity(
												Number(e.target.value),
											)
										}
										bg="bg.surface"
									/>
								</Field>

								<Field label="Weekend Capacity (minutes/day)">
									<Input
										type="number"
										value={weekendCapacity}
										onChange={(e) =>
											setWeekendCapacity(
												Number(e.target.value),
											)
										}
										bg="bg.surface"
									/>
								</Field>

								<Field label="Max Hard / Grueling Quests Per Day">
									<Input
										type="number"
										value={maxHardQuests}
										onChange={(e) =>
											setMaxHardQuests(
												Number(e.target.value),
											)
										}
										bg="bg.surface"
									/>
								</Field>
							</VStack>
						</DialogBody>

						<DialogFooter p={0} mt={6}>
							<HStack justify="flex-end" gap={2} width="full">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsConfigOpen(false)}
								>
									Cancel
								</Button>
								<Button
									colorPalette="purple"
									size="sm"
									onClick={handleSaveConfig}
									loading={updateConfigMutation.isPending}
								>
									Save Limits
								</Button>
							</HStack>
						</DialogFooter>
					</DialogContent>
				</DialogRoot>

				{/* Focus Session Modal */}
				<FocusSessionModal
					isOpen={isFocusOpen}
					onClose={() => setIsFocusOpen(false)}
					quest={focusQuest}
					isMVQ={focusMVQ}
				/>
			</VStack>
		</Container>
	);
}
