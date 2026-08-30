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
import { useTranslation } from "@/lib/i18n";

export type Attribute =
	"vigor" | "craft" | "mind" | "order" | "spirit" | "bond" | "fortune";

export interface AttributeMeta {
	key: Attribute;
	/** The quest category whose EXP raises this attribute. */
	source: string;
}

export const ATTRIBUTES: AttributeMeta[] = [
	{ key: "vigor", source: "health" },
	{ key: "craft", source: "work" },
	{ key: "mind", source: "learning" },
	{ key: "order", source: "chores" },
	{ key: "spirit", source: "mindfulness" },
	{ key: "bond", source: "social" },
	{ key: "fortune", source: "finance" },
];

export interface AttributeRadarProps {
	values: Record<Attribute, number>;
	max: number;
	/** @deprecated Chart.Root sizes itself to its container; pass maxH on a wrapper instead. */
	size?: number;
}

const CHART_SERIES: Array<{ name: "value"; color: string }> = [
	{ name: "value", color: "mint.solid" },
];

export const AttributeRadar: React.FC<AttributeRadarProps> = React.memo(
	({ values, max = 100 }) => {
		const { t } = useTranslation();
		const effectiveMax = Math.max(20, max);

		const chartData = React.useMemo(
			() =>
				ATTRIBUTES.map((attr) => ({
					attribute: t(
						`components.game.attributes.${attr.key}.label`,
					),
					value: values[attr.key] ?? 0,
				})),
			[values, t],
		);

		const chart = useChart({
			data: chartData,
			series: CHART_SERIES,
		});

		return (
			<Grid
				gap={5}
				templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
				w="full"
				alignItems="center"
			>
				<Chart.Root chart={chart} h="260px" w="full" minW={0}>
					<ResponsiveContainer
						width="100%"
						height={260}
						minWidth={0}
						minHeight={0}
					>
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
						<Tooltip
							key={attr.key}
							content={t(
								`components.game.attributes.${attr.key}.description`,
							)}
						>
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
										{t(
											`components.game.attributes.${attr.key}.label`,
										)}
									</Text>
									<Text
										fontSize="10px"
										color="fg.muted"
										textTransform="capitalize"
									>
										{t(
											"components.game.attributeRadar.from",
										)}{" "}
										{attr.source}
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
	},
);

export default AttributeRadar;
