import { NumberInput as ChakraNumberInput } from "@chakra-ui/react";
import * as React from "react";

export interface NumberInputFieldProps
	extends Omit<ChakraNumberInput.RootProps, "children"> {
	placeholder?: string;
	showControls?: boolean;
}

export const NumberInputField = React.forwardRef<
	HTMLInputElement,
	NumberInputFieldProps
>(function NumberInputField(props, ref) {
	const { placeholder, showControls = true, ...rest } = props;
	return (
		<ChakraNumberInput.Root
			ref={ref}
			w="full"
			position="relative"
			rounded="pill"
			overflow="hidden"
			{...rest}
		>
			<ChakraNumberInput.Input
				placeholder={placeholder}
				rounded="pill"
				bg="bg.muted"
				borderWidth="1px"
				borderColor="border"
				fontSize="sm"
				pl={4}
				pr={showControls ? 9 : 4}
				w="full"
			/>
			{showControls && (
				<ChakraNumberInput.Control
					position="absolute"
					right="2"
					top="50%"
					transform="translateY(-50%)"
					h="calc(100% - 6px)"
					w="5"
					rounded="sm"
					overflow="hidden"
				>
					<ChakraNumberInput.IncrementTrigger
						_hover={{ bg: "bg.emphasized" }}
					/>
					<ChakraNumberInput.DecrementTrigger
						_hover={{ bg: "bg.emphasized" }}
					/>
				</ChakraNumberInput.Control>
			)}
		</ChakraNumberInput.Root>
	);
});

export const NumberInputRoot = ChakraNumberInput.Root;
export const NumberInputControl = ChakraNumberInput.Control;
export const NumberInputInput = ChakraNumberInput.Input;
export const NumberInputIncrementTrigger = ChakraNumberInput.IncrementTrigger;
export const NumberInputDecrementTrigger = ChakraNumberInput.DecrementTrigger;
