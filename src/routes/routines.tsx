import {
	useCreateRoutine,
	useDeleteRoutine,
	useRoutines,
	useUpdateRoutine,
	type Routine,
} from "@/api";
import { routineSchema, type RoutineFormData } from "@/api/schemas";
import { RewardFlight, useRewardFlight } from "@/components/game";
import {
	DialogActionTrigger,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
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
	VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
	LuCheck,
	LuClock,
	LuFastForward,
	LuPause,
	LuPlay,
	LuPlus,
	LuRepeat,
	LuTimer,
	LuTrash2,
	LuX,
} from "react-icons/lu";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(20px)",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const RoutinesRoute: React.FC = () => {
	const { data: routines = [], isLoading } = useRoutines();
	const createRoutineMutation = useCreateRoutine();
	const updateRoutineMutation = useUpdateRoutine();
	const deleteRoutineMutation = useDeleteRoutine();

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [activeRunningRoutine, setActiveRunningRoutine] =
		useState<Routine | null>(null);
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [stepTimerSeconds, setStepTimerSeconds] = useState(0);
	const [isTimerPaused, setIsTimerPaused] = useState(false);

	const { triggerFlight } = useRewardFlight();

	const form = useForm<RoutineFormData>({
		resolver: zodResolver(routineSchema),
		defaultValues: {
			title: "",
			description: "",
			schedule_days: [1, 2, 3, 4, 5],
			estimated_m: 30,
			steps: [
				{
					title: "Hydrate & stretch",
					minutes: 5,
					category: "health",
					effort: "trivial",
					order: 0,
				},
				{
					title: "Review daily top 3",
					minutes: 10,
					category: "work",
					effort: "light",
					order: 1,
				},
			],
			is_template: false,
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "steps",
	});

	// Routine Runner Timer
	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;
		if (activeRunningRoutine && !isTimerPaused) {
			interval = setInterval(() => {
				setStepTimerSeconds((s) => s + 1);
			}, 1000);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [activeRunningRoutine, isTimerPaused]);

	const handleCreateRoutine = async (data: RoutineFormData) => {
		try {
			await createRoutineMutation.mutateAsync(data);
			toaster.create({
				title: "Routine Saved",
				description: `"${data.title}" routine added to your playbook.`,
				type: "success",
			});
			setIsCreateOpen(false);
			form.reset();
		} catch (e: any) {
			toaster.create({
				title: "Failed to create routine",
				description: e?.message || "Something went wrong",
				type: "error",
			});
		}
	};

	const startRoutine = (routine: Routine) => {
		if (routine.steps.length === 0) {
			toaster.create({
				title: "Empty Routine",
				description: "Add steps to this routine before running it.",
				type: "warning",
			});
			return;
		}
		setActiveRunningRoutine(routine);
		setCurrentStepIndex(0);
		setStepTimerSeconds(0);
		setIsTimerPaused(false);
	};

	const nextStep = (completed = true, event?: React.MouseEvent) => {
		if (!activeRunningRoutine) return;

		if (completed && event) {
			const rect = (event.target as HTMLElement).getBoundingClientRect();
			triggerFlight({
				sourceX: rect.left + rect.width / 2,
				sourceY: rect.top + rect.height / 2,
				exp: 25,
				px: 10,
			});
		}

		if (currentStepIndex + 1 < activeRunningRoutine.steps.length) {
			setCurrentStepIndex((prev) => prev + 1);
			setStepTimerSeconds(0);
		} else {
			// Finished all steps
			toaster.create({
				title: "🎉 Routine Completed!",
				description: `Completed all ${activeRunningRoutine.steps.length} steps in ${activeRunningRoutine.title}!`,
				type: "success",
			});
			setActiveRunningRoutine(null);
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
						<Circle size="32px" bg="blue.500/15" color="blue.400">
							<Icon as={LuRepeat} boxSize={5} />
						</Circle>
						<Heading size="xl" fontWeight="bold">
							Routine Builder & Runner
						</Heading>
					</HStack>
					<Text color="fg.muted" fontSize="sm">
						Group quests and habits into executable flows (Morning,
						Work Shutdown, Gym, Weekly Reset).
					</Text>
				</VStack>

				<Button
					colorPalette="blue"
					rounded="full"
					onClick={() => {
						form.reset();
						setIsCreateOpen(true);
					}}
				>
					<Icon as={LuPlus} /> New Routine
				</Button>
			</Flex>

			{/* Routines Grid */}
			{isLoading ? (
				<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} h="200px" rounded="card" />
					))}
				</SimpleGrid>
			) : routines.length === 0 ? (
				<Box {...glassCard} p={10}>
					<EmptyState
						title="No Routines Created"
						description="Create your first sequence of actions or load a template."
					/>
				</Box>
			) : (
				<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
					{routines.map((routine) => {
						const totalM = routine.steps.reduce(
							(sum, s) => sum + s.minutes,
							0,
						);

						return (
							<Box
								key={routine.id}
								{...glassCard}
								p={5}
								display="flex"
								flexDirection="column"
								justifyContent="space-between"
							>
								<Box>
									<Flex
										justify="space-between"
										align="flex-start"
										mb={2}
									>
										<VStack align="flex-start" gap={1}>
											<HStack gap={2}>
												<Heading size="md">
													{routine.title}
												</Heading>
												{routine.is_template && (
													<Badge
														colorPalette="purple"
														size="xs"
														rounded="full"
													>
														Template
													</Badge>
												)}
											</HStack>
											{routine.description && (
												<Text
													fontSize="xs"
													color="fg.muted"
												>
													{routine.description}
												</Text>
											)}
										</VStack>

										<IconButton
											size="xs"
											variant="ghost"
											colorPalette="red"
											aria-label="Delete routine"
											onClick={() =>
												deleteRoutineMutation.mutate(
													routine.id,
												)
											}
										>
											<Icon as={LuTrash2} />
										</IconButton>
									</Flex>

									<HStack
										gap={3}
										my={3}
										fontSize="xs"
										color="fg.muted"
									>
										<HStack gap={1}>
											<Icon as={LuClock} />
											<Text fontWeight="semibold">
												{totalM} min
											</Text>
										</HStack>
										<HStack gap={1}>
											<Icon as={LuTimer} />
											<Text>
												{routine.steps.length} steps
											</Text>
										</HStack>
									</HStack>

									{/* Step Preview List */}
									<VStack gap={1.5} align="stretch" my={3}>
										{routine.steps
											.slice(0, 4)
											.map((step, idx) => (
												<Flex
													key={idx}
													justify="space-between"
													align="center"
													bg="bg.subtle"
													px={2.5}
													py={1.5}
													rounded="md"
													fontSize="xs"
												>
													<HStack gap={2}>
														<Circle
															size="18px"
															bg="bg.panel"
															fontSize="2xs"
															fontWeight="bold"
														>
															{idx + 1}
														</Circle>
														<Text>
															{step.title}
														</Text>
													</HStack>
													<Text color="fg.muted">
														{step.minutes}m
													</Text>
												</Flex>
											))}
										{routine.steps.length > 4 && (
											<Text
												fontSize="2xs"
												color="fg.muted"
												textAlign="center"
											>
												+{routine.steps.length - 4} more
												steps
											</Text>
										)}
									</VStack>

									{/* Schedule Days */}
									{routine.schedule_days.length > 0 && (
										<HStack gap={1} mb={4} mt={2}>
											{WEEKDAYS.map((name, dayIndex) => {
												const active =
													routine.schedule_days.includes(
														dayIndex,
													);
												return (
													<Circle
														key={name}
														size="20px"
														fontSize="2xs"
														bg={
															active
																? "blue.500/20"
																: "transparent"
														}
														color={
															active
																? "blue.400"
																: "fg.muted"
														}
														borderWidth="1px"
														borderColor={
															active
																? "blue.500/40"
																: "border.subtle"
														}
													>
														{name[0]}
													</Circle>
												);
											})}
										</HStack>
									)}
								</Box>

								<Button
									colorPalette="blue"
									size="sm"
									w="full"
									mt={3}
									onClick={() => startRoutine(routine)}
								>
									<Icon as={LuPlay} /> Run Routine
								</Button>
							</Box>
						);
					})}
				</SimpleGrid>
			)}

			{/* Routine Runner Modal */}
			{activeRunningRoutine && (
				<DialogRoot
					open={!!activeRunningRoutine}
					onOpenChange={() => setActiveRunningRoutine(null)}
				>
					<DialogContent maxW="600px">
						<DialogHeader>
							<Flex
								justify="space-between"
								align="center"
								w="full"
							>
								<VStack align="flex-start" gap={0}>
									<DialogTitle>
										{activeRunningRoutine.title}
									</DialogTitle>
									<Text fontSize="xs" color="fg.muted">
										Step {currentStepIndex + 1} of{" "}
										{activeRunningRoutine.steps.length}
									</Text>
								</VStack>
								<Button
									size="xs"
									variant="ghost"
									onClick={() =>
										setActiveRunningRoutine(null)
									}
								>
									<Icon as={LuX} />
								</Button>
							</Flex>
						</DialogHeader>

						<DialogBody>
							{(() => {
								const currentStep =
									activeRunningRoutine.steps[
										currentStepIndex
									];
								const totalSecondsNeeded =
									currentStep.minutes * 60;
								const progressVal = Math.min(
									100,
									(stepTimerSeconds / totalSecondsNeeded) *
										100,
								);
								const minutesLeft = Math.floor(
									stepTimerSeconds / 60,
								);
								const secondsLeft = stepTimerSeconds % 60;

								return (
									<VStack gap={6} py={4}>
										<VStack gap={2} textAlign="center">
											<Badge
												size="lg"
												colorPalette="blue"
												rounded="full"
												px={3}
												py={1}
											>
												Step {currentStepIndex + 1}:{" "}
												{currentStep.category}
											</Badge>
											<Heading
												size="xl"
												fontWeight="bold"
											>
												{currentStep.title}
											</Heading>
											<Text
												color="fg.muted"
												fontSize="sm"
											>
												Planned duration:{" "}
												{currentStep.minutes} minutes (
												{currentStep.effort} effort)
											</Text>
										</VStack>

										{/* Timer Display */}
										<Circle
											size="150px"
											borderWidth="4px"
											borderColor="blue.400"
											bg="blue.500/10"
											flexDirection="column"
										>
											<Text
												fontSize="3xl"
												fontWeight="bold"
												fontFamily="mono"
											>
												{String(minutesLeft).padStart(
													2,
													"0",
												)}
												:
												{String(secondsLeft).padStart(
													2,
													"0",
												)}
											</Text>
											<Text
												fontSize="2xs"
												color="fg.muted"
											>
												target {currentStep.minutes}:00
											</Text>
										</Circle>

										{/* Step Progress */}
										<Box w="full">
											<Progress.Root
												value={progressVal}
												max={100}
												size="sm"
											>
												<Progress.Track
													bg="bg.subtle"
													rounded="full"
												>
													<Progress.Range bg="blue.400" />
												</Progress.Track>
											</Progress.Root>
										</Box>
									</VStack>
								);
							})()}
						</DialogBody>

						<DialogFooter justifyContent="space-between">
							<HStack gap={2}>
								<Button
									size="sm"
									variant="outline"
									onClick={() =>
										setIsTimerPaused(!isTimerPaused)
									}
								>
									<Icon
										as={isTimerPaused ? LuPlay : LuPause}
									/>{" "}
									{isTimerPaused ? "Resume" : "Pause"}
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onClick={() => nextStep(false)}
								>
									<Icon as={LuFastForward} /> Skip
								</Button>
							</HStack>

							<Button
								colorPalette="green"
								size="sm"
								onClick={(e) => nextStep(true, e)}
							>
								<Icon as={LuCheck} /> Complete Step
							</Button>
						</DialogFooter>
					</DialogContent>
				</DialogRoot>
			)}

			{/* Create Routine Dialog */}
			<DialogRoot
				open={isCreateOpen}
				onOpenChange={(e) => setIsCreateOpen(e.open)}
			>
				<DialogContent maxW="600px">
					<form onSubmit={form.handleSubmit(handleCreateRoutine)}>
						<DialogHeader>
							<DialogTitle>Create Custom Routine</DialogTitle>
							<DialogDescription>
								Define an ordered set of tasks and steps.
							</DialogDescription>
						</DialogHeader>

						<DialogBody>
							<VStack gap={4}>
								<Field
									label="Routine Title"
									required
									errorText={
										form.formState.errors.title?.message
									}
								>
									<Input
										{...form.register("title")}
										placeholder="e.g. Morning Focus Ritual"
									/>
								</Field>

								<Field label="Description">
									<Input
										{...form.register("description")}
										placeholder="Short description of this routine..."
									/>
								</Field>

								{/* Steps Builder */}
								<VStack gap={3} align="stretch" w="full">
									<Flex
										justify="space-between"
										align="center"
									>
										<Text fontSize="sm" fontWeight="bold">
											Routine Steps ({fields.length})
										</Text>
										<Button
											size="xs"
											variant="subtle"
											colorPalette="blue"
											onClick={() =>
												append({
													title: "",
													minutes: 10,
													category: "work",
													effort: "light",
													order: fields.length,
												})
											}
										>
											<Icon as={LuPlus} /> Add Step
										</Button>
									</Flex>

									{fields.map((field, idx) => (
										<HStack
											key={field.id}
											gap={2}
											bg="bg.subtle"
											p={2.5}
											rounded="md"
										>
											<Text
												fontSize="xs"
												fontWeight="bold"
												color="fg.muted"
											>
												{idx + 1}.
											</Text>
											<Input
												size="sm"
												placeholder="Step description..."
												{...form.register(
													`steps.${idx}.title` as const,
												)}
											/>
											<Input
												size="sm"
												type="number"
												w="70px"
												placeholder="min"
												{...form.register(
													`steps.${idx}.minutes` as const,
												)}
											/>
											<IconButton
												size="xs"
												variant="ghost"
												colorPalette="red"
												aria-label="Remove step"
												onClick={() => remove(idx)}
											>
												<Icon as={LuTrash2} />
											</IconButton>
										</HStack>
									))}
								</VStack>
							</VStack>
						</DialogBody>

						<DialogFooter>
							<DialogActionTrigger asChild>
								<Button variant="outline">Cancel</Button>
							</DialogActionTrigger>
							<Button
								type="submit"
								colorPalette="blue"
								loading={createRoutineMutation.isPending}
							>
								Save Routine
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</DialogRoot>
		</Box>
	);
};

export default RoutinesRoute;
