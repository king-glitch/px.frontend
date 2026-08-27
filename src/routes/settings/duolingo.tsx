import React, { useState } from "react";
import {
	Badge,
	Box,
	Circle,
	Container,
	Flex,
	HStack,
	Heading,
	Icon,
	Input,
	Stack,
	Text,
} from "@chakra-ui/react";
import { LuArrowLeft, LuLeaf, LuShieldCheck, LuSparkles } from "react-icons/lu";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import { useConnectDuolingo } from "@/api";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

export const DuolingoConnectRoute: React.FC = () => {
	const navigate = useNavigate();
	const [botUsername, setBotUsername] = useState("");
	const [botPassword, setBotPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const connect = useConnectDuolingo();

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!botUsername.trim() || !botPassword.trim()) {
			setError("Please provide both username and password");
			return;
		}

		setError(null);
		try {
			const link = await connect.mutateAsync({
				bot_username: botUsername.trim(),
				bot_password: botPassword,
			});

			toaster.create({
				title: "Duolingo connected",
				description: `Linked to @${link.bot_username}`,
				type: "success",
			});
			navigate("/settings");
		} catch (err) {
			setError(
				err instanceof ApiError
					? err.message
					: "Failed to connect to Duolingo. Please check your credentials.",
			);
		}
	};

	return (
		<Container maxW="xl" py={{ base: 4, md: 8 }}>
			<Stack gap={6}>
				{/* Top Back Navigation Link */}
				<HStack asChild gap={2} cursor="pointer" color="fg.muted" _hover={{ color: "fg" }}>
					<Link to="/settings">
						<Icon as={LuArrowLeft} boxSize={4} />
						<Text fontSize="sm" fontWeight="semibold">
							Back to Settings
						</Text>
					</Link>
				</HStack>

				{/* Main Connection Card */}
				<Box {...glassCard} p={{ base: 6, md: 8 }}>
					<Stack gap={6}>
						{/* Card Header & Brand Identity */}
						<Flex align="center" justify="space-between">
							<HStack gap={3}>
								<Circle
									size="12"
									bg="mint.subtle"
									color="mint.fg"
									borderWidth="1px"
									borderColor="border.glass"
									shadow="glass"
								>
									<Icon as={LuLeaf} boxSize={6} />
								</Circle>
								<Stack gap={0.5}>
									<HStack gap={2}>
										<Heading size="lg">Connect Duolingo</Heading>
										<Badge
											size="xs"
											rounded="pill"
											variant="subtle"
											colorPalette="mint"
										>
											Integration
										</Badge>
									</HStack>
									<Text color="fg.muted" fontSize="sm">
										Link your account to track streaks, XP, and leagues
									</Text>
								</Stack>
							</HStack>
						</Flex>

						{/* Connect Form */}
						<form noValidate onSubmit={onSubmit}>
							<Stack gap={5}>
								{error && (
									<Box
										p={3}
										rounded="xl"
										bg="red.subtle"
										borderWidth="1px"
										borderColor="red.muted"
										color="red.fg"
										fontSize="sm"
									>
										{error}
									</Box>
								)}

								<Field label="Duolingo Username" required>
									<Input
										placeholder="e.g. duousername"
										value={botUsername}
										onChange={(e) => setBotUsername(e.target.value)}
										autoComplete="username"
										autoFocus
										rounded="xl"
									/>
								</Field>

								<Field label="Duolingo Password" required>
									<PasswordInput
										placeholder="Your Duolingo password"
										value={botPassword}
										onChange={(e) => setBotPassword(e.target.value)}
										autoComplete="current-password"
										rounded="xl"
									/>
								</Field>

								<HStack
									p={3}
									rounded="xl"
									bg="bg.muted"
									borderWidth="1px"
									borderColor="border.glass"
									gap={2.5}
									align="flex-start"
								>
									<Icon as={LuShieldCheck} boxSize={4} color="fg.muted" mt={0.5} />
									<Text fontSize="xs" color="fg.muted">
										Your credentials are used solely to establish a secure synchronization session with Duolingo.
									</Text>
								</HStack>

								<HStack gap={3} pt={2}>
									<Button
										type="button"
										variant="outline"
										noIcon
										flex="1"
										onClick={() => navigate("/settings")}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										variant="dark"
										flex="2"
										loading={connect.isPending}
									>
										Connect Account
									</Button>
								</HStack>
							</Stack>
						</form>
					</Stack>
				</Box>
			</Stack>
		</Container>
	);
};

export default DuolingoConnectRoute;
