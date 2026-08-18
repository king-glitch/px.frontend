import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink, Navigate, useNavigate } from "react-router";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import { useAuthContext } from "@/contexts/auth-context";
import { ApiError } from "@/api/client";
import { type RegisterFormData, registerSchema } from "@/api/schemas";

export const Register: React.FC = () => {
  const { isAuthenticated, isLoading, register: registerAuth, login } = useAuthContext();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

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
    setServerError(null);
    try {
      const cleanUsername = data.username.trim().toLowerCase();
      const user = await registerAuth({
        username: cleanUsername,
        password: data.password,
      });

      toaster.create({
        title: "Account Created",
        description: `Registered @${user.username}`,
        type: "success",
      });

      await login({ username: cleanUsername, password: data.password });
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
        if (err.violations) {
          Object.entries(err.violations).forEach(([field, v]) => {
            if (field === "username" || field === "password") {
              setError(field, { message: v.message });
            }
          });
        }
      } else {
        setServerError("Failed to register. Please try again.");
      }
    }
  };

  return (
    <Container maxW="md" py={12}>
      <Stack gap={6}>
        <Stack gap={1}>
          <Heading size="xl">Register</Heading>
          <Text color="fg.muted">Create a new account to get started.</Text>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={4}>
            {serverError && <Text color="red.500">{serverError}</Text>}

            <Field
              label="Username"
              errorText={errors.username?.message}
              invalid={Boolean(errors.username)}
              required
            >
              <Input
                placeholder="Username (e.g. alice)"
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
                autoComplete="new-password"
              />
            </Field>

            <Field
              label="Confirm Password"
              errorText={errors.confirmPassword?.message}
              invalid={Boolean(errors.confirmPassword)}
              required
            >
              <PasswordInput
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                autoComplete="new-password"
              />
            </Field>

            <Button type="submit" loading={isSubmitting} width="full">
              Register
            </Button>
          </Stack>
        </form>

        <HStack justify="center" fontSize="sm">
          <Text color="fg.muted">Already have an account?</Text>
          <Link asChild colorPalette="blue">
            <RouterLink to="/authentication/login">Login</RouterLink>
          </Link>
        </HStack>
      </Stack>
    </Container>
  );
};

export default Register;
