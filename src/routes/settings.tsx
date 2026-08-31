import { useDisconnectDuolingo, useDuolingoStatus } from "@/api";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import { useAuthContext } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n";
import {
	Badge,
	Box,
	Container,
	Flex,
	Grid,
	HStack,
	Heading,
	Icon,
	Skeleton,
	Stack,
	Text,
} from "@chakra-ui/react";
import React from "react";
import {
	LuExternalLink,
	LuFlame,
	LuLeaf,
	LuTrendingUp,
	LuTrophy,
	LuUser,
} from "react-icons/lu";
import { useNavigate } from "react-router";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

export const Settings: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { user } = useAuthContext();
	const { data: status, isLoading } = useDuolingoStatus();
	const disconnect = useDisconnectDuolingo();

	const isConnected = status !== null && status !== undefined;

	const handleDisconnect = async () => {
		try {
			await disconnect.mutateAsync();
		} catch (err) {
			if (err instanceof ApiError && err.violations?._error) {
				toaster.create({
					title: t("routes.settings.validationError"),
					description: err.violations._error.message,
					type: "error",
				});
			}
		}
	};

	return (
		<Container maxW="3xl" py={{ base: 4, md: 8 }}>
			<Stack gap={6}>
				{/* Settings Header */}
				<Stack gap={1}>
					<Heading size="2xl">{t("routes.settings.heading")}</Heading>
					<Text color="fg.muted">
						{t("routes.settings.subtitle")}
					</Text>
				</Stack>

				{/* Account Profile Card */}
				<Box {...glassCard} p={{ base: 5, md: 6 }}>
					<Flex
						align="center"
						justify="space-between"
						wrap="wrap"
						gap={4}
					>
						<HStack gap={3.5}>
							<Box
								p={3}
								rounded="2xl"
								bg="bg.muted"
								borderWidth="1px"
								borderColor="border.glass"
							>
								<Icon
									as={LuUser}
									boxSize={5}
									color="fg.muted"
								/>
							</Box>
							<Stack gap={0.5}>
								<HStack gap={2}>
									<Text fontWeight="bold" fontSize="md">
										{user?.username}
									</Text>
									<Badge
										size="xs"
										rounded="pill"
										variant="subtle"
									>
										{t("routes.settings.active")}
									</Badge>
								</HStack>
								<Text fontSize="xs" color="fg.muted">
									{t("routes.settings.idPrefix")} {user?.id}
								</Text>
							</Stack>
						</HStack>
					</Flex>
				</Box>

				{/* Integrations Section */}
				<Stack gap={3}>
					<Heading
						size="md"
						color="fg.muted"
						textTransform="uppercase"
						letterSpacing="0.05em"
						fontSize="xs"
					>
						{t("routes.settings.integrations")}
					</Heading>

					<Box {...glassCard} p={{ base: 5, md: 7 }}>
						<Flex
							align="flex-start"
							justify="space-between"
							wrap="wrap"
							gap={3}
							mb={4}
						>
							<HStack gap={3}>
								<Box
									p={3}
									rounded="2xl"
									bg="bg.muted"
									color="fg.muted"
									borderWidth="1px"
									borderColor="border.glass"
								>
									<Icon as={LuLeaf} boxSize={5} />
								</Box>
								<Stack gap={0.5}>
									<HStack gap={2}>
										<Heading size="sm">
											{t("routes.settings.duolingo")}
										</Heading>
										<Badge size="sm" variant="subtle">
											{isConnected
												? status?.username
													? `@${status.username}`
													: t(
															"routes.settings.connected",
														)
												: t(
														"routes.settings.notConnected",
													)}
										</Badge>
									</HStack>
									<Text fontSize="xs" color="fg.muted">
										{isConnected && status?.username
											? t("routes.settings.connectedAs", {
													username: status.username,
												})
											: t(
													"routes.settings.duolingoTagline",
												)}
									</Text>
								</Stack>
							</HStack>

							{!isConnected && !isLoading && (
								<Button
									size="sm"
									variant="dark"
									onClick={() =>
										navigate("/settings/duolingo")
									}
								>
									{t("routes.settings.connect")}
								</Button>
							)}
						</Flex>

						{isLoading ? (
							<Grid
								gap={3}
								templateColumns={{
									base: "1fr",
									sm: "repeat(2, 1fr)",
									md: "repeat(4, 1fr)",
								}}
								pt={2}
							>
								<Skeleton h="20" rounded="card" />
								<Skeleton h="20" rounded="card" />
								<Skeleton h="20" rounded="card" />
								<Skeleton h="20" rounded="card" />
							</Grid>
						) : isConnected && status ? (
							<Stack gap={5} pt={2}>
								<Grid
									gap={3}
									templateColumns={{
										base: "1fr",
										sm: "repeat(2, 1fr)",
										md: "repeat(4, 1fr)",
									}}
								>
									<Box {...glassCard} p={3.5}>
										<HStack
											justify="space-between"
											color="fg.muted"
										>
											<Text
												fontSize="10px"
												fontWeight="semibold"
												textTransform="uppercase"
											>
												{t("routes.settings.xp")}
											</Text>
											<Icon
												as={LuTrendingUp}
												boxSize={3.5}
												color="fg.muted"
											/>
										</HStack>
										<Heading size="xl" mt={1}>
											{status.xp}
										</Heading>
									</Box>

									<Box {...glassCard} p={3.5}>
										<HStack
											justify="space-between"
											color="fg.muted"
										>
											<Text
												fontSize="10px"
												fontWeight="semibold"
												textTransform="uppercase"
											>
												{t("routes.settings.rank")}
											</Text>
											<Icon
												as={LuTrophy}
												boxSize={3.5}
												color="fg.muted"
											/>
										</HStack>
										<Heading size="xl" mt={1}>
											{status.rank > 0
												? `#${status.rank}`
												: t("routes.settings.unranked")}
										</Heading>
									</Box>

									<Box {...glassCard} p={3.5}>
										<HStack
											justify="space-between"
											color="fg.muted"
										>
											<Text
												fontSize="10px"
												fontWeight="semibold"
												textTransform="uppercase"
											>
												{t("routes.settings.streak")}
											</Text>
											<Icon
												as={LuFlame}
												boxSize={3.5}
												color="fg.muted"
											/>
										</HStack>
										<Heading size="xl" mt={1}>
											{status.streak}d
										</Heading>
									</Box>

									<Box {...glassCard} p={3.5}>
										<HStack
											justify="space-between"
											color="fg.muted"
										>
											<Text
												fontSize="10px"
												fontWeight="semibold"
												textTransform="uppercase"
											>
												{t(
													"routes.settings.longestStreak",
												)}
											</Text>
											<Icon
												as={LuFlame}
												boxSize={3.5}
												color="fg.muted"
											/>
										</HStack>
										<Heading size="xl" mt={1}>
											{status.longest_streak}d
										</Heading>
									</Box>
								</Grid>

								<HStack justify="space-between" pt={2}>
									<Button
										variant="outline"
										size="sm"
										rounded="pill"
										onClick={() =>
											navigate("/settings/duolingo")
										}
									>
										<Icon
											as={LuExternalLink}
											boxSize={3.5}
											mr={1}
										/>
										{t("routes.settings.reconnect")}
									</Button>
									<Button
										variant="outline"
										size="sm"
										rounded="pill"
										colorPalette="red"
										loading={disconnect.isPending}
										onClick={handleDisconnect}
									>
										{t("routes.settings.disconnect")}
									</Button>
								</HStack>
							</Stack>
						) : (
							<Stack gap={4} pt={2}>
								<Text color="fg.muted" fontSize="sm">
									{t("routes.settings.connectPrompt")}
								</Text>
								<Box pt={1}>
									<Button
										variant="outline"
										rounded="pill"
										onClick={() =>
											navigate("/settings/duolingo")
										}
									>
										<Icon
											as={LuLeaf}
											boxSize={4}
											mr={1.5}
											color="fg.muted"
										/>
										{t(
											"routes.settings.connectDuolingoAccount",
										)}
									</Button>
								</Box>
							</Stack>
						)}
					</Box>
				</Stack>
			</Stack>
		</Container>
	);
};

export default Settings;
