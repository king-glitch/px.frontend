import React from "react";
import { Box, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import type { FinanceSummary } from "@/api/types";
import { holoGlassCard } from "./holo-card";
import { useTranslation } from "@/lib/i18n";

interface TodayPulseCardProps {
	todayCompletionPct: number;
	healthScorePct: number;
	financeSummary?: FinanceSummary;
	netThisMonth?: number;
	isLoading: boolean;
	isError: boolean;
}

export const TodayPulseCard: React.FC<TodayPulseCardProps> = ({
	todayCompletionPct,
	healthScorePct,
	financeSummary,
	netThisMonth,
	isLoading,
	isError,
}) => {
	const { t } = useTranslation();
	return (
		<Box {...holoGlassCard} p={{ base: 6, xl: 7 }}>
			{isLoading ? (
				<Stack gap={4}>
					<Skeleton h="4" rounded="full" />
					<Skeleton h="4" rounded="full" />
					<Skeleton h="12" rounded="lg" w="70%" mt={2} />
					<Skeleton h="3" rounded="full" w="100%" />
				</Stack>
			) : isError ? (
				<Stack gap={2}>
					<Text fontSize="sm" color="red.fg" fontWeight="medium">
						{t("components.dashboard.todayPulseCard.failedToLoad")}
					</Text>
					<Text fontSize="xs" color="fg.muted">
						{t("common.errors.tryRefresh")}
					</Text>
				</Stack>
			) : (
				<>
					<Text
						fontSize="sm"
						fontWeight="bold"
						textTransform="uppercase"
						letterSpacing="0.08em"
					>
						{t("components.dashboard.todayPulseCard.today")}
					</Text>
					<Stack gap={2.5} mt={4}>
						<Box
							h="3.5"
							rounded="pill"
							bg="bg.muted"
							overflow="hidden"
						>
							<Box
								h="full"
								w={`${todayCompletionPct}%`}
								rounded="pill"
								bg="bg.solid"
							/>
						</Box>
						<Box
							h="3.5"
							rounded="pill"
							bg="bg.muted"
							overflow="hidden"
						>
							<Box
								h="full"
								w={`${healthScorePct}%`}
								rounded="pill"
								bg="bg.solid"
							/>
						</Box>
					</Stack>

					<HStack align="baseline" gap={2} mt={5}>
						<Text
							fontSize={{
								base: "3.2rem",
								xl: "3.8rem",
							}}
							fontWeight="bold"
							letterSpacing="-0.04em"
							lineHeight="1"
							color={
								netThisMonth !== undefined && netThisMonth < 0
									? "red.fg"
									: "fg"
							}
						>
							{netThisMonth !== undefined
								? `${netThisMonth >= 0 ? "+" : ""}${netThisMonth.toLocaleString()}`
								: "—"}
						</Text>
						<Text
							fontSize="sm"
							color="fg.muted"
							pl={3}
							fontWeight="medium"
						>
							{t(
								"components.dashboard.todayPulseCard.netThisPeriod",
							)}
						</Text>
					</HStack>
					{financeSummary && (
						<Text fontSize="xs" color="fg.muted" mt={1.5}>
							{t("components.dashboard.todayPulseCard.income")}{" "}
							{financeSummary.income.toLocaleString()} ·{" "}
							{t("components.dashboard.todayPulseCard.expense")}{" "}
							{financeSummary.expense.toLocaleString()} · +
							{financeSummary.projected_exp}{" "}
							{t(
								"components.dashboard.todayPulseCard.expProjected",
							)}
						</Text>
					)}
				</>
			)}
		</Box>
	);
};
