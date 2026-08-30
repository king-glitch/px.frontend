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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { useConnectDuolingo } from "@/api";
import {
	type ConnectDuolingoFormData,
	connectDuolingoSchema,
} from "@/api/schemas";
import { handleFormApiError } from "@/utils/form-error";
import { useTranslation } from "@/lib/i18n";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

export const DuolingoConnectRoute: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const connect = useConnectDuolingo();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ConnectDuolingoFormData>({
		resolver: zodResolver(connectDuolingoSchema),
		defaultValues: {
			bot_username: "",
			bot_password: "",
		},
	});

	const onSubmit = async (data: ConnectDuolingoFormData) => {
		try {
			await connect.mutateAsync({
				bot_username: data.bot_username.trim(),
				bot_password: data.bot_password,
			});
			navigate("/settings");
		} catch (err) {
			handleFormApiError(err, setError);
		}
	};

	return (
		<Container maxW="xl" py={{ base: 4, md: 8 }}>
			<Stack gap={6}>
				{/* Top Back Navigation Link */}
				<HStack
					asChild
					gap={2}
					cursor="pointer"
					color="fg.muted"
					_hover={{ color: "fg" }}
				>
					<Link to="/settings">
						<Icon as={LuArrowLeft} boxSize={4} />
						<Text fontSize="sm" fontWeight="semibold">
							{t("routes.settingsDuolingo.backToSettings")}
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
									bg="bg.muted"
									color="fg.muted"
									borderWidth="1px"
									borderColor="border.glass"
									shadow="glass"
								>
									<Icon as={LuLeaf} boxSize={6} />
								</Circle>
								<Stack gap={0.5}>
									<HStack gap={2}>
										<Heading size="lg">
											{t(
												"routes.settingsDuolingo.heading",
											)}
										</Heading>
										<Badge
											size="xs"
											rounded="pill"
											variant="subtle"
										>
											{t("routes.settingsDuolingo.badge")}
										</Badge>
									</HStack>
									<Text color="fg.muted" fontSize="sm">
										{t("routes.settingsDuolingo.subtitle")}
									</Text>
								</Stack>
							</HStack>
						</Flex>

						{/* Connect Form */}
						<form noValidate onSubmit={handleSubmit(onSubmit)}>
							<Stack gap={5}>
								{errors.root?.message && (
									<Box
										p={3}
										rounded="xl"
										bg="red.subtle"
										borderWidth="1px"
										borderColor="red.muted"
										color="red.fg"
										fontSize="sm"
									>
										{errors.root.message}
									</Box>
								)}

								<Field
									label={t(
										"routes.settingsDuolingo.username",
									)}
									required
									invalid={Boolean(errors.bot_username)}
									errorText={errors.bot_username?.message}
								>
									<Input
										placeholder={t(
											"routes.settingsDuolingo.usernamePlaceholder",
										)}
										{...register("bot_username")}
										autoComplete="username"
										autoFocus
										rounded="xl"
									/>
								</Field>

								<Field
									label={t(
										"routes.settingsDuolingo.password",
									)}
									required
									invalid={Boolean(errors.bot_password)}
									errorText={errors.bot_password?.message}
								>
									<PasswordInput
										placeholder={t(
											"routes.settingsDuolingo.passwordPlaceholder",
										)}
										{...register("bot_password")}
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
									<Icon
										as={LuShieldCheck}
										boxSize={4}
										color="fg.muted"
										mt={0.5}
									/>
									<Text fontSize="xs" color="fg.muted">
										{t(
											"routes.settingsDuolingo.securityNote",
										)}
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
										{t("routes.settingsDuolingo.cancel")}
									</Button>
									<Button
										type="submit"
										variant="dark"
										flex="2"
										loading={
											connect.isPending || isSubmitting
										}
									>
										{t(
											"routes.settingsDuolingo.connectAccount",
										)}
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
