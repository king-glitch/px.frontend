import React, { useState } from "react";
import {
	Badge,
	Box,
	Button,
	Circle,
	Flex,
	HStack,
	Heading,
	Icon,
	Progress,
	SimpleGrid,
	Text,
	VStack,
} from "@chakra-ui/react";
import { LuAward, LuCrown, LuSparkles, LuStar, LuZap } from "react-icons/lu";
import {
	DialogActionTrigger,
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { toaster } from "@/components/ui/toaster";
import {
	useCategoryMastery,
	useSetSpecialization,
	type QuestCategory,
} from "@/api";
import { glassCard } from "./perks-data";

const CATEGORIES: QuestCategory[] = [
	"health",
	"work",
	"learning",
	"chores",
	"mindfulness",
	"social",
	"finance",
];

const CATEGORY_ICONS: Record<QuestCategory, string> = {
	health: "❤️",
	work: "💼",
	learning: "📚",
	chores: "🧹",
	mindfulness: "🧘",
	social: "🤝",
	finance: "💰",
};

export const CategoryMasteryCard: React.FC = () => {
	const { data: masterySummary } = useCategoryMastery();
	const setSpecializationMutation = useSetSpecialization();
	const [specOpen, setSpecOpen] = useState(false);
	const [selectedPrimary, setSelectedPrimary] = useState<QuestCategory>(
		masterySummary?.primary || "learning",
	);
	const [selectedSecondary, setSelectedSecondary] = useState<QuestCategory>(
		masterySummary?.secondary || "health",
	);

	const handleSaveSpecialization = async () => {
		if (selectedPrimary === selectedSecondary) {
			toaster.create({
				title: "Duplicate Specialization",
				description:
					"Primary and Secondary categories must be different.",
				type: "warning",
			});
			return;
		}

		try {
			await setSpecializationMutation.mutateAsync({
				primary: selectedPrimary,
				secondary: selectedSecondary,
			});
			toaster.create({
				title: "Specialization Assigned!",
				description: `Primary: ${selectedPrimary}, Secondary: ${selectedSecondary}`,
				type: "success",
			});
			setSpecOpen(false);
		} catch (e: any) {
			toaster.create({
				title: "Failed to set specialization",
				description: e?.message || "Something went wrong",
				type: "error",
			});
		}
	};

	const masteries = masterySummary?.masteries || [];

	return (
		<Box {...glassCard} p={5}>
			<Flex justify="space-between" align="center" mb={4}>
				<VStack align="flex-start" gap={0.5}>
					<HStack gap={2}>
						<Circle
							size="28px"
							bg="purple.500/15"
							color="purple.400"
						>
							<Icon as={LuCrown} boxSize={4} />
						</Circle>
						<Heading size="md">
							Category Mastery & Specializations
						</Heading>
					</HStack>
					<Text fontSize="xs" color="fg.muted">
						Deepen mastery through consistent quests.
						Specializations boost XP by +25%.
					</Text>
				</VStack>

				<Button
					size="xs"
					variant="subtle"
					colorPalette="purple"
					onClick={() => {
						setSelectedPrimary(
							masterySummary?.primary || "learning",
						);
						setSelectedSecondary(
							masterySummary?.secondary || "health",
						);
						setSpecOpen(true);
					}}
				>
					<Icon as={LuStar} /> Specialize
				</Button>
			</Flex>

			{/* Mastery Cards Grid */}
			<SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={3}>
				{CATEGORIES.map((cat) => {
					const mastery = masteries.find((m) => m.category === cat);
					const level = mastery?.mastery_level || 1;
					const isPrimary = masterySummary?.primary === cat;
					const isSecondary = masterySummary?.secondary === cat;

					let title = "Novice";
					if (level >= 50) title = "Grandmaster";
					else if (level >= 30) title = "Master";
					else if (level >= 20) title = "Expert";
					else if (level >= 10) title = "Adept";
					else if (level >= 5) title = "Apprentice";

					return (
						<Box
							key={cat}
							bg="bg.panel"
							p={3.5}
							rounded="lg"
							borderWidth="1px"
							borderColor={
								isPrimary
									? "purple.500/40"
									: isSecondary
										? "blue.500/40"
										: "border.subtle"
							}
							position="relative"
						>
							<Flex
								justify="space-between"
								align="flex-start"
								mb={2}
							>
								<HStack gap={2}>
									<Text fontSize="lg">
										{CATEGORY_ICONS[cat]}
									</Text>
									<VStack align="flex-start" gap={0}>
										<Text
											fontSize="xs"
											fontWeight="bold"
											textTransform="capitalize"
										>
											{cat}
										</Text>
										<Text fontSize="2xs" color="fg.muted">
											{title}
										</Text>
									</VStack>
								</HStack>

								<HStack gap={1}>
									{isPrimary && (
										<Badge
											colorPalette="purple"
											size="xs"
											variant="solid"
										>
											Primary
										</Badge>
									)}
									{isSecondary && (
										<Badge
											colorPalette="blue"
											size="xs"
											variant="solid"
										>
											Secondary
										</Badge>
									)}
								</HStack>
							</Flex>

							<HStack
								justify="space-between"
								fontSize="xs"
								color="fg.muted"
								mb={1}
							>
								<Text>Mastery Rank</Text>
								<Text fontWeight="bold" color="purple.400">
									Lv. {level}
								</Text>
							</HStack>

							<Progress.Root
								value={(level % 10) * 10}
								max={100}
								size="xs"
							>
								<Progress.Track bg="bg.subtle" rounded="full">
									<Progress.Range bg="purple.400" />
								</Progress.Track>
							</Progress.Root>
						</Box>
					);
				})}
			</SimpleGrid>

			{/* Specialization Dialog */}
			<DialogRoot
				open={specOpen}
				onOpenChange={(e) => setSpecOpen(e.open)}
			>
				<DialogContent maxW="500px">
					<DialogHeader>
						<DialogTitle>
							Choose Category Specializations
						</DialogTitle>
						<DialogDescription>
							Select 1 Primary (+25% XP) and 1 Secondary (+15% XP)
							category focus.
						</DialogDescription>
					</DialogHeader>

					<DialogBody>
						<VStack gap={4}>
							<Box w="full">
								<Text fontSize="xs" fontWeight="bold" mb={1}>
									Primary Specialization
								</Text>
								<select
									value={selectedPrimary}
									onChange={(e) =>
										setSelectedPrimary(
											e.target.value as QuestCategory,
										)
									}
									style={{
										width: "100%",
										padding: "8px",
										borderRadius: "8px",
										background: "transparent",
										border: "1px solid var(--chakra-colors-border-glass)",
									}}
								>
									{CATEGORIES.map((c) => (
										<option key={c} value={c}>
											{c.toUpperCase()}
										</option>
									))}
								</select>
							</Box>

							<Box w="full">
								<Text fontSize="xs" fontWeight="bold" mb={1}>
									Secondary Specialization
								</Text>
								<select
									value={selectedSecondary}
									onChange={(e) =>
										setSelectedSecondary(
											e.target.value as QuestCategory,
										)
									}
									style={{
										width: "100%",
										padding: "8px",
										borderRadius: "8px",
										background: "transparent",
										border: "1px solid var(--chakra-colors-border-glass)",
									}}
								>
									{CATEGORIES.map((c) => (
										<option key={c} value={c}>
											{c.toUpperCase()}
										</option>
									))}
								</select>
							</Box>
						</VStack>
					</DialogBody>

					<DialogFooter>
						<DialogActionTrigger asChild>
							<Button variant="outline">Cancel</Button>
						</DialogActionTrigger>
						<Button
							colorPalette="purple"
							loading={setSpecializationMutation.isPending}
							onClick={handleSaveSpecialization}
						>
							Confirm Specialization
						</Button>
					</DialogFooter>
				</DialogContent>
			</DialogRoot>
		</Box>
	);
};
