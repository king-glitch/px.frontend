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
import { Field } from "@/components/ui/field";
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
	Card,
	Container,
	Flex,
	HStack,
	Heading,
	Icon,
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
	LuZap
} from "react-icons/lu";

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
			<Container maxW="7xl" py={6}>
				<VStack gap={4} align="stretch">
					<Skeleton h="120px" rounded="xl" />
					<Skeleton h="200px" rounded="xl" />
					<Skeleton h="300px" rounded="xl" />
				</VStack>
			</Container>
		);
	}

	// Unenrolled State: Create or Join
	if (!circleData) {
		return (
			<Container maxW="5xl" py={12}>
				<VStack gap={8} textAlign="center">
					<Icon as={LuUsers} boxSize={16} color="purple.400" />
					<Heading
						size="3xl"
						bgGradient="to-r"
						gradientFrom="purple.400"
						gradientTo="blue.400"
						bgClip="text"
					>
						Co-op Circles
					</Heading>
					<Text color="fg.muted" maxW="xl" fontSize="lg">
						Form a private 6-person circle with friends or family.
						Encourage each other, contribute through daily quests,
						and earn shared weekly bonuses.
					</Text>

					<SimpleGrid
						columns={{ base: 1, md: 2 }}
						gap={6}
						w="full"
						maxW="3xl"
						mt={4}
					>
						<Card.Root
							bg="bg.glass"
							borderWidth="1px"
							borderColor="border.glass"
							backdropFilter="blur(20px)"
							p={6}
							textAlign="left"
						>
							<VStack align="start" gap={4}>
								<HStack gap={3}>
									<Icon
										as={LuPlus}
										boxSize={6}
										color="purple.400"
									/>
									<Heading size="md">Create a Circle</Heading>
								</HStack>
								<Text fontSize="sm" color="fg.muted">
									Start a new private circle. You'll be the
									owner and can invite up to 5 members.
								</Text>
								<Button
									colorPalette="purple"
									w="full"
									onClick={() => setIsCreateOpen(true)}
								>
									Create Circle
								</Button>
							</VStack>
						</Card.Root>

						<Card.Root
							bg="bg.glass"
							borderWidth="1px"
							borderColor="border.glass"
							backdropFilter="blur(20px)"
							p={6}
							textAlign="left"
						>
							<VStack align="start" gap={4}>
								<HStack gap={3}>
									<Icon
										as={LuUserPlus}
										boxSize={6}
										color="blue.400"
									/>
									<Heading size="md">
										Join with Invite Code
									</Heading>
								</HStack>
								<Text fontSize="sm" color="fg.muted">
									Have a code from a friend? Enter it below to
									join their circle.
								</Text>
								<HStack w="full">
									<Input
										placeholder="e.g. a1b2c3d4"
										value={joinCode}
										onChange={(e) =>
											setJoinCode(e.target.value)
										}
									/>
									<Button
										colorPalette="blue"
										onClick={handleJoinInvite}
										loading={acceptInviteMutation.isPending}
									>
										Join
									</Button>
								</HStack>
							</VStack>
						</Card.Root>
					</SimpleGrid>
				</VStack>

				{/* Create Circle Dialog */}
				<DialogRoot
					open={isCreateOpen}
					onOpenChange={(e) => setIsCreateOpen(e.open)}
				>
					<DialogContent bg="bg.panel" backdropFilter="blur(20px)">
						<form
							onSubmit={createForm.handleSubmit(
								handleCreateCircle,
							)}
						>
							<DialogHeader>
								<DialogTitle>Create Your Circle</DialogTitle>
							</DialogHeader>
							<DialogBody>
								<VStack gap={4}>
									<Field
										label="Circle Name"
										required
										errorText={
											createForm.formState.errors.name
												?.message
										}
									>
										<Input
											{...createForm.register("name")}
											placeholder="e.g. The Vanguard"
										/>
									</Field>
									<Field label="Motto / Focus">
										<Input
											{...createForm.register("motto")}
											placeholder="e.g. Daily consistency together"
										/>
									</Field>
									<Field label="Description">
										<Textarea
											{...createForm.register(
												"description",
											)}
											placeholder="Purpose of this circle..."
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
									colorPalette="purple"
									loading={createCircleMutation.isPending}
								>
									Create
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</DialogRoot>
			</Container>
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
		<Container maxW="7xl" py={6}>
			<VStack gap={6} align="stretch">
				{/* Circle Header */}
				<Card.Root
					bg="bg.glass"
					borderWidth="1px"
					borderColor="border.glass"
					backdropFilter="blur(20px)"
					p={6}
				>
					<Flex
						justify="space-between"
						align={{ base: "start", md: "center" }}
						direction={{ base: "column", md: "row" }}
						gap={4}
					>
						<VStack align="start" gap={2}>
							<HStack gap={3} wrap="wrap">
								<Heading size="xl">{circle.name}</Heading>
								<Badge colorPalette="purple" size="md">
									<Icon as={LuShield} mr={1} /> Bond Lv.{" "}
									{circle.level}
								</Badge>
								<Badge colorPalette="green" size="md">
									<Icon as={LuZap} mr={1} /> +
									{circleData.together_bonus_percent}%
									Together XP Bonus
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
							<HStack gap={4} w="full" maxW="md" mt={2}>
								<Text
									fontSize="xs"
									color="fg.muted"
									minW="80px"
								>
									Bond XP ({circle.bond_xp} XP)
								</Text>
								<Progress.Root
									value={currentBondProgress}
									size="sm"
									flex={1}
									colorPalette="purple"
								>
									<Progress.Track>
										<Progress.Range />
									</Progress.Track>
								</Progress.Root>
							</HStack>
						</VStack>

						<HStack gap={3}>
							<Button
								size="sm"
								colorPalette="purple"
								onClick={() => setIsInviteOpen(true)}
							>
								<Icon as={LuUserPlus} /> Invite (
								{members.length}/6)
							</Button>
							<Button
								size="sm"
								variant="outline"
								colorPalette="red"
								onClick={() => leaveCircleMutation.mutate()}
								loading={leaveCircleMutation.isPending}
							>
								<Icon as={LuLogOut} /> Leave
							</Button>
						</HStack>
					</Flex>
				</Card.Root>

				{/* Weekly Momentum & Shared Goal Section */}
				<SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
					{/* Weekly Momentum Meter */}
					<Card.Root
						bg="bg.glass"
						borderWidth="1px"
						borderColor="border.glass"
						backdropFilter="blur(20px)"
						p={6}
						gridColumn={{ base: "span 1", lg: "span 2" }}
					>
						<VStack align="start" gap={4}>
							<Flex
								justify="space-between"
								align="center"
								w="full"
							>
								<HStack gap={2}>
									<Icon as={LuTrendingUp} color="cyan.400" />
									<Heading size="md">Weekly Momentum</Heading>
								</HStack>
								<Badge
									colorPalette={
										currentWeek.momentum_tier === "thriving"
											? "green"
											: "cyan"
									}
									size="sm"
								>
									{currentWeek.momentum_tier.toUpperCase()}{" "}
									TIER ({currentWeek.contribution_days}{" "}
									contribution days)
								</Badge>
							</Flex>
							<Text fontSize="xs" color="fg.muted">
								Each member completing qualifying activity adds
								1 contribution day. Rewards unlock at tier
								thresholds:
							</Text>

							{/* Tier Gauges */}
							<SimpleGrid columns={4} gap={2} w="full">
								{tierThresholds.map((t) => {
									const isAchieved =
										currentWeek.contribution_days >= t.days;
									return (
										<Box
											key={t.tier}
											p={3}
											rounded="lg"
											borderWidth="1px"
											borderColor={
												isAchieved
													? "green.500/40"
													: "border.subtle"
											}
											bg={
												isAchieved
													? "green.500/10"
													: "bg.subtle"
											}
										>
											<Text
												fontSize="xs"
												fontWeight="bold"
												color={
													isAchieved
														? "green.300"
														: "fg.muted"
												}
											>
												{t.name}
											</Text>
											<Text
												fontSize="2xs"
												color="fg.muted"
											>
												{t.days} Days
											</Text>
											<Text
												fontSize="2xs"
												color={
													isAchieved
														? "green.400"
														: "fg.subtle"
												}
												mt={1}
											>
												+{t.xpBonus}% XP{" "}
												{t.pxBonus > 0 &&
													`& +${t.pxBonus}% PX`}
											</Text>
										</Box>
									);
								})}
							</SimpleGrid>

							{/* Reward Claim Button */}
							{currentWeek.momentum_tier !== "none" && (
								<Flex justify="flex-end" w="full" mt={2}>
									<Button
										size="sm"
										colorPalette="green"
										onClick={() =>
											handleClaimWeeklyReward(
												currentWeek.week_id,
											)
										}
										loading={claimRewardMutation.isPending}
									>
										<Icon as={LuAward} mr={1} /> Claim
										Weekly Bonus
									</Button>
								</Flex>
							)}
						</VStack>
					</Card.Root>

					{/* Shared Goal Card */}
					<Card.Root
						bg="bg.glass"
						borderWidth="1px"
						borderColor="border.glass"
						backdropFilter="blur(20px)"
						p={6}
					>
						<VStack
							align="start"
							gap={3}
							h="full"
							justify="space-between"
						>
							<VStack align="start" gap={2} w="full">
								<HStack justify="space-between" w="full">
									<HStack gap={2}>
										<Icon
											as={LuSparkles}
											color="purple.400"
										/>
										<Heading size="md">Shared Goal</Heading>
									</HStack>
									{isLeader && (
										<Button
											size="xs"
											variant="ghost"
											onClick={() => setIsGoalOpen(true)}
										>
											Set Goal
										</Button>
									)}
								</HStack>

								{activeGoal ? (
									<VStack
										align="start"
										gap={2}
										w="full"
										mt={2}
									>
										<Badge colorPalette="purple" size="sm">
											{activeGoal.goal_type.toUpperCase()}
										</Badge>
										<Text fontSize="sm" fontWeight="medium">
											Target: {activeGoal.target}{" "}
											collective actions
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
											colorPalette="purple"
										>
											<Progress.Track>
												<Progress.Range />
											</Progress.Track>
										</Progress.Root>
										<HStack
											justify="space-between"
											w="full"
											fontSize="xs"
											color="fg.muted"
										>
											<Text>
												Progress:{" "}
												{activeGoal.current_progress}/
												{activeGoal.target}
											</Text>
											<Text>
												+{activeGoal.reward_xp} XP, +
												{activeGoal.reward_px} PX
											</Text>
										</HStack>
									</VStack>
								) : (
									<Box py={4} textAlign="center" w="full">
										<Text fontSize="xs" color="fg.muted">
											No active shared goal this week.
										</Text>
										{isLeader && (
											<Button
												size="xs"
												colorPalette="purple"
												mt={2}
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
					</Card.Root>
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
									<Card.Root
										key={`slot-${idx}`}
										bg="bg.glass"
										borderWidth="1px"
										borderStyle="dashed"
										borderColor="border.subtle"
										p={5}
										textAlign="center"
									>
										<VStack gap={2} py={4}>
											<Icon
												as={LuUserPlus}
												color="fg.subtle"
												boxSize={6}
											/>
											<Text
												fontSize="xs"
												color="fg.subtle"
											>
												Open Slot
											</Text>
											<Button
												size="xs"
												variant="ghost"
												onClick={() =>
													setIsInviteOpen(true)
												}
											>
												Invite
											</Button>
										</VStack>
									</Card.Root>
								);
							}

							return (
								<Card.Root
									key={m.member.id}
									bg="bg.glass"
									borderWidth="1px"
									borderColor="border.glass"
									backdropFilter="blur(20px)"
									p={5}
								>
									<VStack align="start" gap={3}>
										<Flex
											justify="space-between"
											align="center"
											w="full"
										>
											<HStack gap={2}>
												<Box
													w={8}
													h={8}
													rounded="full"
													bg="purple.500/20"
													display="flex"
													alignItems="center"
													justifyContent="center"
													fontWeight="bold"
													color="purple.300"
												>
													{m.username
														.charAt(0)
														.toUpperCase()}
												</Box>
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
															m.member.role ===
															"owner"
																? "purple"
																: "blue"
														}
													>
														{m.member.role}
													</Badge>
												</VStack>
											</HStack>
											<Button
												size="xs"
												variant="ghost"
												colorPalette="cyan"
												onClick={() =>
													handleNudge(
														m.member.user_id,
													)
												}
											>
												<Icon as={LuSend} mr={1} />{" "}
												Nudge
											</Button>
										</Flex>

										<HStack
											justify="space-between"
											w="full"
											fontSize="xs"
											color="fg.muted"
										>
											<Text>{m.broad_status}</Text>
											<Text>
												{m.contribution_count_this_week}{" "}
												days this week
											</Text>
										</HStack>

										{m.is_eligible_for_reward && (
											<Badge
												size="xs"
												colorPalette="green"
											>
												<Icon as={LuUserCheck} mr={1} />{" "}
												Reward Eligible
											</Badge>
										)}
									</VStack>
								</Card.Root>
							);
						})}
					</SimpleGrid>
				</VStack>

				{/* Activity Feed */}
				<Card.Root
					bg="bg.glass"
					borderWidth="1px"
					borderColor="border.glass"
					backdropFilter="blur(20px)"
					p={6}
				>
					<VStack align="start" gap={4}>
						<HStack gap={2}>
							<Icon as={LuMessageSquare} color="purple.400" />
							<Heading size="md">Circle Activity Stream</Heading>
						</HStack>

						<VStack gap={3} align="stretch" w="full">
							{activities.length === 0 ? (
								<Text
									fontSize="xs"
									color="fg.muted"
									py={4}
									textAlign="center"
								>
									No activity yet. Complete quests to record
									daily contributions!
								</Text>
							) : (
								activities.map((item) => (
									<Box
										key={item.activity.id}
										p={3}
										rounded="lg"
										bg="bg.subtle"
										borderWidth="1px"
										borderColor="border.subtle"
									>
										<Flex
											justify="space-between"
											align="center"
											wrap="wrap"
											gap={2}
										>
											<Text fontSize="sm">
												<Text
													as="span"
													fontWeight="bold"
													color="purple.300"
												>
													{item.username}
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
														item.activity
															.reactions?.[rx] ||
														0;
													return (
														<Button
															key={rx}
															size="xs"
															variant={
																count > 0
																	? "subtle"
																	: "ghost"
															}
															colorPalette="purple"
															onClick={() =>
																reactMutation.mutate(
																	{
																		activity_id:
																			item
																				.activity
																				.id,
																		reaction:
																			rx,
																	},
																)
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
				</Card.Root>
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
							<VStack gap={4}>
								<Text fontSize="sm" color="fg.muted">
									Generate an invite code to share with your
									friends or family. Codes expire after 7
									days.
								</Text>
								<Field label="Username (Optional)">
									<Input
										{...inviteForm.register(
											"invitee_username",
										)}
										placeholder="e.g. alex"
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
												p={2}
												bg="bg.subtle"
												rounded="md"
											>
												<Text
													fontSize="sm"
													fontFamily="mono"
													fontWeight="bold"
												>
													{inv.invite_code}
												</Text>
												<Button
													size="xs"
													variant="outline"
													onClick={() =>
														handleCopy(
															inv.invite_code,
														)
													}
												>
													<Icon as={LuCopy} mr={1} />{" "}
													Copy
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
								colorPalette="purple"
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
							<VStack gap={4}>
								<Field label="Goal Type" required>
									<select
										{...goalForm.register("goal_type")}
										style={{
											width: "100%",
											padding: "8px",
											borderRadius: "6px",
											background:
												"var(--chakra-colors-bg-subtle)",
											border: "1px solid var(--chakra-colors-border-subtle)",
											color: "inherit",
										}}
									>
										<option value="consistency">
											Consistency (20 Contribution Days)
										</option>
										<option value="balance">
											Balance (5 Disciplines Active)
										</option>
										<option value="progress">
											Progress (3 Milestones Moved)
										</option>
										<option value="recovery">
											Recovery (4 Planned Rest/Recovery)
										</option>
										<option value="reflection">
											Reflection (4 Weekly Reviews)
										</option>
									</select>
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
								colorPalette="purple"
								loading={setGoalMutation.isPending}
							>
								Set Goal
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</DialogRoot>
		</Container>
	);
};

export default CircleRoute;
