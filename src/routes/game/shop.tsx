import React from "react";
import {
	Badge,
	Box,
	Container,
	Flex,
	Grid,
	HStack,
	Heading,
	Icon,
	Input,
	Skeleton,
	Stack,
	Tabs,
	Text,
	Textarea,
} from "@chakra-ui/react";
import {
	LuBadgeCheck,
	LuCheck,
	LuClipboardList,
	LuFlaskConical,
	LuGift,
	LuHourglass,
	LuLock,
	LuPackage,
	LuPlus,
	LuShirt,
	LuTrash2,
	LuWallet,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import {
	useClaims,
	useCreateShopItem,
	useDeleteShopItem,
	useInventory,
	usePlayerSummary,
	usePurchaseItem,
	useRedeemClaim,
	useShopCatalog,
	useSuggestPrice,
	useUseInventoryItem,
} from "@/api";
import type {
	Claim,
	ClaimStatus,
	Player,
	ShopItem,
	ShopItemKind,
} from "@/api/types";

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

const EFFECT_LABEL: Record<string, string> = {
	streak_shield: "Streak Shield",
	streak_repair: "Streak Repair",
	focus_elixir: "Focus Elixir",
	coin_charm: "Coin Charm",
	quest_reroll: "Quest Reroll",
	rest_day: "Rest Day",
};

function formatCountdown(iso: string, now: number): string {
	const diffMs = new Date(iso).getTime() - now;
	if (diffMs <= 0) return "Ready";
	const totalMinutes = Math.ceil(diffMs / 60000);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
}

export const Shop: React.FC = () => {
	const { data: summary } = usePlayerSummary();
	const player = summary?.player;

	return (
		<Container maxW="6xl" py={{ base: 4, md: 8 }}>
			<Stack gap={6}>
				<Flex
					justify="space-between"
					align="flex-end"
					wrap="wrap"
					gap={3}
				>
					<Stack gap={1}>
						<Heading size="2xl">Shop</Heading>
						<Text color="fg.muted">
							Spend PX on rewards, consumables, and cosmetics.
						</Text>
					</Stack>
					{player && (
						<HStack
							{...glassCard}
							px={4}
							py={2}
							gap={2}
							bg="bg.muted"
						>
							<Icon as={LuWallet} boxSize={4} color="fg.muted" />
							<Text fontWeight="bold">{player.px} PX</Text>
						</HStack>
					)}
				</Flex>

				<Tabs.Root
					defaultValue="reward"
					variant="plain"
					size="sm"
					css={{
						"--tabs-indicator-bg": "colors.bg.solid",
						"--tabs-indicator-shadow": "shadows.glass",
						"--tabs-trigger-radius": "radii.full",
					}}
				>
					<Tabs.List
						bg="bg.muted"
						borderWidth="1px"
						borderColor="border.glass"
						rounded="pill"
						p={1}
						gap={1}
						position="relative"
						shadow="glass"
						w="fit-content"
					>
						<Tabs.Trigger
							value="reward"
							px={3.5}
							py={1.5}
							cursor="pointer"
							fontWeight="semibold"
							fontSize="xs"
							zIndex={1}
							color="fg.muted"
							_selected={{
								color: "fg.inverted",
								fontWeight: "bold",
							}}
							transition="color 0.15s ease-out"
						>
							<Icon as={LuGift} boxSize={3.5} mr={1.5} />
							Rewards
						</Tabs.Trigger>
						<Tabs.Trigger
							value="consumable"
							px={3.5}
							py={1.5}
							cursor="pointer"
							fontWeight="semibold"
							fontSize="xs"
							zIndex={1}
							color="fg.muted"
							_selected={{
								color: "fg.inverted",
								fontWeight: "bold",
							}}
							transition="color 0.15s ease-out"
						>
							<Icon as={LuFlaskConical} boxSize={3.5} mr={1.5} />
							Consumables
						</Tabs.Trigger>
						<Tabs.Trigger
							value="cosmetic"
							px={3.5}
							py={1.5}
							cursor="pointer"
							fontWeight="semibold"
							fontSize="xs"
							zIndex={1}
							color="fg.muted"
							_selected={{
								color: "fg.inverted",
								fontWeight: "bold",
							}}
							transition="color 0.15s ease-out"
						>
							<Icon as={LuShirt} boxSize={3.5} mr={1.5} />
							Cosmetics
						</Tabs.Trigger>
						<Tabs.Indicator rounded="pill" />
					</Tabs.List>

					<Tabs.Content value="reward">
						<Stack gap={6} pt={4}>
							<CatalogGrid kind="reward" player={player} />
							<RewardComposer />
							<ClaimsSection />
						</Stack>
					</Tabs.Content>

					<Tabs.Content value="consumable">
						<Stack gap={6} pt={4}>
							<CatalogGrid kind="consumable" player={player} />
							<InventorySection />
						</Stack>
					</Tabs.Content>

					<Tabs.Content value="cosmetic">
						<Stack gap={6} pt={4}>
							<CatalogGrid kind="cosmetic" player={player} />
						</Stack>
					</Tabs.Content>
				</Tabs.Root>
			</Stack>
		</Container>
	);
};

interface CatalogGridProps {
	kind: ShopItemKind;
	player?: Player;
}

const CatalogGrid: React.FC<CatalogGridProps> = ({ kind, player }) => {
	const { data: items, isLoading, isError } = useShopCatalog(kind);
	const purchase = usePurchaseItem();
	const deleteItem = useDeleteShopItem();
	const [pendingId, setPendingId] = React.useState<string | null>(null);

	const handlePurchase = async (item: ShopItem) => {
		setPendingId(item.id);
		try {
			await purchase.mutateAsync(item.id);
			toaster.create({
				title: `Purchased ${item.name}`,
				type: "success",
			});
		} catch (err) {
			toaster.create({
				title: "Purchase failed",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		} finally {
			setPendingId(null);
		}
	};

	const handleDelete = async (item: ShopItem) => {
		setPendingId(item.id);
		try {
			await deleteItem.mutateAsync(item.id);
		} catch (err) {
			toaster.create({
				title: "Failed to delete item",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		} finally {
			setPendingId(null);
		}
	};

	if (isLoading) {
		return (
			<Grid
				gap={3}
				templateColumns={{
					base: "1fr",
					sm: "repeat(2, 1fr)",
					lg: "repeat(3, 1fr)",
				}}
			>
				{[0, 1, 2].map((i) => (
					<Skeleton key={i} h="150px" rounded="card" />
				))}
			</Grid>
		);
	}

	if (isError) {
		return (
			<Box {...glassCard} p={6}>
				<Text color="fg.muted" fontSize="sm">
					Couldn&apos;t load the catalog. Try again later.
				</Text>
			</Box>
		);
	}

	if (!items || items.length === 0) {
		return (
			<Box {...glassCard} p={6}>
				<EmptyState
					title="Nothing here yet"
					description="Check back later, or add your own reward below."
					icon={<Icon as={LuPackage} boxSize={6} />}
				/>
			</Box>
		);
	}

	return (
		<Grid
			gap={3}
			templateColumns={{
				base: "1fr",
				sm: "repeat(2, 1fr)",
				lg: "repeat(3, 1fr)",
			}}
		>
			{items.map((item) => {
				const locked =
					Boolean(player) &&
					item.level_required > (player?.level ?? 0);
				const unaffordable =
					Boolean(player) && item.price_px > (player?.px ?? 0);
				const disabled =
					locked || unaffordable || pendingId === item.id;
				return (
					<Box key={item.id} {...glassCard} p={4}>
						<Stack gap={3} h="full" justify="space-between">
							<Stack gap={1.5}>
								<HStack
									justify="space-between"
									align="flex-start"
								>
									<Text fontWeight="bold" fontSize="sm">
										{item.name}
									</Text>
									{!item.system && (
										<Icon
											as={LuTrash2}
											boxSize={3.5}
											color="fg.muted"
											cursor="pointer"
											onClick={() => handleDelete(item)}
											_hover={{ color: "red.fg" }}
										/>
									)}
								</HStack>
								{item.description && (
									<Text fontSize="xs" color="fg.muted">
										{item.description}
									</Text>
								)}
								<HStack gap={2} wrap="wrap">
									<Badge
										size="xs"
										rounded="pill"
										variant="subtle"
									>
										{item.price_px} PX
									</Badge>
									{item.level_required > 0 && (
										<Badge
											size="xs"
											rounded="pill"
											variant="subtle"
											colorPalette={
												locked ? "red" : "gray"
											}
										>
											Lvl {item.level_required}+
										</Badge>
									)}
								</HStack>
							</Stack>

							<Button
								size="sm"
								variant="dark"
								w="full"
								noIcon
								disabled={disabled}
								loading={pendingId === item.id}
								onClick={() => handlePurchase(item)}
							>
								{locked
									? "Level locked"
									: unaffordable
										? "Not enough PX"
										: "Purchase"}
							</Button>
						</Stack>
					</Box>
				);
			})}
		</Grid>
	);
};

const RewardComposer: React.FC = () => {
	const [name, setName] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [realCost, setRealCost] = React.useState("");
	const [currency, setCurrency] = React.useState("USD");
	const [pricePx, setPricePx] = React.useState("");
	const [pxTouched, setPxTouched] = React.useState(false);

	const realCostNumber = Number(realCost) || 0;
	const { data: suggestedPx } = useSuggestPrice(realCostNumber);
	const create = useCreateShopItem();

	React.useEffect(() => {
		if (!pxTouched && suggestedPx !== undefined) {
			setPricePx(String(suggestedPx));
		}
	}, [suggestedPx, pxTouched]);

	const resetForm = () => {
		setName("");
		setDescription("");
		setRealCost("");
		setCurrency("USD");
		setPricePx("");
		setPxTouched(false);
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !pricePx) return;

		try {
			await create.mutateAsync({
				kind: "reward",
				name: name.trim(),
				description: description.trim() || undefined,
				price_px: Number(pricePx),
				real_cost: realCostNumber || undefined,
				currency: realCostNumber ? currency : undefined,
			});
			toaster.create({ title: "Reward created", type: "success" });
			resetForm();
		} catch (err) {
			toaster.create({
				title: "Failed to create reward",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	return (
		<Box {...glassCard} p={{ base: 5, md: 6 }}>
			<Stack gap={4}>
				<HStack gap={2}>
					<Icon as={LuPlus} boxSize={4} color="mint.fg" />
					<Heading size="sm">Create a real-world reward</Heading>
				</HStack>
				<Text fontSize="xs" color="fg.muted">
					Turn something you actually want into a PX price. We suggest
					a price from the real-world cost — override it if you like.
				</Text>
				<form noValidate onSubmit={onSubmit}>
					<Stack gap={4}>
						<Grid
							gap={4}
							templateColumns={{ base: "1fr", sm: "2fr 1fr" }}
						>
							<Field label="Name" required>
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Movie night"
									rounded="xl"
								/>
							</Field>
							<Field label="PX price" required>
								<Input
									type="number"
									min={1}
									value={pricePx}
									onChange={(e) => {
										setPxTouched(true);
										setPricePx(e.target.value);
									}}
									placeholder={
										suggestedPx !== undefined
											? String(suggestedPx)
											: "0"
									}
									rounded="xl"
								/>
							</Field>
						</Grid>

						<Field label="Description">
							<Textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="What do you get?"
								rounded="xl"
								rows={2}
							/>
						</Field>

						<Grid
							gap={4}
							templateColumns={{ base: "1fr", sm: "2fr 1fr" }}
						>
							<Field
								label="Real-world cost"
								helperText="Used only to suggest a PX price."
							>
								<Input
									type="number"
									min={0}
									value={realCost}
									onChange={(e) =>
										setRealCost(e.target.value)
									}
									placeholder="0"
									rounded="xl"
								/>
							</Field>
							<Field label="Currency">
								<Input
									value={currency}
									onChange={(e) =>
										setCurrency(
											e.target.value.toUpperCase(),
										)
									}
									maxLength={3}
									rounded="xl"
								/>
							</Field>
						</Grid>

						<Button
							type="submit"
							variant="dark"
							alignSelf="flex-start"
							loading={create.isPending}
							icon={LuPlus}
						>
							Create Reward
						</Button>
					</Stack>
				</form>
			</Stack>
		</Box>
	);
};

const InventorySection: React.FC = () => {
	const { data: items, isLoading } = useInventory();
	const useItem = useUseInventoryItem();
	const [pendingId, setPendingId] = React.useState<string | null>(null);

	const handleUse = async (id: string) => {
		setPendingId(id);
		try {
			await useItem.mutateAsync(id);
			toaster.create({ title: "Item used", type: "success" });
		} catch (err) {
			toaster.create({
				title: "Failed to use item",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		} finally {
			setPendingId(null);
		}
	};

	return (
		<Stack gap={3}>
			<Heading
				size="md"
				color="fg.muted"
				textTransform="uppercase"
				letterSpacing="0.05em"
				fontSize="xs"
			>
				Inventory
			</Heading>
			<Box {...glassCard} p={{ base: 5, md: 6 }}>
				{isLoading ? (
					<Stack gap={2}>
						<Skeleton h="12" rounded="xl" />
						<Skeleton h="12" rounded="xl" />
					</Stack>
				) : !items || items.length === 0 ? (
					<EmptyState
						title="Your inventory is empty"
						description="Purchase a consumable above to see it here."
						icon={<Icon as={LuFlaskConical} boxSize={6} />}
					/>
				) : (
					<Stack gap={2}>
						{items.map((item) => (
							<HStack
								key={item.id}
								justify="space-between"
								p={3.5}
								rounded="xl"
								bg="bg.muted"
								borderWidth="1px"
								borderColor="border.glass"
							>
								<HStack gap={2.5}>
									<Icon
										as={LuFlaskConical}
										boxSize={4}
										color="fg.muted"
									/>
									<Stack gap={0}>
										<Text
											fontWeight="semibold"
											fontSize="sm"
										>
											{EFFECT_LABEL[item.effect] ??
												item.effect}
										</Text>
										<Text fontSize="xs" color="fg.muted">
											Qty {item.quantity}
										</Text>
									</Stack>
								</HStack>
								<Button
									size="xs"
									variant="outline"
									noIcon
									disabled={item.quantity === 0}
									loading={pendingId === item.id}
									onClick={() => handleUse(item.id)}
								>
									Use
								</Button>
							</HStack>
						))}
					</Stack>
				)}
			</Box>
		</Stack>
	);
};

const CLAIM_GROUPS: {
	status: ClaimStatus;
	label: string;
	icon: React.ElementType;
}[] = [
	{ status: "pending", label: "Pending", icon: LuHourglass },
	{ status: "owned", label: "Owned", icon: LuBadgeCheck },
	{ status: "redeemed", label: "Redeemed", icon: LuCheck },
];

const ClaimsSection: React.FC = () => {
	const { data: claims, isLoading } = useClaims();
	const redeem = useRedeemClaim();
	const [pendingId, setPendingId] = React.useState<string | null>(null);
	const [now, setNow] = React.useState(() => Date.now());

	React.useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 30000);
		return () => clearInterval(interval);
	}, []);

	const handleRedeem = async (id: string) => {
		setPendingId(id);
		try {
			await redeem.mutateAsync(id);
			toaster.create({ title: "Claim redeemed", type: "success" });
		} catch (err) {
			toaster.create({
				title: "Failed to redeem claim",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		} finally {
			setPendingId(null);
		}
	};

	return (
		<Stack gap={3}>
			<Heading
				size="md"
				color="fg.muted"
				textTransform="uppercase"
				letterSpacing="0.05em"
				fontSize="xs"
			>
				Claims
			</Heading>
			<Box {...glassCard} p={{ base: 5, md: 6 }}>
				{isLoading ? (
					<Skeleton h="12" rounded="xl" />
				) : !claims || claims.length === 0 ? (
					<EmptyState
						title="No claims yet"
						description="Purchase a reward above to start a claim."
						icon={<Icon as={LuClipboardList} boxSize={6} />}
					/>
				) : (
					<Stack gap={5}>
						{CLAIM_GROUPS.map((group) => {
							const grouped = claims.filter(
								(claim) => claim.status === group.status,
							);
							if (grouped.length === 0) return null;
							return (
								<Stack key={group.status} gap={2}>
									<HStack gap={1.5} color="fg.muted">
										<Icon as={group.icon} boxSize={3.5} />
										<Text
											fontSize="10px"
											fontWeight="semibold"
											textTransform="uppercase"
										>
											{group.label}
										</Text>
									</HStack>
									{grouped.map((claim) => (
										<ClaimRow
											key={claim.id}
											claim={claim}
											now={now}
											pending={pendingId === claim.id}
											onRedeem={() =>
												handleRedeem(claim.id)
											}
										/>
									))}
								</Stack>
							);
						})}
					</Stack>
				)}
			</Box>
		</Stack>
	);
};

interface ClaimRowProps {
	claim: Claim;
	now: number;
	pending: boolean;
	onRedeem: () => void;
}

const ClaimRow: React.FC<ClaimRowProps> = ({
	claim,
	now,
	pending,
	onRedeem,
}) => {
	const redeemableInFuture = new Date(claim.redeemable_at).getTime() > now;

	return (
		<HStack
			justify="space-between"
			p={3.5}
			rounded="xl"
			bg="bg.muted"
			borderWidth="1px"
			borderColor="border.glass"
		>
			<Stack gap={0}>
				<Text fontWeight="semibold" fontSize="sm">
					{claim.name}
				</Text>
				<Text fontSize="xs" color="fg.muted">
					{claim.price_paid} PX
				</Text>
			</Stack>

			{claim.status === "pending" && redeemableInFuture && (
				<HStack gap={1} color="fg.muted" fontSize="xs">
					<Icon as={LuHourglass} boxSize={3.5} />
					<Text>{formatCountdown(claim.redeemable_at, now)}</Text>
				</HStack>
			)}
			{claim.status === "owned" && (
				<Button
					size="xs"
					variant="dark"
					noIcon
					loading={pending}
					onClick={onRedeem}
				>
					Redeem
				</Button>
			)}
			{claim.status === "redeemed" && (
				<HStack gap={1} color="fg.muted" fontSize="xs">
					<Icon as={LuLock} boxSize={3.5} />
					<Text>Redeemed</Text>
				</HStack>
			)}
		</HStack>
	);
};

export default Shop;
