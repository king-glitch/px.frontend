import {
	Badge,
	Box,
	Button,
	Circle,
	Flex,
	FormatNumber,
	HStack,
	Heading,
	Icon,
	Skeleton,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import {
	LuArrowLeft,
	LuCalendar,
	LuCheck,
	LuCreditCard,
	LuDollarSign,
	LuFileText,
	LuReceipt,
	LuTrash2,
} from "react-icons/lu";
import { Link, useNavigate, useParams } from "react-router";
import {
	useAccounts,
	useBanks,
	useCategories,
	useDeleteTransaction,
	useTransaction,
} from "@/api";
import type { BankAccount } from "@/api/types";
import TransactionForm from "@/components/financial/transaction-form";
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

export const FinancialTransactionDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const { data: transaction, isLoading } = useTransaction(id);
	const { data: categories = [] } = useCategories();
	const { data: banks = [] } = useBanks();
	const { data: accounts = [] } = useAccounts();

	const deleteMutation = useDeleteTransaction();

	const category = transaction?.category_id
		? categories.find((c) => c.id === transaction.category_id)
		: undefined;

	const fromAccount = transaction?.from_bank_account_id
		? accounts.find((a: BankAccount) => a.id === transaction.from_bank_account_id)
		: undefined;

	const toAccount = transaction?.to_bank_account_id
		? accounts.find((a: BankAccount) => a.id === transaction.to_bank_account_id)
		: undefined;

	const fromBank = fromAccount
		? banks.find((b) => b.id === fromAccount.bank_id)
		: undefined;

	const toBank = toAccount
		? banks.find((b) => b.id === toAccount.bank_id)
		: undefined;

	const handleDelete = async () => {
		if (!id) return;
		try {
			await deleteMutation.mutateAsync(id);
			toaster.create({ title: "Transaction deleted", type: "success" });
			navigate("/financial/transactions");
		} catch (err: any) {
			toaster.create({
				title: "Failed to delete transaction",
				description: err?.message,
				type: "error",
			});
		}
	};

	if (isLoading) {
		return (
			<Stack gap={4} maxW="700px" mx="auto">
				<Skeleton h="10" rounded="pill" />
				<Skeleton h="300px" rounded="card" />
			</Stack>
		);
	}

	if (!transaction) {
		return (
			<VStack py={16} textAlign="center" gap={4}>
				<Icon as={LuReceipt} boxSize={12} color="fg.muted" />
				<Heading fontSize="lg">Transaction not found</Heading>
				<Button asChild rounded="pill" size="sm" variant="outline">
					<Link to="/financial/transactions">Back to Transactions</Link>
				</Button>
			</VStack>
		);
	}

	const isExpense = transaction.direction === "out";

	return (
		<Stack gap={6} maxW="760px" mx="auto">
			{/* Back Button & Header */}
			<Flex justify="space-between" align="center" wrap="wrap" gap={3}>
				<HStack gap={2}>
					<Circle
						asChild
						size="9"
						bg="bg.muted"
						cursor="pointer"
						_hover={{ bg: "bg.panel", shadow: "glass" }}
					>
						<Link to="/financial/transactions">
							<Icon as={LuArrowLeft} boxSize={4} />
						</Link>
					</Circle>
					<VStack align="flex-start" gap={0}>
						<Heading fontSize="md" fontWeight="bold">
							Transaction Details
						</Heading>
						<Text fontSize="xs" color="fg.muted">
							Ref: {transaction.transaction_number || transaction.id}
						</Text>
					</VStack>
				</HStack>

				<HStack gap={2}>
					<Button
						size="sm"
						rounded="pill"
						variant={isEditing ? "solid" : "outline"}
						onClick={() => setIsEditing((prev) => !prev)}
					>
						{isEditing ? "View Details" : "Edit Transaction"}
					</Button>
					<Button
						size="sm"
						rounded="pill"
						variant="outline"
						colorPalette="red"
						onClick={() => setIsDeleteOpen(true)}
					>
						<Icon as={LuTrash2} />
						Delete
					</Button>
				</HStack>
			</Flex>

			{/* Delete Confirmation Dialog */}
			<DialogRoot
				open={isDeleteOpen}
				onOpenChange={(details) => setIsDeleteOpen(details.open)}
				size="sm"
			>
				<DialogContent {...glassCard} bg="bg.panel" p={6}>
					<DialogHeader p={0} mb={2}>
						<DialogTitle fontSize="md" fontWeight="bold">
							Confirm Deletion
						</DialogTitle>
					</DialogHeader>
					<DialogCloseTrigger />
					<DialogBody p={0} mb={4}>
						<Text fontSize="sm" color="fg.muted">
							Are you sure you want to delete this transaction? This action cannot be undone.
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

			{/* Main Detail / Edit Card */}
			<Box {...glassCard} p={{ base: 5, md: 8 }}>
				{isEditing ? (
					<TransactionForm
						transaction={transaction}
						onSuccess={() => setIsEditing(false)}
						onCancel={() => setIsEditing(false)}
					/>
				) : (
					<Stack gap={6}>
						{/* Amount & Direction Header */}
						<Flex
							justify="space-between"
							align="center"
							p={4}
							bg="bg.muted"
							rounded="card"
						>
							<VStack align="flex-start" gap={0}>
								<Text fontSize="xs" color="fg.muted" fontWeight="medium">
									Total Amount
								</Text>
								<Text
									fontSize={{ base: "2xl", md: "3xl" }}
									fontWeight="bold"
									color="fg"
								>
									{isExpense ? "-" : "+"}
									<FormatNumber
										value={transaction.amount}
										style="currency"
										currency={transaction.currency || "THB"}
									/>
								</Text>
							</VStack>
							<Badge
								size="md"
								rounded="pill"
								colorPalette={
									transaction.direction === "transfer"
										? "purple"
										: isExpense
											? "red"
											: "green"
								}
								px={3}
								py={1}
							>
								{transaction.direction === "transfer"
									? "Transfer"
									: isExpense
										? "Expense (Out)"
										: "Income (In)"}
							</Badge>
						</Flex>

						{/* Key Details Grid */}
						<Stack gap={4}>
							<Flex justify="space-between" py={3} px={4} bg="bg.muted" rounded="xl">
								<HStack gap={2} color="fg.muted">
									<Icon as={LuCalendar} boxSize={4} />
									<Text fontSize="xs">Occurred At</Text>
								</HStack>
								<Text fontSize="xs" fontWeight="semibold">
									{transaction.occurred_at
										? new Date(transaction.occurred_at).toLocaleString("en-US", {
												dateStyle: "full",
												timeStyle: "medium",
											})
										: "-"}
								</Text>
							</Flex>

							<Flex justify="space-between" py={3} px={4} bg="bg.muted" rounded="xl">
								<HStack gap={2} color="fg.muted">
									<Icon as={LuReceipt} boxSize={4} />
									<Text fontSize="xs">Category</Text>
								</HStack>
								{category ? (
									<HStack gap={1.5} bg="bg.muted" px={2.5} py={1} rounded="pill" borderWidth="1px" borderColor="border">
										<Circle size="2" bg={category.color || "fg.muted"} />
										<Text fontSize="xs" fontWeight="semibold" color="fg">
											{category.name}
										</Text>
									</HStack>
								) : (
									<Text fontSize="xs" color="fg.muted">
										Uncategorized
									</Text>
								)}
							</Flex>

							{transaction.fee > 0 && (
								<Flex justify="space-between" py={3} px={4} bg="bg.muted" rounded="xl">
									<HStack gap={2} color="fg.muted">
										<Icon as={LuCreditCard} boxSize={4} />
										<Text fontSize="xs">Transfer Fee</Text>
									</HStack>
									<Text fontSize="xs" fontWeight="semibold">
										<FormatNumber
											value={transaction.fee}
											style="currency"
											currency={transaction.currency || "THB"}
										/>
									</Text>
								</Flex>
							)}

							{fromAccount && (
								<Flex justify="space-between" py={3} px={4} bg="bg.muted" rounded="xl">
									<HStack gap={2} color="fg.muted">
										<Icon as={LuCreditCard} boxSize={4} />
										<Text fontSize="xs">From Account</Text>
									</HStack>
									<VStack align="flex-end" gap={0}>
										<HStack gap={1.5}>
											{fromBank && (
												<Badge size="xs" variant="surface">
													{fromBank.code}
												</Badge>
											)}
											<Text fontSize="xs" fontWeight="semibold">
												{fromAccount.name} ({fromAccount.account_number})
											</Text>
										</HStack>
										<Text fontSize="10px" color="fg.muted">
											{fromAccount.is_third_party ? "Contact / Third Party" : "Personal Account"}
										</Text>
									</VStack>
								</Flex>
							)}

							{toAccount && (
								<Flex justify="space-between" py={3} px={4} bg="bg.muted" rounded="xl">
									<HStack gap={2} color="fg.muted">
										<Icon as={LuCreditCard} boxSize={4} />
										<Text fontSize="xs">To Account / Destination</Text>
									</HStack>
									<VStack align="flex-end" gap={0}>
										<HStack gap={1.5}>
											{toBank && (
												<Badge size="xs" variant="surface">
													{toBank.code}
												</Badge>
											)}
											<Text fontSize="xs" fontWeight="semibold">
												{toAccount.name} ({toAccount.account_number})
											</Text>
										</HStack>
										<Text fontSize="10px" color="fg.muted">
											{toAccount.is_third_party ? "Contact / Third Party" : "Personal Account"}
										</Text>
									</VStack>
								</Flex>
							)}

							{transaction.note && (
								<Stack gap={1} py={3} px={4} bg="bg.muted" rounded="xl">
									<HStack gap={2} color="fg.muted">
										<Icon as={LuFileText} boxSize={4} />
										<Text fontSize="xs">Note / Remarks</Text>
									</HStack>
									<Text fontSize="xs" pl={6}>
										{transaction.note}
									</Text>
								</Stack>
							)}

							{transaction.raw_text && (
								<Stack gap={1} py={2}>
									<Text fontSize="11px" color="fg.muted">
										Raw Parser Text
									</Text>
									<Box
										bg="bg.muted"
										p={3}
										rounded="card"
										fontSize="10px"
										fontFamily="mono"
										whiteSpace="pre-wrap"
										maxH="150px"
										overflowY="auto"
									>
										{transaction.raw_text}
									</Box>
								</Stack>
							)}
						</Stack>
					</Stack>
				)}
			</Box>
		</Stack>
	);
};

export default FinancialTransactionDetail;
