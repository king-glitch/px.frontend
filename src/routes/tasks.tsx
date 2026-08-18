import React, { useState } from "react";
import { PillButton } from "@/components/ui/pill-button";
import {
  Badge,
  Box,
  Button,
  Circle,
  Container,
  Flex,
  Grid,
  HStack,
  Heading,
  Icon,
  Input,
  Progress,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuCircle,
  LuCircleCheck,
  LuFlame,
  LuPlus,
  LuSparkles,
  LuTarget,
  LuTimer,
  LuTrendingUp,
} from "react-icons/lu";

interface TaskItem {
  id: string;
  title: string;
  category: "Habit" | "Work" | "Personal" | "Health";
  streak?: number;
  completed: boolean;
  timeEstimate?: string;
}

const initialTasks: TaskItem[] = [
  { id: "1", title: "Morning meditation & breathwork", category: "Health", streak: 14, completed: true, timeEstimate: "15 min" },
  { id: "2", title: "Review monthly budget & slips ingestion", category: "Personal", streak: 6, completed: true, timeEstimate: "20 min" },
  { id: "3", title: "Deep work session: frontend architecture", category: "Work", completed: false, timeEstimate: "90 min" },
  { id: "4", title: "Hit 10,000 steps & strength workout", category: "Health", streak: 21, completed: false, timeEstimate: "45 min" },
  { id: "5", title: "Read 20 pages of system design book", category: "Habit", streak: 8, completed: false, timeEstimate: "30 min" },
];

const glassCard = {
  bg: "bg.glass",
  borderWidth: "1px",
  borderColor: "border.glass",
  rounded: "card",
  shadow: "glass",
  backdropFilter: "blur(30px) saturate(1.4)",
} as const;

