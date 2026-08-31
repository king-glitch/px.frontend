import {
	useDuolingoStatus,
	useFinanceSummary,
	useHealthDay,
	usePlayerSummary,
	useQuests,
	useTodayQuests,
} from "@/api";
import { useTranslation } from "@/lib/i18n";
import { FloatingCreaturesScene } from "@/routes/dashboard/components/creature-scene";
import { DuolingoCard } from "@/routes/dashboard/components/duolingo-card";
import { HabitsCard } from "@/routes/dashboard/components/habits-card";
import { HeroSnapshotCard } from "@/routes/dashboard/components/hero-snapshot-card";
import { OutlinePill } from "@/routes/dashboard/components/holo-card";
import { QuestsSummaryCard } from "@/routes/dashboard/components/quests-summary-card";
import { TodayPulseCard } from "@/routes/dashboard/components/today-pulse-card";
import {
	Box,
	Flex,
	Grid,
	GridItem,
	HStack,
	Stack,
	Text,
} from "@chakra-ui/react";
import React from "react";

function todayISO(): string {
	return new Date().toISOString().split("T")[0];
}

export const Index: React.FC = () => {
	const { t } = useTranslation();
	const {
		data: duolingoStatus,
		isLoading: duolingoLoading,
		isError: duolingoError,
	} = useDuolingoStatus();
	const {
		data: summary,
		isLoading: summaryLoading,
		isError: summaryError,
	} = usePlayerSummary();
	const {
		data: todayQuests = [],
		isLoading: todayQuestsLoading,
		isError: todayQuestsError,
	} = useTodayQuests();
	const {
		data: questPage,
		isLoading: questPageLoading,
		isError: questPageError,
	} = useQuests(1, 1);
	const {
		data: healthSummary,
		isLoading: healthLoading,
		isError: healthError,
	} = useHealthDay(todayISO());
	const {
		data: financeSummary,
		isLoading: financeLoading,
		isError: financeError,
	} = useFinanceSummary();

	const completedToday = todayQuests.filter((tq) => tq.completed).length;
	const pendingToday = todayQuests.length - completedToday;
	const ongoingHabits = Math.max(
		0,
		(questPage?.count ?? 0) - todayQuests.length,
	);

	const healthScores = Object.values(healthSummary?.metrics ?? {});
	const healthScorePct = healthScores.length
		? Math.round(
				(healthScores.reduce((sum, m) => sum + m.score, 0) /
					healthScores.length) *
					100,
			)
		: 0;
	const todayCompletionPct = todayQuests.length
		? Math.round((completedToday / todayQuests.length) * 100)
		: 0;

	const netThisMonth = financeSummary
		? financeSummary.income - financeSummary.expense
		: undefined;

	const todayLabel = new Date().toLocaleDateString(undefined, {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return (
		<Box
			position="relative"
			flex="1"
			h="full"
			mx={{ base: -4, md: -6, xl: -8 }}
			my={{ base: -4, md: -6 }}
			px={{ base: 4, md: 6, xl: 8 }}
			py={{ base: 4, md: 6 }}
			overflow="hidden"
			display="flex"
			flexDirection="column"
			justifyContent="space-between"
		>
			{/* Full-bleed ambient creature glow & lighting background shining behind all cards */}
			<Box
				position="absolute"
				inset="-50px"
				pointerEvents="none"
				userSelect="none"
				zIndex={0}
				overflow="hidden"
			>
				{/* Top-left & Center-left creature stage aura */}
				<Box
					position="absolute"
					left="30%"
					top="25%"
					w="900px"
					h="650px"
					transform="translate(-50%, -50%)"
					rounded="full"
					filter="blur(85px)"
					opacity={{ base: 0.45, _dark: 0.55 }}
					bg="radial-gradient(circle, rgba(221, 214, 254, 0.6) 0%, rgba(251, 207, 232, 0.4) 35%, rgba(165, 243, 252, 0.25) 60%, transparent 75%)"
				/>
				{/* Bottom cards under-glow aura */}
				<Box
					position="absolute"
					left="35%"
					bottom="-5%"
					w="950px"
					h="500px"
					transform="translate(-50%, 0)"
					rounded="full"
					filter="blur(80px)"
					opacity={{ base: 0.4, _dark: 0.5 }}
					bg="radial-gradient(circle, rgba(163, 247, 136, 0.5) 0%, rgba(165, 243, 252, 0.35) 35%, rgba(221, 214, 254, 0.2) 60%, transparent 75%)"
				/>
				{/* Right column cards under-glow aura */}
				<Box
					position="absolute"
					right="-5%"
					top="30%"
					w="700px"
					h="800px"
					rounded="full"
					filter="blur(90px)"
					opacity={{ base: 0.35, _dark: 0.45 }}
					bg="radial-gradient(circle, rgba(251, 207, 232, 0.5) 0%, rgba(221, 214, 254, 0.35) 40%, rgba(163, 247, 136, 0.25) 65%, transparent 80%)"
				/>
			</Box>

			<Grid
				flex="1"
				minH="0"
				h="full"
				gap={{ base: 4, lg: 6, xl: 8 }}
				templateColumns={{
					base: "1fr",
					lg: "minmax(0, 1fr) 370px",
					xl: "minmax(0, 1fr) 420px",
				}}
				position="relative"
				zIndex={1}
			>
				{/* Center Column: Open Creature Stage Box & Bottom Daily Summary */}
				<GridItem
					h="full"
					minH="0"
					display="flex"
					flexDirection="column"
					justifyContent="space-between"
					position="relative"
				>
					{/* Dedicated Creature Stage Box */}
					<Box
						flex="1"
						minH="0"
						position="relative"
						w="full"
						overflow="visible"
						display={{ base: "none", lg: "block" }}
					>
						<FloatingCreaturesScene />
					</Box>

					{/* Bottom: Daily Summary Dock */}
					<Stack gap={3.5} pb={3} position="relative" zIndex={2}>
						<HStack gap={2.5}>
							<Text fontSize="lg" fontWeight="bold">
								{t("routes.index.dailyPrefix")}
							</Text>
							<Text fontSize="lg">
								<OutlinePill>
									{t("routes.index.dailyHighlight")}
								</OutlinePill>
							</Text>
						</HStack>

						<Grid
							gap={{ base: 3, xl: 4 }}
							templateColumns={{
								base: "1fr",
								lg: "220px 1fr",
								xl: "260px 1fr",
							}}
						>
							{/* 1. Isolated Duolingo Card */}
							<DuolingoCard
								status={duolingoStatus}
								isLoading={duolingoLoading}
								isError={duolingoError}
							/>

							{/* 2. Large Merged Card: To do, On going, Complete */}
							<QuestsSummaryCard
								pendingToday={pendingToday}
								ongoingHabits={ongoingHabits}
								completedToday={completedToday}
								isLoading={
									todayQuestsLoading || questPageLoading
								}
								isError={todayQuestsError || questPageError}
							/>
						</Grid>
					</Stack>
				</GridItem>

				{/* Right Side Widgets: Hero, Habit Tracker & Performance */}
				<GridItem h="full" minH="0">
					<Flex
						direction="column"
						h="full"
						justify="space-between"
						gap={4}
						pb={3}
					>
						{/* Hero Snapshot Card */}
						<HeroSnapshotCard
							summary={summary}
							isLoading={summaryLoading}
							isError={summaryError}
						/>

						{/* Habit Tracker Card */}
						<HabitsCard
							todayQuests={todayQuests}
							isLoading={todayQuestsLoading}
							isError={todayQuestsError}
							todayLabel={todayLabel}
						/>

						{/* Today's Pulse: Health + Quests bars, Finance headline */}
						<TodayPulseCard
							todayCompletionPct={todayCompletionPct}
							healthScorePct={healthScorePct}
							financeSummary={financeSummary}
							netThisMonth={netThisMonth}
							isLoading={
								todayQuestsLoading ||
								healthLoading ||
								financeLoading
							}
							isError={
								todayQuestsError || healthError || financeError
							}
						/>
					</Flex>
				</GridItem>
			</Grid>
		</Box>
	);
};

export default Index;
