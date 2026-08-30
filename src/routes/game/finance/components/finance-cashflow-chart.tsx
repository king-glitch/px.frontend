import React from "react";
import {
	Box,
	Flex,
	HStack,
	Heading,
	Icon,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuBanknote } from "react-icons/lu";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { ChartRoot, ChartTooltip, useChart } from "@chakra-ui/charts";
import { useTranslation } from "@/lib/i18n";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

interface FinanceCashflowChartProps {
	period: string;
	data: Array<{ date: string; income: number; expense: number }>;
}

export const FinanceCashflowChart: React.FC<FinanceCashflowChartProps> = ({
	period,
	data,
}) => {
	const { t } = useTranslation();
	const cashflowChart = useChart({
		data,
		series: [
			{
				name: "income",
				color: "mint.solid",
				label: t("routes.finance.cashflowChart.income"),
			},
			{
				name: "expense",
				color: "slate",
				label: t("routes.finance.cashflowChart.expense"),
			},
		],
	});

	return (
		<Box {...glassCard} p={{ base: 5, md: 6 }}>
			<HStack justify="space-between" mb={4}>
				<Stack gap={0.5}>
					<Heading size="md">
						{t("routes.finance.cashflowChart.heading")}
					</Heading>
					<Text fontSize="xs" color="fg.muted">
						{t("routes.finance.cashflowChart.subtitle", { period })}
					</Text>
				</Stack>
				<Icon as={LuBanknote} boxSize={4} color="fg.muted" />
			</HStack>

			{data.length === 0 ? (
				<Flex
					justify="center"
					align="center"
					h="220px"
					color="fg.muted"
				>
					<Text fontSize="xs">
						{t("routes.finance.cashflowChart.empty")}
					</Text>
				</Flex>
			) : (
				<ChartRoot chart={cashflowChart} h="220px" w="full">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={cashflowChart.data}
							margin={{
								top: 10,
								right: 10,
								left: -20,
								bottom: 0,
							}}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								opacity={0.3}
							/>
							<XAxis
								dataKey="date"
								tickLine={false}
								axisLine={false}
								tick={{ fontSize: 11 }}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tick={{ fontSize: 11 }}
							/>
							<Tooltip content={<ChartTooltip />} />
							<Bar
								dataKey={cashflowChart.key("income")}
								fill={cashflowChart.color("mint.solid")}
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey={cashflowChart.key("expense")}
								fill={cashflowChart.color("slate")}
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</ChartRoot>
			)}
		</Box>
	);
};
