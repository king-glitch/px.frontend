import React, { useMemo, useState } from "react";
import { Container, Grid, Stack } from "@chakra-ui/react";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import {
	useConvertFinancePeriod,
	useFinanceEntries,
	useFinanceSummary,
} from "@/api";
import {
	RewardFlight,
	registerRewardFlightTarget,
	useRewardFlight,
} from "@/components/game";
import { EntriesSection } from "@/routes/game/finance/components/entries-section";
import { BudgetsSection } from "@/routes/game/finance/components/budgets-section";
import { FinanceHeader } from "@/routes/game/finance/components/finance-header";
import { FinanceStatTiles } from "@/routes/game/finance/components/finance-stat-tiles";
import { FinanceConversionCard } from "@/routes/game/finance/components/finance-conversion-card";
import { FinanceCashflowChart } from "@/routes/game/finance/components/finance-cashflow-chart";
import { FinanceCategoryChart } from "@/routes/game/finance/components/finance-category-chart";
import { useTranslation } from "@/lib/i18n";

function currentPeriod(): string {
	return new Date().toISOString().slice(0, 7);
}

export const Finance: React.FC = () => {
	const { t } = useTranslation();
	const [period, setPeriod] = useState(currentPeriod);
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const {
		data: summary,
		isLoading: summaryLoading,
		isError: summaryError,
	} = useFinanceSummary(period);
	const { data: entriesData } = useFinanceEntries(1, 100);

	const convert = useConvertFinancePeriod();
	const [convertedPeriods, setConvertedPeriods] = useState<Set<string>>(
		() => new Set(),
	);
	const targetRef = React.useRef<HTMLDivElement | null>(null);
	const { fly } = useRewardFlight();

	const confirmConvert = useConfirm<string>();

	React.useEffect(() => {
		registerRewardFlightTarget(targetRef.current);
		return () => registerRewardFlightTarget(null);
	}, []);

	const alreadyConverted = convertedPeriods.has(period);

	const handleExecuteConvert = async () => {
		if (!confirmConvert.target) return;
		try {
			const award = await convert.mutateAsync(confirmConvert.target);
			setConvertedPeriods((prev) => new Set(prev).add(period));
			if (targetRef.current) {
				void fly(targetRef.current, award.exp, "exp");
				void fly(targetRef.current, award.px, "px");
			}
			toaster.create({
				title: t("routes.finance.convert.success"),
				description: t("routes.finance.convert.successDescription", {
					exp: award.exp,
					px: award.px,
				}),
				type: "success",
			});
			confirmConvert.close();
		} catch (err) {
			toaster.create({
				title: t("routes.finance.convert.failed"),
				description:
					err instanceof ApiError
						? err.message
						: t("routes.finance.convert.failedDescription"),
				type: "error",
			});
		}
	};

	// Compute Cashflow Chart Data from entries
	const periodEntries = useMemo(() => {
		const list = entriesData?.entries ?? [];
		return list.filter((e) => e.occurred_on.startsWith(period));
	}, [entriesData, period]);

	const dailyChartData = useMemo(() => {
		const dayMap = new Map<
			string,
			{ date: string; income: number; expense: number }
		>();

		for (const entry of periodEntries) {
			const dayKey = entry.occurred_on.slice(8, 10);
			const current = dayMap.get(dayKey) ?? {
				date: dayKey,
				income: 0,
				expense: 0,
			};
			if (entry.direction === "income") {
				current.income += entry.amount;
			} else {
				current.expense += entry.amount;
			}
			dayMap.set(dayKey, current);
		}

		return Array.from(dayMap.entries())
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([, val]) => val);
	}, [periodEntries]);

	const categoryChartData = useMemo(() => {
		const catMap = new Map<string, number>();
		for (const entry of periodEntries) {
			if (entry.direction === "expense") {
				catMap.set(
					entry.category,
					(catMap.get(entry.category) ?? 0) + entry.amount,
				);
			}
		}

		return Array.from(catMap.entries())
			.map(([category, amount]) => ({ category, amount }))
			.sort((a, b) => b.amount - a.amount)
			.slice(0, 8);
	}, [periodEntries]);

	return (
		<Container maxW="6xl" py={{ base: 4, md: 8 }}>
			<RewardFlight />
			<Stack gap={6}>
				{/* Header Bar */}
				<FinanceHeader period={period} onPeriodChange={setPeriod} />

				{/* Top Vital Matrix Stat Tiles */}
				<FinanceStatTiles
					summary={summary}
					isLoading={summaryLoading}
					isError={summaryError}
					period={period}
					targetRef={targetRef}
				/>

				{/* Period Conversion Action Card */}
				<FinanceConversionCard
					summary={summary}
					alreadyConverted={alreadyConverted}
					isPending={convert.isPending}
					onConvert={() => confirmConvert.ask(period)}
				/>

				{/* Charts Section */}
				<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
					<FinanceCashflowChart
						period={period}
						data={dailyChartData}
					/>
					<FinanceCategoryChart
						period={period}
						data={categoryChartData}
						selectedCategory={selectedCategory}
						onSelectCategory={setSelectedCategory}
					/>
				</Grid>

				{/* Entries Section */}
				<EntriesSection
					period={period}
					selectedCategory={selectedCategory}
					onClearCategory={() => setSelectedCategory("")}
				/>

				{/* Budgets Section */}
				<BudgetsSection periodEntries={periodEntries} />
			</Stack>

			{/* Confirm Period Conversion Dialog */}
			<ConfirmDialog
				open={confirmConvert.open}
				onOpenChange={confirmConvert.onOpenChange}
				title={t("routes.finance.convert.dialogTitle")}
				description={t("routes.finance.convert.dialogDescription", {
					period,
					exp: summary?.projected_exp ?? 0,
				})}
				confirmLabel={t("routes.finance.convert.confirmLabel")}
				loading={convert.isPending}
				onConfirm={handleExecuteConvert}
			/>
		</Container>
	);
};

export default Finance;
