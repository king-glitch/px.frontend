import React, { useState } from "react";
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
import { type LoginFormData, loginSchema } from "@/api/schemas";
import { handleFormApiError } from "@/utils/form-error";

export const Login: React.FC = () => {
	const { isAuthenticated, isLoading, login } = useAuthContext();
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	if (!isLoading && isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	const onSubmit = async (data: LoginFormData) => {
		try {
			await login(data);
			navigate("/", { replace: true });
		} catch (err) {
			handleFormApiError(err, setError);
		}
	};

	return (
		<Container maxW="md" py={12}>
			<Stack gap={6}>
				<Stack gap={1}>
					<Heading size="xl">Login</Heading>
					<Text color="fg.muted">
						Enter your credentials to access your account.
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
							label="Username"
							errorText={errors.username?.message}
							invalid={Boolean(errors.username)}
							required
						>
							<Input
								placeholder="Username"
								{...register("username")}
								autoComplete="username"
								autoFocus
							/>
						</Field>

						<Field
							label="Password"
							errorText={errors.password?.message}
							invalid={Boolean(errors.password)}
							required
						>
							<PasswordInput
								placeholder="Password"
								{...register("password")}
								autoComplete="current-password"
							/>
						</Field>

						<Button
							type="submit"
							loading={isSubmitting}
							width="full"
						>
							Login
						</Button>
					</Stack>
				</form>

				<HStack justify="center" fontSize="sm">
					<Text color="fg.muted">Don't have an account?</Text>
					<Link
						asChild
						color="fg"
						fontWeight="semibold"
						textDecoration="underline"
					>
						<RouterLink to="/authentication/register">
							Register
						</RouterLink>
					</Link>
				</HStack>
			</Stack>
		</Container>
	);
};

export default Login;
