import { useIngestHealthSamples } from "@/api/hooks/use-game";
import type { HealthMetric, HealthSource } from "@/api/types";
import {
	DialogActionTrigger,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { NumberInputField } from "@/components/ui/number-input";
import { toaster } from "@/components/ui/toaster";
import { Button, HStack, Icon, SimpleGrid, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import { LuActivity, LuCheck } from "react-icons/lu";

interface LogHealthDialogProps {
	isOpen: boolean;
	onClose: () => void;
	day: string;
}

export const LogHealthDialog: React.FC<LogHealthDialogProps> = ({
	isOpen,
	onClose,
	day,
}) => {
	const [steps, setSteps] = useState("");
	const [sleepHours, setSleepHours] = useState("");
	const [sleepMins, setSleepMins] = useState("");
	const [activeEnergy, setActiveEnergy] = useState("");
	const [restingHr, setRestingHr] = useState("");
	const [hrv, setHrv] = useState("");

	const ingestMutation = useIngestHealthSamples();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const samples: Array<{
			metric: HealthMetric;
			value: number;
			unit?: string;
			day: string;
			source: HealthSource;
		}> = [];

		if (steps.trim() && !isNaN(Number(steps))) {
			samples.push({
				metric: "steps",
				value: Number(steps),
				unit: "count",
				day,
				source: "manual",
			});
		}

		const totalSleepMins =
			(Number(sleepHours) || 0) * 60 + (Number(sleepMins) || 0);
		if (totalSleepMins > 0) {
			samples.push({
				metric: "sleep_minutes",
				value: totalSleepMins,
				unit: "min",
				day,
				source: "manual",
			});
		}

		if (activeEnergy.trim() && !isNaN(Number(activeEnergy))) {
			samples.push({
				metric: "active_energy",
				value: Number(activeEnergy),
				unit: "kcal",
				day,
				source: "manual",
			});
		}

		if (restingHr.trim() && !isNaN(Number(restingHr))) {
			samples.push({
				metric: "resting_hr",
				value: Number(restingHr),
				unit: "bpm",
				day,
				source: "manual",
			});
		}

		if (hrv.trim() && !isNaN(Number(hrv))) {
			samples.push({
				metric: "hrv",
				value: Number(hrv),
				unit: "ms",
				day,
				source: "manual",
			});
		}

		if (samples.length === 0) {
			toaster.create({
				title: "No vitals entered",
				description: "Please enter at least one health metric to log.",
				type: "info",
			});
			return;
		}

		try {
			await ingestMutation.mutateAsync({ samples });
			toaster.create({
				title: "Bio-Data Synced!",
				description: `Logged ${samples.length} health metric${samples.length > 1 ? "s" : ""} for today.`,
				type: "success",
			});
			onClose();
		} catch (err: any) {
			toaster.create({
				title: "Failed to log health data",
				description: err?.message || "An unexpected error occurred",
				type: "error",
			});
		}
	};

	return (
		<DialogRoot
			open={isOpen}
			onOpenChange={(e) => !e.open && onClose()}
			placement="center"
		>
			<DialogContent bg="bg.panel" backdropFilter="blur(20px)" maxW="md">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<VStack align="flex-start" gap={1} w="full">
							<HStack gap={2}>
								<Icon as={LuActivity} color="lime.500" boxSize={5} />
								<DialogTitle>Log Daily Bio-Data</DialogTitle>
							</HStack>
							<DialogDescription>
								Record your movement, sleep, and recovery metrics for {day}.
							</DialogDescription>
						</VStack>
					</DialogHeader>

					<DialogBody>
						<VStack gap={4} align="stretch">
							<Field label="Daily Steps">
								<NumberInputField
									min={0}
									placeholder="e.g. 8500"
									value={steps}
									onValueChange={(e) => setSteps(e.value)}
								/>
							</Field>

							<SimpleGrid columns={2} gap={3}>
								<Field label="Sleep (Hours)">
									<NumberInputField
										min={0}
										max={24}
										placeholder="e.g. 7"
										value={sleepHours}
										onValueChange={(e) => setSleepHours(e.value)}
									/>
								</Field>
								<Field label="Sleep (Minutes)">
									<NumberInputField
										min={0}
										max={59}
										placeholder="e.g. 45"
										value={sleepMins}
										onValueChange={(e) => setSleepMins(e.value)}
									/>
								</Field>
							</SimpleGrid>

							<SimpleGrid columns={2} gap={3}>
								<Field label="Active Energy (kcal)">
									<NumberInputField
										min={0}
										placeholder="e.g. 520"
										value={activeEnergy}
										onValueChange={(e) => setActiveEnergy(e.value)}
									/>
								</Field>
								<Field label="Resting HR (bpm)">
									<NumberInputField
										min={30}
										max={220}
										placeholder="e.g. 58"
										value={restingHr}
										onValueChange={(e) => setRestingHr(e.value)}
									/>
								</Field>
							</SimpleGrid>

							<Field label="HRV (ms, Optional)">
								<NumberInputField
									min={0}
									placeholder="e.g. 65"
									value={hrv}
									onValueChange={(e) => setHrv(e.value)}
								/>
							</Field>
						</VStack>
					</DialogBody>

					<DialogFooter>
						<DialogActionTrigger asChild>
							<Button variant="outline">Cancel</Button>
						</DialogActionTrigger>
						<Button
							type="submit"
							colorPalette="lime"
							loading={ingestMutation.isPending}
						>
							<Icon as={LuCheck} mr={1} /> Save Vitals
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</DialogRoot>
	);
};
