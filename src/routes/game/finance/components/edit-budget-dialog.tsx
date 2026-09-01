import React, { useEffect, useState } from "react";
import {
	Button,
	HStack,
	Icon,
	Input,
	VStack,
} from "@chakra-ui/react";
import { LuCheck, LuPiggyBank } from "react-icons/lu";
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
import { toaster } from "@/components/ui/toaster";
import { useUpdateFinanceBudget } from "@/api/hooks/use-finance";
import type { FinanceBudget } from "@/api/types";

interface EditBudgetDialogProps {
	budget: FinanceBudget | null;
	isOpen: boolean;
	onClose: () => void;
}

export const EditBudgetDialog: React.FC<EditBudgetDialogProps> = ({
	budget,
	isOpen,
	onClose,
}) => {
	const [monthlyLimit, setMonthlyLimit] = useState("");

	const updateMutation = useUpdateFinanceBudget();

	useEffect(() => {
		if (budget) {
			setMonthlyLimit(String(budget.monthly_limit || ""));
		}
	}, [budget]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!budget || !monthlyLimit || isNaN(Number(monthlyLimit))) return;

		try {
			await updateMutation.mutateAsync({
				id: budget.id,
				monthly_limit: Number(monthlyLimit),
			});
			toaster.create({
				title: "Budget Updated",
				description: `Updated budget for ${budget.category}`,
				type: "success",
			});
			onClose();
		} catch (err: any) {
			toaster.create({
				title: "Failed to update budget",
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
			<DialogContent bg="bg.panel" backdropFilter="blur(20px)" maxW="sm">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<VStack align="flex-start" gap={1} w="full">
							<HStack gap={2}>
								<Icon as={LuPiggyBank} color="mint.fg" boxSize={5} />
								<DialogTitle>Edit Budget ({budget?.category})</DialogTitle>
							</HStack>
							<DialogDescription>
								Adjust the monthly spending target for this category.
							</DialogDescription>
						</VStack>
					</DialogHeader>

					<DialogBody>
						<VStack gap={4} align="stretch">
							<Field label="Monthly Target Limit ($)" required>
								<NumberInputField
									step={1}
									min={0}
									placeholder="500"
									value={monthlyLimit}
									onValueChange={(e) => setMonthlyLimit(e.value)}
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
							disabled={!monthlyLimit || Number(monthlyLimit) <= 0}
						>
							<Icon as={LuCheck} mr={1} /> Save
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</DialogRoot>
	);
};
