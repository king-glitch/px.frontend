import React from "react";
import { Flex, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { useTranslation } from "@/lib/i18n";

interface FinanceHeaderProps {
	period: string;
	onPeriodChange: (period: string) => void;
}

export const FinanceHeader: React.FC<FinanceHeaderProps> = ({
	period,
	onPeriodChange,
}) => {
	const { t } = useTranslation();

	const currentMonth = new Date().toISOString().slice(0, 7);

	return (
		<Flex justify="space-between" align="flex-end" wrap="wrap" gap={3}>
			<Stack gap={1}>
				<Heading size="2xl">
					{t("routes.finance.header.heading")}
				</Heading>
				<Text color="fg.muted" fontSize="sm">
					{t("routes.finance.header.subtitle")}
				</Text>
			</Stack>
			<Field label={t("routes.finance.header.activePeriod")} w="auto">
				<Input
					type="month"
					value={period}
					max={currentMonth}
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
