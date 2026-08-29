"use client";

import {
	Circle,
	Icon,
	Toaster as ChakraToaster,
	Portal,
	Spinner,
	Stack,
	Toast,
	createToaster,
} from "@chakra-ui/react";
import {
	LuCircleAlert,
	LuCircleCheck,
	LuInfo,
	LuTriangleAlert,
} from "react-icons/lu";

export const toaster = createToaster({
	placement: "bottom-end",
	pauseOnPageIdle: true,
});

const toastIconByType = {
	success: { icon: LuCircleCheck, bg: "green.muted", fg: "green.fg" },
	error: { icon: LuCircleAlert, bg: "red.muted", fg: "red.fg" },
	warning: { icon: LuTriangleAlert, bg: "orange.muted", fg: "orange.fg" },
	info: { icon: LuInfo, bg: "mint.muted", fg: "mint.fg" },
} as const;

export const Toaster = () => {
	return (
		<Portal>
			<ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
				{(toast) => (
					<Toast.Root
						width={{ md: "sm" }}
						bg="bg.panel"
						borderWidth="1px"
						borderColor="border.glass"
						rounded="xl"
						shadow="glass"
						backdropFilter="blur(20px)"
						p={4}
					>
						{toast.type === "loading" ? (
							<Spinner size="sm" color="mint.fg" />
						) : (
							(() => {
								const meta =
									toastIconByType[
										toast.type as keyof typeof toastIconByType
									];
								if (!meta) return <Toast.Indicator />;

								return (
									<Circle
										size="7"
										bg={meta.bg}
										color={meta.fg}
										flexShrink={0}
									>
										<Icon as={meta.icon} boxSize={4} />
									</Circle>
								);
							})()
						)}
						<Stack gap="1" flex="1" maxWidth="100%">
							{toast.title && (
								<Toast.Title
									fontSize="sm"
									fontWeight="bold"
									color="fg"
								>
									{toast.title}
								</Toast.Title>
							)}
							{toast.description && (
								<Toast.Description
									fontSize="xs"
									color="fg.muted"
								>
									{toast.description}
								</Toast.Description>
							)}
						</Stack>
						{toast.action && (
							<Toast.ActionTrigger
								fontSize="xs"
								fontWeight="semibold"
								rounded="pill"
							>
								{toast.action.label}
							</Toast.ActionTrigger>
						)}
						{toast.closable && (
							<Toast.CloseTrigger rounded="full" />
						)}
					</Toast.Root>
				)}
			</ChakraToaster>
		</Portal>
	);
};
