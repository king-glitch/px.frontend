import {
	Box,
	Button,
	Flex,
	HStack,
	Icon,
	IconButton,
	Input,
	Stack,
	Text,
} from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import {
	LuCalendar,
	LuChevronLeft,
	LuChevronRight,
	LuRotateCcw,
	LuSlidersHorizontal,
} from "react-icons/lu";
import { useSearchParams } from "react-router";

export interface MonthRangeProps {
	/** Optional callback when range changes */
	onChange?: (from?: string, to?: string) => void;
}

function getCurrentMonthString(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	return `${year}-${month}`;
}

function monthToDateRange(monthStr: string): { from: string; to: string } {
	const [yearStr, monthPart] = monthStr.split("-");
	const year = parseInt(yearStr, 10);
	const month = parseInt(monthPart, 10);

	const from = `${yearStr}-${String(month).padStart(2, "0")}-01`;

	let nextYear = year;
	let nextMonth = month + 1;
	if (nextMonth > 12) {
		nextYear += 1;
		nextMonth = 1;
	}
	const to = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

	return { from, to };
}

function dateRangeToMonth(fromStr?: string | null): string {
	if (!fromStr) return getCurrentMonthString();
	// Handles "2026-08-01" or "2026-08-01T..."
	return fromStr.slice(0, 7);
}

