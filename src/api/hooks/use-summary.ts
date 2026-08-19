import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { bankService } from "@/api/services/bank-service";
import type {
	DateRangeParams,
	DimensionBreakdownParams,
	TimeSeriesParams,
} from "@/api/types";

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
 * Hook to fetch time-bucketed totals (day/week/month) for a range.
 */
export function useTimeSeries(
	params: TimeSeriesParams,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: queryKeys.summary.timeseries(params),
		queryFn: async () => {
			const res = await bankService.getTimeSeries(params);
			return res.points;
		},
		placeholderData: keepPreviousData,
		enabled: options?.enabled,
	});
}

/**
 * Hook to fetch a ranked spend breakdown by account, weekday, or reference.
 */
export function useDimensionBreakdown(
	params: DimensionBreakdownParams,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: queryKeys.summary.breakdown(params),
		queryFn: async () => {
			const res = await bankService.getBreakdown(params);
			return res.breakdown;
		},
		placeholderData: keepPreviousData,
		enabled: options?.enabled,
	});
}
