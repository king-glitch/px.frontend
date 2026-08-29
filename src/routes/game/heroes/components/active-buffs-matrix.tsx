import React from "react";
import { Badge, Box, Grid, HStack, Icon, Text } from "@chakra-ui/react";
import { LuClock, LuSparkles } from "react-icons/lu";
import type { Buff } from "@/api";
import { BUFF_LABEL, formatCountdown, glassCard } from "./perks-data";

interface ActiveBuffsMatrixProps {
	activeBuffs: Buff[];
}

export const ActiveBuffsMatrix: React.FC<ActiveBuffsMatrixProps> = ({
	activeBuffs,
}) => {
	const [now, setNow] = React.useState(() => Date.now());

	React.useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(interval);
	}, []);

	if (activeBuffs.length === 0) return null;

	return (
		<Box {...glassCard} p={5}>
			<HStack justify="space-between" mb={3}>
				<HStack gap={2}>
					<Icon as={LuSparkles} boxSize={4} color="mint.fg" />
					<Text fontSize="md" fontWeight="bold">
						Active Consumable Buffs
					</Text>
				</HStack>
				<Badge colorPalette="mint" rounded="pill" size="sm">
					{activeBuffs.length} active
				</Badge>
			</HStack>

			<Grid
				gap={3}
				templateColumns={{
					base: "1fr",
					sm: "repeat(2, 1fr)",
					lg: "repeat(3, 1fr)",
				}}
			>
				{activeBuffs.map((buff, i) => (
					<Box
						key={i}
						p={3.5}
						rounded="card"
						bg="bg.panel"
						borderWidth="1px"
						borderColor="border.glass"
					>
						<HStack justify="space-between">
							<Box>
								<Text fontSize="xs" fontWeight="bold">
									{BUFF_LABEL[buff.effect] ?? buff.effect}
								</Text>
								<Text fontSize="10px" color="fg.muted">
									Multiplier bonus active
								</Text>
							</Box>
							<HStack
								gap={1}
								bg="bg.muted"
								px={2}
								py={0.5}
								rounded="pill"
							>
								<Icon
									as={LuClock}
									boxSize={3}
									color="mint.fg"
								/>
								<Text
									fontSize="xs"
									fontWeight="bold"
									fontFamily="mono"
									color="mint.fg"
								>
									{formatCountdown(buff.expires_at, now)}
								</Text>
							</HStack>
						</HStack>
					</Box>
				))}
			</Grid>
		</Box>
	);
};
