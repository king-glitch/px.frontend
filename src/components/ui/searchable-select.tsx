import {
	Box,
	Button,
	Circle,
	Flex,
	HStack,
	Icon,
	Input,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import React, { useMemo, useRef, useState } from "react";
import {
	LuCheck,
	LuChevronDown,
	LuSearch,
	LuX,
} from "react-icons/lu";
import {
	PopoverBody,
	PopoverContent,
	PopoverRoot,
	PopoverTrigger,
} from "@/components/ui/popover";

export interface SearchableSelectItem {
	label: string;
	value: string;
	color?: string;
	description?: string;
}

export interface SearchableSelectProps {
	items: SearchableSelectItem[];
	value?: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	size?: "xs" | "sm" | "md";
	width?: string | number;
	allowClear?: boolean;
	disabled?: boolean;
	clearLabel?: string;
	portalled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
	items,
	value,
	onValueChange,
	placeholder = "Select an option...",
	searchPlaceholder = "Search...",
	size = "sm",
	width = "full",
	allowClear = true,
	disabled = false,
	clearLabel = "(Uncategorized)",
	portalled = true,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const searchInputRef = useRef<HTMLInputElement>(null);

	const selectedItem = useMemo(() => {
		return items.find((item) => item.value === value);
	}, [items, value]);

	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return items;
		const q = searchQuery.toLowerCase();
		return items.filter(
			(item) =>
				item.label.toLowerCase().includes(q) ||
				(item.description && item.description.toLowerCase().includes(q)),
		);
	}, [items, searchQuery]);

	const handleSelect = (itemValue: string) => {
		onValueChange(itemValue);
		setIsOpen(false);
		setSearchQuery("");
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		onValueChange("");
		setIsOpen(false);
		setSearchQuery("");
	};

	return (
		<PopoverRoot
			open={isOpen}
			onOpenChange={(details) => {
				setIsOpen(details.open);
				if (details.open) {
					setTimeout(() => searchInputRef.current?.focus(), 50);
				} else {
					setSearchQuery("");
				}
			}}
			positioning={{ sameWidth: true, placement: "bottom-start", gutter: 4 }}
		>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size={size}
					rounded="pill"
					bg="bg.panel"
					borderColor="border"
					w={width}
					justifyContent="space-between"
					px={size === "xs" ? 2.5 : 3.5}
					fontWeight="normal"
					disabled={disabled}
					_hover={{ borderColor: "fg.muted", bg: "bg.muted" }}
					_active={{ transform: "none" }}
				>
					<HStack gap={2} overflow="hidden" flex="1">
						{selectedItem ? (
							<>
								{selectedItem.color && (
									<Circle size="2" bg={selectedItem.color} flexShrink={0} />
								)}
								<Text
									fontSize={size === "xs" ? "xs" : "sm"}
									fontWeight="medium"
									truncate
								>
									{selectedItem.label}
								</Text>
							</>
						) : (
							<Text
								fontSize={size === "xs" ? "xs" : "sm"}
								color="fg.muted"
								truncate
							>
								{placeholder}
							</Text>
						)}
					</HStack>

					<HStack gap={1} flexShrink={0} ml={2}>
						{allowClear && selectedItem && (
							<Circle
								as="span"
								size="4"
								bg="bg.muted"
								cursor="pointer"
								onClick={handleClear}
								_hover={{ bg: "bg.solid", color: "fg.inverted" }}
							>
								<Icon as={LuX} boxSize={2.5} />
							</Circle>
						)}
						<Icon as={LuChevronDown} boxSize={3.5} color="fg.muted" />
					</HStack>
				</Button>
			</PopoverTrigger>

			<PopoverContent
				portalled={portalled}
				bg="bg.panel"
				borderWidth="1px"
				borderColor="border"
				rounded="card"
				shadow="float"
				p={2}
				w="full"
				minW="200px"
				zIndex={2000}
			>
				<PopoverBody p={1}>
					<Stack gap={2}>
						{/* Search Input Box */}
						<HStack
							bg="bg.muted"
							px={2.5}
							py={1}
							rounded="pill"
							borderWidth="1px"
							borderColor="border"
						>
							<Icon as={LuSearch} boxSize={3.5} color="fg.muted" />
							<Input
								ref={searchInputRef}
								placeholder={searchPlaceholder}
								size="xs"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								border="none"
								bg="transparent"
								outline="none"
								px={1}
							/>
							{searchQuery && (
								<Circle
									as="span"
									size="4"
									bg="bg.panel"
									cursor="pointer"
									onClick={() => setSearchQuery("")}
								>
									<Icon as={LuX} boxSize={2.5} />
								</Circle>
							)}
						</HStack>

						{/* Items List */}
						<VStack
							align="stretch"
							gap={0.5}
							maxH="200px"
							overflowY="auto"
							pr={1}
						>
							{allowClear && (
								<Flex
									align="center"
									justify="space-between"
									px={2.5}
									py={1.5}
									rounded="pill"
									cursor="pointer"
									bg={!value ? "bg.muted" : "transparent"}
									_hover={{ bg: "bg.muted" }}
									onClick={() => handleSelect("")}
								>
									<Text fontSize="xs" color="fg.muted" fontStyle="italic">
										{clearLabel}
									</Text>
									{!value && <Icon as={LuCheck} boxSize={3.5} color="fg" />}
								</Flex>
							)}

							{filteredItems.length === 0 ? (
								<Box py={3} textAlign="center">
									<Text fontSize="xs" color="fg.muted">
										No matches found
									</Text>
								</Box>
							) : (
								filteredItems.map((item) => {
									const isSelected = item.value === value;
									return (
										<Flex
											key={item.value}
											align="center"
											justify="space-between"
											px={2.5}
											py={1.5}
											rounded="pill"
											cursor="pointer"
											bg={isSelected ? "bg.muted" : "transparent"}
											_hover={{ bg: "bg.muted" }}
											onClick={() => handleSelect(item.value)}
										>
											<HStack gap={2} overflow="hidden">
												{item.color && (
													<Circle
														size="2.5"
														bg={item.color}
														flexShrink={0}
													/>
												)}
												<VStack align="flex-start" gap={0} overflow="hidden">
													<Text
														fontSize="xs"
														fontWeight={isSelected ? "bold" : "normal"}
														truncate
													>
														{item.label}
													</Text>
													{item.description && (
														<Text fontSize="10px" color="fg.muted" truncate>
															{item.description}
														</Text>
													)}
												</VStack>
											</HStack>

											{isSelected && (
												<Icon as={LuCheck} boxSize={3.5} color="fg" />
											)}
										</Flex>
									);
								})
							)}
						</VStack>
					</Stack>
				</PopoverBody>
			</PopoverContent>
		</PopoverRoot>
	);
};

export default SearchableSelect;
