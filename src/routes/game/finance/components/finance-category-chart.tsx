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
import { LuLayers } from "react-icons/lu";
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

interface FinanceCategoryChartProps {
	period: string;
	data: Array<{ category: string; amount: number }>;
	selectedCategory?: string;
	onSelectCategory?: (category: string) => void;
}

export const FinanceCategoryChart: React.FC<FinanceCategoryChartProps> = ({
	period,
	data,
	selectedCategory,
	onSelectCategory,
}) => {
	const { t } = useTranslation();
	const categoryChart = useChart({
		data,
		series: [
			{
				name: "amount",
				color: "mint.solid",
				label: t("routes.finance.categoryChart.spend"),
			},
		],
	});

	return (
		<Box {...glassCard} p={{ base: 5, md: 6 }}>
			<HStack justify="space-between" mb={4}>
				<Stack gap={0.5}>
					<Heading size="md">
						{t("routes.finance.categoryChart.heading")}
					</Heading>
					<Text fontSize="xs" color="fg.muted">
						{t("routes.finance.categoryChart.subtitle", { period })}
					</Text>
				</Stack>
				<Icon as={LuLayers} boxSize={4} color="fg.muted" />
			</HStack>

			{data.length === 0 ? (
				<Flex
					justify="center"
					align="center"
					h="220px"
					color="fg.muted"
				>
					<Text fontSize="xs">
						{t("routes.finance.categoryChart.empty")}
					</Text>
				</Flex>
			) : (
				<ChartRoot chart={categoryChart} h="220px" w="full">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={categoryChart.data}
							layout="vertical"
							margin={{
								top: 10,
								right: 10,
								left: 20,
								bottom: 0,
							}}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								horizontal={false}
								opacity={0.3}
							/>
							<XAxis
								type="number"
								tickLine={false}
								axisLine={false}
								tick={{ fontSize: 11 }}
							/>
							<YAxis
								type="category"
								dataKey="category"
								tickLine={false}
								axisLine={false}
								tick={{ fontSize: 11 }}
							/>
							<Tooltip content={<ChartTooltip />} />
							<Bar
								dataKey={categoryChart.key("amount")}
								fill={categoryChart.color("purple.solid")}
								radius={[0, 4, 4, 0]}
								style={{ cursor: "pointer" }}
								onClick={(entry: any) => {
									if (entry && entry.category) {
										onSelectCategory?.(
											selectedCategory === entry.category
												? ""
												: entry.category,
										);
									}
								}}
							/>
						</BarChart>
					</ResponsiveContainer>
				</ChartRoot>
			)}
		</Box>
	);
};
