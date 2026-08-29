import React, { useMemo, useState } from "react";
import {
	Badge,
	Box,
	Flex,
	HStack,
	Heading,
	Icon,
	Input,
	Skeleton,
	Stack,
	Text,
} from "@chakra-ui/react";
import {
	LuBanknote,
	LuPlus,
	LuTrendingDown,
	LuTrendingUp,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import { useDeleteFinanceEntry, useFinanceEntries } from "@/api";
import { CreateEntryDialog } from "./create-entry-dialog";
import { EntryItemRow } from "./entry-item-row";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

interface EntriesSectionProps {
	period: string;
}

export const EntriesSection: React.FC<EntriesSectionProps> = ({ period }) => {
	const [page, setPage] = useState(1);
	const [pageSize] = useState(10);
	const [filterDirection, setFilterDirection] = useState<string>("all");
	const [searchCategory, setSearchCategory] = useState("");
	const [isAdding, setIsAdding] = useState(false);

	const { data: entriesData, isLoading: entriesLoading } = useFinanceEntries(
		page,
		pageSize,
	);
	const deleteEntry = useDeleteFinanceEntry();
	const confirmDelete = useConfirm<string>();

	const handleDeleteConfirm = async () => {
		if (!confirmDelete.target) return;
		try {
			await deleteEntry.mutateAsync(confirmDelete.target);
			toaster.create({
				title: "Entry deleted",
				type: "success",
			});
			confirmDelete.close();
		} catch (err) {
			toaster.create({
				title: "Failed to delete entry",
				description:
					err instanceof ApiError
						? err.message
						: "An error occurred while deleting the entry",
				type: "error",
			});
		}
	};

	const filteredEntries = useMemo(() => {
		let list = entriesData?.entries ?? [];
		if (filterDirection !== "all") {
			list = list.filter((e) => e.direction === filterDirection);
		}
		if (searchCategory.trim()) {
			const q = searchCategory.toLowerCase();
			list = list.filter(
				(e) =>
					e.category.toLowerCase().includes(q) ||
					(e.note && e.note.toLowerCase().includes(q)),
			);
		}
		return list;
	}, [entriesData?.entries, filterDirection, searchCategory]);

	return (
		<Box {...glassCard} p={{ base: 5, md: 6 }}>
			<Stack gap={5}>
				<Flex
					justify="space-between"
					align="center"
					wrap="wrap"
					gap={3}
				>
					<Stack gap={0.5}>
						<Heading size="md">Transaction History</Heading>
						<Text fontSize="xs" color="fg.muted">
							Manage and review your logged expenses and income.
						</Text>
					</Stack>
					<Button
						variant="dark"
						size="sm"
						onClick={() => setIsAdding(!isAdding)}
					>
						<HStack gap={1.5}>
							<Icon as={LuPlus} boxSize={3.5} />
							<Text>Log Entry</Text>
						</HStack>
					</Button>
				</Flex>

				{/* Add Entry Card */}
				{isAdding && (
					<Box
						p={4}
						rounded="card"
						bg="bg.panel"
						borderWidth="1px"
						borderColor="border.glass"
					>
						<CreateEntryDialog onClose={() => setIsAdding(false)} />
					</Box>
				)}

				{/* Filter & Search Bar */}
				<Flex
					justify="space-between"
					align="center"
					wrap="wrap"
					gap={3}
				>
					<HStack gap={1.5}>
						<Button
							size="xs"
							variant={
								filterDirection === "all" ? "solid" : "ghost"
							}
							onClick={() => setFilterDirection("all")}
						>
							All
						</Button>
						<Button
							size="xs"
							variant={
								filterDirection === "expense"
									? "solid"
									: "ghost"
							}
							colorPalette={
								filterDirection === "expense"
									? "slate"
									: undefined
							}
							onClick={() => setFilterDirection("expense")}
						>
							<HStack gap={1}>
								<Icon as={LuTrendingDown} boxSize={3} />
								<Text>Expenses</Text>
							</HStack>
						</Button>
						<Button
							size="xs"
							variant={
								filterDirection === "income" ? "solid" : "ghost"
							}
							colorPalette={
								filterDirection === "income"
									? "mint"
									: undefined
							}
							onClick={() => setFilterDirection("income")}
						>
							<HStack gap={1}>
								<Icon as={LuTrendingUp} boxSize={3} />
								<Text>Income</Text>
							</HStack>
						</Button>
					</HStack>

					<Input
						placeholder="Search notes or category..."
						size="sm"
						w={{ base: "full", sm: "220px" }}
						rounded="pill"
						bg="bg.muted"
						value={searchCategory}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setSearchCategory(e.target.value)
						}
					/>
				</Flex>

				{/* Entries List */}
				{entriesLoading ? (
					<Stack gap={2}>
						{[0, 1, 2, 3].map((i) => (
							<Skeleton key={i} h="52px" rounded="card" />
						))}
					</Stack>
				) : filteredEntries.length === 0 ? (
					<EmptyState
						title="No transactions found"
						description="Log your daily coffee, rent, or salary to start tracking cashflow."
						icon={<Icon as={LuBanknote} boxSize={6} />}
					/>
				) : (
					<Stack gap={2}>
						{filteredEntries.map((entry) => (
							<EntryItemRow
								key={entry.id}
								entry={entry}
								onDelete={(id) => confirmDelete.ask(id)}
							/>
						))}
					</Stack>
				)}

				{/* Pagination Controls */}
				{entriesData && entriesData.count > pageSize && (
					<Flex justify="space-between" align="center" pt={2}>
						<Text fontSize="xs" color="fg.muted">
							Showing {(page - 1) * pageSize + 1} -{" "}
							{Math.min(page * pageSize, entriesData.count)} of{" "}
							{entriesData.count} entries
						</Text>
						<HStack gap={2}>
							<Button
								size="xs"
								variant="outline"
								disabled={page <= 1}
								onClick={() => setPage((p) => p - 1)}
							>
								Previous
							</Button>
							<Badge size="sm" variant="subtle">
								Page {page}
							</Badge>
							<Button
								size="xs"
								variant="outline"
								disabled={page * pageSize >= entriesData.count}
								onClick={() => setPage((p) => p + 1)}
							>
								Next
							</Button>
						</HStack>
					</Flex>
				)}
			</Stack>

			{/* Confirm Delete Entry Dialog */}
			<ConfirmDialog
				open={confirmDelete.open}
				onOpenChange={confirmDelete.onOpenChange}
				title="Delete Transaction"
				description="Are you sure you want to permanently remove this transaction record?"
				confirmLabel="Delete"
				confirmColorPalette="red"
				loading={deleteEntry.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</Box>
	);
};

export default EntriesSection;
