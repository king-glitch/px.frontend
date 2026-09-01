import {
	useCompleteGoal,
	useCompleteMilestone,
	useCreateGoal,
	useCreateMilestone,
	useCreateProject,
	useDeleteGoal,
	useDeleteMilestone,
	useDeleteProject,
	useGoals,
	type Goal,
	type LifeArea,
	type Milestone,
	type Project,
} from "@/api";
import {
	goalSchema,
	milestoneSchema,
	projectSchema,
	type GoalFormData,
	type MilestoneFormData,
	type ProjectFormData,
} from "@/api/schemas";
import { RewardFlight, useRewardFlight } from "@/components/game";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
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
import { PillButton } from "@/components/ui/pill-button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toaster } from "@/components/ui/toaster";
import { GoalRetrospectiveDialog } from "@/routes/goals/goal-retrospective-dialog";
import { EditGoalDialog } from "@/routes/goals/edit-goal-dialog";
import { EditProjectDialog } from "@/routes/goals/edit-project-dialog";
import { EditMilestoneDialog } from "@/routes/goals/edit-milestone-dialog";
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
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
	LuAward,
	LuCheck,
	LuChevronRight,
	LuCoins,
	LuCompass,
	LuFlag,
	LuFolder,
	LuHistory,
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
	backdropFilter: "blur(20px)",
};

const AREA_COLORS: Record<
	LifeArea,
	{ bg: string; color: string; border: string }
> = {
	health: { bg: "lime.500/15", color: "lime.500", border: "lime.500/30" },
	wealth: { bg: "bg.muted", color: "fg", border: "border" },
	mastery: { bg: "lime.500/15", color: "lime.500", border: "lime.500/30" },
	personal: { bg: "bg.muted", color: "fg", border: "border" },
	social: { bg: "lime.500/15", color: "lime.500", border: "lime.500/30" },
};

const LIFE_AREAS = [
	{ label: "Health", value: "health" },
	{ label: "Wealth", value: "wealth" },
	{ label: "Mastery", value: "mastery" },
	{ label: "Personal", value: "personal" },
	{ label: "Social", value: "social" },
];

const GOAL_CATEGORIES = [
	{ label: "Learning", value: "learning" },
	{ label: "Work", value: "work" },
	{ label: "Health", value: "health" },
	{ label: "Chores", value: "chores" },
	{ label: "Mindfulness", value: "mindfulness" },
	{ label: "Social", value: "social" },
	{ label: "Finance", value: "finance" },
];

const GoalCardSkeleton: React.FC = () => (
	<Box {...glassCard} p={{ base: 5, md: 6 }}>
		<Flex justify="space-between" align="flex-start" mb={4}>
			<VStack align="flex-start" gap={2} flex="1">
				<HStack gap={2}>
					<Skeleton h="20px" w="70px" rounded="pill" />
					<Skeleton h="20px" w="60px" rounded="pill" />
				</HStack>
				<Skeleton h="24px" w="55%" rounded="lg" />
				<Skeleton h="14px" w="35%" rounded="md" />
			</VStack>
			<HStack gap={2}>
				<Skeleton h="28px" w="90px" rounded="pill" />
				<Skeleton h="28px" w="28px" rounded="full" />
			</HStack>
		</Flex>

		<Box mb={5}>
			<Flex justify="space-between" mb={2}>
				<Skeleton h="12px" w="120px" rounded="md" />
				<Skeleton h="12px" w="35px" rounded="md" />
			</Flex>
			<Skeleton h="8px" w="100%" rounded="full" />
		</Box>

		<VStack
			gap={3}
			align="stretch"
			pt={4}
			borderTopWidth="1px"
			borderColor="border.glass"
		>
			<Flex justify="space-between" align="center">
				<Skeleton h="14px" w="140px" rounded="md" />
				<Skeleton h="24px" w="85px" rounded="pill" />
			</Flex>
			<Box
				bg="bg.panel"
				p={4}
				rounded="xl"
				borderWidth="1px"
				borderColor="border.glass"
			>
				<Flex justify="space-between" align="center" mb={3}>
					<HStack gap={2}>
						<Skeleton h="24px" w="24px" rounded="full" />
						<Skeleton h="16px" w="120px" rounded="md" />
					</HStack>
					<Skeleton h="20px" w="70px" rounded="pill" />
				</Flex>
				<VStack gap={2} align="stretch">
					<Skeleton h="36px" w="100%" rounded="pill" />
					<Skeleton h="36px" w="100%" rounded="pill" />
				</VStack>
			</Box>
		</VStack>
	</Box>
);

