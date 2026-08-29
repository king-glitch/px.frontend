import React from "react";
import { Flex, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";

interface FinanceHeaderProps {
	period: string;
	onPeriodChange: (period: string) => void;
}

export const FinanceHeader: React.FC<FinanceHeaderProps> = ({
	period,
	onPeriodChange,
}) => {
	return (
		<Flex justify="space-between" align="flex-end" wrap="wrap" gap={3}>
			<Stack gap={1}>
				<Heading size="2xl">Finance & Economy</Heading>
				<Text color="fg.muted" fontSize="sm">
					Log transactions, track budget limits, and convert monthly
					discipline into hero EXP.
				</Text>
			</Stack>
			<Field label="Active Period" w="auto">
				<Input
					type="month"
					value={period}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						onPeriodChange(e.target.value)
					}
					rounded="pill"
					bg="bg.panel"
					borderColor="border"
					w="180px"
					fontSize="sm"
				/>
			</Field>
		</Flex>
	);
};
