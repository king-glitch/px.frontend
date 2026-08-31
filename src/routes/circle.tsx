import {
	useAcceptCircleInvite,
	useCircleActivities,
	useCircleInvites,
	useClaimWeeklyCircleReward,
	useCreateCircle,
	useCreateCircleInvite,
	useCurrentCircle,
	useLeaveCircle,
	useNudgeMember,
	useReactToActivity,
	useRemoveCircleMember,
	useSetCircleGoal,
} from "@/api/hooks/use-game";
import {
	createCircleGoalSchema,
	createCircleSchema,
	inviteMemberSchema,
	type CreateCircleFormData,
	type CreateCircleGoalFormData,
	type InviteMemberFormData,
} from "@/api/schemas";
import type { CircleReactionType } from "@/api/types";
import { Avatar } from "@/components/ui/avatar";
import { Field } from "@/components/ui/field";
import { PillButton } from "@/components/ui/pill-button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toaster } from "@/components/ui/toaster";
import {
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
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
	LuCopy,
	LuHeart,
	LuLogOut,
	LuMessageSquare,
	LuPlus,
	LuSend,
	LuShield,
	LuSparkles,
	LuTrendingUp,
	LuUserCheck,
	LuUserPlus,
	LuUsers,
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

const tierThresholds = [
	{ tier: "connected", name: "Connected", days: 6, xpBonus: 2, pxBonus: 0 },
	{ tier: "steady", name: "Steady", days: 15, xpBonus: 4, pxBonus: 2 },
	{ tier: "strong", name: "Strong", days: 24, xpBonus: 6, pxBonus: 3 },
	{ tier: "thriving", name: "Thriving", days: 32, xpBonus: 8, pxBonus: 5 },
];

const reactionIcons: Record<CircleReactionType, string> = {
	cheer: "🎉",
	fire: "🔥",
	clap: "👏",
	heart: "❤️",
	muscle: "💪",
};

const CIRCLE_GOAL_TYPES = [
	{
		label: "Consistency (20 Contribution Days)",
		value: "consistency",
		description: "Daily quest activity across all members",
	},
	{
		label: "Balance (5 Disciplines Active)",
		value: "balance",
		description: "Broad category distribution throughout the week",
	},
	{
		label: "Progress (3 Milestones Moved)",
		value: "progress",
		description: "Move long-term projects and milestones",
	},
	{
		label: "Recovery (4 Planned Rest/Recovery)",
		value: "recovery",
		description: "Protect health, rest days, and avoid burnout",
	},
	{
		label: "Reflection (4 Weekly Reviews)",
		value: "reflection",
		description: "Complete mindful weekly progress reviews",
	},
];

export const CircleRoute: React.FC = () => {
	const { data: circleData, isLoading } = useCurrentCircle();
	const { data: activities = [] } = useCircleActivities();
	const { data: invites = [] } = useCircleInvites();

	const createCircleMutation = useCreateCircle();
	const acceptInviteMutation = useAcceptCircleInvite();
	const createInviteMutation = useCreateCircleInvite();
	const leaveCircleMutation = useLeaveCircle();
	const removeMemberMutation = useRemoveCircleMember();
	const reactMutation = useReactToActivity();
	const nudgeMutation = useNudgeMember();
	const setGoalMutation = useSetCircleGoal();
	const claimRewardMutation = useClaimWeeklyCircleReward();

	// Modals state
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isInviteOpen, setIsInviteOpen] = useState(false);
	const [isGoalOpen, setIsGoalOpen] = useState(false);
	const [joinCode, setJoinCode] = useState("");
	const [copiedCode, setCopiedCode] = useState("");

	const createForm = useForm<CreateCircleFormData>({
		resolver: zodResolver(createCircleSchema),
		defaultValues: { name: "", description: "", motto: "" },
	});

	const inviteForm = useForm<InviteMemberFormData>({
		resolver: zodResolver(inviteMemberSchema),
		defaultValues: { invitee_username: "" },
	});

	const goalForm = useForm<CreateCircleGoalFormData>({
		resolver: zodResolver(createCircleGoalSchema),
		defaultValues: { goal_type: "consistency" },
	});

	const goalType = goalForm.watch("goal_type");

	const handleCreateCircle = async (data: CreateCircleFormData) => {
		try {
			await createCircleMutation.mutateAsync(data);
			setIsCreateOpen(false);
			toaster.create({ title: "Circle Created!", type: "success" });
		} catch (err: any) {
			toaster.create({
				title: err?.message || "Failed to create Circle",
				type: "error",
			});
		}
	};

	const handleJoinInvite = async () => {
		if (!joinCode.trim()) return;
		try {
			await acceptInviteMutation.mutateAsync(joinCode.trim());
			setJoinCode("");
			toaster.create({
				title: "Welcome to the Circle!",
				type: "success",
			});
		} catch (err: any) {
			toaster.create({
				title: err?.message || "Invalid or expired invite code",
				type: "error",
			});
		}
	};

	const handleSendInvite = async (data: InviteMemberFormData) => {
		try {
			const res = await createInviteMutation.mutateAsync(data);
			setCopiedCode(res.invite_code);
			toaster.create({
				title: `Invite code: ${res.invite_code}`,
				type: "success",
			});
		} catch (err: any) {
			toaster.create({
				title: err?.message || "Failed to create invite",
				type: "error",
			});
		}
	};

	const handleCopy = (code: string) => {
		navigator.clipboard.writeText(code);
		setCopiedCode(code);
		toaster.create({
			title: "Invite code copied to clipboard",
			type: "info",
		});
	};

	const handleNudge = async (targetUserId: string) => {
		try {
			await nudgeMutation.mutateAsync(targetUserId);
			toaster.create({
				title: "Supportive nudge sent!",
				type: "success",
			});
		} catch (err: any) {
			toaster.create({
				title: err?.message || "Nudge available once per 24 hours",
				type: "info",
			});
		}
	};

	const handleSetGoal = async (data: CreateCircleGoalFormData) => {
		try {
			await setGoalMutation.mutateAsync(data);
			setIsGoalOpen(false);
			toaster.create({
				title: "Weekly Circle Goal set!",
				type: "success",
			});
		} catch (err: any) {
			toaster.create({
				title: err?.message || "Failed to set goal",
				type: "error",
			});
		}
	};

	const handleClaimWeeklyReward = async (weekId: string) => {
		try {
			await claimRewardMutation.mutateAsync(weekId);
			toaster.create({
				title: "Weekly Circle Bonus Claimed!",
				type: "success",
			});
		} catch (err: any) {
			toaster.create({
				title: err?.message || "Failed to claim reward",
				type: "error",
			});
		}
	};

	if (isLoading) {
		return (
			<Box flex="1" pb={12}>
				<VStack gap={6} align="stretch">
					{/* Header Skeleton */}
					<Flex
						direction={{ base: "column", md: "row" }}
						justify="space-between"
						align={{ base: "flex-start", md: "center" }}
						gap={4}
					>
						<HStack gap={3}>
							<Skeleton h="36px" w="36px" rounded="full" />
							<VStack align="flex-start" gap={2}>
								<Skeleton h="24px" w="180px" rounded="md" />
								<Skeleton h="14px" w="240px" rounded="md" />
							</VStack>
						</HStack>
						<HStack gap={2}>
							<Skeleton h="32px" w="100px" rounded="pill" />
							<Skeleton h="32px" w="110px" rounded="pill" />
						</HStack>
					</Flex>

					{/* Roster & Squad Matrix Skeleton */}
					<Box {...glassCard} p={6}>
						<Flex justify="space-between" align="center" mb={5}>
							<HStack gap={2}>
								<Skeleton h="16px" w="120px" rounded="md" />
								<Skeleton h="20px" w="50px" rounded="pill" />
							</HStack>
							<Skeleton h="20px" w="100px" rounded="pill" />
						</Flex>
						<SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} gap={3}>
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<VStack
									key={i}
									p={3}
									rounded="xl"
									bg="bg.panel"
									borderWidth="1px"
									borderColor="border.glass"
									gap={2}
									align="center"
								>
									<Skeleton h="40px" w="40px" rounded="full" />
									<Skeleton h="14px" w="60px" rounded="md" />
									<Skeleton h="10px" w="45px" rounded="pill" />
								</VStack>
							))}
						</SimpleGrid>
					</Box>

					{/* Tier Milestone Gauge Skeleton */}
					<Box {...glassCard} p={6}>
						<Flex justify="space-between" align="center" mb={4}>
							<VStack align="flex-start" gap={1}>
								<Skeleton h="18px" w="150px" rounded="md" />
								<Skeleton h="12px" w="200px" rounded="md" />
							</VStack>
							<Skeleton h="24px" w="80px" rounded="pill" />
						</Flex>
						<Skeleton h="10px" w="100%" rounded="full" mb={4} />
						<SimpleGrid columns={{ base: 2, md: 4 }} gap={2}>
							{[1, 2, 3, 4].map((i) => (
								<Skeleton key={i} h="36px" rounded="lg" />
							))}
						</SimpleGrid>
					</Box>
				</VStack>
			</Box>
		);
	}

	// Unenrolled State: Create or Join
	if (!circleData) {
		return (
			<Box flex="1" pb={12}>
				{/* Page Header */}
				<Flex
					direction={{ base: "column", md: "row" }}
					justify="space-between"
					align={{ base: "flex-start", md: "center" }}
					gap={4}
					mb={8}
				>
					<VStack align="flex-start" gap={1}>
						<HStack gap={2}>
							<Circle
								size="32px"
								bg="lime.500/15"
								color="lime.500"
							>
								<Icon as={LuUsers} boxSize={5} />
							</Circle>
							<Heading size="xl" fontWeight="bold">
								Co-op Circle
							</Heading>
						</HStack>
						<Text color="fg.muted" fontSize="sm">
							A permanent, private 6-person group for family or close friends to stay consistent together.
						</Text>
					</VStack>
				</Flex>

				<SimpleGrid
					columns={{ base: 1, md: 2 }}
					gap={6}
					w="full"
					maxW="4xl"
					mx="auto"
					mt={4}
				>
					{/* Create Circle Card */}
					<Box {...glassCard} p={{ base: 5, md: 6 }}>
						<VStack align="start" gap={4} h="full" justify="space-between">
							<VStack align="start" gap={3}>
								<HStack gap={3}>
									<Circle size="40px" bg="lime.500/15" color="lime.500">
										<Icon as={LuPlus} boxSize={5} />
									</Circle>
									<VStack align="start" gap={0}>
										<Heading size="md">Create a Circle</Heading>
										<Text fontSize="xs" color="fg.muted">
											Lead a new private 6-member co-op group
										</Text>
									</VStack>
								</HStack>
								<Text fontSize="sm" color="fg.muted">
									Start a private circle as the owner, invite your inner circle, and unlock shared weekly XP & PX momentum bonuses.
								</Text>
							</VStack>
							<Button
								colorPalette="lime"
								w="full"
								rounded="full"
								onClick={() => setIsCreateOpen(true)}
							>
								<Icon as={LuPlus} mr={1} /> Create Circle
							</Button>
						</VStack>
					</Box>

					{/* Join with Invite Code Card */}
					<Box {...glassCard} p={{ base: 5, md: 6 }}>
						<VStack align="start" gap={4} h="full" justify="space-between">
							<VStack align="start" gap={3} w="full">
								<HStack gap={3}>
									<Circle size="40px" bg="bg.muted" color="fg">
										<Icon as={LuUserPlus} boxSize={5} />
									</Circle>
									<VStack align="start" gap={0}>
										<Heading size="md">Join with Invite Code</Heading>
										<Text fontSize="xs" color="fg.muted">
											Enter an 8-character invitation code
										</Text>
									</VStack>
								</HStack>
								<Text fontSize="sm" color="fg.muted">
									Received an invite code from a friend or family member? Enter it below to join their circle.
								</Text>
							</VStack>
							<HStack w="full" gap={2}>
								<Input
									placeholder="e.g. A1B2C3D4"
									value={joinCode}
									onChange={(e) => setJoinCode(e.target.value)}
									rounded="full"
									bg="bg.muted"
								/>
								<Button
									colorPalette="lime"
									rounded="full"
									px={6}
									onClick={handleJoinInvite}
									loading={acceptInviteMutation.isPending}
								>
									Join
								</Button>
							</HStack>
						</VStack>
					</Box>
				</SimpleGrid>

				{/* Create Circle Dialog */}
				<DialogRoot
					open={isCreateOpen}
					onOpenChange={(e) => setIsCreateOpen(e.open)}
				>
					<DialogContent bg="bg.panel" backdropFilter="blur(20px)">
						<form
							onSubmit={createForm.handleSubmit(handleCreateCircle)}
						>
							<DialogHeader>
								<DialogTitle>Create Your Circle</DialogTitle>
							</DialogHeader>
							<DialogBody>
								<VStack gap={4} align="stretch">
									<Field
										label="Circle Name"
										required
										invalid={Boolean(
											createForm.formState.errors.name,
										)}
										errorText={
											createForm.formState.errors.name
												?.message
										}
									>
										<Input
											{...createForm.register("name")}
											placeholder="e.g. The Vanguard"
											rounded="pill"
											bg="bg.muted"
											borderColor="border"
											fontSize="sm"
										/>
									</Field>
									<Field label="Motto / Focus">
										<Input
											{...createForm.register("motto")}
											placeholder="e.g. Daily consistency together"
											rounded="pill"
											bg="bg.muted"
											borderColor="border"
											fontSize="sm"
										/>
									</Field>
									<Field label="Description">
										<Textarea
											{...createForm.register(
												"description",
											)}
											placeholder="Purpose of this circle..."
											rounded="xl"
											bg="bg.muted"
											borderColor="border"
											fontSize="sm"
											rows={2}
										/>
									</Field>
								</VStack>
							</DialogBody>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsCreateOpen(false)}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									colorPalette="lime"
									loading={createCircleMutation.isPending}
								>
									Create
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</DialogRoot>
			</Box>
		);
	}

	const circle = circleData.circle;
	const members = circleData.members;
	const currentWeek = circleData.current_week;
	const activeGoal = circleData.active_goal;
	const isLeader =
		circleData.my_role === "owner" || circleData.my_role === "co_owner";

	// Calculate Bond XP bar
	const nextLevelXP = circle.level * 500;
	const currentBondProgress = Math.min(
		100,
		Math.round(((circle.bond_xp % 500) / 500) * 100),
	);

	return (
		<Box flex="1" pb={12}>
			<VStack gap={6} align="stretch">
				{/* Circle Header Card */}
				<Box {...glassCard} p={{ base: 4, md: 6 }}>
					<Flex
						justify="space-between"
						align={{ base: "start", md: "center" }}
						direction={{ base: "column", md: "row" }}
						gap={4}
					>
						<VStack align="start" gap={2} flex={1}>
							<HStack gap={3} wrap="wrap">
								<Circle size="36px" bg="lime.500/15" color="lime.500">
									<Icon as={LuShield} boxSize={5} />
								</Circle>
								<Heading size="xl" fontWeight="bold">{circle.name}</Heading>
								<Badge colorPalette="lime" size="sm" variant="solid">
									Bond Lv. {circle.level}
								</Badge>
								<Badge colorPalette="lime" size="sm" variant="subtle">
									<Icon as={LuZap} mr={1} /> +{circleData.together_bonus_percent}% Together XP
								</Badge>
							</HStack>

							{circle.motto && (
								<Text
									fontSize="sm"
									color="fg.muted"
									fontStyle="italic"
								>
									"{circle.motto}"
								</Text>
							)}

							<HStack gap={4} w="full" maxW="lg" mt={1}>
								<Text
									fontSize="xs"
									color="fg.muted"
									minW="90px"
									fontWeight="medium"
								>
									Bond XP ({circle.bond_xp} XP)
								</Text>
								<Progress.Root
									value={currentBondProgress}
									size="sm"
									flex={1}
								>
									<Progress.Track bg="bg.subtle" rounded="full">
										<Progress.Range bg="lime.solid" />
									</Progress.Track>
								</Progress.Root>
							</HStack>
						</VStack>

						<HStack gap={2.5}>
							<Button
								size="sm"
								colorPalette="lime"
								rounded="full"
								onClick={() => setIsInviteOpen(true)}
							>
								<Icon as={LuUserPlus} /> Invite ({members.length}/6)
							</Button>
							<Button
								size="sm"
								variant="outline"
								colorPalette="gray"
								rounded="full"
								onClick={() => leaveCircleMutation.mutate()}
								loading={leaveCircleMutation.isPending}
							>
								<Icon as={LuLogOut} /> Leave
							</Button>
						</HStack>
					</Flex>
				</Box>

				{/* Weekly Momentum & Shared Goal Section */}
				<SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
					{/* Weekly Momentum Meter */}
					<Box
						{...glassCard}
						p={{ base: 4, md: 6 }}
						gridColumn={{ base: "span 1", lg: "span 2" }}
					>
						<VStack align="start" gap={4}>
							<Flex
								justify="space-between"
								align="center"
								w="full"
								wrap="wrap"
								gap={2}
							>
								<HStack gap={2}>
									<Circle size="28px" bg="lime.500/15" color="lime.500">
										<Icon as={LuTrendingUp} boxSize={4} />
									</Circle>
									<Heading size="md">Weekly Momentum</Heading>
								</HStack>
								<Badge
									colorPalette="lime"
									size="sm"
									variant="solid"
								>
									{currentWeek.momentum_tier.toUpperCase()} TIER ({currentWeek.contribution_days} contribution days)
								</Badge>
							</Flex>
							<Text fontSize="xs" color="fg.muted">
								Each member completing a qualifying daily quest adds 1 contribution day. Shared bonuses unlock at tier thresholds:
							</Text>

							{/* Tier Gauges */}
							<SimpleGrid columns={{ base: 2, sm: 4 }} gap={2.5} w="full">
								{tierThresholds.map((t) => {
									const isAchieved =
										currentWeek.contribution_days >= t.days;
									return (
										<Box
											key={t.tier}
											p={3}
											rounded="xl"
											borderWidth="1px"
											borderColor={
												isAchieved
													? "lime.500/40"
													: "border.subtle"
											}
											bg={
												isAchieved
													? "lime.500/10"
													: "bg.muted"
											}
											transition="all 0.15s ease-out"
										>
											<Text
												fontSize="xs"
												fontWeight="bold"
												color={
													isAchieved
														? "lime.500"
														: "fg.muted"
												}
											>
												{t.name}
											</Text>
											<Text
												fontSize="11px"
												color="fg.muted"
											>
												{t.days} Days
											</Text>
											<Text
												fontSize="11px"
												color={
													isAchieved
														? "lime.500"
														: "fg.muted"
												}
												fontWeight={isAchieved ? "bold" : "normal"}
												mt={1}
											>
												+{t.xpBonus}% XP {t.pxBonus > 0 && `& +${t.pxBonus}% PX`}
											</Text>
										</Box>
									);
								})}
							</SimpleGrid>

							{/* Reward Claim Button */}
							{currentWeek.momentum_tier !== "none" && (
								<Flex justify="flex-end" w="full" mt={1}>
									<Button
										size="sm"
										colorPalette="lime"
										rounded="full"
										onClick={() =>
											handleClaimWeeklyReward(
												currentWeek.week_id,
											)
										}
										loading={claimRewardMutation.isPending}
									>
										<Icon as={LuAward} mr={1} /> Claim Weekly Bonus
									</Button>
								</Flex>
							)}
						</VStack>
					</Box>

					{/* Shared Goal Card */}
					<Box
						{...glassCard}
						p={{ base: 4, md: 6 }}
					>
						<VStack
							align="start"
							gap={3}
							h="full"
							justify="space-between"
						>
							<VStack align="start" gap={2} w="full">
								<Flex justify="space-between" align="center" w="full">
									<HStack gap={2}>
										<Circle size="28px" bg="lime.500/15" color="lime.500">
											<Icon as={LuSparkles} boxSize={4} />
										</Circle>
										<Heading size="md">Shared Goal</Heading>
									</HStack>
									{isLeader && (
										<Button
											size="xs"
											variant="ghost"
											colorPalette="lime"
											onClick={() => setIsGoalOpen(true)}
										>
											Set Goal
										</Button>
									)}
								</Flex>

								{activeGoal ? (
									<VStack
										align="start"
										gap={2.5}
										w="full"
										mt={2}
									>
										<Badge colorPalette="lime" size="sm" variant="subtle">
											{activeGoal.goal_type.toUpperCase()}
										</Badge>
										<Text fontSize="sm" fontWeight="medium">
											Target: {activeGoal.target} collective actions
										</Text>
										<Progress.Root
											value={Math.min(
												100,
												(activeGoal.current_progress /
													activeGoal.target) *
													100,
											)}
											size="sm"
											w="full"
										>
											<Progress.Track bg="bg.subtle" rounded="full">
												<Progress.Range bg="lime.solid" />
											</Progress.Track>
										</Progress.Root>
										<HStack
											justify="space-between"
											w="full"
											fontSize="xs"
											color="fg.muted"
										>
											<Text>
												Progress: {activeGoal.current_progress}/{activeGoal.target}
											</Text>
											<Text color="lime.500" fontWeight="bold">
												+{activeGoal.reward_xp} XP, +{activeGoal.reward_px} PX
											</Text>
										</HStack>
									</VStack>
								) : (
									<Box py={6} textAlign="center" w="full">
										<Text fontSize="xs" color="fg.muted">
											No active shared goal this week.
										</Text>
										{isLeader && (
											<Button
												size="xs"
												colorPalette="lime"
												rounded="full"
												mt={3}
												onClick={() =>
													setIsGoalOpen(true)
												}
											>
												Choose Weekly Goal
											</Button>
										)}
									</Box>
								)}
							</VStack>
						</VStack>
					</Box>
				</SimpleGrid>

				{/* 6-Member Roster */}
				<VStack align="start" gap={3}>
					<Heading size="md">
						Circle Roster ({members.length}/6)
					</Heading>
					<SimpleGrid
						columns={{ base: 1, sm: 2, md: 3 }}
						gap={4}
						w="full"
					>
						{Array.from({ length: 6 }).map((_, idx) => {
							const m = members[idx];
							if (!m) {
								return (
									<Box
										key={`slot-${idx}`}
										{...glassCard}
										borderStyle="dashed"
										borderColor="border.subtle"
										p={5}
										textAlign="center"
									>
										<VStack gap={2} py={3}>
											<Icon
												as={LuUserPlus}
												color="fg.muted"
												boxSize={5}
											/>
											<Text
												fontSize="xs"
												color="fg.muted"
												fontWeight="medium"
											>
												Open Member Slot
											</Text>
											<Button
												size="xs"
												variant="ghost"
												colorPalette="lime"
												onClick={() =>
													setIsInviteOpen(true)
												}
											>
												Invite
											</Button>
										</VStack>
									</Box>
								);
							}

							return (
								<Box
									key={m.member.id}
									{...glassCard}
									p={4.5}
								>
									<VStack align="start" gap={3}>
										<Flex
											justify="space-between"
											align="center"
											w="full"
										>
											<HStack gap={2.5}>
												<Avatar size="sm" name={m.username} />
												<VStack align="start" gap={0}>
													<Text
														fontSize="sm"
														fontWeight="bold"
													>
														{m.username}
													</Text>
													<Badge
														size="xs"
														colorPalette={
															m.member.role === "owner"
																? "lime"
																: "gray"
														}
														variant="subtle"
													>
														{m.member.role}
													</Badge>
												</VStack>
											</HStack>
											<Button
												size="xs"
												variant="ghost"
												colorPalette="lime"
												onClick={() =>
													handleNudge(
														m.member.user_id,
													)
												}
											>
												<Icon as={LuSend} mr={1} /> Nudge
											</Button>
										</Flex>

										<HStack
											justify="space-between"
											w="full"
											fontSize="xs"
											color="fg.muted"
										>
											<Text textTransform="capitalize">{m.broad_status}</Text>
											<Text fontWeight="medium">
												{m.contribution_count_this_week} days this week
											</Text>
										</HStack>

										{m.is_eligible_for_reward && (
											<Badge
												size="xs"
												colorPalette="lime"
												variant="subtle"
											>
												<Icon as={LuUserCheck} mr={1} /> Reward Eligible
											</Badge>
										)}
									</VStack>
								</Box>
							);
						})}
					</SimpleGrid>
				</VStack>

				{/* Activity Feed */}
				<Box {...glassCard} p={{ base: 4, md: 6 }}>
					<VStack align="start" gap={4}>
						<HStack gap={2}>
							<Circle size="28px" bg="lime.500/15" color="lime.500">
								<Icon as={LuMessageSquare} boxSize={4} />
							</Circle>
							<Heading size="md">Circle Activity Stream</Heading>
						</HStack>

						<VStack gap={2.5} align="stretch" w="full">
							{activities.length === 0 ? (
								<Text
									fontSize="xs"
									color="fg.muted"
									py={4}
									textAlign="center"
								>
									No activity yet. Complete quests to record daily contributions!
								</Text>
							) : (
								activities.map((item) => (
									<Box
										key={item.activity.id}
										p={3}
										rounded="xl"
										bg="bg.muted"
										borderWidth="1px"
										borderColor="border.glass"
									>
										<Flex
											justify="space-between"
											align="center"
											wrap="wrap"
											gap={2}
										>
											<Text fontSize="xs">
												<Text
													as="span"
													fontWeight="bold"
													color="lime.500"
												>
													@{item.username}
												</Text>{" "}
												{item.activity.message_template}
											</Text>
											{/* Reaction Bar */}
											<HStack gap={1}>
												{(
													[
														"cheer",
														"fire",
														"clap",
														"heart",
														"muscle",
													] as CircleReactionType[]
												).map((rx) => {
													const count =
														item.activity.reactions?.[rx] || 0;
													return (
														<Button
															key={rx}
															size="2xs"
															variant={
																count > 0
																	? "solid"
																	: "ghost"
															}
															colorPalette="lime"
															onClick={() =>
																reactMutation.mutate({
																	activity_id:
																		item.activity.id,
																	reaction: rx,
																})
															}
														>
															{reactionIcons[rx]}{" "}
															{count > 0 && count}
														</Button>
													);
												})}
											</HStack>
										</Flex>
									</Box>
								))
							)}
						</VStack>
					</VStack>
				</Box>
			</VStack>

			{/* Invite Modal */}
			<DialogRoot
				open={isInviteOpen}
				onOpenChange={(e) => setIsInviteOpen(e.open)}
			>
				<DialogContent bg="bg.panel" backdropFilter="blur(20px)">
					<form onSubmit={inviteForm.handleSubmit(handleSendInvite)}>
						<DialogHeader>
							<DialogTitle>Invite to Circle</DialogTitle>
						</DialogHeader>
						<DialogBody>
							<VStack gap={4} align="stretch">
								<Text fontSize="sm" color="fg.muted">
									Generate an invite code to share with your friends or family. Codes expire after 7 days.
								</Text>
								<Field label="Username (Optional)">
									<Input
										{...inviteForm.register("invitee_username")}
										placeholder="e.g. alex"
										rounded="pill"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
									/>
								</Field>

								{/* Active Pending Invites */}
								{invites.length > 0 && (
									<VStack
										align="start"
										gap={2}
										w="full"
										mt={2}
									>
										<Text fontSize="xs" fontWeight="bold">
											Active Pending Invites:
										</Text>
										{invites.map((inv) => (
											<HStack
												key={inv.id}
												justify="space-between"
												w="full"
												p={2.5}
												bg="bg.muted"
												rounded="lg"
											>
												<Text
													fontSize="sm"
													fontFamily="mono"
													fontWeight="bold"
													color="lime.500"
												>
													{inv.invite_code}
												</Text>
												<Button
													size="xs"
													variant="outline"
													onClick={() =>
														handleCopy(inv.invite_code)
													}
												>
													<Icon as={LuCopy} mr={1} /> Copy
												</Button>
											</HStack>
										))}
									</VStack>
								)}
							</VStack>
						</DialogBody>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsInviteOpen(false)}
							>
								Close
							</Button>
							<Button
								type="submit"
								colorPalette="lime"
								loading={createInviteMutation.isPending}
							>
								Generate Code
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</DialogRoot>

			{/* Set Goal Modal */}
			<DialogRoot
				open={isGoalOpen}
				onOpenChange={(e) => setIsGoalOpen(e.open)}
			>
				<DialogContent bg="bg.panel" backdropFilter="blur(20px)">
					<form onSubmit={goalForm.handleSubmit(handleSetGoal)}>
						<DialogHeader>
							<DialogTitle>Set Weekly Shared Goal</DialogTitle>
						</DialogHeader>
						<DialogBody>
							<VStack gap={4} align="stretch">
								<Field label="Goal Type" required>
									<SearchableSelect
										items={CIRCLE_GOAL_TYPES}
										value={goalType}
										onValueChange={(val) =>
											goalForm.setValue(
												"goal_type",
												val as any,
												{ shouldValidate: true },
											)
										}
										placeholder="Select Weekly Goal Type"
									/>
								</Field>
							</VStack>
						</DialogBody>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsGoalOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								colorPalette="lime"
								loading={setGoalMutation.isPending}
							>
								Set Goal
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</DialogRoot>
		</Box>
	);
};

export default CircleRoute;
