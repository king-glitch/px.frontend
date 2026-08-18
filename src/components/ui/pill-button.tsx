import React from "react";
import {
  Button as ChakraButton,
  type ButtonProps as ChakraButtonProps,
  Flex,
  Icon,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { LuArrowUpRight } from "react-icons/lu";

export interface PillButtonProps extends Omit<ChakraButtonProps, "variant" | "size"> {
  variant?: "dark" | "light" | "mint" | "outline" | "ghost" | "glass";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: React.ElementType;
  iconNode?: React.ReactNode;
  noIcon?: boolean;
  children: React.ReactNode;
}

export const PillButton = React.forwardRef<HTMLButtonElement, PillButtonProps>(
  function PillButton(
    {
      variant = "light",
      size = "md",
      icon: CustomIcon,
      iconNode,
      noIcon = false,
      children,
      disabled,
      loading,
      ...rest
    },
    ref
  ) {
    const IconComponent = CustomIcon || (!noIcon && !iconNode ? LuArrowUpRight : undefined);

    // Size metrics matching the studio capsule references
    const sizeConfig = {
      xs: {
        h: "28px",
        pl: "3",
        pr: noIcon ? "3" : "1",
        fontSize: "10px",
        iconBoxSize: "20px",
        iconSize: 2.5,
        gap: 2,
      },
      sm: {
        h: "36px",
        pl: "4",
        pr: noIcon ? "4" : "1.5",
        fontSize: "11px",
        iconBoxSize: "26px",
        iconSize: 3.5,
        gap: 2.5,
      },
      md: {
        h: "44px",
        pl: "5",
        pr: noIcon ? "5" : "2",
        fontSize: "12px",
        iconBoxSize: "32px",
        iconSize: 4,
        gap: 3.5,
      },
      lg: {
        h: "52px",
        pl: "6",
        pr: noIcon ? "6" : "2.5",
        fontSize: "13px",
        iconBoxSize: "40px",
        iconSize: 4.5,
        gap: 4,
      },
    }[size];

    // Variant visual styles
    const variantStyles = {
      light: {
        bg: { base: "#E2E8F0", _dark: "#1E2230" },
        color: { base: "#0C0E14", _dark: "#F8FAFC" },
        borderWidth: "1px",
        borderColor: { base: "rgba(15, 23, 42, 0.06)", _dark: "rgba(255, 255, 255, 0.08)" },
        _hover: {
          bg: { base: "#D5DDE6", _dark: "#282E40" },
          transform: "translateY(-1.5px)",
          shadow: "0 8px 24px rgba(15, 23, 42, 0.1)",
          "& .pill-icon-bubble": {
            transform: "scale(1.08)",
            shadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
        },
        _active: {
          transform: "scale(0.97)",
        },
        iconBubbleBg: { base: "#0C0E14", _dark: "#FFFFFF" },
        iconBubbleColor: { base: "#FFFFFF", _dark: "#0C0E14" },
        iconBubbleShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
      },
      dark: {
        bg: { base: "#0C0E14", _dark: "#14161F" },
        color: "#FFFFFF",
        borderWidth: "1px",
        borderColor: { base: "transparent", _dark: "rgba(255, 255, 255, 0.12)" },
        _hover: {
          bg: { base: "#1A1D26", _dark: "#1E2230" },
          transform: "translateY(-1.5px)",
          shadow: "0 8px 24px rgba(12, 14, 20, 0.22)",
          "& .pill-icon-bubble": {
            transform: "scale(1.08)",
            bg: "rgba(255, 255, 255, 0.25)",
          },
        },
        _active: {
          transform: "scale(0.97)",
        },
        iconBubbleBg: "rgba(255, 255, 255, 0.15)",
        iconBubbleColor: "#FFFFFF",
        iconBubbleShadow: "none",
      },
      mint: {
        bg: "mint.solid",
        color: "mint.contrast",
        borderWidth: "1px",
        borderColor: "transparent",
        _hover: {
          bg: "mint.400",
          transform: "translateY(-1.5px)",
          shadow: "0 8px 24px rgba(163, 247, 136, 0.35)",
          "& .pill-icon-bubble": {
            transform: "scale(1.08)",
          },
        },
        _active: {
          transform: "scale(0.97)",
        },
        iconBubbleBg: "rgba(12, 14, 20, 0.16)",
        iconBubbleColor: "#0C0E14",
        iconBubbleShadow: "none",
      },
      glass: {
        bg: "bg.glass",
        color: "fg",
        borderWidth: "1px",
        borderColor: "border.glass",
        backdropFilter: "blur(20px)",
        shadow: "glass",
        _hover: {
          bg: "bg.panel",
          transform: "translateY(-1.5px)",
          shadow: "float",
          "& .pill-icon-bubble": {
            transform: "scale(1.08)",
          },
        },
        _active: {
          transform: "scale(0.97)",
        },
        iconBubbleBg: "bg.solid",
        iconBubbleColor: "fg.inverted",
        iconBubbleShadow: "glass",
      },
      outline: {
        bg: "transparent",
        color: "fg",
        borderWidth: "1.5px",
        borderColor: "border",
        _hover: {
          borderColor: "fg",
          transform: "translateY(-1.5px)",
          "& .pill-icon-bubble": {
            transform: "scale(1.08)",
            bg: "fg",
            color: "bg.canvas",
          },
        },
        _active: {
          transform: "scale(0.97)",
        },
        iconBubbleBg: "bg.muted",
        iconBubbleColor: "fg",
        iconBubbleShadow: "none",
      },
      ghost: {
        bg: "transparent",
        color: "fg",
        borderWidth: "0",
        _hover: {
          bg: "bg.muted",
          transform: "translateY(-1px)",
          "& .pill-icon-bubble": {
            transform: "scale(1.08)",
          },
        },
        _active: {
          transform: "scale(0.97)",
        },
        iconBubbleBg: "bg.muted",
        iconBubbleColor: "fg",
        iconBubbleShadow: "none",
      },
    }[variant];

    const showBubble = !noIcon && Boolean(IconComponent || iconNode || loading);

    return (
      <ChakraButton
        ref={ref}
        display="inline-flex"
        alignItems="center"
        justifyContent="space-between"
        rounded="pill"
        h={sizeConfig.h}
        pl={sizeConfig.pl}
        pr={sizeConfig.pr}
        gap={sizeConfig.gap}
        cursor="pointer"
        disabled={disabled || loading}
        transition="all 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
        userSelect="none"
        {...variantStyles}
        {...rest}
      >
        <Text
          as="span"
          fontWeight="semibold"
          fontSize={sizeConfig.fontSize}
          letterSpacing="0.05em"
          textTransform="uppercase"
          lineHeight="1"
          whiteSpace="nowrap"
        >
          {children}
        </Text>

        {showBubble && (
          <Flex
            className="pill-icon-bubble"
            align="center"
            justify="center"
            boxSize={sizeConfig.iconBoxSize}
            rounded="full"
            bg={variantStyles.iconBubbleBg}
            color={variantStyles.iconBubbleColor}
            shadow={variantStyles.iconBubbleShadow}
            transition="all 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
            flexShrink={0}
          >
            {loading ? (
              <Spinner size="xs" color="currentColor" />
            ) : IconComponent ? (
              <Icon as={IconComponent} boxSize={sizeConfig.iconSize} />
            ) : (
              iconNode
            )}
          </Flex>
        )}
      </ChakraButton>
    );
  }
);

export default PillButton;
