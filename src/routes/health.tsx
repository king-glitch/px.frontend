import React from "react";
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
import {
	LuActivity,
	LuApple,
	LuBed,
	LuDroplets,
	LuFlame,
	LuFootprints,
	LuHeart,
	LuSparkles,
	LuTrendingUp,
} from "react-icons/lu";
import { PillButton } from "@/components/ui/pill-button";
import { useHealthDay } from "@/api";
import { useTranslation } from "@/lib/i18n";

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
	const totalExp = Object.values(metrics).reduce(
		(acc, m) => acc + (m?.exp ?? 0),
		0,
	);

	return (
		<Box
			position="relative"
			flex="1"
			display="flex"
			flexDirection="column"
			gap={5}
		>
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
								{hrvMetric?.score
									? `${Math.round(hrvMetric.score * 100)}%`
									: "92%"}
							</Heading>
							<Text fontSize="xs" color="fg.muted">
								+45 {t("common.units.exp")}
							</Text>
						</HStack>
						<Text fontSize="xs" color="fg.muted" mt={1}>
							{t("routes.health.cards.hrvBaseline")}
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
								{stepsMetric?.value
									? Math.round(
											stepsMetric.value,
										).toLocaleString()
									: "8,420"}
							</Heading>
							<Text fontSize="xs" color="fg.muted">
								/{" "}
								{stepsMetric?.target
									? Math.round(
											stepsMetric.target,
										).toLocaleString()
									: "10,000"}
							</Text>
						</HStack>
						<Text fontSize="xs" color="fg.muted" mt={1}>
							{t("routes.health.cards.movementProgress")}
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
								{sleepMetric?.value
									? `${Math.floor(sleepMetric.value / 60)}h ${Math.round(sleepMetric.value % 60)}m`
									: "7h 48m"}
							</Heading>
							<Text fontSize="xs" color="fg.muted">
								{t("routes.health.cards.score")}{" "}
								{sleepMetric?.score
									? Math.round(sleepMetric.score * 100)
									: 88}
							</Text>
						</HStack>
						<Text fontSize="xs" color="fg.muted" mt={1}>
							{t("routes.health.cards.sleepRecovery")}
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
								{activeEnergyMetric?.value
									? Math.round(activeEnergyMetric.value)
									: 640}
							</Heading>
							<Text fontSize="xs" color="fg.muted">
								{t("routes.health.cards.kcal")}
							</Text>
						</HStack>
						<Text fontSize="xs" color="fg.muted" mt={1}>
							{t("routes.health.cards.activeCalorieOutput")}
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
					<Flex justify="space-between" align="center">
						<Stack gap={0.5}>
							<Heading size="lg">
								{t("routes.health.protocol.heading")}
							</Heading>
							<Text fontSize="xs" color="fg.muted">
								{t("routes.health.protocol.subtitle")}
							</Text>
						</Stack>
						{healthSummary?.exp_awarded ? (
							<Badge size="lg" rounded="pill" variant="subtle">
								{t("routes.health.protocol.settled")} +
								{healthSummary.exp_awarded}{" "}
								{t("common.units.exp")} (+
								{healthSummary.px_awarded}{" "}
								{t("common.units.px")})
							</Badge>
						) : (
							<Badge size="lg" rounded="pill" variant="subtle">
								{t("routes.health.protocol.awardPending")}
								{totalExp || 120} {t("common.units.exp")}
							</Badge>
						)}
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
