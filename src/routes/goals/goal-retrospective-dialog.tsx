import { useCloseGoalWithRetrospective } from "@/api/hooks/use-game";
import type { Goal, GoalRetrospectiveOutcome } from "@/api/types";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import {
	Badge,
	Box,
	Button,
	Card,
	Circle,
	HStack,
	Heading,
	Icon,
	Input,
	SimpleGrid,
	Text,
	Textarea,
	VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { LuAward, LuCheck, LuSparkles } from "react-icons/lu";

interface GoalRetrospectiveDialogProps {
	isOpen: boolean;
	onClose: () => void;
	goal: Goal | null;
}

export const GoalRetrospectiveDialog: React.FC<
	GoalRetrospectiveDialogProps
> = ({ isOpen, onClose, goal }) => {
	const [outcome, setOutcome] =
		useState<GoalRetrospectiveOutcome>("achieved");
	const [obstacles, setObstacles] = useState("");
	const [learnings, setLearnings] = useState("");
	const [effectiveRoutines, setEffectiveRoutines] = useState("");

	const closeGoalMutation = useCloseGoalWithRetrospective();

	if (!goal) return null;

	const handleSubmit = async () => {
		const routinesArray = effectiveRoutines
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		await closeGoalMutation.mutateAsync({
			goalId: goal.id,
			payload: {
				outcome,
				obstacles,
				learnings,
				effective_routines: routinesArray,
			},
		});
		onClose();
	};

	const outcomeOptions: {
		value: GoalRetrospectiveOutcome;
		label: string;
		desc: string;
	}[] = [
		{
			value: "achieved",
			label: "Achieved",
			desc: "Outcome fully realized according to plan",
		},
		{
			value: "partially_achieved",
			label: "Partially Achieved",
			desc: "Meaningful progress with pivot",
		},
		{
			value: "abandoned",
			label: "Abandoned",
			desc: "Deprioritized or no longer relevant",
		},
		{
			value: "replaced",
			label: "Replaced",
			desc: "Superseded by a new higher-impact goal",
		},
	];

	return (
		<DialogRoot
			open={isOpen}
			onOpenChange={(e) => !e.open && onClose()}
			size="lg"
			placement="center"
		>
			<DialogContent
				bg="bg.panel"
				borderWidth="1px"
				borderColor="border.glass"
				rounded="2xl"
				p={6}
				shadow="float"
			>
				<DialogHeader p={0} mb={4}>
					<HStack justify="space-between" align="center">
						<HStack gap={2}>
							<Circle
								size="32px"
								bg="lime.500/15"
								color="lime.500"
							>
								<Icon as={LuAward} boxSize={5} />
							</Circle>
							<VStack align="flex-start" gap={0}>
								<DialogTitle
									fontSize="lg"
									fontWeight="bold"
								>
									Goal Retrospective & Closure
								</DialogTitle>
								<Text fontSize="xs" color="fg.muted">
									Reflect, synthesize learnings, and archive
								</Text>
							</VStack>
						</HStack>
						<DialogCloseTrigger />
					</HStack>
				</DialogHeader>

					<DialogBody p={0}>
						<VStack gap={5} align="stretch">
							{/* Goal Meta Card */}
							<Card.Root
								bg="bg.subtle"
								p={4}
								rounded="xl"
								borderWidth="1px"
								borderColor="border.glass"
							>
								<VStack align="flex-start" gap={1}>
									<Badge
										colorPalette="lime"
										variant="subtle"
										size="sm"
									>
										{goal.area}
									</Badge>
									<Heading size="md" fontWeight="bold">
										{goal.title}
									</Heading>
									{goal.description && (
										<Text fontSize="sm" color="fg.muted">
											{goal.description}
										</Text>
									)}
								</VStack>
							</Card.Root>

							{/* Outcome Selection Grid */}
							<VStack align="flex-start" gap={2}>
								<Text fontSize="sm" fontWeight="semibold">
									Outcome Status
								</Text>
								<SimpleGrid
									columns={{ base: 1, sm: 2 }}
									gap={3}
									width="full"
								>
									{outcomeOptions.map((opt) => {
										const isSelected =
											outcome === opt.value;
										return (
											<Box
												key={opt.value}
												role="button"
												tabIndex={0}
												onClick={() =>
													setOutcome(opt.value)
												}
												onKeyDown={(e) => {
													if (
														e.key === "Enter" ||
														e.key === " "
													) {
														setOutcome(opt.value);
													}
												}}
												p={3}
												rounded="xl"
												borderWidth="1px"
												borderColor={
													isSelected
														? "lime.500"
														: "border.glass"
												}
												bg={
													isSelected
														? "lime.500/10"
														: "bg.surface"
												}
												textAlign="left"
												cursor="pointer"
												transition="all 0.15s ease"
											>
												<HStack
													justify="space-between"
													width="full"
													mb={1}
												>
													<Text
														fontWeight="bold"
														fontSize="sm"
														color={
															isSelected
																? "lime.500"
																: "inherit"
														}
													>
														{opt.label}
													</Text>
													{isSelected && (
														<Icon
															as={LuCheck}
															color="lime.500"
														/>
													)}
												</HStack>
												<Text
													fontSize="xs"
													color="fg.muted"
												>
													{opt.desc}
												</Text>
											</Box>
										);
									})}
								</SimpleGrid>
							</VStack>

							{/* Obstacles Encountered */}
							<Field label="Obstacles & Bottlenecks">
								<Textarea
									placeholder="What hindered momentum or took longer than expected?"
									value={obstacles}
									onChange={(e) =>
										setObstacles(e.target.value)
									}
									rows={2}
									fontSize="sm"
									bg="bg.muted"
									borderColor="border"
									rounded="xl"
								/>
							</Field>

							{/* Learnings & Key Takeaways */}
							<Field label="Key Learnings for Next Goals">
								<Textarea
									placeholder="What worked well? What rules will you carry forward?"
									value={learnings}
									onChange={(e) =>
										setLearnings(e.target.value)
									}
									rows={2}
									fontSize="sm"
									bg="bg.muted"
									borderColor="border"
									rounded="xl"
								/>
							</Field>

							{/* Effective Routines */}
							<Field label="Effective Routines (comma-separated)">
								<Input
									placeholder="e.g. Morning Focus, Weekly Sprint Reset"
									value={effectiveRoutines}
									onChange={(e) =>
										setEffectiveRoutines(e.target.value)
									}
									fontSize="sm"
									bg="bg.muted"
									borderColor="border"
									rounded="pill"
								/>
							</Field>
						</VStack>
					</DialogBody>

					<DialogFooter p={0} mt={6}>
						<HStack justify="flex-end" gap={2} width="full">
							<Button
								variant="outline"
								size="sm"
								onClick={onClose}
							>
								Cancel
							</Button>
							<Button
								colorPalette="lime"
								size="sm"
								onClick={handleSubmit}
								loading={closeGoalMutation.isPending}
							>
								<Icon as={LuSparkles} mr={1} />
								Finalize Retrospective
							</Button>
						</HStack>
					</DialogFooter>
				</DialogContent>
		</DialogRoot>
	);
};