export const MonthRange: React.FC<MonthRangeProps> = ({ onChange }) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const urlFrom = searchParams.get("from");
	const urlTo = searchParams.get("to");

	const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

	// Current month value in YYYY-MM format
	const currentMonth = useMemo(() => {
		return dateRangeToMonth(urlFrom);
	}, [urlFrom]);

	const [customFrom, setCustomFrom] = useState<string>(urlFrom || "");
	const [customTo, setCustomTo] = useState<string>(urlTo || "");

	// Ensure default month range is set if not present in URL
	useEffect(() => {
		if (!urlFrom && !urlTo) {
			const initialMonth = getCurrentMonthString();
			const { from, to } = monthToDateRange(initialMonth);
			const newParams = new URLSearchParams(searchParams);
			newParams.set("from", from);
			newParams.set("to", to);
			setSearchParams(newParams, { replace: true });
			onChange?.(from, to);
		}
	}, [urlFrom, urlTo, searchParams, setSearchParams, onChange]);

	const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		if (!val) return;
		const { from, to } = monthToDateRange(val);
		const newParams = new URLSearchParams(searchParams);
		newParams.set("from", from);
		newParams.set("to", to);
		newParams.set("page", "1");
		setSearchParams(newParams);
		onChange?.(from, to);
	};

	const handleStepMonth = (direction: "prev" | "next") => {
		const [yearStr, monthPart] = currentMonth.split("-");
		let year = parseInt(yearStr, 10);
		let month = parseInt(monthPart, 10);

		if (direction === "prev") {
			month -= 1;
			if (month < 1) {
				year -= 1;
				month = 12;
			}
		} else {
			month += 1;
			if (month > 12) {
				year += 1;
				month = 1;
			}
		}

		const newMonthStr = `${year}-${String(month).padStart(2, "0")}`;
		const { from, to } = monthToDateRange(newMonthStr);
		const newParams = new URLSearchParams(searchParams);
		newParams.set("from", from);
		newParams.set("to", to);
		newParams.set("page", "1");
		setSearchParams(newParams);
		onChange?.(from, to);
	};

	const handleResetCurrentMonth = () => {
		const defaultMonth = getCurrentMonthString();
		const { from, to } = monthToDateRange(defaultMonth);
		const newParams = new URLSearchParams(searchParams);
		newParams.set("from", from);
		newParams.set("to", to);
		newParams.set("page", "1");
		setSearchParams(newParams);
		onChange?.(from, to);
		setIsCustomMode(false);
	};

	const handleApplyCustomRange = () => {
		const newParams = new URLSearchParams(searchParams);
		if (customFrom) {
			newParams.set("from", customFrom);
		} else {
			newParams.delete("from");
		}
		if (customTo) {
			newParams.set("to", customTo);
		} else {
			newParams.delete("to");
		}
		newParams.set("page", "1");
		setSearchParams(newParams);
		onChange?.(customFrom || undefined, customTo || undefined);
	};

	// Format display label
	const displayLabel = useMemo(() => {
		if (isCustomMode && (urlFrom || urlTo)) {
			return `${urlFrom || "Start"} → ${urlTo || "Latest"}`;
		}
		if (!urlFrom) return "All Time";
		try {
			const [year, month] = currentMonth.split("-");
			const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
			return d.toLocaleString("en-US", { month: "long", year: "numeric" });
		} catch {
			return currentMonth;
		}
	}, [isCustomMode, urlFrom, urlTo, currentMonth]);

	return (
		<Box
			bg="bg.panel"
			borderWidth="1px"
			borderColor="border.glass"
			rounded="pill"
			px={3}
			py={1.5}
			shadow="glass"
		>
			<Flex
				align="center"
				justify="space-between"
				gap={2}
				wrap={{ base: "wrap", md: "nowrap" }}
			>
				{/* Month Stepper & Selector */}
				{!isCustomMode ? (
					<HStack gap={1}>
						<IconButton
							size="xs"
							variant="ghost"
							rounded="full"
							aria-label="Previous month"
							onClick={() => handleStepMonth("prev")}
						>
							<Icon as={LuChevronLeft} boxSize={3.5} />
						</IconButton>

						<HStack
							gap={2}
							px={2}
							py={1}
							rounded="pill"
							bg="bg.muted"
							position="relative"
							overflow="hidden"
						>
							<Icon as={LuCalendar} boxSize={3.5} color="fg.muted" />
							<Text fontSize="xs" fontWeight="semibold" whiteSpace="nowrap">
								{displayLabel}
							</Text>
							{/* Hidden native input overlaid over the button for direct picker */}
							<Input
								type="month"
								value={currentMonth}
								onChange={handleMonthChange}
								position="absolute"
								inset={0}
								opacity={0}
								cursor="pointer"
								title="Click to pick month"
							/>
						</HStack>

						<IconButton
							size="xs"
							variant="ghost"
							rounded="full"
							aria-label="Next month"
							onClick={() => handleStepMonth("next")}
						>
							<Icon as={LuChevronRight} boxSize={3.5} />
						</IconButton>
					</HStack>
				) : (
					/* Custom Date Range Inputs */
					<HStack gap={2} wrap="wrap">
						<HStack gap={1} bg="bg.muted" px={2} py={1} rounded="pill">
							<Text fontSize="xs" color="fg.muted">
								From:
							</Text>
							<Input
								type="date"
								size="xs"
								value={customFrom}
								onChange={(e) => setCustomFrom(e.target.value)}
								border="none"
								bg="transparent"
								outline="none"
								fontSize="xs"
								w="110px"
							/>
						</HStack>

						<HStack gap={1} bg="bg.muted" px={2} py={1} rounded="pill">
							<Text fontSize="xs" color="fg.muted">
								To:
							</Text>
							<Input
								type="date"
								size="xs"
								value={customTo}
								onChange={(e) => setCustomTo(e.target.value)}
								border="none"
								bg="transparent"
								outline="none"
								fontSize="xs"
								w="110px"
							/>
						</HStack>

						<Button
							size="xs"
							rounded="pill"
							onClick={handleApplyCustomRange}
						>
							Apply
						</Button>
					</HStack>
				)}

				{/* Quick Controls */}
				<HStack gap={1}>
					<Button
						size="xs"
						variant="ghost"
						rounded="pill"
						onClick={handleResetCurrentMonth}
						title="Reset to current month"
					>
						<Icon as={LuRotateCcw} boxSize={3} />
						<Text fontSize="xs" display={{ base: "none", sm: "inline" }}>
							This Month
						</Text>
					</Button>

					<IconButton
						size="xs"
						variant={isCustomMode ? "solid" : "ghost"}
						rounded="full"
						aria-label="Toggle custom date range"
						title="Toggle custom range"
						onClick={() => setIsCustomMode((prev) => !prev)}
					>
						<Icon as={LuSlidersHorizontal} boxSize={3.5} />
					</IconButton>
				</HStack>
			</Flex>
		</Box>
	);
};

export default MonthRange;
