import React from "react";
import { Navigate } from "react-router";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useAuthContext } from "@/contexts/auth-context";

interface IndexProps {}

export const Index: React.FC<IndexProps> = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuthContext();

  if (isLoading) {
    return (
      <Container py={12} centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/authentication/login" replace />;
  }

  return (
    <Container maxW="md" py={12}>
      <Stack gap={6}>
        <Heading size="xl">Dashboard</Heading>
        <Text>Welcome, @{user?.username}!</Text>
        <Box>
          <Button onClick={logout}>Logout</Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default Index;
