import { useDeleteFinanceEntry, useFinanceEntries } from "@/api";
import { ApiError } from "@/api/client";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PillButton } from "@/components/ui/pill-button";
import { toaster } from "@/components/ui/toaster";
import { useTranslation } from "@/lib/i18n";
import {
	Badge,
	Box,
	Button,
	Flex,
	HStack,
	Heading,
	Icon,
	Input,
	Skeleton,
	Stack,
	Text,
} from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import {
	LuBanknote,
	LuPlus,
	LuTrendingDown,
	LuTrendingUp,
} from "react-icons/lu";
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
	selectedCategory?: string;
	onClearCategory?: () => void;
}

export const EntriesSection: React.FC<EntriesSectionProps> = ({
	period,
	selectedCategory = "",
	onClearCategory,
}) => {
	const { t } = useTranslation();
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
				title: t("routes.finance.entries.deleted"),
				type: "success",
			});
			confirmDelete.close();
		} catch (err) {
			toaster.create({
				title: t("routes.finance.entries.failedToDelete"),
				description:
					err instanceof ApiError
						? err.message
						: t("routes.finance.entries.failedToDeleteDescription"),
				type: "error",
			});
		}
	};

	const effectiveCategoryFilter = selectedCategory || searchCategory;

	const filteredEntries = useMemo(() => {
		let list = entriesData?.entries ?? [];
		if (filterDirection !== "all") {
			list = list.filter((e) => e.direction === filterDirection);
		}
		if (effectiveCategoryFilter.trim()) {
			const q = effectiveCategoryFilter.toLowerCase();
			list = list.filter(
				(e) =>
					e.category.toLowerCase().includes(q) ||
					(e.note && e.note.toLowerCase().includes(q)),
			);
		}
		return list;
	}, [entriesData?.entries, filterDirection, effectiveCategoryFilter]);

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
						<Heading size="md">
							{t("routes.finance.entries.heading")}
						</Heading>
						<Text fontSize="xs" color="fg.muted">
							{t("routes.finance.entries.subtitle")}
						</Text>
					</Stack>
					<PillButton
						variant="dark"
						icon={LuPlus}
						onClick={() => setIsAdding(!isAdding)}
					>
						{t("routes.finance.entries.logEntry")}
					</PillButton>
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
							{t("routes.finance.entries.filterAll")}
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
								<Text>
									{t("routes.finance.entries.filterExpenses")}
								</Text>
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
								<Text>
									{t("routes.finance.entries.filterIncome")}
								</Text>
							</HStack>
						</Button>
					</HStack>

					<HStack gap={2} w={{ base: "full", sm: "auto" }}>
						{selectedCategory && (
							<Badge
								size="sm"
								colorPalette="purple"
								variant="surface"
								rounded="pill"
								px={2.5}
								py={1}
								cursor="pointer"
								onClick={onClearCategory}
							>
								{selectedCategory} ✕
							</Badge>
						)}
						<Input
							placeholder={t(
								"routes.finance.entries.searchPlaceholder",
							)}
							size="sm"
							w={{ base: "full", sm: "200px" }}
							rounded="pill"
							bg="bg.muted"
							value={searchCategory}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>,
							) => setSearchCategory(e.target.value)}
						/>
					</HStack>
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
						title={t("routes.finance.entries.emptyTitle")}
						description={t(
							"routes.finance.entries.emptyDescription",
						)}
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
							{t("routes.finance.entries.showing", {
								from: (page - 1) * pageSize + 1,
								to: Math.min(
									page * pageSize,
									entriesData.count,
								),
								total: entriesData.count,
							})}
						</Text>
						<HStack gap={2}>
							<Button
								size="xs"
								variant="outline"
								disabled={page <= 1}
								onClick={() => setPage((p) => p - 1)}
							>
								{t("routes.finance.entries.previous")}
							</Button>
							<Badge size="sm" variant="subtle">
								{t("routes.finance.entries.page", { page })}
							</Badge>
							<Button
								size="xs"
								variant="outline"
								disabled={page * pageSize >= entriesData.count}
								onClick={() => setPage((p) => p + 1)}
							>
								{t("routes.finance.entries.next")}
							</Button>
						</HStack>
					</Flex>
				)}
			</Stack>

			{/* Confirm Delete Entry Dialog */}
			<ConfirmDialog
				open={confirmDelete.open}
				onOpenChange={confirmDelete.onOpenChange}
				title={t("routes.finance.entries.deleteDialogTitle")}
				description={t(
					"routes.finance.entries.deleteDialogDescription",
				)}
				confirmLabel={t("routes.finance.entries.deleteConfirmLabel")}
				destructive
				loading={deleteEntry.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</Box>
	);
};

export default EntriesSection;
