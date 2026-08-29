import React from "react";
import { HStack, Icon, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { LuFlame } from "react-icons/lu";
import { usePrefersReducedMotion } from "./hooks";

const emberPulse = keyframes({
	"0%, 100%": { transform: "scale(1)", opacity: 0.85 },
	"50%": { transform: "scale(1.08)", opacity: 1 },
});

const PLATEAU_DAYS = 30;
const MAX_PERIOD_SECONDS = 3.2;
const MIN_PERIOD_SECONDS = 1.4;

export interface StreakFlameProps {
	days: number;
	size?: number;
}

export const StreakFlame: React.FC<StreakFlameProps> = ({
	days,
	size = 16,
}) => {
	const reducedMotion = usePrefersReducedMotion();
	const active = days > 0;
	const clampedDays = Math.max(0, Math.min(PLATEAU_DAYS, days));
	const period =
		MAX_PERIOD_SECONDS -
		(clampedDays / PLATEAU_DAYS) *
			(MAX_PERIOD_SECONDS - MIN_PERIOD_SECONDS);

	return (
		<HStack gap={1} color={active ? "mint.fg" : "fg.muted"}>
			<Icon
				as={LuFlame}
				boxSize={`${size}px`}
				opacity={active ? 1 : 0.4}
				animation={
					active && !reducedMotion
						? `${emberPulse} ${period}s ease-in-out infinite`
						: undefined
				}
			/>
			<Text fontSize="xs" fontWeight="bold">
				{days}d
			</Text>
		</HStack>
	);
};

export default StreakFlame;
