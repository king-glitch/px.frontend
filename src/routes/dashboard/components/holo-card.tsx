import React from "react";
import { Flex } from "@chakra-ui/react";

// Luminous Holographic Glassmorphism tokens (Enhanced frosted depth & specular glow)
export const holoGlassCard = {
	bg: {
		base: "rgba(255, 255, 255, 0.65)",
		_dark: "rgba(18, 22, 34, 0.65)",
	},
	backdropFilter: "blur(24px) saturate(180%)",
	borderWidth: "1px",
	borderColor: {
		base: "rgba(255, 255, 255, 0.9)",
		_dark: "rgba(255, 255, 255, 0.16)",
	},
	rounded: "3xl",
	shadow: {
		base: "0 16px 40px -10px rgba(15, 23, 42, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.95), inset 0 0 0 1px rgba(255, 255, 255, 0.6)",
		_dark: "0 16px 40px -10px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
	},
	transition:
		"transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
	_hover: {
		transform: "translateY(-2px)",
		shadow: {
			base: "0 24px 52px -12px rgba(15, 23, 42, 0.1), inset 0 1px 2px rgba(255, 255, 255, 1), inset 0 0 0 1px rgba(255, 255, 255, 0.8)",
			_dark: "0 24px 52px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.18), inset 0 0 0 1px rgba(255, 255, 255, 0.12)",
		},
	},
} as const;

interface OutlinePillProps {
	children: React.ReactNode;
}

export const OutlinePill: React.FC<OutlinePillProps> = ({ children }) => (
	<Flex
		as="span"
		display="inline-flex"
		align="center"
		justify="center"
		borderWidth="1.5px"
		borderColor="fg"
		rounded="pill"
		px="0.55em"
		py="0.12em"
		lineHeight="1.05"
	>
		{children}
	</Flex>
);
