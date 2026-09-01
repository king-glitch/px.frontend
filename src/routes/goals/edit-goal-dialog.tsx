import { useUpdateGoal } from "@/api";
import type { Goal, LifeArea, QuestCategory } from "@/api/types";
import {
	DialogActionTrigger,
	DialogBody,
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
import { Button, HStack, Icon, Input, SimpleGrid, Textarea, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { LuCheck, LuTarget } from "react-icons/lu";

interface EditGoalDialogProps {
	goal: Goal | null;
	isOpen: boolean;
	onClose: () => void;
}

const LIFE_AREAS = [
	{ value: "vitality", label: "Vitality (Physical Health)" },
	{ value: "mind", label: "Mind (Cognitive & Mental)" },
	{ value: "connection", label: "Connection (Social & Family)" },
	{ value: "craft", label: "Craft (Career & Creation)" },
	{ value: "abundance", label: "Abundance (Financial & Wealth)" },
	{ value: "mastery", label: "Mastery (Skills & Discipline)" },
];

const CATEGORIES = [
	{ value: "learning", label: "Learning & Education" },
	{ value: "health", label: "Health & Fitness" },
	{ value: "wealth", label: "Wealth & Finance" },
	{ value: "relationship", label: "Relationship" },
	{ value: "project", label: "Creative Project" },
	{ value: "discipline", label: "Discipline & Habit" },
];

export const EditGoalDialog: React.FC<EditGoalDialogProps> = ({
	goal,
	isOpen,
	onClose,
}) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [area, setArea] = useState<LifeArea>("mastery");
	const [category, setCategory] = useState<QuestCategory>("learning");
	const [targetDate, setTargetDate] = useState("");

	const updateMutation = useUpdateGoal();

	useEffect(() => {
		if (goal) {
			setTitle(goal.title || "");
			setDescription(goal.description || "");
			setArea(goal.area || "mastery");
			setCategory(goal.category || "learning");
			setTargetDate(goal.target_date ? goal.target_date.split("T")[0] : "");
		}
	}, [goal]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!goal || !title.trim()) return;

		try {
			await updateMutation.mutateAsync({
				goalId: goal.id,
				payload: {
					title: title.trim(),
					description: description.trim() || undefined,
					area,
					category,
					target_date: targetDate || undefined,
				},
			});
			toaster.create({
				title: "Goal Updated",
				description: `"${title}" has been updated successfully.`,
				type: "success",
			});
			onClose();
		} catch (err: any) {
			toaster.create({
				title: "Failed to update goal",
				description: err?.message || "An unexpected error occurred",
				type: "error",
			});
		}
	};

	return (
		<DialogRoot
			open={isOpen}
			onOpenChange={(e) => !e.open && onClose()}
			placement="center"
		>
			<DialogContent bg="bg.panel" backdropFilter="blur(20px)" maxW="lg">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<VStack align="flex-start" gap={1} w="full">
							<HStack gap={2}>
								<Icon as={LuTarget} color="lime.500" boxSize={5} />
								<DialogTitle>Edit Goal</DialogTitle>
							</HStack>
							<DialogDescription>
								Update your strategic goal details and target completion.
							</DialogDescription>
						</VStack>
					</DialogHeader>

					<DialogBody>
						<VStack gap={4} align="stretch">
							<Field label="Goal Title" required>
								<Input
									placeholder="e.g. Master Japanese N3"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									rounded="pill"
									bg="bg.muted"
								/>
							</Field>

							<Field label="Description (Optional)">
								<Textarea
									placeholder="Why is this goal critical to your character journey?"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rounded="xl"
									bg="bg.muted"
									rows={3}
								/>
							</Field>

							<SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
								<Field label="Life Area">
									<SearchableSelect
										items={LIFE_AREAS}
										value={area}
										onValueChange={(val) => setArea(val as LifeArea)}
									/>
								</Field>
								<Field label="Category">
									<SearchableSelect
										items={CATEGORIES}
										value={category}
										onValueChange={(val) => setCategory(val as QuestCategory)}
									/>
								</Field>
							</SimpleGrid>

							<Field label="Target Date (Optional)">
								<Input
									type="date"
									value={targetDate}
									onChange={(e) => setTargetDate(e.target.value)}
									rounded="pill"
									bg="bg.muted"
								/>
							</Field>
						</VStack>
					</DialogBody>

					<DialogFooter>
						<DialogActionTrigger asChild>
							<Button variant="outline">Cancel</Button>
						</DialogActionTrigger>
						<Button
							type="submit"
							colorPalette="lime"
							loading={updateMutation.isPending}
							disabled={!title.trim()}
						>
							<Icon as={LuCheck} mr={1} /> Save Changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</DialogRoot>
	);
};
