import React from "react";
import { Grid, HStack, Stack, Text } from "@chakra-ui/react";
import { Chart, useChart } from "@chakra-ui/charts";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
} from "recharts";
import { Tooltip } from "@/components/ui/tooltip";

export type Attribute =
	"vigor" | "craft" | "mind" | "order" | "spirit" | "bond" | "fortune";

export interface AttributeMeta {
	key: Attribute;
	label: string;
	/** The quest category whose EXP raises this attribute. */
	source: string;
	description: string;
}

export const ATTRIBUTES: AttributeMeta[] = [
	{
		key: "vigor",
		label: "VIGOR",
		source: "health",
		description: "Raised by health quests and your daily health award.",
	},
	{
		key: "craft",
		label: "CRAFT",
		source: "work",
		description: "Raised by work quests — anything you build or ship.",
	},
	{
		key: "mind",
		label: "MIND",
		source: "learning",
		description: "Raised by learning quests — study, reading, practice.",
	},
	{
		key: "order",
		label: "ORDER",
		source: "chores",
		description:
			"Raised by chores — the upkeep that keeps everything else running.",
	},
	{
		key: "spirit",
		label: "SPIRIT",
		source: "mindfulness",
		description:
			"Raised by mindfulness quests — rest, reflection, stillness.",
	},
	{
		key: "bond",
		label: "BOND",
		source: "social",
		description: "Raised by social quests — time spent on people.",
	},
	{
		key: "fortune",
		label: "FORTUNE",
		source: "finance",
		description:
			"Raised by finance quests and by logging your income and expenses.",
	},
];

export interface AttributeRadarProps {
	values: Record<Attribute, number>;
	max: number;
	/** @deprecated Chart.Root sizes itself to its container; pass maxH on a wrapper instead. */
	size?: number;
}

export const AttributeRadar: React.FC<AttributeRadarProps> = ({
	values,
	max = 100,
}) => {
	const effectiveMax = Math.max(20, max);

	const chartData = React.useMemo(
		() =>
			ATTRIBUTES.map((attr) => ({
				attribute: attr.label,
				value: values[attr.key] ?? 0,
			})),
		[values],
	);

	const chart = useChart({
		data: chartData,
		series: [{ name: "value", color: "mint.solid" }],
	});

	return (
		<Grid
			gap={5}
			templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
			w="full"
			alignItems="center"
		>
			<Chart.Root chart={chart} h="260px" w="full" minW={0}>
				<ResponsiveContainer width="100%" height="100%">
					<RadarChart data={chart.data} outerRadius="75%">
						<PolarGrid stroke={chart.color("border")} />
						<PolarAngleAxis
							dataKey={chart.key("attribute")}
							tick={{
								fill: chart.color("fg.muted"),
								fontSize: 10,
							}}
						/>
						<PolarRadiusAxis
							domain={[0, effectiveMax]}
							tick={false}
							axisLine={false}
						/>
						<Radar
							dataKey={chart.key("value")}
							stroke={chart.color("mint.solid")}
							fill={chart.color("mint.solid")}
							fillOpacity={0.25}
							isAnimationActive={false}
						/>
					</RadarChart>
				</ResponsiveContainer>
			</Chart.Root>

			<Stack gap={2} minW={0}>
				{ATTRIBUTES.map((attr) => (
					<Tooltip key={attr.key} content={attr.description}>
						<HStack
							justify="space-between"
							gap={3}
							px={2.5}
							py={1.5}
							rounded="pill"
							bg="bg.muted"
							cursor="default"
						>
							<Stack gap={0} minW={0}>
								<Text fontSize="xs" fontWeight="bold">
									{attr.label}
								</Text>
								<Text
									fontSize="10px"
									color="fg.muted"
									textTransform="capitalize"
								>
									from {attr.source}
								</Text>
							</Stack>
							<Text
								fontSize="sm"
								fontWeight="bold"
								fontFamily="mono"
								color="mint.fg"
								flexShrink={0}
							>
								{values[attr.key] ?? 0}
							</Text>
						</HStack>
					</Tooltip>
				))}
			</Stack>
		</Grid>
	);
};

export default AttributeRadar;
