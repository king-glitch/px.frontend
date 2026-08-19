import React from "react";
import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { bankService } from "@/api/services/bank-service";
import type { DateRangeParams } from "@/api/types";

export interface MonthSummaryPoint {
	monthKey: string;
	monthLabel: string;
	year: number;
	totalIn: number;
	totalOut: number;
	net: number;
	count: number;
}

/**
 * Hook to fetch aggregate totals and the per-category breakdown for a range.
 */
export function useSummary(
	params?: DateRangeParams,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: queryKeys.summary.range(params),
		queryFn: async () => {
			const res = await bankService.getSummary(params);
			return res.summary;
		},
		placeholderData: keepPreviousData,
		enabled: options?.enabled,
	});
}

/**
 * Hook to fetch summary statistics for the past N months (e.g., past 6 months).
 */
export function usePastMonthsSummary(monthCount: number = 6) {
	const months = React.useMemo(() => {
		const result: Array<{
			monthKey: string;
			monthLabel: string;
			year: number;
			from: string;
			to: string;
		}> = [];

		const now = new Date();
		for (let i = monthCount - 1; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const year = d.getFullYear();
			const month = d.getMonth();
			const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
			const monthLabel = d.toLocaleString("default", { month: "short" });

			const start = new Date(year, month, 1);
			const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

			result.push({
				monthKey,
				monthLabel,
				year,
				from: start.toISOString(),
				to: end.toISOString(),
			});
		}
		return result;
	}, [monthCount]);

	const queries = useQueries({
		queries: months.map((m) => ({
			queryKey: queryKeys.summary.range({ from: m.from, to: m.to }),
			queryFn: async () => {
				const res = await bankService.getSummary({ from: m.from, to: m.to });
				return res.summary;
			},
			staleTime: 60 * 1000,
		})),
	});

	const isLoading = queries.some((q) => q.isLoading);

	const data: MonthSummaryPoint[] = React.useMemo(() => {
		return months.map((m, idx) => {
			const summary = queries[idx]?.data;
			const totalIn = summary?.total_in || 0;
			const totalOut = summary?.total_out || 0;
			const net = summary?.net || 0;
			const count = summary?.count || 0;

			return {
				monthKey: m.monthKey,
				monthLabel: m.monthLabel,
				year: m.year,
				totalIn,
				totalOut,
				net,
				count,
			};
		});
	}, [months, queries]);

	return {
		data,
		isLoading,
	};
}
