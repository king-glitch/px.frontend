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

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

export const HealthRoute: React.FC = () => {
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
								Energy & Recovery
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
								+45 EXP
							</Text>
						</HStack>
						<Text fontSize="xs" color="fg.muted" mt={1}>
							HRV baseline optimal
						</Text>
					</Box>

					<Box {...glassCard} p={4}>
						<HStack justify="space-between" color="fg.muted">
							<Text
								fontSize="xs"
								fontWeight="semibold"
								textTransform="uppercase"
							>
								Daily Steps
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
							Movement progress
						</Text>
					</Box>

					<Box {...glassCard} p={4}>
						<HStack justify="space-between" color="fg.muted">
							<Text
								fontSize="xs"
								fontWeight="semibold"
								textTransform="uppercase"
							>
								Sleep Quality
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
								Score{" "}
								{sleepMetric?.score
									? Math.round(sleepMetric.score * 100)
									: 88}
							</Text>
						</HStack>
						<Text fontSize="xs" color="fg.muted" mt={1}>
							Sleep recovery phase
						</Text>
					</Box>

					<Box {...glassCard} p={4}>
						<HStack justify="space-between" color="fg.muted">
							<Text
								fontSize="xs"
								fontWeight="semibold"
								textTransform="uppercase"
							>
								Active Burn
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
								kcal
							</Text>
						</HStack>
						<Text fontSize="xs" color="fg.muted" mt={1}>
							Active calorie output
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
							<Heading size="lg">Bio-Protocol & Vitals</Heading>
							<Text fontSize="xs" color="fg.muted">
								Daily physiological readiness and workout
								tracking
							</Text>
						</Stack>
						{healthSummary?.exp_awarded ? (
							<Badge size="lg" rounded="pill" variant="subtle">
								Settled +{healthSummary.exp_awarded} EXP (+
								{healthSummary.px_awarded} PX)
							</Badge>
						) : (
							<Badge size="lg" rounded="pill" variant="subtle">
								Award Pending: ~{totalExp || 120} EXP
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
											Resting Heart Rate
										</Text>
									</HStack>
									<Text fontSize="sm" fontWeight="bold">
										54 bpm
									</Text>
								</HStack>
								<Text fontSize="xs" color="fg.muted">
									Consistently in the high performance tier
									for recovery.
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
											Hydration
										</Text>
									</HStack>
									<Text fontSize="sm" fontWeight="bold">
										2.4L / 3.0L
									</Text>
								</HStack>
								<Text fontSize="xs" color="fg.muted">
									Electrolyte balance replenished after
									morning workout.
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
											Protein Target
										</Text>
									</HStack>
									<Text fontSize="sm" fontWeight="bold">
										140g / 165g
									</Text>
								</HStack>
								<Text fontSize="xs" color="fg.muted">
									High-density whole foods protocol.
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
											Aerobic Capacity
										</Text>
									</HStack>
									<Text fontSize="sm" fontWeight="bold">
										52 VO2 Max
									</Text>
								</HStack>
								<Text fontSize="xs" color="fg.muted">
									Zone 2 endurance training maintained.
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
									Recovery Index
								</Heading>
								<Text fontSize="xs" color="fg.muted" mb={4}>
									Combined biomarker readiness
								</Text>
								<Stack gap={3}>
									<Box>
										<Flex
											justify="space-between"
											fontSize="xs"
											mb={1}
										>
											<Text fontWeight="medium">
												Sleep Phase
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
												HRV Trend
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
									<Heading size="md">Adaptive Target</Heading>
								</HStack>
								<Text fontSize="xs" color="fg.muted" mb={4}>
									Dynamic training targets computed from your
									recovery baseline.
								</Text>
								<PillButton
									size="sm"
									variant="dark"
									w="full"
									icon={LuActivity}
								>
									Sync Bio-Data
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
