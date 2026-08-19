import { PillButton } from "@/components/ui/pill-button";
import {
	Badge,
	Box,
	Button,
	Circle,
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
	Tabs,
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
	LuPencil,
	LuPlus,
	LuSave,
	LuSearch,
	LuTrash2,
} from "react-icons/lu";
import {
	useAccounts,
	useBanks,
	useCreateAccount,
	useCreateBank,
	useDeleteAccount,
	useDeleteBank,
	useUpdateAccount,
	useUpdateBank,
} from "@/api";
import {
	createBankAccountSchema,
	createBankSchema,
	type CreateBankAccountFormData,
	type CreateBankFormData,
} from "@/api/schemas";
import type { Bank, BankAccount } from "@/api/types";
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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toaster } from "@/components/ui/toaster";
import { glassCard } from "@/routes/financial/layout";

export const FinancialBanks: React.FC = () => {
	const [activeTab, setActiveTab] = useState<string>("accounts");
	const [searchQuery, setSearchQuery] = useState("");

	// Banks data & mutations
	const { data: banks = [], isLoading: isBanksLoading } = useBanks();
	const createBankMutation = useCreateBank();
	const updateBankMutation = useUpdateBank();
	const deleteBankMutation = useDeleteBank();

	// Accounts data & mutations
	const { data: accounts = [], isLoading: isAccountsLoading } = useAccounts();
	const createAccountMutation = useCreateAccount();
	const updateAccountMutation = useUpdateAccount();
	const deleteAccountMutation = useDeleteAccount();

	const banksMap = new Map(banks.map((b) => [b.id, b]));

	// Modals state
	const [isBankModalOpen, setIsBankModalOpen] = useState(false);
	const [editingBank, setEditingBank] = useState<Bank | null>(null);
	const [deletingBank, setDeletingBank] = useState<Bank | null>(null);

	const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
	const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
	const [deletingAccount, setDeletingAccount] = useState<BankAccount | null>(null);

	// Bank form
	const {
		register: registerBank,
		handleSubmit: handleSubmitBank,
		reset: resetBank,
		formState: { errors: bankErrors },
	} = useForm<CreateBankFormData>({
		resolver: zodResolver(createBankSchema),
		defaultValues: { code: "", name: "" },
	});

	// Account form
	const {
		register: registerAccount,
		handleSubmit: handleSubmitAccount,
		reset: resetAccount,
		setValue: setAccountValue,
		watch: watchAccount,
		formState: { errors: accountErrors },
	} = useForm<CreateBankAccountFormData>({
		resolver: zodResolver(createBankAccountSchema),
		defaultValues: {
			bank_id: "",
			account_number: "",
			name: "",
			note: "",
		},
	});

	const handleOpenCreateBank = () => {
		setEditingBank(null);
		resetBank({ code: "", name: "" });
		setIsBankModalOpen(true);
	};

	const handleOpenEditBank = (bank: Bank) => {
		setEditingBank(bank);
		resetBank({ code: bank.code, name: bank.name });
		setIsBankModalOpen(true);
	};

	const onSubmitBank = async (data: CreateBankFormData) => {
		try {
			if (editingBank) {
				await updateBankMutation.mutateAsync({
					id: editingBank.id,
					payload: { code: data.code.toUpperCase(), name: data.name },
				});
				toaster.create({ title: "Bank updated", type: "success" });
			} else {
				await createBankMutation.mutateAsync({
					code: data.code.toUpperCase(),
					name: data.name,
				});
				toaster.create({ title: "Bank created", type: "success" });
			}
			setIsBankModalOpen(false);
		} catch (err: any) {
			toaster.create({
				title: editingBank ? "Failed to update bank" : "Failed to create bank",
				description: err?.message,
				type: "error",
			});
		}
	};

	const handleDeleteBank = async () => {
		if (!deletingBank) return;
		try {
			await deleteBankMutation.mutateAsync(deletingBank.id);
			toaster.create({ title: "Bank deleted", type: "success" });
			setDeletingBank(null);
		} catch (err: any) {
			toaster.create({
				title: "Failed to delete bank",
				description: err?.message,
				type: "error",
			});
		}
	};

	const handleOpenCreateAccount = () => {
		setEditingAccount(null);
		resetAccount({
			bank_id: banks[0]?.id || "",
			account_number: "",
			name: "",
			note: "",
		});
		setIsAccountModalOpen(true);
	};

	const handleOpenEditAccount = (account: BankAccount) => {
		setEditingAccount(account);
		resetAccount({
			bank_id: account.bank_id,
			account_number: account.account_number,
			name: account.name,
			note: account.note || "",
		});
		setIsAccountModalOpen(true);
	};

	const onSubmitAccount = async (data: CreateBankAccountFormData) => {
		try {
			if (editingAccount) {
				await updateAccountMutation.mutateAsync({
					id: editingAccount.id,
					payload: {
						bank_id: data.bank_id,
						account_number: data.account_number,
						name: data.name,
						note: data.note || undefined,
					},
				});
				toaster.create({ title: "Bank account updated", type: "success" });
			} else {
				await createAccountMutation.mutateAsync({
					bank_id: data.bank_id,
					account_number: data.account_number,
					name: data.name,
					note: data.note || undefined,
				});
				toaster.create({ title: "Bank account created", type: "success" });
			}
			setIsAccountModalOpen(false);
		} catch (err: any) {
			toaster.create({
				title: editingAccount
					? "Failed to update bank account"
					: "Failed to create bank account",
				description: err?.message,
				type: "error",
			});
		}
	};

	const handleDeleteAccount = async () => {
		if (!deletingAccount) return;
		try {
			await deleteAccountMutation.mutateAsync(deletingAccount.id);
			toaster.create({ title: "Bank account deleted", type: "success" });
			setDeletingAccount(null);
		} catch (err: any) {
			toaster.create({
				title: "Failed to delete bank account",
				description: err?.message,
				type: "error",
			});
		}
	};

	const filteredAccounts = accounts.filter((acc) => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return true;
		const bank = banksMap.get(acc.bank_id);
		return (
			acc.name.toLowerCase().includes(q) ||
			acc.account_number.toLowerCase().includes(q) ||
			(bank && (bank.code.toLowerCase().includes(q) || bank.name.toLowerCase().includes(q)))
		);
	});

	const filteredBanks = banks.filter((b) => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return true;
		return (
			b.code.toLowerCase().includes(q) ||
			b.name.toLowerCase().includes(q)
		);
	});

	return (
		<Stack gap={6}>
			{/* Page Header */}
			<Flex justify="space-between" align="center" wrap="wrap" gap={3}>
				<VStack align="flex-start" gap={0}>
					<Heading fontSize="md" fontWeight="bold">
						Bank Accounts & Directory
					</Heading>
					<Text fontSize="xs" color="fg.muted">
						Manage personal accounts and supported financial institutions
					</Text>
				</VStack>

				<HStack gap={2}>
					{activeTab === "accounts" ? (
						<PillButton
							size="sm"
							variant="dark"
							icon={LuPlus}
							onClick={handleOpenCreateAccount}
						>
							Add Account
						</PillButton>
					) : (
						<PillButton
							size="sm"
							variant="dark"
							icon={LuPlus}
							onClick={handleOpenCreateBank}
						>
							Add Bank
						</PillButton>
					)}
				</HStack>
			</Flex>

			{/* Sub-bar: Tabs & Search Input */}
			<Flex justify="space-between" align="center" wrap="wrap" gap={3}>
				<Tabs.Root
					value={activeTab}
					onValueChange={(details) => setActiveTab(details.value)}
					variant="plain"
					size="sm"
					css={{
						"--tabs-indicator-bg": "colors.bg.solid",
						"--tabs-indicator-shadow": "shadows.glass",
						"--tabs-trigger-radius": "radii.full",
					}}
				>
					<Tabs.List
						bg="bg.panel"
						borderWidth="1px"
						borderColor="border.glass"
						rounded="pill"
						p={1}
						shadow="glass"
						gap={1}
						position="relative"
					>
						<Tabs.Trigger
							value="accounts"
							px={3.5}
							py={1.5}
							cursor="pointer"
							fontWeight="semibold"
							fontSize="xs"
							color={activeTab === "accounts" ? "fg.inverted" : "fg.muted"}
							_selected={{
								color: "fg.inverted",
								fontWeight: "bold",
							}}
							_hover={{
								color: activeTab === "accounts" ? "fg.inverted" : "fg",
							}}
							zIndex={1}
							transition="color 0.15s ease-out"
						>
							<Box as="span" display="inline-flex" alignItems="center" gap={1.5}>
								<Icon as={LuCreditCard} boxSize={3.5} />
								<Text as="span" whiteSpace="nowrap">
									My Accounts ({accounts.length})
								</Text>
							</Box>
						</Tabs.Trigger>

						<Tabs.Trigger
							value="banks"
							px={3.5}
							py={1.5}
							cursor="pointer"
							fontWeight="semibold"
							fontSize="xs"
							color={activeTab === "banks" ? "fg.inverted" : "fg.muted"}
							_selected={{
								color: "fg.inverted",
								fontWeight: "bold",
							}}
							_hover={{
								color: activeTab === "banks" ? "fg.inverted" : "fg",
							}}
							zIndex={1}
							transition="color 0.15s ease-out"
						>
							<Box as="span" display="inline-flex" alignItems="center" gap={1.5}>
								<Icon as={LuBuilding2} boxSize={3.5} />
								<Text as="span" whiteSpace="nowrap">
									Banks Directory ({banks.length})
								</Text>
							</Box>
						</Tabs.Trigger>

						<Tabs.Indicator rounded="pill" />
					</Tabs.List>
				</Tabs.Root>

				<HStack
					bg="bg.muted"
					px={3}
					py={1.5}
					rounded="pill"
					borderWidth="1px"
					w={{ base: "full", sm: "300px" }}
				>
					<Icon as={LuSearch} color="fg.muted" boxSize={4} />
					<Input
						placeholder={
							activeTab === "accounts"
								? "Search accounts by nickname, number, bank..."
								: "Search banks by code or name..."
						}
						border="none"
						bg="transparent"
						outline="none"
						fontSize="xs"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</HStack>
			</Flex>

			{/* Tab 1: Bank Accounts */}
			{activeTab === "accounts" && (
				<>
					{isAccountsLoading ? (
						<SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
							<Skeleton h="120px" rounded="card" />
							<Skeleton h="120px" rounded="card" />
							<Skeleton h="120px" rounded="card" />
						</SimpleGrid>
					) : filteredAccounts.length === 0 ? (
						<Box {...glassCard} p={12} textAlign="center">
							<VStack gap={3}>
								<Circle size="12" bg="bg.muted">
									<Icon as={LuCreditCard} boxSize={6} color="fg.muted" />
								</Circle>
								<Heading fontSize="sm" fontWeight="bold">
									{searchQuery ? "No matching accounts found" : "No bank accounts registered"}
								</Heading>
								<Text fontSize="xs" color="fg.muted" maxW="400px">
									{searchQuery
										? "Try a different search keyword."
										: "Register your bank account numbers (you can add multiple accounts for the same bank like KBANK Savings & KBANK Business)."}
								</Text>
								{!searchQuery && (
									<Button
										size="sm"
										rounded="pill"
										onClick={handleOpenCreateAccount}
										mt={2}
									>
										<Icon as={LuPlus} />
										Add First Account
									</Button>
								)}
							</VStack>
						</Box>
					) : (
						<SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
							{filteredAccounts.map((account) => {
								const bank = banksMap.get(account.bank_id);
								return (
									<Box
										key={account.id}
										{...glassCard}
										p={4}
										position="relative"
										transition="transform 0.15s ease, box-shadow 0.15s ease"
										_hover={{ transform: "translateY(-2px)", shadow: "lg" }}
									>
										<Flex justify="space-between" align="flex-start" mb={2}>
											<HStack gap={2}>
												<Circle size="8" bg="bg.muted">
													<Icon as={LuCreditCard} boxSize={4} color="fg.muted" />
												</Circle>
												{bank && (
													<Badge size="xs" variant="surface">
														{bank.code}
													</Badge>
												)}
											</HStack>

											<HStack gap={1}>
												<IconButton
													size="2xs"
													variant="ghost"
													aria-label="Edit account"
													onClick={() => handleOpenEditAccount(account)}
												>
													<Icon as={LuPencil} boxSize={3} />
												</IconButton>
												<IconButton
													size="2xs"
													variant="ghost"
													colorPalette="red"
													aria-label="Delete account"
													onClick={() => setDeletingAccount(account)}
												>
													<Icon as={LuTrash2} boxSize={3} />
												</IconButton>
											</HStack>
										</Flex>

										<Text fontSize="sm" fontWeight="bold" lineClamp={1}>
											{account.name}
										</Text>
										<Text fontSize="xs" fontFamily="mono" color="fg.muted" mt={0.5}>
											{account.account_number}
										</Text>
										{bank && (
											<Text fontSize="10px" color="fg.muted" mt={1} lineClamp={1}>
												{bank.name}
											</Text>
										)}
										{account.note && (
											<Text fontSize="10px" color="fg.subtle" mt={1} lineClamp={1}>
												{account.note}
											</Text>
										)}
									</Box>
								);
							})}
						</SimpleGrid>
					)}
				</>
			)}

			{/* Tab 2: Bank Directory */}
			{activeTab === "banks" && (
				<>
					{isBanksLoading ? (
						<SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
							<Skeleton h="100px" rounded="card" />
							<Skeleton h="100px" rounded="card" />
							<Skeleton h="100px" rounded="card" />
						</SimpleGrid>
					) : filteredBanks.length === 0 ? (
						<Box {...glassCard} p={12} textAlign="center">
							<VStack gap={3}>
								<Circle size="12" bg="bg.muted">
									<Icon as={LuBuilding2} boxSize={6} color="fg.muted" />
								</Circle>
								<Heading fontSize="sm" fontWeight="bold">
									{searchQuery ? "No matching banks found" : "No banks configured"}
								</Heading>
								<Text fontSize="xs" color="fg.muted" maxW="360px">
									{searchQuery
										? "Try a different search keyword."
										: "Add your bank profiles to easily classify and manage transactions."}
								</Text>
								{!searchQuery && (
									<Button
										size="sm"
										rounded="pill"
										onClick={handleOpenCreateBank}
										mt={2}
									>
										<Icon as={LuPlus} />
										Add First Bank
									</Button>
								)}
							</VStack>
						</Box>
					) : (
						<SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
							{filteredBanks.map((bank) => (
								<Box
									key={bank.id}
									{...glassCard}
									p={4}
									position="relative"
									transition="transform 0.15s ease, box-shadow 0.15s ease"
									_hover={{ transform: "translateY(-2px)", shadow: "lg" }}
								>
									<Flex justify="space-between" align="flex-start" mb={2}>
										<HStack gap={2}>
											<Circle size="8" bg="bg.muted">
												<Icon as={LuBuilding2} boxSize={4} color="fg.muted" />
											</Circle>
											<Badge size="xs" variant="surface">
												{bank.code}
											</Badge>
										</HStack>

										<HStack gap={1}>
											<IconButton
												size="2xs"
												variant="ghost"
												aria-label="Edit bank"
												onClick={() => handleOpenEditBank(bank)}
											>
												<Icon as={LuPencil} boxSize={3} />
											</IconButton>
											<IconButton
												size="2xs"
												variant="ghost"
												colorPalette="red"
												aria-label="Delete bank"
												onClick={() => setDeletingBank(bank)}
											>
												<Icon as={LuTrash2} boxSize={3} />
											</IconButton>
										</HStack>
									</Flex>

									<Text fontSize="sm" fontWeight="bold" lineClamp={1}>
										{bank.name}
									</Text>
									<Text fontSize="10px" color="fg.muted" mt={1}>
										Code: {bank.code}
									</Text>
								</Box>
							))}
						</SimpleGrid>
					)}
				</>
			)}

			{/* Create / Edit Bank Modal */}
			<DialogRoot
				open={isBankModalOpen}
				onOpenChange={(details) => setIsBankModalOpen(details.open)}
				size="sm"
			>
				<DialogContent {...glassCard} bg="bg.panel" p={6}>
					<DialogHeader p={0} mb={4}>
						<DialogTitle fontSize="md" fontWeight="bold">
							{editingBank ? "Edit Bank" : "Add Bank"}
						</DialogTitle>
					</DialogHeader>
					<DialogCloseTrigger />

					<form noValidate onSubmit={handleSubmitBank(onSubmitBank)}>
						<Stack gap={4}>
							<Field.Root invalid={!!bankErrors.code} required>
								<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
									Bank Code (e.g. KBANK, SCB, BBL, PROMPTPAY)
								</Field.Label>
								<HStack bg="bg.muted" px={3} py={1} rounded="pill" borderWidth="1px">
									<Input
										placeholder="e.g. KBANK"
										border="none"
										bg="transparent"
										outline="none"
										fontSize="sm"
										{...registerBank("code")}
									/>
								</HStack>
								{bankErrors.code && (
									<Field.ErrorText fontSize="xs">
										{bankErrors.code.message}
									</Field.ErrorText>
								)}
							</Field.Root>

							<Field.Root invalid={!!bankErrors.name} required>
								<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
									Bank Name / Description
								</Field.Label>
								<HStack bg="bg.muted" px={3} py={1} rounded="pill" borderWidth="1px">
									<Input
										placeholder="e.g. Kasikornbank"
										border="none"
										bg="transparent"
										outline="none"
										fontSize="sm"
										{...registerBank("name")}
									/>
								</HStack>
								{bankErrors.name && (
									<Field.ErrorText fontSize="xs">
										{bankErrors.name.message}
									</Field.ErrorText>
								)}
							</Field.Root>

							<DialogFooter p={0} pt={2} gap={2}>
								<DialogActionTrigger asChild>
									<Button variant="ghost" size="sm" rounded="pill">
										Cancel
									</Button>
								</DialogActionTrigger>
								<Button
									type="submit"
									size="sm"
									rounded="pill"
									loading={createBankMutation.isPending || updateBankMutation.isPending}
								>
									<Icon as={LuSave} />
									{editingBank ? "Update Bank" : "Create Bank"}
								</Button>
							</DialogFooter>
						</Stack>
					</form>
				</DialogContent>
			</DialogRoot>

			{/* Create / Edit Bank Account Modal */}
			<DialogRoot
				open={isAccountModalOpen}
				onOpenChange={(details) => setIsAccountModalOpen(details.open)}
				size="md"
			>
				<DialogContent {...glassCard} bg="bg.panel" p={6}>
					<DialogHeader p={0} mb={4}>
						<DialogTitle fontSize="md" fontWeight="bold">
							{editingAccount ? "Edit Bank Account" : "Add Bank Account"}
						</DialogTitle>
					</DialogHeader>
					<DialogCloseTrigger />

					<form noValidate onSubmit={handleSubmitAccount(onSubmitAccount)}>
						<Stack gap={4}>
							<Field.Root invalid={!!accountErrors.bank_id} required>
								<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
									Bank
								</Field.Label>
								<SearchableSelect
									items={banks.map((b) => ({
										label: `${b.code} - ${b.name}`,
										value: b.id,
									}))}
									value={watchAccount("bank_id") || ""}
									placeholder="Select bank..."
									searchPlaceholder="Search bank..."
									width="100%"
									portalled={false}
									onValueChange={(val) =>
										setAccountValue("bank_id", val, {
											shouldValidate: true,
											shouldDirty: true,
										})
									}
								/>
								{accountErrors.bank_id && (
									<Field.ErrorText fontSize="xs">
										{accountErrors.bank_id.message}
									</Field.ErrorText>
								)}
							</Field.Root>

							<Field.Root invalid={!!accountErrors.name} required>
								<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
									Account Nickname / Name (e.g. Main Savings, Salary, Business Ops)
								</Field.Label>
								<HStack bg="bg.muted" px={3} py={1} rounded="pill" borderWidth="1px">
									<Input
										placeholder="e.g. Main Savings"
										border="none"
										bg="transparent"
										outline="none"
										fontSize="sm"
										{...registerAccount("name")}
									/>
								</HStack>
								{accountErrors.name && (
									<Field.ErrorText fontSize="xs">
										{accountErrors.name.message}
									</Field.ErrorText>
								)}
							</Field.Root>

							<Field.Root invalid={!!accountErrors.account_number} required>
								<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
									Account Number (Full or Masked, e.g. xxx-x-x1456-x, 123-4-56789-0)
								</Field.Label>
								<HStack bg="bg.muted" px={3} py={1} rounded="pill" borderWidth="1px">
									<Input
										placeholder="e.g. xxx-x-x1456-x"
										border="none"
										bg="transparent"
										outline="none"
										fontSize="sm"
										{...registerAccount("account_number")}
									/>
								</HStack>
								{accountErrors.account_number && (
									<Field.ErrorText fontSize="xs">
										{accountErrors.account_number.message}
									</Field.ErrorText>
								)}
							</Field.Root>

							<Field.Root invalid={!!accountErrors.note}>
								<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
									Note / Remarks
								</Field.Label>
								<Textarea
									placeholder="Optional notes or description..."
									size="sm"
									rounded="card"
									bg="bg.muted"
									rows={2}
									{...registerAccount("note")}
								/>
							</Field.Root>

							<DialogFooter p={0} pt={2} gap={2}>
								<DialogActionTrigger asChild>
									<Button variant="ghost" size="sm" rounded="pill">
										Cancel
									</Button>
								</DialogActionTrigger>
								<Button
									type="submit"
									size="sm"
									rounded="pill"
									loading={createAccountMutation.isPending || updateAccountMutation.isPending}
								>
									<Icon as={LuSave} />
									{editingAccount ? "Update Account" : "Create Account"}
								</Button>
							</DialogFooter>
						</Stack>
					</form>
				</DialogContent>
			</DialogRoot>

			{/* Delete Bank Confirmation */}
			<DialogRoot
				open={Boolean(deletingBank)}
				onOpenChange={(details) => !details.open && setDeletingBank(null)}
				size="sm"
			>
				<DialogContent {...glassCard} bg="bg.panel" p={6}>
					<DialogHeader p={0} mb={2}>
						<DialogTitle fontSize="md" fontWeight="bold">
							Delete Bank
						</DialogTitle>
					</DialogHeader>
					<DialogCloseTrigger />
					<DialogBody p={0} mb={4}>
						<Text fontSize="sm" color="fg.muted">
							Are you sure you want to delete bank "{deletingBank?.name}" ({deletingBank?.code})?
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
							loading={deleteBankMutation.isPending}
							onClick={handleDeleteBank}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</DialogRoot>

			{/* Delete Account Confirmation */}
			<DialogRoot
				open={Boolean(deletingAccount)}
				onOpenChange={(details) => !details.open && setDeletingAccount(null)}
				size="sm"
			>
				<DialogContent {...glassCard} bg="bg.panel" p={6}>
					<DialogHeader p={0} mb={2}>
						<DialogTitle fontSize="md" fontWeight="bold">
							Delete Bank Account
						</DialogTitle>
					</DialogHeader>
					<DialogCloseTrigger />
					<DialogBody p={0} mb={4}>
						<Text fontSize="sm" color="fg.muted">
							Are you sure you want to delete account "{deletingAccount?.name}" ({deletingAccount?.account_number})?
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
							loading={deleteAccountMutation.isPending}
							onClick={handleDeleteAccount}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</DialogRoot>
		</Stack>
	);
};

export default FinancialBanks;
