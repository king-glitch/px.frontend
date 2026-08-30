import React from "react";
import { Badge, Box, Flex, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { LuArrowDownRight, LuArrowUpRight, LuTrash2 } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import type { FinanceEntry } from "@/api/types";
import { useTranslation } from "@/lib/i18n";

interface EntryItemRowProps {
	entry: FinanceEntry;
	onDelete: (id: string) => void;
}

export const EntryItemRow: React.FC<EntryItemRowProps> = ({
	entry,
	onDelete,
}) => {
	const { t } = useTranslation();
	const isIncome = entry.direction === "income";

	return (
		<Flex
			p={3.5}
			rounded="card"
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border.glass"
			justify="space-between"
			align="center"
		>
			<HStack gap={3}>
				<Box
					p={2}
					rounded="pill"
					bg={isIncome ? "mint.muted" : "bg.muted"}
					color={isIncome ? "mint.fg" : "fg.muted"}
				>
					<Icon
						as={isIncome ? LuArrowUpRight : LuArrowDownRight}
						boxSize={4}
					/>
				</Box>
				<Stack gap={0.5}>
					<HStack gap={2}>
						<Text fontWeight="semibold" fontSize="sm">
							{entry.category}
						</Text>
						<Badge
							size="xs"
							colorPalette={isIncome ? "mint" : "gray"}
						>
							{isIncome
								? t("routes.finance.entries.directionIncome")
								: t("routes.finance.entries.directionExpense")}
						</Badge>
					</HStack>
					<HStack gap={2} fontSize="xs" color="fg.muted">
						<Text>{entry.occurred_on}</Text>
						{entry.note && (
							<>
								<Text>•</Text>
								<Text>{entry.note}</Text>
							</>
						)}
					</HStack>
				</Stack>
			</HStack>

			<HStack gap={3}>
				<Text
					fontWeight="bold"
					fontSize="md"
					color={isIncome ? "mint.fg" : "fg"}
				>
					{isIncome ? "+" : "-"}${entry.amount.toLocaleString()}
				</Text>
				<Button
					variant="ghost"
					size="xs"
					colorPalette="red"
					onClick={() => onDelete(entry.id)}
				>
					<Icon as={LuTrash2} boxSize={3.5} />
				</Button>
			</HStack>
		</Flex>
	);
};
