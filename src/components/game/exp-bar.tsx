import React from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { usePrefersReducedMotion } from "./hooks";

const SPRING_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function useCountUp(target: number, duration = 600): number {
	const reducedMotion = usePrefersReducedMotion();
	const [value, setValue] = React.useState(target);
	const fromRef = React.useRef(target);

	React.useEffect(() => {
		if (reducedMotion) {
			fromRef.current = target;
			setValue(target);
			return;
		}

		const from = fromRef.current;
		const start = performance.now();
		let rafId: number;

		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			const eased = 1 - Math.pow(1 - t, 3);
			setValue(Math.round(from + (target - from) * eased));
			if (t < 1) {
				rafId = requestAnimationFrame(tick);
			} else {
				fromRef.current = target;
			}
		};

		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
	}, [target, duration, reducedMotion]);

	return value;
}

export interface ExpBarProps {
	level: number;
	expIntoLevel: number;
	expToNext: number;
}

export const ExpBar: React.FC<ExpBarProps> = ({
	level,
	expIntoLevel,
	expToNext,
}) => {
	const reducedMotion = usePrefersReducedMotion();
	const targetPercent = Math.max(
		0,
		Math.min(100, (expIntoLevel / expToNext) * 100),
	);
	const prevLevelRef = React.useRef(level);
	const [phase, setPhase] = React.useState<"idle" | "draining" | "refilling">(
		"idle",
	);
	const [percent, setPercent] = React.useState(targetPercent);
	const displayedExp = useCountUp(expIntoLevel);

	React.useEffect(() => {
		const leveledUp = level > prevLevelRef.current;
		prevLevelRef.current = level;

		if (!leveledUp || reducedMotion) {
			setPhase("idle");
			setPercent(targetPercent);
			return;
		}

		setPhase("draining");
		setPercent(0);
		const timeout = setTimeout(() => {
			setPhase("refilling");
			setPercent(targetPercent);
		}, 420);
		return () => clearTimeout(timeout);
	}, [level, targetPercent, reducedMotion]);

	const transition = reducedMotion
		? "none"
		: phase === "draining"
			? "width 0.4s ease-in"
			: `width 0.6s ${SPRING_EASE}`;

	return (
		<VStack align="stretch" gap={1.5} w="full">
			<HStack justify="space-between" fontSize="xs" color="fg.muted">
				<Text fontWeight="semibold">Level {level}</Text>
				<Text>
					{displayedExp} / {expToNext} EXP
				</Text>
			</HStack>
			<Box h="3" rounded="pill" bg="bg.muted" overflow="hidden">
				<Box
					h="full"
					rounded="pill"
					bg="mint.solid"
					width={`${percent}%`}
					transition={transition}
				/>
			</Box>
		</VStack>
	);
};

export interface LevelRingProps {
	level: number;
	progress: number;
	size?: number;
}

export const LevelRing: React.FC<LevelRingProps> = ({
	level,
	progress,
	size = 64,
}) => {
	const reducedMotion = usePrefersReducedMotion();
	const strokeWidth = Math.max(3, size * 0.07);
	const radius = size / 2 - strokeWidth;
	const circumference = 2 * Math.PI * radius;
	const clamped = Math.max(0, Math.min(1, progress));
	const dashOffset = circumference * (1 - clamped);

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			role="img"
			aria-label={`Level ${level}`}
		>
			<Box
				as="circle"
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				color="border"
				opacity={0.6}
			/>
			<Box
				as="circle"
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				color="mint.solid"
				transform={`rotate(-90 ${size / 2} ${size / 2})`}
				style={{
					strokeDasharray: circumference,
					strokeDashoffset: dashOffset,
					transition: reducedMotion
						? "none"
						: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
				}}
			/>
		</svg>
	);
};

export default ExpBar;
