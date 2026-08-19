import {
	Badge,
	Box,
	Circle,
	Flex,
	FormatNumber,
	HStack,
	Heading,
	Icon,
	Progress,
	Skeleton,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import { LuLayers, LuReceiptText } from "react-icons/lu";
import { useDimensionBreakdown } from "@/api/hooks/use-summary";
import { monochromeIntensity } from "@/components/financial/chart-palette";

export interface TopReferencesChartProps {
	from?: string;
	to?: string;
}

export const TopReferencesChart: React.FC<TopReferencesChartProps> = ({
	from,
	to,
}) => {
	const { data: breakdown, isLoading } = useDimensionBreakdown({
		dimension: "reference",
		from,
		to,
	});

	const buckets = breakdown?.buckets || [];
	const maxAmount = useMemo(
		() => Math.max(1, ...buckets.map((b) => b.amount)),
		[buckets],
	);

	return (
		<Box
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border"
			rounded="2xl"
			p={{ base: 4, md: 6 }}
		>
			<HStack gap={2} mb={4}>
				<Icon as={LuReceiptText} color="mint.fg" />
				<Heading fontSize="sm" fontWeight="bold">
					Top Transaction References
				</Heading>
			</HStack>

			{isLoading ? (
				<Stack gap={3}>
					<Skeleton h="160px" rounded="card" />
				</Stack>
			) : buckets.length === 0 ? (
				<VStack py={10} textAlign="center" color="fg.muted" gap={2}>
					<Icon as={LuLayers} boxSize={8} />
					<Text fontSize="sm">No recurring references found for this period.</Text>
				</VStack>
			) : (
				<VStack align="stretch" gap={2}>
					{buckets.map((bucket) => {
						const pct = Math.min(
							100,
							Math.round((bucket.amount / maxAmount) * 100),
						);
						const intensity = monochromeIntensity(bucket.amount, maxAmount);

						return (
							<Box
								key={bucket.key}
								p={2}
								rounded="card"
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border"
							>
								<Flex justify="space-between" align="center" mb={1}>
									<HStack gap={2} overflow="hidden">
										<Circle
											size="2.5"
											bg="fg"
											opacity={intensity}
											flexShrink={0}
										/>
										<Text fontSize="xs" fontWeight="semibold" truncate maxW="220px">
											{bucket.label}
										</Text>
										<Text fontSize="10px" color="fg.muted">
											({bucket.count} tx)
										</Text>
									</HStack>

									<HStack gap={2}>
										<Text fontSize="xs" fontWeight="bold">
											<FormatNumber
												value={bucket.amount}
												style="currency"
												currency="THB"
											/>
										</Text>
										<Badge size="xs" rounded="pill" variant="outline">
											{pct}%
										</Badge>
									</HStack>
								</Flex>

								<Progress.Root value={pct} max={100} size="xs">
									<Progress.Track bg="bg.muted" rounded="pill">
										<Progress.Range
											bg="fg"
											opacity={intensity}
											rounded="pill"
										/>
									</Progress.Track>
								</Progress.Root>
							</Box>
						);
					})}
				</VStack>
			)}
		</Box>
	);
};

export default TopReferencesChart;