export const TasksRoute: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      category: "Personal",
      completed: false,
      streak: 1,
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const categories = ["All", "Habit", "Work", "Health", "Personal"];
  const filteredTasks =
    selectedCategory === "All"
      ? tasks
      : tasks.filter((t) => t.category === selectedCategory);

  return (
    <Box position="relative" flex="1" display="flex" flexDirection="column" gap={5}>
      {/* Top Banner Stats */}
      <Grid
        gap={4}
        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
      >
        <Box {...glassCard} p={4}>
          <HStack justify="space-between" color="fg.muted">
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase">Completion</Text>
            <Icon as={LuCircleCheck} boxSize={4} color="mint.fg" />
          </HStack>
          <HStack align="baseline" gap={2} mt={2}>
            <Heading size="2xl">{progressPercent}%</Heading>
            <Text fontSize="xs" color="fg.muted">{completedCount}/{tasks.length} done</Text>
          </HStack>
        </Box>

        <Box {...glassCard} p={4}>
          <HStack justify="space-between" color="fg.muted">
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase">Active Streak</Text>
            <Icon as={LuFlame} boxSize={4} color="orange.fg" />
          </HStack>
          <HStack align="baseline" gap={2} mt={2}>
            <Heading size="2xl">21</Heading>
            <Text fontSize="xs" color="fg.muted">days personal best</Text>
          </HStack>
        </Box>

        <Box {...glassCard} p={4}>
          <HStack justify="space-between" color="fg.muted">
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase">Focus Time</Text>
            <Icon as={LuTimer} boxSize={4} color="blue.fg" />
          </HStack>
          <HStack align="baseline" gap={2} mt={2}>
            <Heading size="2xl">3.5h</Heading>
            <Text fontSize="xs" color="fg.muted">allocated today</Text>
          </HStack>
        </Box>

        <Box {...glassCard} p={4}>
          <HStack justify="space-between" color="fg.muted">
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase">Momentum</Text>
            <Icon as={LuTrendingUp} boxSize={4} color="mint.fg" />
          </HStack>
          <HStack align="baseline" gap={2} mt={2}>
            <Heading size="2xl">+18%</Heading>
            <Text fontSize="xs" color="fg.muted">vs previous week</Text>
          </HStack>
        </Box>
      </Grid>

      {/* Main Task Manager */}
      <Grid gap={5} templateColumns={{ base: "1fr", lg: "1fr 340px" }} flex="1">
        {/* Task List Panel */}
        <Box {...glassCard} p={{ base: 4, md: 6 }} display="flex" flexDirection="column" gap={4}>
          {/* Header & Quick Add */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <Stack gap={0.5}>
              <Heading size="lg">Tasks & Habit Loops</Heading>
              <Text fontSize="xs" color="fg.muted">Execute daily routines and track continuous improvement</Text>
            </Stack>

            {/* Filter Pills */}
            <HStack bg="bg.muted" p={1} rounded="pill" gap={1}>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  size="xs"
                  rounded="pill"
                  variant={selectedCategory === cat ? "solid" : "ghost"}
                  onClick={() => setSelectedCategory(cat)}
                  fontSize="xs"
                  px={3}
                >
                  {cat}
                </Button>
              ))}
            </HStack>
          </Flex>

          {/* Quick Input Bar */}
          <form onSubmit={handleAddTask}>
            <HStack gap={2}>
              <Input
                placeholder="Add a new task or habit (press Enter)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                rounded="pill"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border"
                px={4}
                h="10"
                fontSize="sm"
              />
              <PillButton type="submit" variant="dark" size="sm" icon={LuPlus}>
                Add Task
              </PillButton>
            </HStack>
          </form>

          {/* Task Rows */}
          <Stack gap={2.5} mt={2} flex="1">
            {filteredTasks.map((task) => (
              <Flex
                key={task.id}
                align="center"
                justify="space-between"
                p={3.5}
                rounded="card"
                bg={task.completed ? "bg.muted" : "bg.panel"}
                borderWidth="1px"
                borderColor="border.glass"
                transition="all 0.2s"
                cursor="pointer"
                onClick={() => toggleTask(task.id)}
                _hover={{ transform: "translateY(-1px)", shadow: "glass" }}
              >
                <HStack gap={3}>
                  <Circle
                    size="6"
                    bg={task.completed ? "mint.solid" : "transparent"}
                    borderWidth={task.completed ? 0 : "2px"}
                    borderColor={task.completed ? "transparent" : "border"}
                    color={task.completed ? "mint.contrast" : "transparent"}
                  >
                    {task.completed ? <Icon as={LuCircleCheck} boxSize={3.5} /> : null}
                  </Circle>
                  <Text
                    fontSize="sm"
                    fontWeight={task.completed ? "normal" : "medium"}
                    textDecoration={task.completed ? "line-through" : "none"}
                    color={task.completed ? "fg.muted" : "fg"}
                  >
                    {task.title}
                  </Text>
                </HStack>

                <HStack gap={2}>
                  {task.streak && (
                    <HStack gap={1} bg="bg.muted" px={2} py={0.5} rounded="pill" fontSize="10px">
                      <Icon as={LuFlame} color="orange.fg" boxSize={3} />
                      <Text fontWeight="bold">{task.streak}d</Text>
                    </HStack>
                  )}
                  {task.timeEstimate && (
                    <Text fontSize="xs" color="fg.muted">
                      {task.timeEstimate}
                    </Text>
                  )}
                  <Badge size="sm" rounded="pill" variant="subtle">
                    {task.category}
                  </Badge>
                </HStack>
              </Flex>
            ))}
          </Stack>
        </Box>

        {/* Side Productivity Insights */}
        <VStack gap={4} align="stretch">
          <Box {...glassCard} p={5}>
            <Heading size="md" mb={2}>Focus Distribution</Heading>
            <Text fontSize="xs" color="fg.muted" mb={4}>Time breakdown across life domains</Text>

            <Stack gap={3}>
              <Box>
                <Flex justify="space-between" fontSize="xs" mb={1}>
                  <Text fontWeight="medium">Health & Fitness</Text>
                  <Text color="fg.muted">40%</Text>
                </Flex>
                <Box h="2" rounded="pill" bg="bg.muted" overflow="hidden">
                  <Box h="full" w="40%" bg="mint.solid" rounded="pill" />
                </Box>
              </Box>

              <Box>
                <Flex justify="space-between" fontSize="xs" mb={1}>
                  <Text fontWeight="medium">Financial & Planning</Text>
                  <Text color="fg.muted">30%</Text>
                </Flex>
                <Box h="2" rounded="pill" bg="bg.muted" overflow="hidden">
                  <Box h="full" w="30%" bg="blue.solid" rounded="pill" />
                </Box>
              </Box>

              <Box>
                <Flex justify="space-between" fontSize="xs" mb={1}>
                  <Text fontWeight="medium">Deep Work & Projects</Text>
                  <Text color="fg.muted">30%</Text>
                </Flex>
                <Box h="2" rounded="pill" bg="bg.muted" overflow="hidden">
                  <Box h="full" w="30%" bg="purple.solid" rounded="pill" />
                </Box>
              </Box>
            </Stack>
          </Box>

          <Box {...glassCard} p={5} flex="1">
            <HStack gap={2} mb={2}>
              <Icon as={LuSparkles} color="holo.lavender" boxSize={4} />
              <Heading size="md">PX Assistant</Heading>
            </HStack>
            <Text fontSize="xs" color="fg.muted" lineHeight="tall">
              You are 2 tasks away from completing all daily foundational habits. Completing "Deep work session" will secure your 100% daily streak!
            </Text>
          </Box>
        </VStack>
      </Grid>
    </Box>
  );
};

export default TasksRoute;
