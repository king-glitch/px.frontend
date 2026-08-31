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
import { Field } from "@/components/ui/field";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
							bg="lime.500/15"
							color="lime.500"
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
					colorPalette="lime"
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
									? "lime.500/40"
									: isSecondary
										? "border.glass"
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
											colorPalette="lime"
											size="xs"
											variant="solid"
										>
											Primary
										</Badge>
									)}
									{isSecondary && (
										<Badge
											colorPalette="gray"
											size="xs"
											variant="subtle"
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
								<Text fontWeight="bold" color="lime.500">
									Lv. {level}
								</Text>
							</HStack>

							<Progress.Root
								value={(level % 10) * 10}
								max={100}
								size="xs"
							>
								<Progress.Track bg="bg.subtle" rounded="full">
									<Progress.Range bg="lime.solid" />
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
						<VStack gap={4} align="stretch">
							<Field label="Primary Specialization (+25% XP)" required>
								<SearchableSelect
									items={CATEGORIES.map((c) => ({
										label: `${CATEGORY_ICONS[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}`,
										value: c,
									}))}
									value={selectedPrimary}
									onValueChange={(val) =>
										setSelectedPrimary(
											val as QuestCategory,
										)
									}
									placeholder="Select Primary Category"
								/>
							</Field>

							<Field label="Secondary Specialization (+15% XP)" required>
								<SearchableSelect
									items={CATEGORIES.map((c) => ({
										label: `${CATEGORY_ICONS[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}`,
										value: c,
									}))}
									value={selectedSecondary}
									onValueChange={(val) =>
										setSelectedSecondary(
											val as QuestCategory,
										)
									}
									placeholder="Select Secondary Category"
								/>
							</Field>
						</VStack>
					</DialogBody>

					<DialogFooter>
						<DialogActionTrigger asChild>
							<Button variant="outline">Cancel</Button>
						</DialogActionTrigger>
						<Button
							colorPalette="lime"
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
