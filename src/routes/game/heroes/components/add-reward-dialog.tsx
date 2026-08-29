import React, { useState } from "react";
import {
	Button,
	Flex,
	Grid,
	HStack,
	Icon,
	Input,
	Stack,
	Text,
	Textarea,
} from "@chakra-ui/react";
import { LuPlus, LuSparkles } from "react-icons/lu";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { PillButton } from "@/components/ui/pill-button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	type CustomShopItemFormData,
	customShopItemSchema,
} from "@/api/schemas";
import { handleFormApiError } from "@/utils/form-error";
import { useCreateShopItem, useSuggestPrice } from "@/api";
import { CURRENCY_OPTIONS } from "./perks-data";

interface AddRewardDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const AddRewardDialog: React.FC<AddRewardDialogProps> = ({
	open,
	onOpenChange,
}) => {
	const createItem = useCreateShopItem();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<CustomShopItemFormData>({
		resolver: zodResolver(customShopItemSchema),
		defaultValues: {
			title: "",
			description: "",
			cost_px: 1000,
			currency_symbol: "THB",
			currency_cost: undefined,
			expires_in_days: undefined,
		},
	});

	const currency = watch("currency_symbol") || "THB";
	const realCost = watch("currency_cost");
	const [hasExpiration, setHasExpiration] = useState(false);
	const [expiryDays, setExpiryDays] = useState<number>(30);

	const { data: suggestion } = useSuggestPrice(
		realCost && realCost > 0 ? realCost : 0,
	);

	const handleApplySuggested = () => {
		if (suggestion) {
			setValue("cost_px", suggestion, { shouldValidate: true });
		}
	};

	const onSubmitReward = async (data: CustomShopItemFormData) => {
		let fullDescription = data.description?.trim() || "";
		if (hasExpiration && expiryDays > 0) {
			fullDescription = fullDescription
				? `${fullDescription} [Expires in: ${expiryDays}d]`
				: `[Expires in: ${expiryDays}d]`;
		}

		try {
			await createItem.mutateAsync({
				kind: "reward",
				name: data.title.trim(),
				description: fullDescription || undefined,
				price_px: data.cost_px,
				real_cost:
					data.currency_cost && data.currency_cost > 0
						? data.currency_cost
						: undefined,
				currency: data.currency_symbol?.trim() || undefined,
				expires_in_days:
					hasExpiration && expiryDays > 0 ? expiryDays : undefined,
			});

			reset();
			setHasExpiration(false);
			onOpenChange(false);
		} catch (err) {
			handleFormApiError(err, setError);
		}
	};

	return (
		<DialogRoot
			open={open}
			onOpenChange={(details) => onOpenChange(details.open)}
			placement="bottom"
		>
			<DialogContent
				maxW="2xl"
				roundedTop="2xl"
				roundedBottom="none"
				bg="bg.panel"
				borderWidth="1px"
				borderColor="border.glass"
				shadow="float"
				p={{ base: 4, md: 6 }}
			>
				<DialogHeader pb={2}>
					<Stack gap={0.5}>
						<DialogTitle fontSize="lg">
							Create Custom Self-Reward
						</DialogTitle>
						<DialogDescription fontSize="xs" color="fg.muted">
							Define personal real-world rewards you can purchase
							with earned PX.
						</DialogDescription>
					</Stack>
				</DialogHeader>

				<DialogBody py={3}>
					<form
						id="create-reward-form"
						onSubmit={handleSubmit(onSubmitReward)}
					>
						<Stack gap={4}>
							<Field
								label="Reward Title"
								required
								invalid={Boolean(errors.title)}
								errorText={errors.title?.message}
							>
								<Input
									placeholder="e.g. Specialty Matcha Latte"
									rounded="pill"
									bg="bg.muted"
									{...register("title")}
								/>
							</Field>

							<Field
								label="Description (Optional)"
								invalid={Boolean(errors.description)}
								errorText={errors.description?.message}
							>
								<Textarea
									placeholder="What is the occasion or treat?"
									rounded="xl"
									bg="bg.muted"
									rows={2}
									{...register("description")}
								/>
							</Field>

							<Grid
								templateColumns={{
									base: "1fr",
									sm: "1fr 1fr",
								}}
								gap={3}
							>
								<Field
									label="Currency Cost (Real $ Value)"
									helperText="Optional reference cost"
								>
									<Input
										type="number"
										step="0.01"
										placeholder="e.g. 150"
										rounded="pill"
										bg="bg.muted"
										{...register("currency_cost", {
											valueAsNumber: true,
										})}
									/>
								</Field>

								<Field label="Currency Unit">
									<SearchableSelect
										items={CURRENCY_OPTIONS}
										value={currency}
										onValueChange={(val) =>
											setValue("currency_symbol", val)
										}
										placeholder="Select currency"
									/>
								</Field>
							</Grid>

							<Field
								label="PX Point Cost"
								required
								invalid={Boolean(errors.cost_px)}
								errorText={errors.cost_px?.message}
								helperText={
									suggestion
										? `Suggested based on economy: ~${suggestion.toLocaleString()} PX`
										: undefined
								}
							>
								<HStack gap={2}>
									<Input
										type="number"
										rounded="pill"
										bg="bg.muted"
										{...register("cost_px", {
											valueAsNumber: true,
										})}
									/>
									{suggestion && suggestion > 0 && (
										<Button
											size="sm"
											variant="outline"
											rounded="pill"
											type="button"
											onClick={handleApplySuggested}
										>
											<HStack gap={1}>
												<Icon
													as={LuSparkles}
													boxSize={3.5}
												/>
												<Text fontSize="xs">
													Auto-Fill ({suggestion})
												</Text>
											</HStack>
										</Button>
									)}
								</HStack>
							</Field>

							<Flex justify="space-between" align="center" pt={1}>
								<HStack gap={2}>
									<Button
										type="button"
										size="xs"
										rounded="pill"
										variant={
											hasExpiration ? "solid" : "outline"
										}
										colorPalette={
											hasExpiration ? "mint" : undefined
										}
										onClick={() =>
											setHasExpiration(!hasExpiration)
										}
									>
										{hasExpiration
											? "Expiration Set"
											: "Add Expiration"}
									</Button>
									{hasExpiration && (
										<HStack gap={1}>
											<Input
												type="number"
												size="xs"
												w="70px"
												rounded="pill"
												bg="bg.muted"
												value={expiryDays}
												onChange={(e) =>
													setExpiryDays(
														parseInt(
															e.target.value,
															10,
														) || 30,
													)
												}
											/>
											<Text
												fontSize="xs"
												color="fg.muted"
											>
												days
											</Text>
										</HStack>
									)}
								</HStack>
							</Flex>
						</Stack>
					</form>
				</DialogBody>

				<DialogFooter pt={3}>
					<Button
						variant="ghost"
						size="sm"
						rounded="pill"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<PillButton
						variant="dark"
						icon={LuPlus}
						form="create-reward-form"
						type="submit"
						loading={isSubmitting}
					>
						Create Reward
					</PillButton>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
};
