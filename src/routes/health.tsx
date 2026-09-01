import { useAwardHealthDay, useHealthDay } from "@/api";
import { PillButton } from "@/components/ui/pill-button";
import { toaster } from "@/components/ui/toaster";
import { useTranslation } from "@/lib/i18n";
import { LogHealthDialog } from "./health/log-health-dialog";
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
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import {
	LuActivity,
	LuApple,
	LuBed,
	LuCheck,
	LuDroplets,
	LuFlame,
	LuFootprints,
	LuHeart,
	LuPlus,
	LuSparkles,
	LuTrendingUp,
} from "react-icons/lu";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

export const HealthRoute: React.FC = () => {
	const { t } = useTranslation();
	const today = new Date().toISOString().split("T")[0];
	const { data: healthSummary, isLoading } = useHealthDay(today);
	const awardMutation = useAwardHealthDay();
	const [isLogOpen, setIsLogOpen] = useState(false);

	const metrics = (healthSummary?.metrics ?? {}) as Partial<
		Record<
			| "steps"
			| "sleep_minutes"
			| "active_energy"
			| "hrv"
			| "workout_minutes"
			| "resting_hr",
			{ value: number; target: number; score: number; exp: number }
		>
	>;
	const stepsMetric = metrics["steps"];
	const sleepMetric = metrics["sleep_minutes"];
	const activeEnergyMetric = metrics["active_energy"];
	const hrvMetric = metrics["hrv"];
	const restingHrMetric = metrics["resting_hr"];
	const totalExp = Object.values(metrics).reduce(
		(acc, m) => acc + (m?.exp ?? 0),
		0,
	);

	const handleAwardHealth = async () => {
		try {
			const res = await awardMutation.mutateAsync(today);
			toaster.create({
				title: "Health Rewards Settled!",
				description: `Claimed +${res.exp} EXP and +${res.px} PX!`,
				type: "success",
			});
		} catch (err: any) {
			toaster.create({
				title: "Failed to settle health awards",
				description: err?.message || "Something went wrong",
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
			<LogHealthDialog
				isOpen={isLogOpen}
				onClose={() => setIsLogOpen(false)}
				day={today}
			/>

			{/* Top Vital Matrix Cards */}
			{isLoading ? (
				<SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
					<Skeleton h="28" rounded="card" />
					<Skeleton h="28" rounded="card" />
					<Skeleton h="28" rounded="card" />
					<Skeleton h="28" rounded="card" />
				</SimpleGrid>
			) : (
				<SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
					<Box {...glassCard} p={4}>
						<HStack justify="space-between" color="fg.muted">
							<Text
								fontSize="xs"
								fontWeight="semibold"
								textTransform="uppercase"
							>
								{t("routes.health.cards.energyRecovery")}
							</Text>
							<Circle size="7" bg="bg.muted" color="fg.muted">
								<Icon as={LuActivity} boxSize={4} />
							</Circle>
						</HStack>
						<HStack align="baseline" gap={2} mt={2}>
							<Heading size="3xl">
								{hrvMetric !== undefined
									? `${Math.round((hrvMetric.score || 0) * 100)}%`
									: "—"}
							</Heading>
							{hrvMetric ? (
								<Text fontSize="xs" color="fg.muted">
									+{hrvMetric.exp || 0} {t("common.units.exp")}
								</Text>
							) : (
								<Button
									size="2xs"
									variant="subtle"
									colorPalette="lime"
									onClick={() => setIsLogOpen(true)}
								>
									Log
								</Button>
							)}
						</HStack>
						<Text fontSize="xs" color="fg.muted" mt={1}>
							{hrvMetric
								? t("routes.health.cards.hrvBaseline")
								: "No HRV recorded today"}
						</Text>
					</Box>

					<Box {...glassCard} p={4}>
						<HStack justify="space-between" color="fg.muted">
							<Text
								fontSize="xs"
								fontWeight="semibold"
								textTransform="uppercase"
							>
								{t("routes.health.cards.dailySteps")}
							</Text>
							<Circle size="7" bg="bg.muted" color="fg.muted">
								<Icon as={LuFootprints} boxSize={4} />
							</Circle>
						</HStack>
						<HStack align="baseline" gap={2} mt={2}>
							<Heading size="3xl">
								{stepsMetric !== undefined
									? Math.round(stepsMetric.value).toLocaleString()
									: "—"}
							</Heading>
							{stepsMetric?.target ? (
								<Text fontSize="xs" color="fg.muted">
									/ {Math.round(stepsMetric.target).toLocaleString()}
								</Text>
							) : (
								<Button
									size="2xs"
									variant="subtle"
									colorPalette="lime"
									onClick={() => setIsLogOpen(true)}
								>
									Log Steps
								</Button>
							)}
						</HStack>
						<Text fontSize="xs" color="fg.muted" mt={1}>
							{stepsMetric
								? t("routes.health.cards.movementProgress")
								: "No steps recorded today"}
						</Text>
					</Box>

					<Box {...glassCard} p={4}>
						<HStack justify="space-between" color="fg.muted">
							<Text
								fontSize="xs"
								fontWeight="semibold"
								textTransform="uppercase"
							>
								{t("routes.health.cards.sleepQuality")}
							</Text>
							<Circle size="7" bg="bg.muted" color="fg.muted">
								<Icon as={LuBed} boxSize={4} />
							</Circle>
						</HStack>
						<HStack align="baseline" gap={2} mt={2}>
							<Heading size="3xl">
								{sleepMetric !== undefined
									? `${Math.floor(sleepMetric.value / 60)}h ${Math.round(sleepMetric.value % 60)}m`
									: "—"}
							</Heading>
							{sleepMetric ? (
								<Text fontSize="xs" color="fg.muted">
									{t("routes.health.cards.score")}{" "}
									{Math.round((sleepMetric.score || 0) * 100)}
								</Text>
							) : (
								<Button
									size="2xs"
									variant="subtle"
									colorPalette="lime"
									onClick={() => setIsLogOpen(true)}
								>
									Log Sleep
								</Button>
							)}
						</HStack>
						<Text fontSize="xs" color="fg.muted" mt={1}>
							{sleepMetric
								? t("routes.health.cards.sleepRecovery")
								: "No sleep logged today"}
						</Text>
					</Box>

					<Box {...glassCard} p={4}>
						<HStack justify="space-between" color="fg.muted">
							<Text
								fontSize="xs"
								fontWeight="semibold"
								textTransform="uppercase"
							>
								{t("routes.health.cards.activeBurn")}
							</Text>
							<Circle size="7" bg="bg.muted" color="fg.muted">
								<Icon as={LuFlame} boxSize={4} />
							</Circle>
						</HStack>
						<HStack align="baseline" gap={2} mt={2}>
							<Heading size="3xl">
								{activeEnergyMetric !== undefined
									? Math.round(activeEnergyMetric.value).toLocaleString()
									: "—"}
							</Heading>
							{activeEnergyMetric ? (
								<Text fontSize="xs" color="fg.muted">
									{t("routes.health.cards.kcal")}
								</Text>
							) : (
								<Button
									size="2xs"
									variant="subtle"
									colorPalette="lime"
									onClick={() => setIsLogOpen(true)}
								>
									Log Calories
								</Button>
							)}
						</HStack>
						<Text fontSize="xs" color="fg.muted" mt={1}>
							{activeEnergyMetric
								? t("routes.health.cards.activeCalorieOutput")
								: "No active calories logged"}
						</Text>
					</Box>
				</SimpleGrid>
			)}

			{/* Health Vitals & Daily Protocol */}
			<Grid
				gap={5}
				templateColumns={{ base: "1fr", lg: "1fr 340px" }}
				flex="1"
			>
				{/* Daily Biomarkers & Workout Protocol */}
				<Box
					{...glassCard}
					p={{ base: 4, md: 6 }}
					display="flex"
					flexDirection="column"
					gap={5}
				>
					<Flex justify="space-between" align="center" wrap="wrap" gap={3}>
						<Stack gap={0.5}>
							<Heading size="lg">
								{t("routes.health.protocol.heading")}
							</Heading>
							<Text fontSize="xs" color="fg.muted">
								{t("routes.health.protocol.subtitle")}
							</Text>
						</Stack>
						<HStack gap={2}>
							{healthSummary?.exp_awarded ? (
								<Badge size="lg" rounded="pill" variant="subtle" colorPalette="lime">
									<Icon as={LuCheck} mr={1} />
									{t("routes.health.protocol.settled")} +
									{healthSummary.exp_awarded}{" "}
									{t("common.units.exp")} (+
									{healthSummary.px_awarded}{" "}
									{t("common.units.px")})
								</Badge>
							) : totalExp > 0 ? (
								<Button
									size="sm"
									colorPalette="lime"
									rounded="pill"
									onClick={handleAwardHealth}
									loading={awardMutation.isPending}
								>
									<Icon as={LuSparkles} mr={1} /> Claim +{totalExp} {t("common.units.exp")}
								</Button>
							) : (
								<Badge size="lg" rounded="pill" variant="subtle">
									Log vitals to earn daily EXP
								</Badge>
							)}
						</HStack>
					</Flex>

					{isLoading ? (
						<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
							<Skeleton h="24" rounded="card" />
							<Skeleton h="24" rounded="card" />
							<Skeleton h="24" rounded="card" />
							<Skeleton h="24" rounded="card" />
						</SimpleGrid>
					) : (
						<SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
							{/* Heart Rate / Stress */}
							<Box
								bg="bg.panel"
								p={4}
								rounded="card"
								borderWidth="1px"
								borderColor="border.glass"
							>
								<HStack justify="space-between" mb={2}>
									<HStack gap={2}>
										<Icon
											as={LuHeart}
											color="fg.muted"
											boxSize={4}
										/>
										<Text
											fontSize="sm"
											fontWeight="semibold"
										>
											{t(
												"routes.health.protocol.restingHeartRate",
											)}
										</Text>
									</HStack>
									<Text fontSize="sm" fontWeight="bold">
										54 bpm
									</Text>
								</HStack>
								<Text fontSize="xs" color="fg.muted">
									{t(
										"routes.health.protocol.restingHeartRateNote",
									)}
								</Text>
							</Box>

							{/* Hydration */}
							<Box
								bg="bg.panel"
								p={4}
								rounded="card"
								borderWidth="1px"
								borderColor="border.glass"
							>
								<HStack justify="space-between" mb={2}>
									<HStack gap={2}>
										<Icon
											as={LuDroplets}
											color="fg.muted"
											boxSize={4}
										/>
										<Text
											fontSize="sm"
											fontWeight="semibold"
										>
											{t(
												"routes.health.protocol.hydration",
											)}
										</Text>
									</HStack>
									<Text fontSize="sm" fontWeight="bold">
										2.4L / 3.0L
									</Text>
								</HStack>
								<Text fontSize="xs" color="fg.muted">
									{t("routes.health.protocol.hydrationNote")}
								</Text>
							</Box>

							{/* Nutrition */}
							<Box
								bg="bg.panel"
								p={4}
								rounded="card"
								borderWidth="1px"
								borderColor="border.glass"
							>
								<HStack justify="space-between" mb={2}>
									<HStack gap={2}>
										<Icon
											as={LuApple}
											color="fg.muted"
											boxSize={4}
										/>
										<Text
											fontSize="sm"
											fontWeight="semibold"
										>
											{t(
												"routes.health.protocol.proteinTarget",
											)}
										</Text>
									</HStack>
									<Text fontSize="sm" fontWeight="bold">
										140g / 165g
									</Text>
								</HStack>
								<Text fontSize="xs" color="fg.muted">
									{t("routes.health.protocol.proteinNote")}
								</Text>
							</Box>

							{/* VO2 Max */}
							<Box
								bg="bg.panel"
								p={4}
								rounded="card"
								borderWidth="1px"
								borderColor="border.glass"
							>
								<HStack justify="space-between" mb={2}>
									<HStack gap={2}>
										<Icon
											as={LuTrendingUp}
											color="fg.muted"
											boxSize={4}
										/>
										<Text
											fontSize="sm"
											fontWeight="semibold"
										>
											{t(
												"routes.health.protocol.aerobicCapacity",
											)}
										</Text>
									</HStack>
									<Text fontSize="sm" fontWeight="bold">
										52 VO2 Max
									</Text>
								</HStack>
								<Text fontSize="xs" color="fg.muted">
									{t("routes.health.protocol.aerobicNote")}
								</Text>
							</Box>
						</SimpleGrid>
					)}
				</Box>

				{/* Side Productivity Insights */}
				<VStack gap={4} align="stretch">
					{isLoading ? (
						<>
							<Skeleton h="44" rounded="card" />
							<Skeleton h="36" rounded="card" />
						</>
					) : (
						<>
							<Box {...glassCard} p={5}>
								<Heading size="md" mb={2}>
									{t("routes.health.sidebar.recoveryIndex")}
								</Heading>
								<Text fontSize="xs" color="fg.muted" mb={4}>
									{t(
										"routes.health.sidebar.recoverySubtitle",
									)}
								</Text>
								<Stack gap={3}>
									<Box>
										<Flex
											justify="space-between"
											fontSize="xs"
											mb={1}
										>
											<Text fontWeight="medium">
												{t(
													"routes.health.sidebar.sleepPhase",
												)}
											</Text>
											<Text color="fg.muted">88%</Text>
										</Flex>
										<Box
											h="2"
											rounded="pill"
											bg="bg.muted"
											overflow="hidden"
										>
											<Box
												h="full"
												w="88%"
												bg="mint.solid"
												rounded="pill"
											/>
										</Box>
									</Box>
									<Box>
										<Flex
											justify="space-between"
											fontSize="xs"
											mb={1}
										>
											<Text fontWeight="medium">
												{t(
													"routes.health.sidebar.hrvTrend",
												)}
											</Text>
											<Text color="fg.muted">92%</Text>
										</Flex>
										<Box
											h="2"
											rounded="pill"
											bg="bg.muted"
											overflow="hidden"
										>
											<Box
												h="full"
												w="92%"
												bg="mint.solid"
												rounded="pill"
											/>
										</Box>
									</Box>
								</Stack>
							</Box>

							<Box {...glassCard} p={5} flex="1">
								<HStack gap={2} mb={2}>
									<Icon
										as={LuSparkles}
										color="fg.muted"
										boxSize={4}
									/>
									<Heading size="md">
										{t(
											"routes.health.sidebar.adaptiveTarget",
										)}
									</Heading>
								</HStack>
								<Text fontSize="xs" color="fg.muted" mb={4}>
									{t(
										"routes.health.sidebar.adaptiveSubtitle",
									)}
								</Text>
								<PillButton
									size="sm"
									variant="dark"
									w="full"
									icon={LuActivity}
									onClick={() => setIsLogOpen(true)}
								>
									{t("routes.health.sidebar.syncBioData")}
								</PillButton>
							</Box>
						</>
					)}
				</VStack>
			</Grid>
		</Box>
	);
};

export default HealthRoute;
