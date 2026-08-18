import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { queryKeys } from "@/api/query-keys";
import { bankService } from "@/api/services/bank-service";
import type { BankSummary } from "@/api/types";

/**
 * Hook to fetch bank transactions summary for a date range.
 */
export function useSummary(
	from?: string,
	to?: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: queryKeys.summary.range(from, to),
		queryFn: async () => {
			const res = await bankService.getSummary(from, to);
			return res.summary;
		},
		enabled: options?.enabled,
	});
}

export interface MonthSummaryPoint {
	monthKey: string;
	monthLabel: string;
	from: string;
	to: string;
	totalIn: number;
	totalOut: number;
	totalFee: number;
	net: number;
	count: number;
}

/**
 * Hook to fetch multi-month summary trends (e.g. past 6 months).
 */
export function usePastMonthsSummary(monthsCount = 6) {
	const months = useMemo(() => {
		const result: {
			monthKey: string;
			monthLabel: string;
			from: string;
			to: string;
		}[] = [];
		const now = new Date();

		for (let i = monthsCount - 1; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const year = d.getFullYear();
			const month = d.getMonth() + 1;
			const monthKey = `${year}-${String(month).padStart(2, "0")}`;
			const monthLabel = d.toLocaleString("en-US", { month: "short" });

			const from = `${year}-${String(month).padStart(2, "0")}-01`;
			let nextYear = year;
			let nextMonth = month + 1;
			if (nextMonth > 12) {
				nextYear += 1;
				nextMonth = 1;
			}
			const to = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

			result.push({ monthKey, monthLabel, from, to });
		}
		return result;
	}, [monthsCount]);

	const queries = useQueries({
		queries: months.map((m) => ({
			queryKey: queryKeys.summary.range(m.from, m.to),
			queryFn: async () => {
				const res = await bankService.getSummary(m.from, m.to);
				return res.summary;
			},
		})),
	});

	const isLoading = queries.some((q) => q.isLoading);

	const data: MonthSummaryPoint[] = useMemo(() => {
		return months.map((m, idx) => {
			const summary = queries[idx]?.data;
			return {
				monthKey: m.monthKey,
				monthLabel: m.monthLabel,
				from: m.from,
				to: m.to,
				totalIn: summary?.total_in || 0,
				totalOut: summary?.total_out || 0,
				totalFee: summary?.total_fee || 0,
				net: summary?.net || 0,
				count: summary?.count || 0,
			};
		});
	}, [months, queries]);

	return { data, isLoading };
}
