"use client";

import React, { useState } from "react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ColorModeProvider, type ColorModeProviderProps } from "@/components/ui/color-mode";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

export function Provider(props: ColorModeProviderProps) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						refetchOnWindowFocus: false,
						retry: 1,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<ChakraProvider value={defaultSystem}>
				<ColorModeProvider {...props}>
					<AuthProvider>
						{props.children}
						<Toaster />
					</AuthProvider>
				</ColorModeProvider>
			</ChakraProvider>
		</QueryClientProvider>
	);
}
