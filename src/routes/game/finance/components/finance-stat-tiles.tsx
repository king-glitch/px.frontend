import React from "react";
import { Box, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import {
	LuCalendarDays,
	LuPercent,
	LuSparkles,
	LuTrendingDown,
	LuTrendingUp,
} from "react-icons/lu";
import type { FinanceSummary } from "@/api/types";
import { StatTile } from "./stat-tile";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

interface FinanceStatTilesProps {
	summary?: FinanceSummary;
	isLoading: boolean;
	isError: boolean;
	period: string;
	targetRef: React.RefObject<HTMLDivElement | null>;
}

export const FinanceStatTiles: React.FC<FinanceStatTilesProps> = ({
	summary,
	isLoading,
	isError,
	period,
	targetRef,
}) => {
	if (isLoading) {
		return (
			<SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} gap={3}>
				{[0, 1, 2, 3, 4].map((i) => (
					<Skeleton key={i} h="96px" rounded="card" />
				))}
			</SimpleGrid>
		);
	}

	if (isError || !summary) {
		return (
			<Box {...glassCard} p={6}>
				<Text color="fg.muted" fontSize="sm">
					Couldn&apos;t load the summary for period {period}.
				</Text>
			</Box>
		);
	}

	return (
		<SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} gap={3}>
			<StatTile
				label="Total Income"
				value={`$${summary.income.toLocaleString()}`}
				icon={LuTrendingUp}
				iconColor="fg.muted"
			/>
			<StatTile
				label="Total Expense"
				value={`$${summary.expense.toLocaleString()}`}
				icon={LuTrendingDown}
				iconColor="fg.muted"
			/>
			<StatTile
				label="Savings Rate"
				value={`${Math.round(summary.savings_rate * 100)}%`}
				icon={LuPercent}
				iconColor="fg.muted"
			/>
			<StatTile
				label="Days Logged"
				value={`${summary.days_logged} / ${summary.days_in_period}`}
				icon={LuCalendarDays}
				iconColor="fg.muted"
			/>
			<StatTile
				label="Projected EXP"
				value={`+${summary.projected_exp}`}
				icon={LuSparkles}
				iconColor="fg.muted"
				tileRef={targetRef}
			/>
		</SimpleGrid>
	);
};
