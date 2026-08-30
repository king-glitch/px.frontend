import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink, Navigate, useNavigate } from "react-router";
import {
	Container,
	Heading,
	HStack,
	Input,
	Link,
	Stack,
	Text,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuthContext } from "@/contexts/auth-context";
import { type RegisterFormData, registerSchema } from "@/api/schemas";
import { handleFormApiError } from "@/utils/form-error";
import { useTranslation } from "@/lib/i18n";

export const Register: React.FC = () => {
	const { t } = useTranslation();
	const {
		isAuthenticated,
		isLoading,
		register: registerAuth,
		login,
	} = useAuthContext();
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			username: "",
			password: "",
			confirmPassword: "",
		},
	});

	if (!isLoading && isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	const onSubmit = async (data: RegisterFormData) => {
		try {
			const cleanUsername = data.username.trim().toLowerCase();
			await registerAuth({
				username: cleanUsername,
				password: data.password,
			});

			await login({ username: cleanUsername, password: data.password });
			navigate("/", { replace: true });
		} catch (err) {
			handleFormApiError(err, setError);
		}
	};

	return (
		<Container maxW="md" py={12}>
			<Stack gap={6}>
				<Stack gap={1}>
					<Heading size="xl">
						{t("routes.auth.register.heading")}
					</Heading>
					<Text color="fg.muted">
						{t("routes.auth.register.subtitle")}
					</Text>
				</Stack>

				<form noValidate onSubmit={handleSubmit(onSubmit)}>
					<Stack gap={4}>
						{errors.root?.message && (
							<Text color="red.500" fontSize="sm">
								{errors.root.message}
							</Text>
						)}

						<Field
							label={t("routes.auth.register.username")}
							errorText={errors.username?.message}
							invalid={Boolean(errors.username)}
							required
						>
							<Input
								placeholder={t(
									"routes.auth.register.usernamePlaceholder",
								)}
								{...register("username")}
								autoComplete="username"
								autoFocus
							/>
						</Field>

						<Field
							label={t("routes.auth.register.password")}
							errorText={errors.password?.message}
							invalid={Boolean(errors.password)}
							required
						>
							<PasswordInput
								placeholder={t("routes.auth.register.password")}
								{...register("password")}
								autoComplete="new-password"
							/>
						</Field>

						<Field
							label={t("routes.auth.register.confirmPassword")}
							errorText={errors.confirmPassword?.message}
							invalid={Boolean(errors.confirmPassword)}
							required
						>
							<PasswordInput
								placeholder={t(
									"routes.auth.register.confirmPassword",
								)}
								{...register("confirmPassword")}
								autoComplete="new-password"
							/>
						</Field>

						<Button
							type="submit"
							loading={isSubmitting}
							width="full"
						>
							{t("routes.auth.register.submit")}
						</Button>
					</Stack>
				</form>

				<HStack justify="center" fontSize="sm">
					<Text color="fg.muted">
						{t("routes.auth.register.hasAccount")}
					</Text>
					<Link
						asChild
						color="fg"
						fontWeight="semibold"
						textDecoration="underline"
					>
						<RouterLink to="/authentication/login">
							{t("routes.auth.register.login")}
						</RouterLink>
					</Link>
				</HStack>
			</Stack>
		</Container>
	);
};

export default Register;