export const GoalsRoute: React.FC = () => {
	const { data: goals = [], isLoading } = useGoals();
	const createGoalMutation = useCreateGoal();
	const deleteGoalMutation = useDeleteGoal();
	const completeGoalMutation = useCompleteGoal();
	const createProjectMutation = useCreateProject();
	const deleteProjectMutation = useDeleteProject();
	const createMilestoneMutation = useCreateMilestone();
	const deleteMilestoneMutation = useDeleteMilestone();
	const completeMilestoneMutation = useCompleteMilestone();

	const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
	const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
	const [editingProject, setEditingProject] = useState<Project | null>(null);
	const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
		null,
	);

	const deleteGoalConfirm = useConfirm<Goal>();
	const deleteProjectConfirm = useConfirm<Project>();
	const deleteMilestoneConfirm = useConfirm<Milestone>();

	const [activeGoalForProject, setActiveGoalForProject] = useState<
		string | null
	>(null);
	const [activeProjectForMilestone, setActiveProjectForMilestone] = useState<{
		goalId: string;
		projectId: string;
	} | null>(null);
	const [selectedArea, setSelectedArea] = useState<string>("all");
	const [retrospectiveGoal, setRetrospectiveGoal] = useState<Goal | null>(
		null,
	);

	const { triggerFlight } = useRewardFlight();

	const goalForm = useForm<GoalFormData>({
		resolver: zodResolver(goalSchema),
		defaultValues: {
			title: "",
			description: "",
			area: "mastery",
			category: "learning",
			target_date: "",
		},
	});

	const goalArea = goalForm.watch("area");
	const goalCategory = goalForm.watch("category");

	const projectForm = useForm<ProjectFormData>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			goal_id: "",
			title: "",
			description: "",
			target_date: "",
			order: 0,
		},
	});

	const milestoneForm = useForm<MilestoneFormData>({
		resolver: zodResolver(milestoneSchema),
		defaultValues: {
			goal_id: "",
			project_id: "",
			title: "",
			order: 0,
		},
	});

	const handleCreateGoal = async (data: GoalFormData) => {
		try {
			await createGoalMutation.mutateAsync(data);
			toaster.create({
				title: "Goal Created",
				description: `"${data.title}" added to your life vision.`,
				type: "success",
			});
			setIsCreateGoalOpen(false);
			goalForm.reset();
		} catch (e: any) {
			toaster.create({
				title: "Failed to create goal",
				description: e?.message || "Something went wrong",
				type: "error",
			});
		}
	};

	const handleCreateProject = async (data: ProjectFormData) => {
		try {
			await createProjectMutation.mutateAsync(data);
			toaster.create({
				title: "Project Added",
				description: `"${data.title}" added to the goal.`,
				type: "success",
			});
			setActiveGoalForProject(null);
			projectForm.reset();
		} catch (e: any) {
			toaster.create({
				title: "Failed to add project",
				description: e?.message || "Something went wrong",
				type: "error",
			});
		}
	};

	const handleCreateMilestone = async (data: MilestoneFormData) => {
		try {
			await createMilestoneMutation.mutateAsync(data);
			toaster.create({
				title: "Milestone Added",
				description: `"${data.title}" created.`,
				type: "success",
			});
			setActiveProjectForMilestone(null);
			milestoneForm.reset();
		} catch (e: any) {
			toaster.create({
				title: "Failed to add milestone",
				description: e?.message || "Something went wrong",
				type: "error",
			});
		}
	};

	const handleCompleteMilestone = async (
		milestone: Milestone,
		event?: React.MouseEvent,
	) => {
		try {
			const res = await completeMilestoneMutation.mutateAsync(
				milestone.id,
			);
			if (event) {
				const rect = (
					event.target as HTMLElement
				).getBoundingClientRect();
				triggerFlight({
					sourceX: rect.left + rect.width / 2,
					sourceY: rect.top + rect.height / 2,
					exp: res.exp,
					px: res.px,
				});
			}
			toaster.create({
				title: "Milestone Completed!",
				description: `+${res.exp} EXP, +${res.px} PX`,
				type: "success",
			});
		} catch (e: any) {
			toaster.create({
				title: "Failed to complete milestone",
				description: e?.message || "Something went wrong",
				type: "error",
			});
		}
	};

	const handleCompleteGoal = async (goal: Goal, event?: React.MouseEvent) => {
		try {
			const res = await completeGoalMutation.mutateAsync(goal.id);
			if (event) {
				const rect = (
					event.target as HTMLElement
				).getBoundingClientRect();
				triggerFlight({
					sourceX: rect.left + rect.width / 2,
					sourceY: rect.top + rect.height / 2,
					exp: res.exp,
					px: res.px,
				});
			}
			toaster.create({
				title: "🎉 Goal Accomplished!",
				description: `Claimed +${res.exp} EXP, +${res.px} PX reward!`,
				type: "success",
			});
		} catch (e: any) {
			toaster.create({
				title: "Failed to complete goal",
				description: e?.message || "Something went wrong",
				type: "error",
			});
		}
	};

	const filteredGoals = goals.filter((g) => {
		if (selectedArea === "all") return true;
		return g.goal.area === selectedArea;
	});

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
					<HStack gap={2.5}>
						<Circle
							size="36px"
							bg="lime.500/15"
							color="lime.500"
						>
							<Icon as={LuTarget} boxSize={5} />
						</Circle>
						<Heading size="2xl" fontWeight="bold">
							Goals & Projects
						</Heading>
					</HStack>
					<Text color="fg.muted" fontSize="sm">
						Life Area → Goal → Project → Milestone hierarchy connecting daily quests to long-term vision.
					</Text>
				</VStack>

				<PillButton
					variant="mint"
					size="sm"
					icon={LuPlus}
					onClick={() => {
						goalForm.reset();
						setIsCreateGoalOpen(true);
					}}
				>
					New Goal
				</PillButton>
			</Flex>

			{/* Area Filter Tabs */}
			<HStack gap={2} mb={6} overflowX="auto" py={1}>
				{[
					"all",
					"health",
					"wealth",
					"mastery",
					"personal",
					"social",
				].map((area) => (
					<PillButton
						key={area}
						size="sm"
						noIcon
						variant={selectedArea === area ? "mint" : "outline"}
						colorPalette={selectedArea === area ? "lime" : "gray"}
						onClick={() => setSelectedArea(area)}
						textTransform="capitalize"
					>
						{area}
					</PillButton>
				))}
			</HStack>

			{/* Goal List */}
			{isLoading ? (
				<VStack gap={6} align="stretch">
					<GoalCardSkeleton />
					<GoalCardSkeleton />
				</VStack>
			) : filteredGoals.length === 0 ? (
				<Box {...glassCard} p={12} textAlign="center">
					<VStack gap={4} align="center">
						<Circle size="48px" bg="lime.500/15" color="lime.500">
							<Icon as={LuTarget} boxSize={6} />
						</Circle>
						<VStack gap={1}>
							<Heading size="md" fontWeight="bold">
								No Goals Found
							</Heading>
							<Text fontSize="sm" color="fg.muted" maxW="400px">
								Create a long-term goal to organize step-by-step projects and milestones.
							</Text>
						</VStack>
						<PillButton
							variant="mint"
							size="sm"
							icon={LuPlus}
							onClick={() => {
								goalForm.reset();
								setIsCreateGoalOpen(true);
							}}
						>
							Create First Goal
						</PillButton>
					</VStack>
				</Box>
			) : (
				<VStack gap={6} align="stretch">
					{filteredGoals.map(
						({ goal, projects, milestones, progress }) => {
							const isDone =
								goal.status === "completed" || progress >= 100;

							return (
								<Box
									key={goal.id}
									{...glassCard}
									p={{ base: 5, md: 6 }}
									position="relative"
								>
									{/* Goal Top Row */}
									<Flex
										direction={{
											base: "column",
											md: "row",
										}}
										justify="space-between"
										align={{
											base: "flex-start",
											md: "center",
										}}
										gap={3}
										mb={4}
									>
										<VStack
											align="flex-start"
											gap={1.5}
											flex="1"
										>
											<HStack gap={2} wrap="wrap">
												<Badge
													colorPalette="lime"
													variant="subtle"
													rounded="pill"
													size="sm"
													textTransform="capitalize"
													fontWeight="bold"
												>
													{goal.area}
												</Badge>
												<Badge
													variant="outline"
													rounded="pill"
													size="sm"
													textTransform="capitalize"
												>
													{goal.category}
												</Badge>
												{isDone && (
													<Badge
														colorPalette="lime"
														variant="solid"
														rounded="pill"
														size="sm"
													>
														<Icon as={LuCheck} mr={1} />
														Completed
													</Badge>
												)}
											</HStack>

											<Heading size="lg" fontWeight="bold">
												{goal.title}
											</Heading>
											{goal.description && (
												<Text
													fontSize="sm"
													color="fg.muted"
												>
													{goal.description}
												</Text>
											)}
										</VStack>

										<HStack gap={2.5} wrap="wrap">
											{goal.status !== "completed" &&
												progress >= 100 && (
													<PillButton
														size="xs"
														variant="mint"
														icon={LuAward}
														onClick={(e) =>
															handleCompleteGoal(
																goal,
																e,
															)
														}
													>
														Claim Reward
													</PillButton>
												)}

											<PillButton
												size="xs"
												variant="dark"
												icon={LuHistory}
												onClick={() =>
													setRetrospectiveGoal(goal)
												}
											>
												Retrospective
											</PillButton>

											<IconButton
												size="xs"
												variant="ghost"
												aria-label="Edit goal"
												rounded="full"
												onClick={() =>
													setEditingGoal(goal)
												}
											>
												<Icon as={LuPencil} />
											</IconButton>

											<IconButton
												size="xs"
												variant="ghost"
												colorPalette="red"
												aria-label="Delete goal"
												rounded="full"
												onClick={() =>
													deleteGoalConfirm.ask(goal)
												}
											>
												<Icon as={LuTrash2} />
											</IconButton>
										</HStack>
									</Flex>

									{/* Progress Bar */}
									<Box mb={5}>
										<Flex
											justify="space-between"
											fontSize="xs"
											mb={1.5}
										>
											<Text color="fg.muted" fontWeight="medium">
												Overall Goal Progress
											</Text>
											<Text fontWeight="bold" color="lime.500">
												{Math.round(progress)}%
											</Text>
										</Flex>
										<Progress.Root
											value={progress}
											max={100}
											size="sm"
										>
											<Progress.Track
												bg="bg.muted"
												rounded="full"
											>
												<Progress.Range bg="lime.solid" rounded="full" />
											</Progress.Track>
										</Progress.Root>
									</Box>

									{/* Projects & Milestones Hierarchy */}
									<VStack
										gap={4}
										align="stretch"
										pt={4}
										borderTopWidth="1px"
										borderColor="border.glass"
									>
										<Flex
											justify="space-between"
											align="center"
										>
											<Text
												fontSize="xs"
												fontWeight="bold"
												textTransform="uppercase"
												color="fg.muted"
												letterSpacing="wider"
											>
												Projects & Milestones (
												{projects.length})
											</Text>
											<PillButton
												size="xs"
												variant="outline"
												icon={LuPlus}
												onClick={() => {
													projectForm.reset({
														goal_id: goal.id,
														title: "",
														description: "",
														target_date: "",
														order: 0,
													});
													setActiveGoalForProject(
														goal.id,
													);
												}}
											>
												Add Project
											</PillButton>
										</Flex>

										{projects.length === 0 ? (
											<Box
												p={4}
												rounded="xl"
												bg="bg.panel"
												borderWidth="1px"
												borderColor="border.glass"
												textAlign="center"
											>
												<Text
													fontSize="xs"
													color="fg.muted"
												>
													No projects yet. Add a project to organize step-by-step milestones.
												</Text>
											</Box>
										) : (
											<VStack gap={3.5} align="stretch">
												{projects.map(
													({
														project,
														milestones: pMilestones,
														progress: pProg,
													}) => {
														const completedCount =
															pMilestones.filter(
																(m) =>
																	m.status ===
																	"completed",
															).length;

														return (
															<Box
																key={project.id}
																bg="bg.panel"
																p={4}
																rounded="xl"
																borderWidth="1px"
																borderColor="border.glass"
																shadow="sm"
															>
																<Flex
																	justify="space-between"
																	align="center"
																	wrap="wrap"
																	gap={2}
																	mb={pMilestones.length > 0 ? 3 : 0}
																>
																	<HStack gap={2.5}>
																		<Circle
																			size="28px"
																			bg="lime.500/15"
																			color="lime.500"
																		>
																			<Icon
																				as={
																					LuFolder
																				}
																				boxSize={3.5}
																			/>
																		</Circle>
																		<VStack align="flex-start" gap={0}>
																			<HStack gap={2}>
																				<Text
																					fontWeight="bold"
																					fontSize="sm"
																				>
																					{
																						project.title
																					}
																				</Text>
																				<Badge
																					size="xs"
																					rounded="pill"
																					variant="subtle"
																					colorPalette="lime"
																				>
																					{Math.round(
																						pProg,
																					)}
																					%
																				</Badge>
																			</HStack>
																			{project.description && (
																				<Text
																					fontSize="xs"
																					color="fg.muted"
																				>
																					{project.description}
																				</Text>
																			)}
																		</VStack>
																	</HStack>

																	<HStack gap={2}>
																		<Text
																			fontSize="xs"
																			color="fg.muted"
																		>
																			{completedCount} / {pMilestones.length} done
																		</Text>
																		<PillButton
																			size="xs"
																			variant="dark"
																			icon={LuPlus}
																			onClick={() => {
																				milestoneForm.reset(
																					{
																						goal_id:
																							goal.id,
																						project_id:
																							project.id,
																						title: "",
																						order: 0,
																					},
																				);
																				setActiveProjectForMilestone(
																					{
																						goalId: goal.id,
																						projectId:
																							project.id,
																					},
																				);
																			}}
																		>
																			Milestone
																		</PillButton>
																		<IconButton
																			size="2xs"
																			variant="ghost"
																			aria-label="Edit project"
																			rounded="full"
																			onClick={() =>
																				setEditingProject(
																					project,
																				)
																			}
																		>
																			<Icon
																				as={
																					LuPencil
																				}
																			/>
																		</IconButton>
																		<IconButton
																			size="2xs"
																			variant="ghost"
																			colorPalette="red"
																			aria-label="Delete project"
																			rounded="full"
																			onClick={() =>
																				deleteProjectConfirm.ask(
																					project,
																				)
																			}
																		>
																			<Icon
																				as={
																					LuTrash2
																				}
																			/>
																		</IconButton>
																	</HStack>
																</Flex>

																{/* Milestones inside project */}
																{pMilestones.length >
																	0 && (
																	<VStack
																		gap={2}
																		align="stretch"
																		pt={2}
																		borderTopWidth="1px"
																		borderColor="border.subtle"
																	>
																		{pMilestones.map(
																			(m) => {
																				const isMCompleted =
																					m.status ===
																					"completed";
																				return (
																					<Flex
																						key={
																							m.id
																						}
																						justify="space-between"
																						align="center"
																						p={2.5}
																						px={3}
																						rounded="pill"
																						bg="bg.muted"
																						borderWidth="1px"
																						borderColor={
																							isMCompleted
																								? "lime.500/25"
																								: "border"
																						}
																						transition="all 0.15s ease"
																					>
																						<HStack
																							gap={2.5}
																						>
																							<Circle
																								size="22px"
																								bg={
																									isMCompleted
																										? "lime.500"
																										: "bg.panel"
																								}
																								color={
																									isMCompleted
																										? "black"
																										: "fg.muted"
																								}
																								borderWidth={
																									isMCompleted
																										? "0px"
																										: "1px"
																								}
																								borderColor="border"
																								cursor={
																									isMCompleted
																										? "default"
																										: "pointer"
																								}
																								display="flex"
																								alignItems="center"
																								justifyContent="center"
																								onClick={(
																									e,
																								) => {
																									if (
																										!isMCompleted
																									) {
																										handleCompleteMilestone(
																											m,
																											e,
																										);
																									}
																								}}
																							>
																								{isMCompleted ? (
																									<Icon
																										as={
																											LuCheck
																										}
																										boxSize={3}
																									/>
																								) : (
																									<Icon
																										as={
																											LuFlag
																										}
																										boxSize={2.5}
																									/>
																								)}
																							</Circle>
																							<Text
																								fontSize="xs"
																								fontWeight={
																									isMCompleted
																										? "normal"
																										: "medium"
																								}
																								textDecoration={
																									isMCompleted
																										? "line-through"
																										: "none"
																								}
																								color={
																									isMCompleted
																										? "fg.muted"
																										: "fg"
																								}
																							>
																								{
																									m.title
																								}
																							</Text>
																						</HStack>

																						<HStack gap={1.5}>
																							<HStack
																								gap={1}
																								bg="bg.panel"
																								px={2}
																								py={0.5}
																								rounded="pill"
																								fontSize="10px"
																								color="lime.500"
																								fontWeight="bold"
																							>
																								<Icon
																									as={
																										LuZap
																									}
																									boxSize={2.5}
																								/>
																								<Text>
																									XP & PX
																								</Text>
																							</HStack>
																							<IconButton
																								size="2xs"
																								variant="ghost"
																								aria-label="Edit milestone"
																								rounded="full"
																								onClick={() =>
																									setEditingMilestone(
																										m,
																									)
																								}
																							>
																								<Icon
																									as={
																										LuPencil
																									}
																									boxSize={2.5}
																								/>
																							</IconButton>
																							<IconButton
																								size="2xs"
																								variant="ghost"
																								colorPalette="red"
																								aria-label="Delete milestone"
																								rounded="full"
																								onClick={() =>
																									deleteMilestoneConfirm.ask(
																										m,
																									)
																								}
																							>
																								<Icon
																									as={
																										LuTrash2
																									}
																									boxSize={2.5}
																								/>
																							</IconButton>
																						</HStack>
																					</Flex>
																				);
																			},
																		)}
																	</VStack>
																)}
															</Box>
														);
													},
												)}
											</VStack>
										)}
									</VStack>
								</Box>
							);
						},
					)}
				</VStack>
			)}

			{/* Create Goal Dialog */}
			<DialogRoot
				open={isCreateGoalOpen}
				onOpenChange={(e) => setIsCreateGoalOpen(e.open)}
			>
				<DialogContent>
					<form onSubmit={goalForm.handleSubmit(handleCreateGoal)}>
						<DialogHeader>
							<DialogTitle>Create New Life Goal</DialogTitle>
							<DialogDescription>
								Define an inspiring long-term outcome. Break it
								into projects & milestones.
							</DialogDescription>
						</DialogHeader>

						<DialogBody>
							<VStack gap={4} align="stretch">
								<Field
									label="Goal Title"
									required
									invalid={Boolean(
										goalForm.formState.errors.title,
									)}
									errorText={
										goalForm.formState.errors.title?.message
									}
								>
									<Input
										{...goalForm.register("title")}
										placeholder="e.g. Become conversational in Japanese"
										rounded="pill"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
									/>
								</Field>

								<Field label="Description">
									<Textarea
										{...goalForm.register("description")}
										placeholder="Why this goal matters..."
										rounded="xl"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
										rows={2}
									/>
								</Field>

								<SimpleGrid columns={{ base: 1, sm: 2 }} gap={3} w="full">
									<Field label="Life Area" required>
										<SearchableSelect
											items={LIFE_AREAS}
											value={goalArea}
											onValueChange={(val) =>
												goalForm.setValue(
													"area",
													val as LifeArea,
													{ shouldValidate: true },
												)
											}
											placeholder="Select Life Area"
										/>
									</Field>

									<Field label="Category" required>
										<SearchableSelect
											items={GOAL_CATEGORIES}
											value={goalCategory}
											onValueChange={(val) =>
												goalForm.setValue(
													"category",
													val as any,
													{ shouldValidate: true },
												)
											}
											placeholder="Select Category"
										/>
									</Field>
								</SimpleGrid>

								<Field label="Target Date">
									<Input
										type="date"
										{...goalForm.register("target_date")}
										rounded="pill"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
									/>
								</Field>
							</VStack>
						</DialogBody>

						<DialogFooter>
							<DialogActionTrigger asChild>
								<Button variant="outline">Cancel</Button>
							</DialogActionTrigger>
							<Button
								type="submit"
								colorPalette="lime"
								loading={createGoalMutation.isPending}
							>
								Create Goal
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</DialogRoot>

			{/* Create Project Dialog */}
			<DialogRoot
				open={!!activeGoalForProject}
				onOpenChange={() => setActiveGoalForProject(null)}
			>
				<DialogContent>
					<form
						onSubmit={projectForm.handleSubmit(handleCreateProject)}
					>
						<DialogHeader>
							<DialogTitle>Add Project to Goal</DialogTitle>
							<DialogDescription>
								A project groups sequential milestones toward
								the goal.
							</DialogDescription>
						</DialogHeader>

						<DialogBody>
							<VStack gap={4} align="stretch">
								<Field
									label="Project Title"
									required
									invalid={Boolean(
										projectForm.formState.errors.title,
									)}
									errorText={
										projectForm.formState.errors.title
											?.message
									}
								>
									<Input
										{...projectForm.register("title")}
										placeholder="e.g. Complete beginner curriculum"
										rounded="pill"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
									/>
								</Field>
								<Field label="Description">
									<Textarea
										{...projectForm.register("description")}
										placeholder="Scope of this project..."
										rounded="xl"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
										rows={2}
									/>
								</Field>
								<Field label="Target Date">
									<Input
										type="date"
										{...projectForm.register("target_date")}
										rounded="pill"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
									/>
								</Field>
							</VStack>
						</DialogBody>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setActiveGoalForProject(null)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								colorPalette="lime"
								loading={createProjectMutation.isPending}
							>
								Add Project
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</DialogRoot>

			{/* Create Milestone Dialog */}
			<DialogRoot
				open={!!activeProjectForMilestone}
				onOpenChange={() => setActiveProjectForMilestone(null)}
			>
				<DialogContent>
					<form
						onSubmit={milestoneForm.handleSubmit(
							handleCreateMilestone,
						)}
					>
						<DialogHeader>
							<DialogTitle>Add Milestone to Project</DialogTitle>
							<DialogDescription>
								A milestone is a concrete accomplishment that
								awards XP & PX.
							</DialogDescription>
						</DialogHeader>

						<DialogBody>
							<VStack gap={4} align="stretch">
								<Field
									label="Milestone Title"
									required
									invalid={Boolean(
										milestoneForm.formState.errors.title,
									)}
									errorText={
										milestoneForm.formState.errors.title
											?.message
									}
								>
									<Input
										{...milestoneForm.register("title")}
										placeholder="e.g. Finish units 1–5"
										rounded="pill"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
									/>
								</Field>
							</VStack>
						</DialogBody>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() =>
									setActiveProjectForMilestone(null)
								}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								colorPalette="lime"
								loading={createMilestoneMutation.isPending}
							>
								Add Milestone
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</DialogRoot>

			{/* Goal Retrospective Dialog */}
			<GoalRetrospectiveDialog
				isOpen={!!retrospectiveGoal}
				onClose={() => setRetrospectiveGoal(null)}
				goal={retrospectiveGoal}
			/>

			{/* Edit Goal Dialog */}
			<EditGoalDialog
				goal={editingGoal}
				isOpen={!!editingGoal}
				onClose={() => setEditingGoal(null)}
			/>

			{/* Edit Project Dialog */}
			<EditProjectDialog
				project={editingProject}
				isOpen={!!editingProject}
				onClose={() => setEditingProject(null)}
			/>

			{/* Edit Milestone Dialog */}
			<EditMilestoneDialog
				milestone={editingMilestone}
				isOpen={!!editingMilestone}
				onClose={() => setEditingMilestone(null)}
			/>

			{/* Delete Goal Confirmation */}
			<ConfirmDialog
				open={deleteGoalConfirm.open}
				onOpenChange={deleteGoalConfirm.onOpenChange}
				title="Delete Goal"
				description={
					deleteGoalConfirm.target ? (
						<>
							Are you sure you want to delete goal{" "}
							<strong>"{deleteGoalConfirm.target.title}"</strong> and all its child projects and milestones? This action cannot be undone.
						</>
					) : (
						"Are you sure you want to delete this goal?"
					)
				}
				confirmLabel="Delete Goal"
				destructive
				loading={deleteGoalMutation.isPending}
				onConfirm={async () => {
					if (deleteGoalConfirm.target) {
						await deleteGoalMutation.mutateAsync(
							deleteGoalConfirm.target.id,
						);
						deleteGoalConfirm.close();
					}
				}}
			/>

			{/* Delete Project Confirmation */}
			<ConfirmDialog
				open={deleteProjectConfirm.open}
				onOpenChange={deleteProjectConfirm.onOpenChange}
				title="Delete Project"
				description={
					deleteProjectConfirm.target ? (
						<>
							Are you sure you want to delete project{" "}
							<strong>"{deleteProjectConfirm.target.title}"</strong> and its milestones?
						</>
					) : (
						"Are you sure you want to delete this project?"
					)
				}
				confirmLabel="Delete Project"
				destructive
				loading={deleteProjectMutation.isPending}
				onConfirm={async () => {
					if (deleteProjectConfirm.target) {
						await deleteProjectMutation.mutateAsync(
							deleteProjectConfirm.target.id,
						);
						deleteProjectConfirm.close();
					}
				}}
			/>

			{/* Delete Milestone Confirmation */}
			<ConfirmDialog
				open={deleteMilestoneConfirm.open}
				onOpenChange={deleteMilestoneConfirm.onOpenChange}
				title="Delete Milestone"
				description={
					deleteMilestoneConfirm.target ? (
						<>
							Are you sure you want to delete milestone{" "}
							<strong>"{deleteMilestoneConfirm.target.title}"</strong>?
						</>
					) : (
						"Are you sure you want to delete this milestone?"
					)
				}
				confirmLabel="Delete Milestone"
				destructive
				loading={deleteMilestoneMutation.isPending}
				onConfirm={async () => {
					if (deleteMilestoneConfirm.target) {
						await deleteMilestoneMutation.mutateAsync(
							deleteMilestoneConfirm.target.id,
						);
						deleteMilestoneConfirm.close();
					}
				}}
			/>
		</Box>
	);
};

export default GoalsRoute;
