import type { DuolingoStatus } from "@/api/types";
import { useTranslation } from "@/lib/i18n";
import {
	Badge,
	Box,
	Circle,
	HStack,
	Icon,
	Skeleton,
	Stack,
	Text,
} from "@chakra-ui/react";
import React from "react";
import { LuArrowUpRight, LuLeaf } from "react-icons/lu";
import { Link } from "react-router";
import { holoGlassCard } from "./holo-card";

interface DuolingoCardProps {
	status?: DuolingoStatus | null;
	isLoading: boolean;
	isError: boolean;
}

export const DuolingoCard: React.FC<DuolingoCardProps> = ({
	status,
	isLoading,
	isError,
}) => {
	const { t } = useTranslation();
	return (
		<Box
			{...holoGlassCard}
			p={{ base: 4, xl: 4.5 }}
			minH={{ base: "120px", xl: "135px" }}
			position="relative"
		>
			{isLoading ? (
				<Stack gap={3} h="full" justify="center">
					<Skeleton h="4" rounded="full" />
					<Skeleton h="8" rounded="full" w="60%" />
					<Skeleton h="3" rounded="full" w="50%" />
				</Stack>
			) : isError ? (
				<Stack gap={2} h="full" justify="center">
					<Text fontSize="sm" color="red.fg" fontWeight="medium">
						{t("components.dashboard.duolingoCard.failedToLoad")}
					</Text>
					<Text fontSize="xs" color="fg.muted">
						{t("common.errors.tryRefresh")}
					</Text>
				</Stack>
			) : (
				<>
					<HStack gap={1.5} color="fg.muted">
						<Icon as={LuLeaf} boxSize={4} color="mint.fg" />
						<Text fontSize="sm" fontWeight="semibold">
							{status?.username ||
								t(
									"components.dashboard.duolingoCard.defaultUsername",
								)}
						</Text>
						{status && (
							<Badge
								size="xs"
								variant="subtle"
								colorPalette="mint"
								rounded="pill"
							>
								Synced
							</Badge>
						)}
					</HStack>
					<Circle
						asChild
						size="9"
						bg="mint.solid"
						color="mint.contrast"
						position="absolute"
						top={4}
						right={4}
						shadow="glass"
						transition="all 0.15s ease-out"
						_hover={{ transform: "scale(1.1)" }}
					>
						<Link
							to={status ? "/settings" : "/settings/duolingo"}
							title={
								status
									? t(
											"components.dashboard.duolingoCard.manage",
										)
									: t(
											"components.dashboard.duolingoCard.connect",
										)
							}
						>
							<Icon as={LuArrowUpRight} boxSize={4.5} />
						</Link>
					</Circle>
					<HStack align="baseline" gap={2} mt={4}>
						<Text
							fontSize={{
								base: "2.6rem",
								xl: "3.2rem",
							}}
							fontWeight="bold"
							letterSpacing="-0.04em"
							lineHeight="1"
						>
							{status ? `${status.streak}d` : "0d"}
						</Text>
						<Text
							fontSize="sm"
							color="fg.muted"
							fontWeight="medium"
						>
							{t("components.dashboard.duolingoCard.streak")}
						</Text>
					</HStack>
					<Text
						fontSize="xs"
						color="fg.muted"
						fontWeight="medium"
						mt={1}
					>
						{status
							? `${status.rank > 0 ? `#${status.rank} rank · ` : ""}${status.xp} XP`
							: t(
									"components.dashboard.duolingoCard.linkAccount",
								)}
					</Text>
				</>
			)}
		</Box>
	);
};
