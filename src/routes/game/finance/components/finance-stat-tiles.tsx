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
import { useTranslation } from "@/lib/i18n";

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
	const { t } = useTranslation();

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
					{t("routes.finance.statTiles.loadError", { period })}
				</Text>
			</Box>
		);
	}

	return (
		<SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} gap={3}>
			<StatTile
				label={t("routes.finance.statTiles.totalIncome")}
				value={`$${summary.income.toLocaleString()}`}
				icon={LuTrendingUp}
				iconColor="fg.muted"
			/>
			<StatTile
				label={t("routes.finance.statTiles.totalExpense")}
				value={`$${summary.expense.toLocaleString()}`}
				icon={LuTrendingDown}
				iconColor="fg.muted"
			/>
			<StatTile
				label={t("routes.finance.statTiles.savingsRate")}
				value={`${Math.round(summary.savings_rate * 100)}%`}
				icon={LuPercent}
				iconColor="fg.muted"
			/>
			<StatTile
				label={t("routes.finance.statTiles.daysLogged")}
				value={`${summary.days_logged} / ${summary.days_in_period}`}
				icon={LuCalendarDays}
				iconColor="fg.muted"
			/>
			<StatTile
				label={t("routes.finance.statTiles.projectedExp")}
				value={`+${summary.projected_exp}`}
				icon={LuSparkles}
				iconColor="fg.muted"
				tileRef={targetRef}
			/>
		</SimpleGrid>
	);
};
