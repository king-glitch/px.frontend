import React from "react";
import {
  Box,
  Circle,
  Flex,
  Grid,
  HStack,
  Heading,
  Icon,
  SimpleGrid,
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

const glassCard = {
  bg: "bg.glass",
  borderWidth: "1px",
  borderColor: "border.glass",
  rounded: "card",
  shadow: "glass",
  backdropFilter: "blur(30px) saturate(1.4)",
} as const;

export const HealthRoute: React.FC = () => {
  return (
    <Box position="relative" flex="1" display="flex" flexDirection="column" gap={5}>
      {/* Top Vital Matrix Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
        <Box {...glassCard} p={4}>
          <HStack justify="space-between" color="fg.muted">
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase">Energy & Recovery</Text>
            <Circle size="7" bg="mint.subtle" color="mint.fg">
              <Icon as={LuActivity} boxSize={4} />
            </Circle>
          </HStack>
          <HStack align="baseline" gap={2} mt={2}>
            <Heading size="3xl">92</Heading>
            <Text fontSize="xs" color="mint.fg" fontWeight="bold">Optimal</Text>
          </HStack>
          <Text fontSize="xs" color="fg.muted" mt={1}>HRV baseline +14% above avg</Text>
        </Box>

        <Box {...glassCard} p={4}>
          <HStack justify="space-between" color="fg.muted">
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase">Daily Steps</Text>
            <Circle size="7" bg="blue.subtle" color="blue.fg">
              <Icon as={LuFootprints} boxSize={4} />
            </Circle>
          </HStack>
          <HStack align="baseline" gap={2} mt={2}>
            <Heading size="3xl">8,420</Heading>
            <Text fontSize="xs" color="fg.muted">/ 10,000</Text>
          </HStack>
          <Text fontSize="xs" color="fg.muted" mt={1}>84% of daily movement target</Text>
        </Box>

        <Box {...glassCard} p={4}>
          <HStack justify="space-between" color="fg.muted">
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase">Sleep Quality</Text>
            <Circle size="7" bg="purple.subtle" color="purple.fg">
              <Icon as={LuBed} boxSize={4} />
            </Circle>
          </HStack>
          <HStack align="baseline" gap={2} mt={2}>
            <Heading size="3xl">7h 48m</Heading>
            <Text fontSize="xs" color="fg.muted">Score 88</Text>
          </HStack>
          <Text fontSize="xs" color="fg.muted" mt={1}>1h 45m deep sleep phase</Text>
        </Box>

        <Box {...glassCard} p={4}>
          <HStack justify="space-between" color="fg.muted">
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase">Active Burn</Text>
            <Circle size="7" bg="orange.subtle" color="orange.fg">
              <Icon as={LuFlame} boxSize={4} />
            </Circle>
          </HStack>
          <HStack align="baseline" gap={2} mt={2}>
            <Heading size="3xl">640</Heading>
            <Text fontSize="xs" color="fg.muted">kcal</Text>
          </HStack>
          <Text fontSize="xs" color="fg.muted" mt={1}>Strength & Zone 2 Cardio</Text>
        </Box>
      </SimpleGrid>

      {/* Health Vitals & Daily Protocol */}
      <Grid gap={5} templateColumns={{ base: "1fr", lg: "1fr 340px" }} flex="1">
        {/* Daily Biomarkers & Workout Protocol */}
        <Box {...glassCard} p={{ base: 4, md: 6 }} display="flex" flexDirection="column" gap={5}>
          <Flex justify="space-between" align="center">
            <Stack gap={0.5}>
              <Heading size="lg">Bio-Protocol & Vitals</Heading>
              <Text fontSize="xs" color="fg.muted">Daily physiological readiness and workout tracking</Text>
            </Stack>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {/* Heart Rate / Stress */}
            <Box bg="bg.panel" p={4} rounded="card" borderWidth="1px" borderColor="border.glass">
              <HStack justify="space-between" mb={2}>
                <HStack gap={2}>
                  <Icon as={LuHeart} color="red.fg" boxSize={4} />
                  <Text fontSize="sm" fontWeight="semibold">Resting Heart Rate</Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold">54 bpm</Text>
              </HStack>
              <Text fontSize="xs" color="fg.muted">Consistently in the high performance tier for recovery.</Text>
            </Box>

            {/* Hydration */}
            <Box bg="bg.panel" p={4} rounded="card" borderWidth="1px" borderColor="border.glass">
              <HStack justify="space-between" mb={2}>
                <HStack gap={2}>
                  <Icon as={LuDroplets} color="cyan.fg" boxSize={4} />
                  <Text fontSize="sm" fontWeight="semibold">Hydration</Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold">2.4L / 3.0L</Text>
              </HStack>
              <Text fontSize="xs" color="fg.muted">Electrolyte balance replenished after morning workout.</Text>
            </Box>

            {/* Nutrition */}
            <Box bg="bg.panel" p={4} rounded="card" borderWidth="1px" borderColor="border.glass">
              <HStack justify="space-between" mb={2}>
                <HStack gap={2}>
                  <Icon as={LuApple} color="mint.fg" boxSize={4} />
                  <Text fontSize="sm" fontWeight="semibold">Protein Target</Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold">140g / 165g</Text>
              </HStack>
              <Text fontSize="xs" color="fg.muted">High-density whole foods protocol.</Text>
            </Box>

            {/* VO2 Max */}
            <Box bg="bg.panel" p={4} rounded="card" borderWidth="1px" borderColor="border.glass">
              <HStack justify="space-between" mb={2}>
                <HStack gap={2}>
                  <Icon as={LuTrendingUp} color="purple.fg" boxSize={4} />
                  <Text fontSize="sm" fontWeight="semibold">Cardio Fitness</Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold">51.2 ml/kg</Text>
              </HStack>
              <Text fontSize="xs" color="fg.muted">Top 10% for demographic benchmark.</Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Holistic Wellness Summary */}
        <VStack gap={4} align="stretch">
          <Box {...glassCard} p={5}>
            <Heading size="md" mb={2}>Readiness Score</Heading>
            <Text fontSize="xs" color="fg.muted" mb={4}>Composite score from sleep, HRV, and activity</Text>

            <HStack align="center" justify="center" my={4}>
              <Circle size="28" bg="bg.solid" color="fg.inverted" shadow="float">
                <VStack gap={0}>
                  <Heading size="2xl" color="mint.solid">94</Heading>
                  <Text fontSize="10px" color="fg.muted">/ 100</Text>
                </VStack>
              </Circle>
            </HStack>

            <Text fontSize="xs" color="fg.muted" textAlign="center">
              Prime state for high-intensity cognitive focus & strength training.
            </Text>
          </Box>

          <Box {...glassCard} p={5} flex="1">
            <HStack gap={2} mb={2}>
              <Icon as={LuSparkles} color="holo.lavender" boxSize={4} />
              <Heading size="md">Holistic Optimization</Heading>
            </HStack>
            <Text fontSize="xs" color="fg.muted" lineHeight="tall">
              Hydration is ahead of target. Maintain current pace to hit your full 3.0L goal by 8:00 PM.
            </Text>
          </Box>
        </VStack>
      </Grid>
    </Box>
  );
};

export default HealthRoute;
