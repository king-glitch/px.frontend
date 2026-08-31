import { useTranslation } from "@/lib/i18n";
import {
	Box,
	Button,
	Container,
	Heading,
	Icon,
	Stack,
	Text,
} from "@chakra-ui/react";
import React from "react";
import { LuHouse, LuSearchX } from "react-icons/lu";
import { Link as RouterLink } from "react-router";

// ponytail: minimal clean 404 page
export const NotFound: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Container maxW="md" py={{ base: 16, md: 24 }} textAlign="center">
			<Stack gap={6} align="center">
				<Box
					p={4}
					rounded="full"
					bg="bg.muted"
					borderWidth="1px"
					borderColor="border.glass"
					shadow="glass"
				>
					<Icon as={LuSearchX} boxSize={10} color="fg.muted" />
				</Box>

				<Stack gap={2}>
					<Heading size="2xl" letterSpacing="-0.03em">
						404
					</Heading>
					<Text fontSize="lg" fontWeight="semibold">
						{t("common.error.notFound") || "Page Not Found"}
					</Text>
					<Text fontSize="sm" color="fg.muted">
						{t("common.error.notFoundDesc") ||
							"The coordinates you entered do not exist in the PX universe."}
					</Text>
				</Stack>

				<Button asChild rounded="pill" size="md">
					<RouterLink to="/">
						<Icon as={LuHouse} mr={2} />
						{t("common.actions.goHome") || "Return Home"}
					</RouterLink>
				</Button>
			</Stack>
		</Container>
	);
};

export default NotFound;
