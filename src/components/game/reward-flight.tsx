import React from "react";
import { Box, Portal } from "@chakra-ui/react";
import { usePrefersReducedMotion } from "./hooks";
import { useTranslation } from "@/lib/i18n";

export type RewardKind = "exp" | "px";

interface ChipRequest {
	id: number;
	fromRect: DOMRect;
	amount: number;
	kind: RewardKind;
	resolve: () => void;
}

type ChipListener = (req: ChipRequest) => void;

let listeners: ChipListener[] = [];
let idCounter = 0;
let flightTargetEl: HTMLElement | null = null;

export function registerRewardFlightTarget(el: HTMLElement | null): void {
	flightTargetEl = el;
}

interface RewardFlightChipProps {
	req: ChipRequest;
	onComplete: (req: ChipRequest) => void;
}

const RewardFlightChip: React.FC<RewardFlightChipProps> = ({
	req,
	onComplete,
}) => {
	const { t } = useTranslation();
	const ref = React.useRef<HTMLDivElement>(null);

	React.useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;

		const target = flightTargetEl?.getBoundingClientRect();
		const startX = req.fromRect.left + req.fromRect.width / 2;
		const startY = req.fromRect.top + req.fromRect.height / 2;
		const endX = target ? target.left + target.width / 2 : startX;
		const endY = target ? target.top + target.height / 2 : startY - 60;
		const midX = startX + (endX - startX) * 0.5;
		const midY = Math.min(startY, endY) - 50;

		el.style.left = `${startX}px`;
		el.style.top = `${startY}px`;

		const animation = el.animate(
			[
				{
					transform: "translate(-50%, -50%) scale(0.85)",
					opacity: 1,
					offset: 0,
				},
				{
					transform: `translate(calc(-50% + ${midX - startX}px), calc(-50% + ${midY - startY}px)) scale(1.05)`,
					opacity: 1,
					offset: 0.55,
				},
				{
					transform: `translate(calc(-50% + ${endX - startX}px), calc(-50% + ${endY - startY}px)) scale(0.5)`,
					opacity: 0,
					offset: 1,
				},
			],
			{
				duration: 700,
				easing: "cubic-bezier(0.16, 1, 0.3, 1)",
				fill: "forwards",
			},
		);

		animation.onfinish = () => onComplete(req);
		return () => animation.cancel();
	}, [req, onComplete]);

	return (
		<Box
			ref={ref}
			position="fixed"
			zIndex={10000}
			pointerEvents="none"
			px={2.5}
			py={1}
			rounded="pill"
			bg="bg.solid"
			color="fg.inverted"
			fontSize="xs"
			fontWeight="bold"
			shadow="float"
			whiteSpace="nowrap"
		>
			+{req.amount}{" "}
			{req.kind === "px" ? t("common.units.px") : t("common.units.exp")}
		</Box>
	);
};

export const RewardFlight: React.FC = () => {
	const [chips, setChips] = React.useState<ChipRequest[]>([]);

	React.useEffect(() => {
		const listener: ChipListener = (req) => {
			setChips((prev) => [...prev, req]);
		};
		listeners.push(listener);
		return () => {
			listeners = listeners.filter((l) => l !== listener);
		};
	}, []);

	const handleComplete = React.useCallback((req: ChipRequest) => {
		req.resolve();
		setChips((prev) => prev.filter((chip) => chip.id !== req.id));
	}, []);

	if (chips.length === 0) return null;

	return (
		<Portal>
			{chips.map((chip) => (
				<RewardFlightChip
					key={chip.id}
					req={chip}
					onComplete={handleComplete}
				/>
			))}
		</Portal>
	);
};

export function useRewardFlight() {
	const reducedMotion = usePrefersReducedMotion();

	const fly = React.useCallback(
		(
			fromEl: HTMLElement,
			amount: number,
			kind: RewardKind,
		): Promise<void> => {
			if (reducedMotion || listeners.length === 0) {
				return Promise.resolve();
			}

			const fromRect = fromEl.getBoundingClientRect();
			return new Promise<void>((resolve) => {
				const req: ChipRequest = {
					id: idCounter++,
					fromRect,
					amount,
					kind,
					resolve,
				};
				listeners.forEach((listener) => listener(req));
			});
		},
		[reducedMotion],
	);

	const triggerFlight = React.useCallback(
		(options: {
			sourceX?: number;
			sourceY?: number;
			exp?: number;
			px?: number;
			fromElement?: HTMLElement;
		}) => {
			const el =
				options.fromElement ||
				(typeof document !== "undefined" ? document.body : null);
			if (!el) return;
			if (options.exp && options.exp > 0) {
				void fly(el, options.exp, "exp");
			}
			if (options.px && options.px > 0) {
				void fly(el, options.px, "px");
			}
		},
		[fly],
	);

	return { fly, triggerFlight };
}

export default RewardFlight;
