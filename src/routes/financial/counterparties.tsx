import { PillButton } from "@/components/ui/pill-button";
import {
	Badge,
	Box,
	Button,
	Circle,
	Editable,
	Field,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	Input,
	SimpleGrid,
	Skeleton,
	Stack,
	Table,
	Text,
	Textarea,
	VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
	LuBuilding2,
	LuCreditCard,
	LuFileText,
	LuPencil,
	LuSave,
	LuSmartphone,
	LuTrash2,
	LuUser,
	LuUsers,
} from "react-icons/lu";
import {
	useCounterparties,
	useDeleteCounterparty,
	useUpdateCounterparty,
} from "@/api";
import {
	counterpartySchema,
	type CounterpartyFormData,
} from "@/api/schemas";
import type { BankCounterparty } from "@/api/types";
import {
	DialogActionTrigger,
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { toaster } from "@/components/ui/toaster";
import { glassCard } from "@/routes/financial/layout";

export const FinancialCounterparties: React.FC = () => {
	const { data: counterparties = [], isLoading } = useCounterparties();
	const updateMutation = useUpdateCounterparty();
	const deleteMutation = useDeleteCounterparty();

	const [editingCounterparty, setEditingCounterparty] =
		useState<BankCounterparty | null>(null);
	const [deletingCounterparty, setDeletingCounterparty] =
		useState<BankCounterparty | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CounterpartyFormData>({
		resolver: zodResolver(counterpartySchema),
		defaultValues: {
			name: "",
			note: "",
		},
	});

	const handleOpenEdit = (cp: BankCounterparty) => {
		setEditingCounterparty(cp);
		reset({
			name: cp.name,
			note: cp.note || "",
		});
	};

	const onSubmit = async (data: CounterpartyFormData) => {
		if (!editingCounterparty) return;
		try {
			await updateMutation.mutateAsync({
				id: editingCounterparty.id,
				payload: {
					name: data.name || editingCounterparty.name,
					note: data.note,
				},
			});
			toaster.create({ title: "Counterparty updated", type: "success" });
			setEditingCounterparty(null);
		} catch (err: any) {
			toaster.create({
				title: "Failed to update counterparty",
				description: err?.message || "Could not save changes",
				type: "error",
			});
		}
	};

	const handleDelete = async () => {
		if (!deletingCounterparty) return;
		try {
			await deleteMutation.mutateAsync(deletingCounterparty.id);
			toaster.create({
				title: "Counterparty deleted",
				type: "success",
			});
			setDeletingCounterparty(null);
		} catch (err: any) {
			// Surface the Service.Conflict or specific backend error message
			toaster.create({
				title: "Cannot Delete Counterparty",
				description:
					err?.message ||
					"This counterparty is still referenced by existing transactions.",
				type: "error",
			});
			setDeletingCounterparty(null);
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "promptpay":
				return LuSmartphone;
			case "company":
				return LuBuilding2;
			case "card":
				return LuCreditCard;
			default:
				return LuUser;
		}
	};

	return (
		<Stack gap={6}>
			{/* Page Header */}
			<Flex justify="space-between" align="center" wrap="wrap" gap={3}>
				<VStack align="flex-start" gap={0}>
					<Heading fontSize="md" fontWeight="bold">
						Payees & Counterparties
					</Heading>
					<Text fontSize="xs" color="fg.muted">
						Manage recognized vendors, transfer recipients, and payees
					</Text>
				</VStack>

				<Badge size="sm" rounded="pill" variant="outline" px={3} py={1}>
					{counterparties.length} Counterparties
				</Badge>
			</Flex>

			{/* Edit Counterparty Modal Dialog */}
			<DialogRoot
				open={Boolean(editingCounterparty)}
				onOpenChange={(details) => {
					if (!details.open) setEditingCounterparty(null);
				}}
				size="md"
			>
				<DialogContent {...glassCard} bg="bg.panel" p={6}>
					<DialogHeader p={0} mb={4}>
						<DialogTitle fontSize="md" fontWeight="bold">
							Edit Counterparty
						</DialogTitle>
					</DialogHeader>
					<DialogCloseTrigger />
					<DialogBody p={0}>
						<Box as="form" onSubmit={handleSubmit(onSubmit)}>
							<Stack gap={4}>
								<Field.Root invalid={!!errors.name}>
									<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
										Display Name
									</Field.Label>
									<Input
										placeholder="e.g. Starbucks, Central Group"
										size="sm"
										rounded="pill"
										bg="bg.muted"
										{...register("name")}
									/>
									{errors.name && (
										<Field.ErrorText fontSize="xs">
											{errors.name.message}
										</Field.ErrorText>
									)}
								</Field.Root>

								<Field.Root invalid={!!errors.note}>
									<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
										User Label / Note
									</Field.Label>
									<Textarea
										placeholder="e.g. Somchai's personal phone promptpay"
										size="sm"
										rounded="card"
										bg="bg.muted"
										rows={2}
										{...register("note")}
									/>
								</Field.Root>

								<HStack justify="flex-end" gap={2} pt={2}>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										rounded="pill"
										onClick={() => setEditingCounterparty(null)}
									>
										Cancel
									</Button>
									<PillButton
										type="submit"
										size="sm"
										variant="dark"
										icon={LuSave}
										loading={updateMutation.isPending}
									>
										Save Changes
									</PillButton>
								</HStack>
							</Stack>
						</Box>
					</DialogBody>
				</DialogContent>
			</DialogRoot>

			{/* Delete Confirmation Dialog */}
			<DialogRoot
				open={Boolean(deletingCounterparty)}
				onOpenChange={(details) => {
					if (!details.open) setDeletingCounterparty(null);
				}}
				size="sm"
			>
				<DialogContent {...glassCard} bg="bg.panel" p={6}>
					<DialogHeader p={0} mb={2}>
						<DialogTitle fontSize="md" fontWeight="bold">
							Delete Counterparty
						</DialogTitle>
					</DialogHeader>
					<DialogCloseTrigger />
					<DialogBody p={0} mb={4}>
						<Text fontSize="sm" color="fg.muted">
							Are you sure you want to delete{" "}
							<Text as="span" fontWeight="bold" color="fg">
								{deletingCounterparty?.note || deletingCounterparty?.name}
							</Text>
							?
						</Text>
						<Text fontSize="xs" color="fg.muted" mt={2}>
							Note: If existing transactions reference this counterparty, deletion will be blocked to preserve your transaction history.
						</Text>
					</DialogBody>
					<DialogFooter p={0} gap={2}>
						<DialogActionTrigger asChild>
							<Button variant="ghost" size="sm" rounded="pill">
								Cancel
							</Button>
						</DialogActionTrigger>
						<Button
							colorPalette="red"
							size="sm"
							rounded="pill"
							loading={deleteMutation.isPending}
							onClick={handleDelete}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</DialogRoot>

			{/* Main Content */}
			<Box {...glassCard} p={{ base: 4, md: 6 }}>
				{isLoading ? (
					<Stack gap={3}>
						<Skeleton h="12" rounded="pill" />
						<Skeleton h="12" rounded="pill" />
						<Skeleton h="12" rounded="pill" />
					</Stack>
				) : counterparties.length === 0 ? (
					<VStack py={12} textAlign="center" color="fg.muted">
						<Icon as={LuUsers} boxSize={10} color="fg.muted" />
						<Text fontSize="sm" fontWeight="medium">
							No counterparties found yet.
						</Text>
						<Text fontSize="xs">
							Counterparties are automatically created and recognized when you ingest bank slips or record transactions.
						</Text>
					</VStack>
				) : (
					<Table.ScrollArea>
						<Table.Root size="sm" variant="line">
							<Table.Header>
								<Table.Row>
									<Table.ColumnHeader fontSize="xs" w="60px">
										Type
									</Table.ColumnHeader>
									<Table.ColumnHeader fontSize="xs" minW="180px">
										Name
									</Table.ColumnHeader>
									<Table.ColumnHeader fontSize="xs" minW="220px">
										User Note / Label (Inline Editable)
									</Table.ColumnHeader>
									<Table.ColumnHeader fontSize="xs" minW="160px">
										Account / PromptPay / Card
									</Table.ColumnHeader>
									<Table.ColumnHeader fontSize="xs" textAlign="center" w="90px">
										Actions
									</Table.ColumnHeader>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{counterparties.map((cp) => {
									const TypeIcon = getTypeIcon(cp.type);
									const accountLabel =
										cp.prompt_pay_id ||
										cp.account_number ||
										cp.card_number ||
										cp.fingerprint ||
										"-";

									return (
										<Table.Row
											key={cp.id}
											_hover={{ bg: "bg.muted" }}
											transition="background 0.15s ease"
										>
											{/* Type Badge */}
											<Table.Cell>
												<Circle
													size="7"
													bg="bg.muted"
													color="fg.muted"
													title={cp.type}
												>
													<Icon as={TypeIcon} boxSize={3.5} />
												</Circle>
											</Table.Cell>

											{/* Name */}
											<Table.Cell>
												<VStack align="flex-start" gap={0}>
													<Text fontSize="xs" fontWeight="semibold">
														{cp.name}
													</Text>
													<Badge size="xs" variant="outline" rounded="pill">
														{cp.type}
													</Badge>
												</VStack>
											</Table.Cell>

											{/* User Note Inline Editable */}
											<Table.Cell>
												<Editable.Root
													key={cp.id + (cp.note || "")}
													defaultValue={cp.note || ""}
													placeholder="Click to add custom label..."
													onValueCommit={(details) => {
														if (details.value !== cp.note) {
															updateMutation.mutate({
																id: cp.id,
																payload: { note: details.value },
															});
														}
													}}
												>
													<Editable.Preview
														fontSize="xs"
														cursor="pointer"
														_hover={{
															bg: "bg.panel",
															rounded: "sm",
															px: 1,
														}}
													/>
													<Editable.Input
														fontSize="xs"
														rounded="pill"
														bg="bg.panel"
														px={2}
														py={1}
													/>
												</Editable.Root>
											</Table.Cell>

											{/* Account Info */}
											<Table.Cell fontSize="xs" color="fg.muted" fontFamily="mono">
												{accountLabel}
											</Table.Cell>

											{/* Actions */}
											<Table.Cell textAlign="center">
												<HStack justify="center" gap={1}>
													<IconButton
														size="xs"
														variant="ghost"
														aria-label="Edit counterparty"
														title="Edit"
														rounded="full"
														onClick={() => handleOpenEdit(cp)}
													>
														<Icon as={LuPencil} boxSize={3.5} />
													</IconButton>
													<IconButton
														size="xs"
														variant="ghost"
														colorPalette="red"
														aria-label="Delete counterparty"
														title="Delete"
														rounded="full"
														onClick={() => setDeletingCounterparty(cp)}
													>
														<Icon as={LuTrash2} boxSize={3.5} />
													</IconButton>
												</HStack>
											</Table.Cell>
										</Table.Row>
									);
								})}
							</Table.Body>
						</Table.Root>
					</Table.ScrollArea>
				)}
			</Box>
		</Stack>
	);
};

export default FinancialCounterparties;
