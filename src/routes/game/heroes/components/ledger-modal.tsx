import React, { useState } from "react";
import {
	Badge,
	Box,
	Button,
	Flex,
	Grid,
	HStack,
	Icon,
	Skeleton,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuClipboardList, LuArrowRight } from "react-icons/lu";
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
import { EmptyState } from "@/components/ui/empty-state";
import { useLedger } from "@/api";

interface LedgerModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const LedgerModal: React.FC<LedgerModalProps> = ({
	open,
	onOpenChange,
}) => {
	const [page, setPage] = useState(1);
	const { data: ledger, isLoading } = useLedger(page, 10);

	return (
		<DialogRoot
			open={open}
			onOpenChange={(details) => onOpenChange(details.open)}
			placement="center"
		>
			<DialogContent
				maxW="3xl"
				rounded="2xl"
				bg="bg.panel"
				borderWidth="1px"
				borderColor="border.glass"
				shadow="float"
				p={{ base: 4, md: 6 }}
			>
				<DialogHeader pb={2}>
					<Stack gap={0.5}>
						<DialogTitle fontSize="lg">
							EXP & PX Award Ledger
						</DialogTitle>
						<DialogDescription fontSize="xs" color="fg.muted">
							Full audit history of all quest completions, health
							rewards, streaks, and purchases.
						</DialogDescription>
					</Stack>
				</DialogHeader>

				<DialogBody py={3} maxH="60vh" overflowY="auto">
					{isLoading ? (
						<Stack gap={2}>
							{[0, 1, 2, 3, 4].map((i) => (
								<Skeleton key={i} h="14" rounded="card" />
							))}
						</Stack>
					) : !ledger || ledger.entries.length === 0 ? (
						<EmptyState
							title="No ledger entries found"
							description="Complete quests or earn rewards to populate your ledger."
							icon={<Icon as={LuClipboardList} boxSize={6} />}
						/>
					) : (
						<Stack gap={2.5}>
							{ledger.entries.map((entry) => (
								<Box
									key={entry.id}
									p={3.5}
									rounded="card"
									bg="bg.muted"
									borderWidth="1px"
									borderColor="border.glass"
								>
									<Flex
										justify="space-between"
										align="center"
										wrap="wrap"
										gap={2}
									>
										<Stack gap={0.5}>
											<HStack gap={2}>
												<Badge
													size="xs"
													rounded="pill"
													variant="subtle"
													colorPalette={
														entry.source === "quest"
															? "mint"
															: entry.source ===
																  "shop"
																? "amber"
																: "blue"
													}
												>
													{entry.source}
												</Badge>
												<Text
													fontSize="xs"
													fontWeight="semibold"
												>
													{entry.reason ||
														"Reward Award"}
												</Text>
											</HStack>
											<HStack
												gap={2}
												fontSize="10px"
												color="fg.muted"
											>
												<Text>{entry.occurred_on}</Text>
												{entry.decay_factor < 1 && (
													<Text>
														Decay:{" "}
														{Math.round(
															entry.decay_factor *
																100,
														)}
														%
													</Text>
												)}
												{entry.multiplier > 1 && (
													<Text>
														Multiplier:{" "}
														{entry.multiplier}x
													</Text>
												)}
											</HStack>
										</Stack>

										<HStack gap={3}>
											{entry.exp_delta !== 0 && (
												<Text
													fontSize="xs"
													fontWeight="bold"
													color={
														entry.exp_delta > 0
															? "mint.fg"
															: "red.500"
													}
												>
													{entry.exp_delta > 0
														? `+${entry.exp_delta}`
														: entry.exp_delta}{" "}
													EXP
												</Text>
											)}
											{entry.px_delta !== 0 && (
												<Text
													fontSize="xs"
													fontWeight="bold"
													color={
														entry.px_delta > 0
															? "amber.fg"
															: "red.500"
													}
												>
													{entry.px_delta > 0
														? `+${entry.px_delta}`
														: entry.px_delta}{" "}
													PX
												</Text>
											)}
										</HStack>
									</Flex>
								</Box>
							))}
						</Stack>
					)}
				</DialogBody>

				<DialogFooter pt={3}>
					<Flex justify="space-between" w="full" gap={3}>
						<HStack gap={2}>
							<Button
								size="xs"
								variant="outline"
								rounded="pill"
								disabled={page <= 1}
								onClick={() =>
									setPage((p) => Math.max(1, p - 1))
								}
							>
								Previous
							</Button>
							<Text fontSize="xs" color="fg.muted">
								Page {page} of {ledger?.total_pages || 1}
							</Text>
							<Button
								size="xs"
								variant="outline"
								rounded="pill"
								disabled={!ledger || page >= ledger.total_pages}
								onClick={() => setPage((p) => p + 1)}
							>
								Next
							</Button>
						</HStack>

						<Button
							size="xs"
							variant="ghost"
							rounded="pill"
							onClick={() => onOpenChange(false)}
						>
							Close
						</Button>
					</Flex>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
};

export default LedgerModal;
