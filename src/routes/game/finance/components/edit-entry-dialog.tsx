import React, { useEffect, useState } from "react";
import {
	Button,
	HStack,
	Icon,
	Input,
	SimpleGrid,
	Textarea,
	VStack,
} from "@chakra-ui/react";
import { LuCheck, LuDollarSign } from "react-icons/lu";
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
import { NumberInputField } from "@/components/ui/number-input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toaster } from "@/components/ui/toaster";
import { useUpdateFinanceEntry } from "@/api/hooks/use-finance";
import type { FinanceDirection, FinanceEntry } from "@/api/types";
import { useTranslation } from "@/lib/i18n";

interface EditEntryDialogProps {
	entry: FinanceEntry | null;
	isOpen: boolean;
	onClose: () => void;
}

const CATEGORIES = [
	{ value: "Groceries", label: "Groceries" },
	{ value: "Dining", label: "Dining" },
	{ value: "Transport", label: "Transport" },
	{ value: "Entertainment", label: "Entertainment" },
	{ value: "Utilities", label: "Utilities" },
	{ value: "Salary", label: "Salary" },
	{ value: "Freelance", label: "Freelance" },
	{ value: "Investment", label: "Investment" },
	{ value: "Other", label: "Other" },
];

export const EditEntryDialog: React.FC<EditEntryDialogProps> = ({
	entry,
	isOpen,
	onClose,
}) => {
	const { t } = useTranslation();
	const [direction, setDirection] = useState<FinanceDirection>("expense");
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("Groceries");
	const [occurredOn, setOccurredOn] = useState("");
	const [note, setNote] = useState("");

	const updateMutation = useUpdateFinanceEntry();

	useEffect(() => {
		if (entry) {
			setDirection(entry.direction || "expense");
			setAmount(String(entry.amount || ""));
			setCategory(entry.category || "Groceries");
			setOccurredOn(entry.occurred_on || "");
			setNote(entry.note || "");
		}
	}, [entry]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!entry || !amount || isNaN(Number(amount))) return;

		try {
			await updateMutation.mutateAsync({
				id: entry.id,
				direction,
				amount: Number(amount),
				category,
				occurred_on: occurredOn,
				note: note.trim() || undefined,
			});
			toaster.create({
				title: "Transaction Updated",
				description: `Updated entry for ${category}`,
				type: "success",
			});
			onClose();
		} catch (err: any) {
			toaster.create({
				title: "Failed to update entry",
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
			<DialogContent bg="bg.panel" backdropFilter="blur(20px)" maxW="md">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<VStack align="flex-start" gap={1} w="full">
							<HStack gap={2}>
								<Icon as={LuDollarSign} color="mint.fg" boxSize={5} />
								<DialogTitle>Edit Transaction</DialogTitle>
							</HStack>
							<DialogDescription>
								Update transaction amount, category, or date.
							</DialogDescription>
						</VStack>
					</DialogHeader>

					<DialogBody>
						<VStack gap={4} align="stretch">
							<SimpleGrid columns={2} gap={2}>
								<Button
									size="sm"
									variant={direction === "expense" ? "solid" : "outline"}
									colorPalette={direction === "expense" ? "red" : "gray"}
									onClick={() => setDirection("expense")}
									type="button"
								>
									Expense
								</Button>
								<Button
									size="sm"
									variant={direction === "income" ? "solid" : "outline"}
									colorPalette={direction === "income" ? "mint" : "gray"}
									onClick={() => setDirection("income")}
									type="button"
								>
									Income
								</Button>
							</SimpleGrid>

							<Field label="Amount ($)" required>
								<NumberInputField
									step={0.01}
									min={0}
									placeholder="0.00"
									value={amount}
									onValueChange={(e) => setAmount(e.value)}
								/>
							</Field>

							<Field label="Category" required>
								<SearchableSelect
									items={CATEGORIES}
									value={category}
									onValueChange={(val) => setCategory(val)}
								/>
							</Field>

							<Field label="Date" required>
								<Input
									type="date"
									value={occurredOn}
									onChange={(e) => setOccurredOn(e.target.value)}
									rounded="pill"
									bg="bg.muted"
								/>
							</Field>

							<Field label="Note (Optional)">
								<Textarea
									placeholder="Add context or tags..."
									value={note}
									onChange={(e) => setNote(e.target.value)}
									rounded="xl"
									bg="bg.muted"
									rows={2}
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
							disabled={!amount || Number(amount) <= 0}
						>
							<Icon as={LuCheck} mr={1} /> Save
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</DialogRoot>
	);
};
