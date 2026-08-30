import React from "react";
import {
	Box,
	Flex,
	Grid,
	GridItem,
	HStack,
	Text,
	Stack,
} from "@chakra-ui/react";
import {
	useDuolingoStatus,
	useFinanceSummary,
	useHealthDay,
	usePlayerSummary,
	useQuests,
	useTodayQuests,
} from "@/api";
import { DashboardRail } from "./dashboard/components/dashboard-rail";
import { FloatingCreaturesScene } from "./dashboard/components/creature-scene";
import { DuolingoCard } from "./dashboard/components/duolingo-card";
import { QuestsSummaryCard } from "./dashboard/components/quests-summary-card";
import { HeroSnapshotCard } from "./dashboard/components/hero-snapshot-card";
import { HabitsCard } from "./dashboard/components/habits-card";
import { TodayPulseCard } from "./dashboard/components/today-pulse-card";
import { OutlinePill } from "./dashboard/components/holo-card";
import { useTranslation } from "@/lib/i18n";

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
			overflow="hidden"
			display="flex"
			flexDirection="column"
			justifyContent="space-between"
		>
			<Grid
				flex="1"
				minH="0"
				h="full"
				gap={{ base: 4, lg: 6, xl: 8 }}
				templateColumns={{
					base: "1fr",
					lg: "76px minmax(0, 1fr) 370px",
					xl: "84px minmax(0, 1fr) 420px",
				}}
				position="relative"
				zIndex={1}
			>
				{/* Left Floating Rail */}
				<DashboardRail />

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
