import React, { useState } from "react";
import {
	Box,
	Container,
	Grid,
	Heading,
	HStack,
	Icon,
	Input,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuFlame, LuLeaf, LuTrendingUp, LuTrophy } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import {
	useConnectDuolingo,
	useDisconnectDuolingo,
	useDuolingoStatus,
} from "@/api";
import type { DuolingoLink } from "@/api/types";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

const ConnectDuolingoForm: React.FC<{
	onConnected: (link: DuolingoLink) => void;
}> = ({ onConnected }) => {
	const [botUsername, setBotUsername] = useState("");
	const [botPassword, setBotPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const connect = useConnectDuolingo();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		try {
			const link = await connect.mutateAsync({
				bot_username: botUsername,
				bot_password: botPassword,
			});
			onConnected(link);
			toaster.create({
				title: "Duolingo connected",
				description: `Linked to @${link.bot_username}`,
				type: "success",
			});
		} catch (err) {
			setError(
				err instanceof ApiError
					? err.message
					: "Failed to connect to Duolingo. Please check your credentials.",
			);
		}
	};

	return (
		<form noValidate onSubmit={onSubmit}>
			<Stack gap={4}>
				{error && <Text color="red.500">{error}</Text>}

				<Field label="Duolingo username" required>
					<Input
						placeholder="Bot username"
						value={botUsername}
						onChange={(e) => setBotUsername(e.target.value)}
						autoComplete="username"
						autoFocus
					/>
				</Field>

				<Field label="Duolingo password" required>
					<PasswordInput
						placeholder="Bot password"
						value={botPassword}
						onChange={(e) => setBotPassword(e.target.value)}
						autoComplete="current-password"
					/>
				</Field>

				<Button type="submit" loading={connect.isPending} width="full">
					Connect Duolingo
				</Button>
			</Stack>
		</form>
	);
};

export const Settings: React.FC = () => {
	const { data: status, isLoading } = useDuolingoStatus();
	const disconnect = useDisconnectDuolingo();
	const [justLinked, setJustLinked] = useState<DuolingoLink | null>(null);

	const isConnected = status !== null && status !== undefined;

	const handleDisconnect = async () => {
		try {
			await disconnect.mutateAsync();
			setJustLinked(null);
			toaster.create({
				title: "Duolingo disconnected",
				type: "success",
			});
		} catch (err) {
			toaster.create({
				title: "Failed to disconnect",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	return (
		<Container maxW="2xl" py={{ base: 4, md: 6 }}>
			<Stack gap={6}>
				<Stack gap={1}>
					<Heading size="xl">Settings</Heading>
					<Text color="fg.muted">
						Manage integrations connected to your account.
					</Text>
				</Stack>

				<Box {...glassCard} p={{ base: 5, md: 7 }}>
					<HStack gap={2.5} mb={4}>
						<Icon as={LuLeaf} boxSize={5} color="mint.fg" />
						<Heading size="md">Duolingo</Heading>
					</HStack>

					{isLoading ? (
						<Text color="fg.muted">Loading...</Text>
					) : isConnected && status ? (
						<Stack gap={5}>
							{justLinked && (
								<Text fontSize="sm" color="fg.muted">
									Connected as @{justLinked.bot_username}
								</Text>
							)}

							<Grid
								gap={3}
								templateColumns={{
									base: "1fr",
									sm: "repeat(2, 1fr)",
								}}
							>
								<Box {...glassCard} p={4}>
									<HStack
										justify="space-between"
										color="fg.muted"
									>
										<Text
											fontSize="xs"
											fontWeight="semibold"
											textTransform="uppercase"
										>
											XP
										</Text>
										<Icon
											as={LuTrendingUp}
											boxSize={4}
											color="mint.fg"
										/>
									</HStack>
									<Heading size="2xl" mt={2}>
										{status.xp}
									</Heading>
								</Box>

								<Box {...glassCard} p={4}>
									<HStack
										justify="space-between"
										color="fg.muted"
									>
										<Text
											fontSize="xs"
											fontWeight="semibold"
											textTransform="uppercase"
										>
											Rank
										</Text>
										<Icon
											as={LuTrophy}
											boxSize={4}
											color="orange.fg"
										/>
									</HStack>
									<Heading size="2xl" mt={2}>
										#{status.rank}
									</Heading>
								</Box>

								<Box {...glassCard} p={4}>
									<HStack
										justify="space-between"
										color="fg.muted"
									>
										<Text
											fontSize="xs"
											fontWeight="semibold"
											textTransform="uppercase"
										>
											Streak
										</Text>
										<Icon
											as={LuFlame}
											boxSize={4}
											color="orange.fg"
										/>
									</HStack>
									<Heading size="2xl" mt={2}>
										{status.streak}d
									</Heading>
								</Box>

								<Box {...glassCard} p={4}>
									<HStack
										justify="space-between"
										color="fg.muted"
									>
										<Text
											fontSize="xs"
											fontWeight="semibold"
											textTransform="uppercase"
										>
											Longest streak
										</Text>
										<Icon
											as={LuFlame}
											boxSize={4}
											color="fg.muted"
										/>
									</HStack>
									<Heading size="2xl" mt={2}>
										{status.longest_streak}d
									</Heading>
								</Box>
							</Grid>

							<Button
								variant="outline"
								noIcon
								loading={disconnect.isPending}
								onClick={handleDisconnect}
							>
								Disconnect
							</Button>
						</Stack>
					) : (
						<Stack gap={4}>
							<Text color="fg.muted" fontSize="sm">
								Connect your Duolingo account to track XP, rank,
								and streaks from your dashboard.
							</Text>
							<ConnectDuolingoForm onConnected={setJustLinked} />
						</Stack>
					)}
				</Box>
			</Stack>
		</Container>
	);
};

export default Settings;
