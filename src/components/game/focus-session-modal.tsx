import { useCompleteQuest } from "@/api/hooks/use-game";
import type { Quest, QuestSubtask } from "@/api/types";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Badge,
	Box,
	Button,
	Card,
	Circle,
	HStack,
	Heading,
	Icon,
	Progress,
	Text,
	VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
	LuCheck,
	LuClock,
	LuFlame,
	LuPause,
	LuPlay,
	LuRotateCcw,
	LuSparkles,
	LuX,
	LuZap,
} from "react-icons/lu";

interface FocusSessionModalProps {
	isOpen: boolean;
	onClose: () => void;
	quest: Quest | null;
	subtask?: QuestSubtask | null;
	isMVQ?: boolean;
}

export const FocusSessionModal: React.FC<FocusSessionModalProps> = ({
	isOpen,
	onClose,
	quest,
	subtask,
	isMVQ = false,
}) => {
	const initialMinutes =
		isMVQ && quest?.mvq_minutes ? quest.mvq_minutes : quest?.minutes || 25;
	const [mode, setMode] = useState<"countdown" | "countup">("countdown");
	const [secondsRemaining, setSecondsRemaining] = useState(
		initialMinutes * 60,
	);
	const [secondsElapsed, setSecondsElapsed] = useState(0);
	const [isRunning, setIsRunning] = useState(false);

	const completeQuestMutation = useCompleteQuest();

	useEffect(() => {
		if (quest) {
			const m =
				isMVQ && quest.mvq_minutes
					? quest.mvq_minutes
					: quest.minutes || 25;
			setSecondsRemaining(m * 60);
			setSecondsElapsed(0);
			setIsRunning(false);
		}
	}, [quest, isMVQ]);

	useEffect(() => {
		let timer: any;
		if (isRunning) {
			timer = setInterval(() => {
				setSecondsElapsed((prev) => prev + 1);
				setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
			}, 1000);
		}
		return () => clearInterval(timer);
	}, [isRunning]);

	if (!quest) return null;

	const formatTime = (totalSec: number) => {
		const m = Math.floor(totalSec / 60);
		const s = totalSec % 60;
		return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	const totalSeconds = initialMinutes * 60;
	const progressPercent =
		mode === "countdown"
			? Math.min(
					100,
					Math.max(
						0,
						((totalSeconds - secondsRemaining) / totalSeconds) *
							100,
					),
				)
			: Math.min(100, (secondsElapsed / totalSeconds) * 100);

	const handleComplete = async () => {
		setIsRunning(false);
		const today = new Date().toISOString().split("T")[0];
		await completeQuestMutation.mutateAsync({
			id: quest.id,
			on: today,
		});
		onClose();
	};

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
								bg="purple.500/15"
								color="purple.400"
							>
								<Icon as={LuFlame} boxSize={5} />
							</Circle>
							<VStack align="flex-start" gap={0}>
								<DialogTitle
									fontSize="lg"
									fontWeight="bold"
								>
									Focus Session
								</DialogTitle>
								<Text fontSize="xs" color="fg.muted">
									Distraction-free execution flow
								</Text>
							</VStack>
						</HStack>
						<DialogCloseTrigger />
					</HStack>
				</DialogHeader>

					<DialogBody p={0}>
						<VStack gap={6} align="stretch">
							{/* Quest Focus Card */}
							<Card.Root
								bg="bg.subtle"
								p={4}
								rounded="xl"
								borderWidth="1px"
								borderColor="border.glass"
							>
								<VStack align="flex-start" gap={2}>
									<HStack
										justify="space-between"
										width="full"
									>
										<Badge
											colorPalette="purple"
											variant="subtle"
											size="sm"
										>
											{quest.category}
										</Badge>
										{isMVQ && (
											<Badge
												colorPalette="amber"
												variant="solid"
												size="sm"
											>
												<Icon as={LuZap} mr={1} /> MVQ
												Mode ({quest.mvq_minutes || 5}m)
											</Badge>
										)}
									</HStack>
									<Heading size="md" fontWeight="bold">
										{quest.title}
									</Heading>
									{subtask && (
										<HStack
											gap={2}
											bg="bg.surface"
											p={2}
											rounded="md"
											width="full"
											borderWidth="1px"
											borderColor="purple.500/30"
										>
											<Icon
												as={LuCheck}
												color="purple.400"
											/>
											<Text
												fontSize="sm"
												fontWeight="medium"
											>
												Subtask: {subtask.title}
											</Text>
										</HStack>
									)}
								</VStack>
							</Card.Root>

							{/* Timer Display */}
							<VStack gap={4} py={4} align="center">
								<HStack gap={2}>
									<Button
										size="xs"
										variant={
											mode === "countdown"
												? "solid"
												: "subtle"
										}
										colorPalette="purple"
										onClick={() => setMode("countdown")}
									>
										Countdown
									</Button>
									<Button
										size="xs"
										variant={
											mode === "countup"
												? "solid"
												: "subtle"
										}
										colorPalette="purple"
										onClick={() => setMode("countup")}
									>
										Stopwatch
									</Button>
								</HStack>

								<Heading
									fontSize="6xl"
									fontWeight="black"
									fontFamily="mono"
									letterSpacing="wider"
								>
									{mode === "countdown"
										? formatTime(secondsRemaining)
										: formatTime(secondsElapsed)}
								</Heading>

								<Box width="full" px={4}>
									<Progress.Root
										value={progressPercent}
										colorPalette="purple"
										size="md"
									>
										<Progress.Track
											bg="whiteAlpha.100"
											rounded="full"
										>
											<Progress.Range rounded="full" />
										</Progress.Track>
									</Progress.Root>
								</Box>

								<HStack gap={4} pt={2}>
									<Button
										size="lg"
										colorPalette="purple"
										variant={
											isRunning ? "outline" : "solid"
										}
										onClick={() => setIsRunning(!isRunning)}
										minW="140px"
										rounded="full"
									>
										<Icon
											as={isRunning ? LuPause : LuPlay}
											mr={2}
										/>
										{isRunning ? "Pause" : "Start Focus"}
									</Button>
									<Button
										size="lg"
										variant="ghost"
										onClick={() => {
											setIsRunning(false);
											setSecondsRemaining(
												initialMinutes * 60,
											);
											setSecondsElapsed(0);
										}}
										rounded="full"
									>
										<Icon as={LuRotateCcw} />
									</Button>
								</HStack>
							</VStack>
						</VStack>
					</DialogBody>

					<DialogFooter p={0} mt={6}>
						<HStack justify="space-between" width="full">
							<HStack gap={1} color="fg.muted" fontSize="xs">
								<Icon as={LuClock} boxSize={3.5} />
								<Text>
									{Math.floor(
										secondsElapsed / 60,
									)}
									m elapsed
								</Text>
							</HStack>
							<HStack gap={2}>
								<Button
									variant="outline"
									size="sm"
									onClick={onClose}
								>
									Cancel
								</Button>
								<Button
									colorPalette="teal"
									size="sm"
									onClick={handleComplete}
									loading={completeQuestMutation.isPending}
								>
									<Icon as={LuSparkles} mr={1} />
									Complete Quest
								</Button>
							</HStack>
						</HStack>
					</DialogFooter>
				</DialogContent>
		</DialogRoot>
	);
};
