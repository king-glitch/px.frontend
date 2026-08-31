import React from "react";
import { Flex } from "@chakra-ui/react";

// Luminous Holographic Glassmorphism tokens (Enhanced frosted depth, specular glow & light refraction)
export const holoGlassCard = {
	bg: {
		base: "rgba(255, 255, 255, 0.45)",
		_dark: "rgba(18, 22, 34, 0.25)",
	},
	backdropFilter: "blur(20px) saturate(200%)",
	borderWidth: "1px",
	borderColor: {
		base: "rgba(255, 255, 255, 0.75)",
		_dark: "rgba(255, 255, 255, 0.15)",
	},
	rounded: "3xl",
	shadow: {
		base: "0 12px 36px -8px rgba(0, 0, 0, 0.08), inset 0 1px 1.5px rgba(255, 255, 255, 0.9), inset 0 0 16px rgba(255, 255, 255, 0.2)",
		_dark: "0 16px 40px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 0 24px rgba(255, 255, 255, 0.04)",
	},
	transition:
		"transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease",
	_hover: {
		transform: "translateY(-2px)",
		borderColor: {
			base: "rgba(255, 255, 255, 0.95)",
			_dark: "rgba(255, 255, 255, 0.3)",
		},
		shadow: {
			base: "0 20px 48px -10px rgba(0, 0, 0, 0.12), inset 0 1px 2px rgba(255, 255, 255, 1)",
			_dark: "0 24px 52px -10px rgba(0, 0, 0, 0.65), inset 0 1px 1.5px rgba(255, 255, 255, 0.28)",
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
