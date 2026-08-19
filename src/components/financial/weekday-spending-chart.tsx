import {
	Box,
	FormatNumber,
	Grid,
	HStack,
	Heading,
	Icon,
	Skeleton,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { LuCalendarDays, LuLayers } from "react-icons/lu";
import { useDimensionBreakdown } from "@/api/hooks/use-summary";
import { monochromeIntensity } from "@/components/financial/chart-palette";

export interface WeekdaySpendingChartProps {
	from?: string;
	to?: string;
}

const WEEKDAY_KEYS = ["1", "2", "3", "4", "5", "6", "7"];
const WEEKDAY_SHORT_LABELS: Record<string, string> = {
	"1": "Mon",
	"2": "Tue",
	"3": "Wed",
	"4": "Thu",
	"5": "Fri",
	"6": "Sat",
	"7": "Sun",
};

export const WeekdaySpendingChart: React.FC<WeekdaySpendingChartProps> = ({
	from,
	to,
}) => {
	const { data: breakdown, isLoading } = useDimensionBreakdown({
		dimension: "weekday",
		from,
		to,
	});

	const [hoveredKey, setHoveredKey] = useState<string | null>(null);

	const byKey = useMemo(() => {
		const map = new Map<string, { amount: number; count: number }>();
		(breakdown?.buckets || []).forEach((b) => {
			map.set(b.key, { amount: b.amount, count: b.count });
		});
		return map;
	}, [breakdown]);

	const maxAmount = useMemo(() => {
		let max = 1;
		byKey.forEach((v) => {
			if (v.amount > max) max = v.amount;
		});
		return max * 1.15;
	}, [byKey]);

	const hasData = byKey.size > 0;

	return (
		<Box
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border"
			rounded="2xl"
			p={{ base: 4, md: 5 }}
		>
			<HStack gap={2} mb={4}>
				<Icon as={LuCalendarDays} color="mint.fg" />
				<Heading fontSize="sm" fontWeight="bold">
					Spend by Day of Week
				</Heading>
			</HStack>

			{isLoading ? (
				<Stack gap={3}>
					<Skeleton h="160px" rounded="card" />
				</Stack>
			) : !hasData ? (
				<VStack py={10} textAlign="center" color="fg.muted" gap={2}>
					<Icon as={LuLayers} boxSize={8} />
					<Text fontSize="sm">No spend recorded for this period.</Text>
				</VStack>
			) : (
				<Box h="180px" w="full" pt={2} pb={2}>
					<Grid templateColumns="repeat(7, 1fr)" h="full" gap={2}>
						{WEEKDAY_KEYS.map((key) => {
							const point = byKey.get(key);
							const amount = point?.amount || 0;
							const height = Math.max(4, Math.round((amount / maxAmount) * 120));
							const isHovered = hoveredKey === key;
							const intensity = monochromeIntensity(amount, maxAmount);

							return (
								<VStack
									key={key}
									h="full"
									justify="flex-end"
									align="center"
									gap={2}
									cursor="pointer"
									onMouseEnter={() => setHoveredKey(key)}
									onMouseLeave={() => setHoveredKey(null)}
									bg={isHovered ? "bg.muted" : "transparent"}
									p={1}
									rounded="card"
									transition="all 0.15s ease"
								>
									{isHovered && amount > 0 && (
										<Text fontSize="10px" fontWeight="bold" color="fg">
											<FormatNumber value={amount} style="currency" currency="THB" />
										</Text>
									)}
									<Box
										w={{ base: "14px", sm: "20px", md: "26px" }}
										h={`${amount > 0 ? height : 4}px`}
										bg="fg"
										opacity={intensity}
										roundedTop="pill"
										transition="all 0.25s ease"
										_hover={{ opacity: 1 }}
									/>
									<Text
										fontSize={{ base: "10px", sm: "xs" }}
										fontWeight={isHovered ? "bold" : "medium"}
										color={isHovered ? "fg" : "fg.muted"}
									>
										{WEEKDAY_SHORT_LABELS[key]}
									</Text>
								</VStack>
							);
						})}
					</Grid>
				</Box>
			)}
		</Box>
	);
};

export default WeekdaySpendingChart;
