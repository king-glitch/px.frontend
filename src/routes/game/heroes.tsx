import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
	Badge,
	Box,
	Button,
	Circle,
	Container,
	Flex,
	Grid,
	HStack,
	Heading,
	Icon,
	Input,
	SimpleGrid,
	Skeleton,
	SkeletonCircle,
	Stack,
	Tabs,
	Text,
	Textarea,
	VStack,
} from "@chakra-ui/react";
import {
	LuActivity,
	LuArrowRight,
	LuArrowUp,
	LuAward,
	LuBadgeCheck,
	LuCalendar,
	LuCheck,
	LuCircleCheck,
	LuCircleDollarSign,
	LuClipboardList,
	LuClock,
	LuCoins,
	LuCrown,
	LuFlame,
	LuFlaskConical,
	LuGift,
	LuGlasses,
	LuHourglass,
	LuLock,
	LuPackage,
	LuPalette,
	LuPiggyBank,
	LuPlus,
	LuShield,
	LuShieldCheck,
	LuShirt,
	LuShoppingBag,
	LuSparkles,
	LuSwords,
	LuTarget,
	LuTrash2,
	LuTrendingUp,
	LuUser,
	LuWallet,
	LuZap,
} from "react-icons/lu";
import { PillButton } from "@/components/ui/pill-button";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import {
	DialogActionTrigger,
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import {
	SearchableSelect,
	type SearchableSelectItem,
} from "@/components/ui/searchable-select";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/api/client";
import {
	useAscendPlayer,
	useClaims,
	useCreateShopItem,
	useDeleteShopItem,
	useInventory,
	useLedger,
	usePlayerSummary,
	usePurchaseItem,
	useRedeemClaim,
	useShopCatalog,
	useSpendPerk,
	useSuggestPrice,
	useUseInventoryItem,
	type Avatar,
	type Buff,
	type Claim,
	type PerkID,
	type Player,
	type ShopItem,
	type ShopItemKind,
} from "@/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	type CustomShopItemFormData,
	customShopItemSchema,
} from "@/api/schemas";
import { handleFormApiError } from "@/utils/form-error";
import { useAuthContext } from "@/contexts/auth-context";
import {
	AttributeRadar,
	ExpBar,
	HeroAvatar,
	LevelRing,
	RewardFlight,
	StreakFlame,
	registerRewardFlightTarget,
	useRewardFlight,
	AVAILABLE_COSMETICS,
	type AvatarSlot,
} from "@/components/game";

export const PERK_COSMETIC_MAP: Record<
	PerkID,
	{
		slot: AvatarSlot;
		itemId: string;
		name: string;
		description: string;
		icon: React.ElementType;
	}
> = {
	merchant: {
		slot: "skin",
		itemId: "golden_rabbit",
		name: "24k Midas Solid Gold Skin",
		description: "Unlocked via Merchant Perk (+5% PX per rank)",
		icon: LuCoins,
	},
	deep_focus: {
		slot: "glasses",
		itemId: "vr_visor",
		name: "Focus VR Visor",
		description: "Unlocked via Deep Focus Perk (+20% bonus on 60m+ quests)",
		icon: LuZap,
	},
	resolve: {
		slot: "accessory",
		itemId: "cape",
		name: "Warrior's Red Cape",
		description: "Unlocked via Resolve Perk (+1 streak multiplier grace)",
		icon: LuShield,
	},
	vitality: {
		slot: "head",
		itemId: "head_sprout",
		name: "Sprout of Vitality",
		description: "Unlocked via Vitality Perk (+10% Health sync bonus)",
		icon: LuActivity,
	},
	ledger: {
		slot: "glasses",
		itemId: "monocle",
		name: "Scholar Monocle",
		description: "Unlocked via Ledger Perk (+5% finance conversion bonus)",
		icon: LuBadgeCheck,
	},
	diligence: {
		slot: "head",
		itemId: "golden_crown",
		name: "Imperial Golden Crown",
		description: "Unlocked via Diligence Perk (+5% EXP from all quests)",
		icon: LuAward,
	},
	second_wind: {
		slot: "head",
		itemId: "halo",
		name: "Immortal Angel Halo",
		description: "Unlocked via Second Wind Perk (50% recovery cost reduction)",
		icon: LuSparkles,
	},
	bargain: {
		slot: "glasses",
		itemId: "blush",
		name: "Merchant's Anime Blush",
		description: "Unlocked via Bargain Perk (10% shop discount)",
		icon: LuFlame,
	},
};

const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

const CURRENCY_OPTIONS: SearchableSelectItem[] = [
	{
		label: "THB (฿ - Thai Baht)",
		value: "THB",
		description: "Default Thai Baht",
	},
	{
		label: "USD ($ - US Dollar)",
		value: "USD",
		description: "United States Dollar",
	},
	{ label: "EUR (€ - Euro)", value: "EUR", description: "European Euro" },
	{
		label: "JPY (¥ - Japanese Yen)",
		value: "JPY",
		description: "Japanese Yen",
	},
	{
		label: "GBP (£ - British Pound)",
		value: "GBP",
		description: "British Pound",
	},
	{
		label: "SGD (S$ - Singapore Dollar)",
		value: "SGD",
		description: "Singapore Dollar",
	},
	{
		label: "AUD (A$ - Australian Dollar)",
		value: "AUD",
		description: "Australian Dollar",
	},
	{
		label: "CNY (¥ - Chinese Yuan)",
		value: "CNY",
		description: "Chinese Yuan",
	},
];

const PERK_DEFS: {
	id: PerkID;
	label: string;
	max: number;
	description: string;
}[] = [
	{
		id: "diligence",
		label: "Diligence",
		max: 5,
		description: "+5% EXP from daily quest completions",
	},
	{
		id: "merchant",
		label: "Merchant",
		max: 5,
		description: "+5% PX points yield on completed tasks",
	},
	{
		id: "vitality",
		label: "Vitality",
		max: 5,
		description: "+10% EXP multiplier for healthy sleep and steps",
	},
	{
		id: "resolve",
		label: "Resolve",
		max: 3,
		description: "+15% EXP multiplier on active streak milestones",
	},
	{
		id: "ledger",
		label: "Ledger",
		max: 3,
		description: "+10% bonus EXP on monthly financial conversions",
	},
	{
		id: "deep_focus",
		label: "Deep Focus",
		max: 3,
		description: "+20% EXP for deep work quests over 60 mins",
	},
	{
		id: "bargain",
		label: "Bargain",
		max: 3,
		description: "-5% PX cost discount across shop catalog",
	},
	{
		id: "second_wind",
		label: "Second Wind",
		max: 1,
		description: "Auto-protects streak once every 14 days",
	},
];

function getPerkCurrentEffect(id: PerkID, rank: number): string {
	switch (id) {
		case "diligence":
			return rank > 0
				? `+${rank * 5}% Daily Quest EXP`
				: "0% (Base rate)";
		case "merchant":
			return rank > 0
				? `+${rank * 5}% PX Points Yield`
				: "0% (Base rate)";
		case "vitality":
			return rank > 0
				? `+${rank * 10}% Health EXP Multiplier`
				: "0% (Base rate)";
		case "resolve":
			return rank > 0
				? `+${rank * 15}% Streak Milestone EXP`
				: "0% (Base rate)";
		case "ledger":
			return rank > 0
				? `+${rank * 10}% Monthly Finance EXP`
				: "0% (Base rate)";
		case "deep_focus":
			return rank > 0
				? `+${rank * 20}% 60m+ Deep Work EXP`
				: "0% (Base rate)";
		case "bargain":
			return rank > 0
				? `-${rank * 5}% Shop Catalog PX Cost`
				: "0% (Full price)";
		case "second_wind":
			return rank > 0
				? "Active (Streak guarded 1x/14d)"
				: "Inactive (0/1)";
		default:
			return `Rank ${rank}`;
	}
}

function getPerkUpgradeGain(id: PerkID): string {
	switch (id) {
		case "diligence":
			return "+5% EXP";
		case "merchant":
			return "+5% PX";
		case "vitality":
			return "+10% Health EXP";
		case "resolve":
			return "+15% Streak EXP";
		case "ledger":
			return "+10% Finance EXP";
		case "deep_focus":
			return "+20% Deep Work";
		case "bargain":
			return "-5% PX Cost";
		case "second_wind":
			return "Streak Guard";
		default:
			return "+1 Level";
	}
}

const BUFF_LABEL: Record<string, string> = {
	streak_shield: "Streak Shield",
	streak_repair: "Streak Repair",
	focus_elixir: "Focus Elixir (2x EXP)",
	coin_charm: "Coin Charm (2x PX)",
	quest_reroll: "Quest Reroll",
	rest_day: "Rest Day Pass",
};

function formatCountdown(expiresAt: string, now: number): string {
	const diffMs = new Date(expiresAt).getTime() - now;
	if (diffMs <= 0) return "Expired";
	const totalSeconds = Math.floor(diffMs / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

type HeroSection = "overview" | "shop" | "inventory";

export const Heroes: React.FC = () => {
	const { user } = useAuthContext();
	const { data: summary, isLoading, isError } = usePlayerSummary();
	const { section } = useParams<{ section?: string }>();
	const activeSection: HeroSection =
		section === "shop" || section === "inventory" ? section : "overview";

	const spendPerk = useSpendPerk();
	const ascend = useAscendPlayer();
	const { data: cosmetics } = useShopCatalog("cosmetic");
	const [pendingPerk, setPendingPerk] = React.useState<string | null>(null);
	const [ascendOpen, setAscendOpen] = React.useState(false);
	const [ledgerOpen, setLedgerOpen] = React.useState(false);
	const [wardrobeOpen, setWardrobeOpen] = React.useState(false);

	const confirmSpendPerk = useConfirm<PerkID>();

	const equippedCosmetics = useMemo(() => {
		const res: Partial<Record<AvatarSlot, string>> = {};
		if (summary?.avatar?.equipped) {
			for (const [slotType, itemId] of Object.entries(
				summary.avatar.equipped,
			)) {
				const item = cosmetics?.find((c) => c.id === itemId);
				if (item?.slot) {
					const parts = item.slot.split(":");
					const key = parts[0] as AvatarSlot;
					res[key] = parts[1] || parts[0];
				} else {
					res[slotType as AvatarSlot] = itemId;
				}
			}
		}
		return res;
	}, [summary?.avatar?.equipped, cosmetics]);

	const handleSpend = async (perkId: PerkID) => {
		setPendingPerk(perkId);
		try {
			await spendPerk.mutateAsync(perkId);
			toaster.create({
				title: "Skill Point Allocated",
				description: `Upgraded perk: ${PERK_DEFS.find((p) => p.id === perkId)?.label}`,
				type: "success",
			});
			confirmSpendPerk.close();
		} catch (err) {
			toaster.create({
				title: "Failed to spend skill point",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		} finally {
			setPendingPerk(null);
		}
	};

	const handleAscend = async () => {
		try {
			await ascend.mutateAsync();
			toaster.create({ title: "Hero Ascended!", type: "success" });
			setAscendOpen(false);
		} catch (err) {
			toaster.create({
				title: "Failed to ascend",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	if (isLoading) {
		return (
			<Container maxW="7xl" py={{ base: 4, md: 8 }}>
				<Stack gap={6}>
					<Skeleton h="10" w="240px" rounded="xl" />
					<Grid
						gap={5}
						templateColumns={{ base: "1fr", lg: "240px 1fr" }}
					>
						<Skeleton h="300px" rounded="card" />
						<Skeleton h="500px" rounded="card" />
					</Grid>
				</Stack>
			</Container>
		);
	}

	if (isError || !summary) {
		return (
			<Container maxW="7xl" py={{ base: 4, md: 8 }}>
				<Box {...glassCard} p={8}>
					<Text color="fg.muted">
						Couldn&apos;t load your character sheet. Try refreshing
						the page.
					</Text>
				</Box>
			</Container>
		);
	}

	const { player, exp_to_next, attributes, active_buffs, perks } = summary;
	const expFraction =
		exp_to_next > 0 ? player.exp_into_level / exp_to_next : 0;
	const maxAttribute = Math.max(...Object.values(attributes), 10);
	const canAscend = player.level >= 50;

	const diligenceRank =
		perks.find((p) => p.perk_id === "diligence")?.rank ?? 0;
	const merchantRank = perks.find((p) => p.perk_id === "merchant")?.rank ?? 0;
	const vitalityRank = perks.find((p) => p.perk_id === "vitality")?.rank ?? 0;
	const resolveRank = perks.find((p) => p.perk_id === "resolve")?.rank ?? 0;
	const ledgerRank = perks.find((p) => p.perk_id === "ledger")?.rank ?? 0;
	const deepFocusRank =
		perks.find((p) => p.perk_id === "deep_focus")?.rank ?? 0;
	const bargainRank = perks.find((p) => p.perk_id === "bargain")?.rank ?? 0;
	const secondWindRank =
		perks.find((p) => p.perk_id === "second_wind")?.rank ?? 0;

	const totalInvestedPoints = perks.reduce((acc, p) => acc + p.rank, 0);
	const totalAttributesSum = Object.values(attributes).reduce(
		(a, b) => a + b,
		0,
	);

	return (
		<Container maxW="7xl" py={{ base: 4, md: 6 }}>
			<RewardFlight />
			<Stack gap={6}>
				{/* Top Hero Command Header */}
				<Flex
					justify="space-between"
					align="center"
					wrap="wrap"
					gap={3}
				>
					<Stack gap={1}>
						<HStack gap={3}>
							<Heading size="2xl">Hero Command Hub</Heading>
							<Badge size="md" rounded="pill" variant="subtle">
								Lv {player.level}
							</Badge>
							{player.ascensions > 0 && (
								<Badge
									size="md"
									rounded="pill"
									variant="subtle"
								>
									Ascension {player.ascensions}
								</Badge>
							)}
						</HStack>
						<Text color="fg.muted" fontSize="sm">
							Progression, talent perks, reward shop, and cyber
							inventory.
						</Text>
					</Stack>

					<HStack gap={3} wrap="wrap">
						<PillButton
							size="sm"
							variant="dark"
							icon={LuClipboardList}
							onClick={() => setLedgerOpen(true)}
						>
							Ledger History
						</PillButton>

						<HStack {...glassCard} px={4} py={2} gap={2} bg="bg.panel">
							<Icon as={LuCoins} boxSize={4} color="fg.muted" />
							<Text fontWeight="bold" fontSize="md">
								{player.px.toLocaleString()} PX
							</Text>
							<Text fontSize="xs" color="fg.muted">
								available
							</Text>
						</HStack>
					</HStack>
				</Flex>

				{/* Sidebar Navigation & Active View Grid */}
				<Grid
					gap={6}
					templateColumns={{ base: "1fr", lg: "240px 1fr" }}
					alignItems="start"
				>
					{/* Sidebar Navigation */}
					<Box {...glassCard} p={3}>
						<VStack gap={1.5} align="stretch">
							<Button
								asChild
								variant={
									activeSection === "overview"
										? "solid"
										: "ghost"
								}
								justifyContent="flex-start"
								rounded="pill"
								size="sm"
								px={3.5}
								py={2}
							>
								<Link to="/game/heroes">
									<HStack gap={2.5}>
										<Icon
											as={LuSwords}
											boxSize={4}
											color={
												activeSection === "overview"
													? "inherit"
													: "fg.muted"
											}
										/>
										<Text
											fontWeight="semibold"
											fontSize="xs"
										>
											Hero Overview
										</Text>
									</HStack>
								</Link>
							</Button>

							<Button
								asChild
								variant={
									activeSection === "shop" ? "solid" : "ghost"
								}
								justifyContent="flex-start"
								rounded="pill"
								size="sm"
								px={3.5}
								py={2}
							>
								<Link to="/game/heroes/shop">
									<HStack gap={2.5}>
										<Icon
											as={LuShoppingBag}
											boxSize={4}
											color={
												activeSection === "shop"
													? "inherit"
													: "fg.muted"
											}
										/>
										<Text
											fontWeight="semibold"
											fontSize="xs"
										>
											Shop & Rewards
										</Text>
									</HStack>
								</Link>
							</Button>

							<Button
								asChild
								variant={
									activeSection === "inventory"
										? "solid"
										: "ghost"
								}
								justifyContent="flex-start"
								rounded="pill"
								size="sm"
								px={3.5}
								py={2}
							>
								<Link to="/game/heroes/inventory">
									<HStack gap={2.5}>
										<Icon
											as={LuPackage}
											boxSize={4}
											color={
												activeSection === "inventory"
													? "inherit"
													: "fg.muted"
											}
										/>
										<Text
											fontWeight="semibold"
											fontSize="xs"
										>
											Inventory & Claims
										</Text>
									</HStack>
								</Link>
							</Button>
						</VStack>

						{/* Mini Hero Profile Card in Sidebar */}
						<Box
							mt={4}
							pt={4}
							borderTopWidth="1px"
							borderColor="border.glass"
							px={1}
						>
							<HStack gap={3}>
								<HeroAvatar
									seed={user?.id ?? player.user_id}
									size={42}
									animated
									equipped={equippedCosmetics}
								/>
								<Stack gap={0}>
									<Text fontSize="xs" fontWeight="bold">
										@{user?.username || "Hero"}
									</Text>
									<Text fontSize="10px" color="fg.muted">
										{player.skill_points} skill pts
										available
									</Text>
								</Stack>
							</HStack>
						</Box>
					</Box>

					{/* Main Content Area */}
					<Box minW={0}>
						{activeSection === "overview" && (
							<Stack gap={6}>
								{/* Focal Avatar + Level & Attribute Radar */}
								<Grid
									gap={5}
									templateColumns={{
										base: "1fr",
										md: "320px 1fr",
									}}
									alignItems="stretch"
								>
									{/* Left Column: 2 Rows (Hero Progression + Streak & Badges) */}
									<Stack gap={4} justify="space-between">
										{/* Hero Level & Exp Progression Card */}
										<Box {...glassCard} p={4.5} flex="1">
											<Stack align="center" gap={3}>
												<Box
													position="relative"
													boxSize="110px"
												>
													<Box
														position="absolute"
														inset={0}
													>
														<LevelRing
															level={player.level}
															progress={expFraction}
															size={110}
														/>
													</Box>
													<Flex
														position="absolute"
														inset={0}
														align="center"
														justify="center"
													>
														<HeroAvatar
															seed={
																user?.id ??
																player.user_id
															}
															size={72}
															animated
															equipped={equippedCosmetics}
														/>
													</Flex>
												</Box>

												<HStack gap={2}>
													<Badge
														size="sm"
														rounded="pill"
														variant="subtle"
													>
														Level {player.level}
													</Badge>
													{player.ascensions > 0 && (
														<Badge
															size="sm"
															rounded="pill"
															variant="subtle"
														>
															Ascension {player.ascensions}
														</Badge>
													)}
												</HStack>

												<Box w="full">
													<ExpBar
														level={player.level}
														expIntoLevel={
															player.exp_into_level
														}
														expToNext={exp_to_next}
													/>
												</Box>

												{canAscend && (
													<PillButton
														variant="dark"
														icon={LuArrowUp}
														w="full"
														size="xs"
														onClick={() =>
															setAscendOpen(true)
														}
													>
														Ascend Hero
													</PillButton>
												)}

												<Button
													variant="outline"
													size="xs"
													rounded="pill"
													w="full"
													onClick={() =>
														setWardrobeOpen(true)
													}
												>
													<HStack gap={1.5}>
														<Icon
															as={LuShirt}
															boxSize={3.5}
															color="mint.fg"
														/>
														<Text>
															Wardrobe & Perks
														</Text>
													</HStack>
												</Button>
											</Stack>
										</Box>

										{/* Streak & Badges Card */}
										<Box {...glassCard} p={4.5}>
											<Stack gap={3}>
												<HStack
													justify="space-between"
													align="center"
												>
													<HStack gap={2}>
														<Icon
															as={LuFlame}
															boxSize={4}
															color="mint.fg"
														/>
														<Text
															fontSize="xs"
															fontWeight="semibold"
															textTransform="uppercase"
															letterSpacing="0.05em"
														>
															Streak & Badges
														</Text>
													</HStack>
													<Badge
														size="xs"
														rounded="pill"
														variant="subtle"
													>
														Best: {player.longest_streak}d
													</Badge>
												</HStack>

												<HStack
													justify="space-between"
													align="center"
													bg="bg.panel"
													p={2.5}
													rounded="card"
													borderWidth="1px"
													borderColor="border.glass"
												>
													<HStack gap={2.5}>
														<StreakFlame
															days={player.streak}
															size={24}
														/>
														<Stack gap={0}>
															<Text
																fontSize="sm"
																fontWeight="bold"
															>
																{player.streak}{" "}
																{player.streak === 1
																	? "Day"
																	: "Days"}
															</Text>
															<Text
																fontSize="10px"
																color="fg.muted"
															>
																Active Streak
															</Text>
														</Stack>
													</HStack>
													{secondWindRank > 0 && (
														<Badge
															size="xs"
															rounded="pill"
															variant="surface"
															colorPalette="mint"
														>
															Shielded
														</Badge>
													)}
												</HStack>

												{active_buffs.length > 0 ? (
													<HStack gap={1.5} wrap="wrap">
														{active_buffs.map((buff) => (
															<Badge
																key={buff.kind}
																size="xs"
																rounded="pill"
																variant="subtle"
															>
																{BUFF_LABEL[buff.kind] || buff.kind}
															</Badge>
														))}
													</HStack>
												) : (
													<HStack
														gap={2}
														color="fg.muted"
														fontSize="xs"
													>
														<Icon
															as={LuShieldCheck}
															boxSize={3.5}
														/>
														<Text fontSize="11px">
															{secondWindRank > 0
																? "Second Wind talent active"
																: "No active consumable buffs"}
														</Text>
													</HStack>
												)}
											</Stack>
										</Box>
									</Stack>

									{/* Attribute Radar Card */}
									<Box {...glassCard} p={6} minW={0}>
										<Stack gap={4}>
											<HStack
												justify="space-between"
												w="full"
											>
												<Stack gap={0.5}>
													<Heading size="sm">
														Attribute Breakdown
													</Heading>
													<Text
														fontSize="xs"
														color="fg.muted"
													>
														Each attribute is EXP
														earned from one quest
														category, log-scaled.
													</Text>
												</Stack>
												<Icon
													as={LuShield}
													boxSize={4}
													color="mint.fg"
												/>
											</HStack>

											<AttributeRadar
												values={attributes}
												max={maxAttribute}
											/>
										</Stack>
									</Box>
								</Grid>

								{/* Active Hero Multipliers & Combat Stats Matrix */}
								<Stack gap={3}>
									<HStack
										justify="space-between"
										wrap="wrap"
										gap={2}
									>
										<Stack gap={0.5}>
											<Heading size="md">
												Active Hero Multipliers
											</Heading>
											<Text
												fontSize="xs"
												color="fg.muted"
											>
												Live permanent bonuses gained
												from your invested talent perks
												and attribute power.
											</Text>
										</Stack>
										<HStack gap={2}>
											<Badge
												size="sm"
												rounded="pill"
												variant="subtle"
											>
												{totalInvestedPoints} Points
												Invested
											</Badge>
											<Badge
												size="sm"
												rounded="pill"
												variant="surface"
												colorPalette="mint"
											>
												{totalAttributesSum} Total
												Attributes
											</Badge>
										</HStack>
									</HStack>

									<SimpleGrid
										columns={{
											base: 2,
											sm: 3,
											md: 4,
											lg: 4,
										}}
										gap={2.5}
									>
										<Box {...glassCard} p={3} bg="bg.panel">
											<HStack
												justify="space-between"
												color="fg.muted"
												mb={1}
											>
												<Text
													fontSize="10px"
													fontWeight="semibold"
													textTransform="uppercase"
												>
													Quest EXP
												</Text>
												<Icon
													as={LuZap}
													boxSize={3.5}
													color="mint.fg"
												/>
											</HStack>
											<Text
												fontSize="lg"
												fontWeight="bold"
												color={
													diligenceRank > 0
														? "mint.fg"
														: "fg"
												}
											>
												+{diligenceRank * 5}%
											</Text>
											<Text
												fontSize="10px"
												color="fg.muted"
											>
												{diligenceRank > 0
													? `+${diligenceRank * 5}% daily exp`
													: "Rank 0 (Base 1.0x)"}
											</Text>
										</Box>

										<Box {...glassCard} p={3} bg="bg.panel">
											<HStack
												justify="space-between"
												color="fg.muted"
												mb={1}
											>
												<Text
													fontSize="10px"
													fontWeight="semibold"
													textTransform="uppercase"
												>
													PX Yield
												</Text>
												<Icon
													as={LuCoins}
													boxSize={3.5}
													color="mint.fg"
												/>
											</HStack>
											<Text
												fontSize="lg"
												fontWeight="bold"
												color={
													merchantRank > 0
														? "mint.fg"
														: "fg"
												}
											>
												+{merchantRank * 5}%
											</Text>
											<Text
												fontSize="10px"
												color="fg.muted"
											>
												{merchantRank > 0
													? `+${merchantRank * 5}% task px`
													: "Rank 0 (Base 1.0x)"}
											</Text>
										</Box>

										<Box {...glassCard} p={3} bg="bg.panel">
											<HStack
												justify="space-between"
												color="fg.muted"
												mb={1}
											>
												<Text
													fontSize="10px"
													fontWeight="semibold"
													textTransform="uppercase"
												>
													Deep Focus
												</Text>
												<Icon
													as={LuTarget}
													boxSize={3.5}
													color="mint.fg"
												/>
											</HStack>
											<Text
												fontSize="lg"
												fontWeight="bold"
												color={
													deepFocusRank > 0
														? "mint.fg"
														: "fg"
												}
											>
												+{deepFocusRank * 20}%
											</Text>
											<Text
												fontSize="10px"
												color="fg.muted"
											>
												{deepFocusRank > 0
													? `+${deepFocusRank * 20}% 60m+ exp`
													: "Rank 0 (Base 1.0x)"}
											</Text>
										</Box>

										<Box {...glassCard} p={3} bg="bg.panel">
											<HStack
												justify="space-between"
												color="fg.muted"
												mb={1}
											>
												<Text
													fontSize="10px"
													fontWeight="semibold"
													textTransform="uppercase"
												>
													Health Award
												</Text>
												<Icon
													as={LuActivity}
													boxSize={3.5}
													color="mint.fg"
												/>
											</HStack>
											<Text
												fontSize="lg"
												fontWeight="bold"
												color={
													vitalityRank > 0
														? "mint.fg"
														: "fg"
												}
											>
												+{vitalityRank * 10}%
											</Text>
											<Text
												fontSize="10px"
												color="fg.muted"
											>
												{vitalityRank > 0
													? `+${vitalityRank * 10}% daily health`
													: "Rank 0 (Base 1.0x)"}
											</Text>
										</Box>

										<Box {...glassCard} p={3} bg="bg.panel">
											<HStack
												justify="space-between"
												color="fg.muted"
												mb={1}
											>
												<Text
													fontSize="10px"
													fontWeight="semibold"
													textTransform="uppercase"
												>
													Streak Bonus
												</Text>
												<Icon
													as={LuFlame}
													boxSize={3.5}
													color="mint.fg"
												/>
											</HStack>
											<Text
												fontSize="lg"
												fontWeight="bold"
												color={
													resolveRank > 0
														? "mint.fg"
														: "fg"
												}
											>
												+{resolveRank * 15}%
											</Text>
											<Text
												fontSize="10px"
												color="fg.muted"
											>
												{resolveRank > 0
													? `+${resolveRank * 15}% streak boost`
													: "Rank 0 (Base 1.0x)"}
											</Text>
										</Box>

										<Box {...glassCard} p={3} bg="bg.panel">
											<HStack
												justify="space-between"
												color="fg.muted"
												mb={1}
											>
												<Text
													fontSize="10px"
													fontWeight="semibold"
													textTransform="uppercase"
												>
													Finance EXP
												</Text>
												<Icon
													as={LuTrendingUp}
													boxSize={3.5}
													color="mint.fg"
												/>
											</HStack>
											<Text
												fontSize="lg"
												fontWeight="bold"
												color={
													ledgerRank > 0
														? "mint.fg"
														: "fg"
												}
											>
												+{ledgerRank * 10}%
											</Text>
											<Text
												fontSize="10px"
												color="fg.muted"
											>
												{ledgerRank > 0
													? `+${ledgerRank * 10}% monthly exp`
													: "Rank 0 (Base 1.0x)"}
											</Text>
										</Box>

										<Box {...glassCard} p={3} bg="bg.panel">
											<HStack
												justify="space-between"
												color="fg.muted"
												mb={1}
											>
												<Text
													fontSize="10px"
													fontWeight="semibold"
													textTransform="uppercase"
												>
													Shop Discount
												</Text>
												<Icon
													as={LuShoppingBag}
													boxSize={3.5}
													color="mint.fg"
												/>
											</HStack>
											<Text
												fontSize="lg"
												fontWeight="bold"
												color={
													bargainRank > 0
														? "mint.fg"
														: "fg"
												}
											>
												-{bargainRank * 5}%
											</Text>
											<Text
												fontSize="10px"
												color="fg.muted"
											>
												{bargainRank > 0
													? `-${bargainRank * 5}% shop price`
													: "Rank 0 (Full price)"}
											</Text>
										</Box>

										<Box {...glassCard} p={3} bg="bg.panel">
											<HStack
												justify="space-between"
												color="fg.muted"
												mb={1}
											>
												<Text
													fontSize="10px"
													fontWeight="semibold"
													textTransform="uppercase"
												>
													Second Wind
												</Text>
												<Icon
													as={LuShield}
													boxSize={3.5}
													color="mint.fg"
												/>
											</HStack>
											<Text
												fontSize="lg"
												fontWeight="bold"
												color={
													secondWindRank > 0
														? "mint.fg"
														: "fg.muted"
												}
											>
												{secondWindRank > 0
													? "Active"
													: "Inactive"}
											</Text>
											<Text
												fontSize="10px"
												color="fg.muted"
											>
												{secondWindRank > 0
													? "Streak auto-shield (14d)"
													: "Rank 0 (0/1)"}
											</Text>
										</Box>
									</SimpleGrid>
								</Stack>

								{/* Perk Tree */}
								<Stack gap={3}>
									<HStack justify="space-between">
										<Stack gap={0.5}>
											<Heading size="md">
												Talent Perk Tree
											</Heading>
											<Text
												fontSize="xs"
												color="fg.muted"
											>
												Spend skill points earned from
												leveling up to activate
												permanent multipliers.
											</Text>
										</Stack>
										<Badge
											size="sm"
											rounded="pill"
											variant="surface"
											colorPalette={
												player.skill_points > 0
													? "mint"
													: "gray"
											}
										>
											{player.skill_points} Points
											Available
										</Badge>
									</HStack>

									<Box {...glassCard}>
										<Grid
											gap={3.5}
											templateColumns={{
												base: "1fr",
												sm: "repeat(2, 1fr)",
												lg: "repeat(4, 1fr)",
											}}
										>
											{PERK_DEFS.map((def) => {
												const owned = perks.find(
													(perk) =>
														perk.perk_id === def.id,
												);
												const rank = owned?.rank ?? 0;
												const atMax = rank >= def.max;
												const disabled =
													atMax ||
													player.skill_points === 0 ||
													pendingPerk === def.id;

												return (
													<Box
														key={def.id}
														p={4}
														rounded="card"
														bg="bg.panel"
														borderWidth="1px"
														borderColor="border.glass"
														transition="all 0.15s ease-out"
														_hover={{
															transform:
																"translateY(-1px)",
															shadow: "glass",
														}}
													>
														<Stack
															gap={3}
															h="full"
															justify="space-between"
														>
															<Stack gap={2}>
																<HStack justify="space-between">
																	<Text
																		fontWeight="bold"
																		fontSize="sm"
																	>
																		{
																			def.label
																		}
																	</Text>
																	<Badge
																		size="xs"
																		rounded="pill"
																		variant={
																			atMax
																				? "solid"
																				: "subtle"
																		}
																		colorPalette={
																			atMax
																				? "mint"
																				: "gray"
																		}
																	>
																		{rank}/
																		{
																			def.max
																		}
																	</Badge>
																</HStack>

																{/* Visual Rank Bar */}
																<Box
																	h="1.5"
																	rounded="pill"
																	bg="bg.muted"
																	overflow="hidden"
																>
																	<Box
																		h="full"
																		w={`${(rank / def.max) * 100}%`}
																		bg="mint.solid"
																		rounded="pill"
																	/>
																</Box>

																<Text
																	fontSize="xs"
																	color="fg.muted"
																	lineHeight="tall"
																>
																	{
																		def.description
																	}
																</Text>

																{/* Current vs Next Stats Breakdown */}
																<Stack
																	gap={1}
																	p={2}
																	rounded="xl"
																	bg="bg.muted"
																	fontSize="11px"
																>
																	<HStack justify="space-between">
																		<Text color="fg.muted">
																			Current:
																		</Text>
																		<Text
																			fontWeight="bold"
																			color={
																				rank >
																				0
																					? "mint.fg"
																					: "fg.muted"
																			}
																		>
																			{getPerkCurrentEffect(
																				def.id,
																				rank,
																			)}
																		</Text>
																	</HStack>
																	{!atMax && (
																		<HStack justify="space-between">
																			<Text color="fg.muted">
																				Next
																				rank:
																			</Text>
																			<Text
																				fontWeight="semibold"
																				color="fg"
																			>
																				{getPerkUpgradeGain(
																					def.id,
																				)}
																			</Text>
																		</HStack>
																	)}
																</Stack>
															</Stack>

															<PillButton
																size="xs"
																variant={
																	atMax
																		? "outline"
																		: "dark"
																}
																w="full"
																disabled={
																	disabled
																}
																loading={
																	pendingPerk ===
																	def.id
																}
																onClick={() =>
																	confirmSpendPerk.ask(
																		def.id,
																	)
																}
															>
																{atMax
																	? "Max Rank"
																	: player.skill_points ===
																		  0
																		? "0 Skill Points"
																		: `Upgrade (+${getPerkUpgradeGain(def.id)})`}
															</PillButton>
														</Stack>
													</Box>
												);
											})}
										</Grid>
									</Box>
								</Stack>
							</Stack>
						)}

						{activeSection === "shop" && (
							<ShopSection player={player} />
						)}

						{activeSection === "inventory" && (
							<InventoryAndClaimsSection
								player={player}
								activeBuffs={active_buffs}
								avatar={summary.avatar}
							/>
						)}
					</Box>
				</Grid>
			</Stack>

			{/* Ledger History Modal */}
			<LedgerModal
				open={ledgerOpen}
				onOpenChange={setLedgerOpen}
			/>

			{/* Wardrobe & Perk Customization Modal */}
			<WardrobeModal
				open={wardrobeOpen}
				onOpenChange={setWardrobeOpen}
				player={player}
				summary={summary}
				cosmetics={cosmetics}
				equipped={equippedCosmetics}
			/>

			{/* Confirm Spend Perk Dialog */}
			<ConfirmDialog
				open={confirmSpendPerk.open}
				onOpenChange={confirmSpendPerk.onOpenChange}
				title="Upgrade Talent Perk"
				description={`Spend 1 skill point to upgrade ${PERK_DEFS.find((p) => p.id === confirmSpendPerk.target)?.label}?`}
				confirmLabel="Upgrade"
				loading={spendPerk.isPending}
				onConfirm={() =>
					confirmSpendPerk.target &&
					handleSpend(confirmSpendPerk.target)
				}
			/>

			{/* Ascend Modal */}
			<DialogRoot
				open={ascendOpen}
				onOpenChange={(e) => setAscendOpen(e.open)}
			>
				<DialogContent
					maxW="md"
					rounded="2xl"
					bg="bg.panel"
					borderWidth="1px"
					borderColor="border.glass"
				>
					<DialogHeader>
						<DialogTitle>Ascend Hero</DialogTitle>
						<DialogDescription fontSize="xs" color="fg.muted">
							Reach higher power tiers through ascension.
						</DialogDescription>
					</DialogHeader>
					<DialogBody>
						<Text fontSize="sm" color="fg.muted" lineHeight="tall">
							Ascending resets your hero level to 1, but
							permanently increases your base stats multiplier and
							awards 5 bonus skill points.
						</Text>
					</DialogBody>
					<DialogFooter>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setAscendOpen(false)}
						>
							Cancel
						</Button>
						<PillButton
							variant="dark"
							icon={LuArrowUp}
							loading={ascend.isPending}
							onClick={handleAscend}
						>
							Ascend Now
						</PillButton>
					</DialogFooter>
					<DialogCloseTrigger />
				</DialogContent>
			</DialogRoot>
		</Container>
	);
};

// ---------------------------------------------------------------------------
// Ledger History Modal
// ---------------------------------------------------------------------------

interface LedgerModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const LedgerModal: React.FC<LedgerModalProps> = ({ open, onOpenChange }) => {
	const [page, setPage] = useState(1);
	const { data: ledger, isLoading } = useLedger(page, 10);

	return (
		<DialogRoot
			open={open}
			onOpenChange={(details) => onOpenChange(details.open)}
			placement="center"
		>
			<DialogContent
				maxW="3xl"
				rounded="2xl"
				bg="bg.panel"
				borderWidth="1px"
				borderColor="border.glass"
				shadow="float"
				p={{ base: 4, md: 6 }}
			>
				<DialogHeader pb={2}>
					<Stack gap={0.5}>
						<DialogTitle fontSize="lg">
							EXP & PX Award Ledger
						</DialogTitle>
						<DialogDescription fontSize="xs" color="fg.muted">
							Full audit history of all quest completions, health
							rewards, streaks, and purchases.
						</DialogDescription>
					</Stack>
				</DialogHeader>

				<DialogBody py={3} maxH="60vh" overflowY="auto">
					{isLoading ? (
						<Stack gap={2}>
							{[0, 1, 2, 3, 4].map((i) => (
								<Skeleton key={i} h="14" rounded="card" />
							))}
						</Stack>
					) : !ledger || ledger.entries.length === 0 ? (
						<EmptyState
							title="No ledger entries found"
							description="Complete quests or earn rewards to populate your ledger."
							icon={<Icon as={LuClipboardList} boxSize={6} />}
						/>
					) : (
						<Stack gap={2.5}>
							{ledger.entries.map((entry) => (
								<Box
									key={entry.id}
									p={3.5}
									rounded="card"
									bg="bg.muted"
									borderWidth="1px"
									borderColor="border.glass"
								>
									<Flex
										justify="space-between"
										align="center"
										wrap="wrap"
										gap={2}
									>
										<Stack gap={0.5}>
											<HStack gap={2}>
												<Badge
													size="xs"
													rounded="pill"
													variant="subtle"
													colorPalette={
														entry.source ===
														"quest"
															? "mint"
															: entry.source ===
																  "shop"
																? "amber"
																: "blue"
													}
												>
													{entry.source}
												</Badge>
												<Text
													fontSize="xs"
													fontWeight="semibold"
												>
													{entry.reason ||
														"Reward Award"}
												</Text>
											</HStack>
											<HStack
												gap={2}
												fontSize="10px"
												color="fg.muted"
											>
												<Text>{entry.occurred_on}</Text>
												{entry.decay_factor < 1 && (
													<Text>
														Decay:{" "}
														{Math.round(
															entry.decay_factor *
																100,
														)}
														%
													</Text>
												)}
												{entry.multiplier > 1 && (
													<Text>
														Multiplier:{" "}
														{entry.multiplier}x
													</Text>
												)}
											</HStack>
										</Stack>

										<HStack gap={3}>
											{entry.exp_delta !== 0 && (
												<Text
													fontSize="xs"
													fontWeight="bold"
													color={
														entry.exp_delta > 0
															? "mint.fg"
															: "red.500"
													}
												>
													{entry.exp_delta > 0
														? `+${entry.exp_delta}`
														: entry.exp_delta}{" "}
													EXP
												</Text>
											)}
											{entry.px_delta !== 0 && (
												<Text
													fontSize="xs"
													fontWeight="bold"
													color={
														entry.px_delta > 0
															? "amber.fg"
															: "red.500"
													}
												>
													{entry.px_delta > 0
														? `+${entry.px_delta}`
														: entry.px_delta}{" "}
													PX
												</Text>
											)}
										</HStack>
									</Flex>
								</Box>
							))}
						</Stack>
					)}
				</DialogBody>

				<DialogFooter pt={3} justify="space-between">
					<HStack gap={2}>
						<Button
							size="xs"
							variant="outline"
							rounded="pill"
							disabled={page <= 1}
							onClick={() =>
								setPage((p) => Math.max(1, p - 1))
							}
						>
							Previous
						</Button>
						<Text fontSize="xs" color="fg.muted">
							Page {page} of {ledger?.total_pages || 1}
						</Text>
						<Button
							size="xs"
							variant="outline"
							rounded="pill"
							disabled={
								!ledger || page >= ledger.total_pages
							}
							onClick={() => setPage((p) => p + 1)}
						>
							Next
						</Button>
					</HStack>

					<Button
						size="xs"
						variant="ghost"
						rounded="pill"
						onClick={() => onOpenChange(false)}
					>
						Close
					</Button>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
};

// ---------------------------------------------------------------------------
// Wardrobe & Perk Customization Modal (30+ Pixel Rabbit Customizations)
// ---------------------------------------------------------------------------

interface WardrobeModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	player: Player;
	summary?: PlayerSummary;
	cosmetics?: ShopItem[];
	equipped: Partial<Record<AvatarSlot, string>>;
}

interface CustomizationDef {
	slot: AvatarSlot;
	id: string;
	name: string;
	description: string;
	requiredPerk?: PerkID;
}

const WARDROBE_CUSTOMIZATIONS: CustomizationDef[] = [
	// Hats (11)
	{
		slot: "head",
		id: "top_hat",
		name: "Classic Top Hat",
		description: "Formal gentleman's top hat with crimson ribbon",
	},
	{
		slot: "head",
		id: "wizard_hat",
		name: "Arcane Wizard Hat",
		description: "Pointy wizard hat with glowing pixel stars",
	},
	{
		slot: "head",
		id: "golden_crown",
		name: "Imperial Golden Crown",
		description: "Royal 24k crown set with ruby gem",
		requiredPerk: "diligence",
	},
	{
		slot: "head",
		id: "party_hat",
		name: "Celebration Party Hat",
		description: "Cone party hat with golden pom-pom",
	},
	{
		slot: "head",
		id: "viking_helm",
		name: "Viking Horned Helm",
		description: "Sturdy iron helmet with curved ivory horns",
	},
	{
		slot: "head",
		id: "pirate_hat",
		name: "Pirate Tricorn",
		description: "Weathered buccaneer hat with skull badge",
	},
	{
		slot: "head",
		id: "chef_toque",
		name: "Chef's Toque",
		description: "Crisp tall white chef puff hat",
	},
	{
		slot: "head",
		id: "head_sprout",
		name: "Sprout of Vitality",
		description: "Single living leaf sprout on head",
		requiredPerk: "vitality",
	},
	{
		slot: "head",
		id: "halo",
		name: "Immortal Angel Halo",
		description: "Luminous floating golden angel halo",
		requiredPerk: "second_wind",
	},
	{
		slot: "head",
		id: "devil_horns",
		name: "Warrior Devil Horns",
		description: "Crimson pixel warrior horns",
		requiredPerk: "resolve",
	},
	{
		slot: "head",
		id: "cyber_headset",
		name: "DJ Cyber Headset",
		description: "Neon cyan gamer headphones across ears",
		requiredPerk: "deep_focus",
	},

	// Glasses & Eyewear (7)
	{
		slot: "glasses",
		id: "pixel_shades",
		name: "Pixel Shades",
		description: "Thug life 8-bit black deal-with-it shades",
	},
	{
		slot: "glasses",
		id: "vr_visor",
		name: "Focus VR Visor",
		description: "Neon cyan glowing cybernetic VR visor",
		requiredPerk: "deep_focus",
	},
	{
		slot: "glasses",
		id: "classic_glasses",
		name: "Scholar Specs",
		description: "Round silver wireframe nerd spectacles",
	},
	{
		slot: "glasses",
		id: "monocle",
		name: "Scholar Monocle",
		description: "Golden monocle with hanging cord",
		requiredPerk: "ledger",
	},
	{
		slot: "glasses",
		id: "eye_patch",
		name: "Pirate Eye Patch",
		description: "Tough leather buccaneer patch",
	},
	{
		slot: "glasses",
		id: "blush",
		name: "Anime Blush",
		description: "Kawaii pink blush cheeks",
		requiredPerk: "bargain",
	},
	{
		slot: "glasses",
		id: "sleep_mask",
		name: "Night Sleep Mask",
		description: "Restorative deep sleep eye mask",
	},

	// Accessories & Body (7)
	{
		slot: "accessory",
		id: "bell_collar",
		name: "Bell Collar",
		description: "Small golden bell on red band",
	},
	{
		slot: "accessory",
		id: "bow_tie",
		name: "Dapper Bowtie",
		description: "Crisp crimson satin bow-tie",
	},
	{
		slot: "accessory",
		id: "gold_chain",
		name: "24k Gold Chain",
		description: "Heavy gold link chain with medallion",
		requiredPerk: "merchant",
	},
	{
		slot: "accessory",
		id: "scarf",
		name: "Winter Scarf",
		description: "Warm forest green knitted wool scarf",
	},
	{
		slot: "accessory",
		id: "cape",
		name: "Hero's Cape",
		description: "Flowing crimson superhero cape",
		requiredPerk: "resolve",
	},
	{
		slot: "accessory",
		id: "backpack",
		name: "Adventure Backpack",
		description: "Leather expedition rucksack on back",
	},
	{
		slot: "accessory",
		id: "guitar",
		name: "Electric Guitar",
		description: "Rockstar axe slung across back",
	},

	// Skins & Fur Colors (8)
	{
		slot: "skin",
		id: "obsidian",
		name: "Obsidian Black",
		description: "Pitch black classic 8-bit rabbit (Default)",
	},
	{
		slot: "skin",
		id: "ghost_white",
		name: "Ghost White",
		description: "Pure moonlit phantom fur with dark eyes",
	},
	{
		slot: "skin",
		id: "cyber_neon",
		name: "Cyber Matrix Cyan",
		description: "Electrified neon cyan matrix rabbit",
	},
	{
		slot: "skin",
		id: "golden_rabbit",
		name: "24k Midas Solid Gold",
		description: "Pure solid 24k shimmering gold skin",
		requiredPerk: "merchant",
	},
	{
		slot: "skin",
		id: "sakura_pink",
		name: "Sakura Blossom Pink",
		description: "Soft pastel flower petal fur",
	},
	{
		slot: "skin",
		id: "crimson_shadow",
		name: "Blood Moon Crimson",
		description: "Deep dark crimson shadow rabbit",
	},
	{
		slot: "skin",
		id: "emerald_jade",
		name: "Mystic Jade Emerald",
		description: "Gemstone jade green rabbit",
	},
	{
		slot: "skin",
		id: "royal_purple",
		name: "Cosmic Royal Amethyst",
		description: "Regal cosmic violet space rabbit",
	},
];

const WardrobeModal: React.FC<WardrobeModalProps> = ({
	open,
	onOpenChange,
	player,
	summary,
	cosmetics = [],
	equipped,
}) => {
	const [activeTab, setActiveTab] = useState<string>("head");
	const [previewSlots, setPreviewSlots] =
		useState<Partial<Record<AvatarSlot, string>>>(equipped);
	const useItem = useUseInventoryItem();
	const { data: inventory = [] } = useInventory();

	// Keep previewSlots synced when modal opens
	React.useEffect(() => {
		if (open) {
			setPreviewSlots(equipped);
		}
	}, [open, equipped]);

	const playerPerkMap = useMemo(() => {
		const res = new Map<PerkID, number>();
		summary?.perks?.forEach((p) => {
			res.set(p.perk_id, p.rank);
		});
		return res;
	}, [summary?.perks]);

	const isItemUnlocked = (item: CustomizationDef): boolean => {
		if (!item.requiredPerk) return true;
		const rank = playerPerkMap.get(item.requiredPerk) || 0;
		return rank > 0;
	};

	const handleToggleSlot = async (item: CustomizationDef) => {
		const isCurrentlyEquipped = previewSlots[item.slot] === item.id;
		const nextSlots = { ...previewSlots };

		if (isCurrentlyEquipped) {
			delete nextSlots[item.slot];
		} else {
			nextSlots[item.slot] = item.id;
		}
		setPreviewSlots(nextSlots);

		// If this item corresponds to an inventory cosmetic, trigger backend equip/unequip
		const shopItem = cosmetics.find(
			(c) => c.slot === `${item.slot}:${item.id}`,
		);
		if (shopItem) {
			const invItem = inventory.find(
				(i) => i.shop_item_id === shopItem.id,
			);
			if (invItem) {
				try {
					await useItem.mutateAsync(invItem.id);
					toaster.create({
						title: isCurrentlyEquipped
							? `Unequipped ${item.name}`
							: `Equipped ${item.name}!`,
						type: "success",
					});
				} catch (err) {
					toaster.create({
						title: "Failed to equip item",
						description:
							err instanceof ApiError ? err.message : undefined,
						type: "error",
					});
				}
			}
		} else if (item.requiredPerk) {
			toaster.create({
				title: isCurrentlyEquipped
					? `Unequipped ${item.name}`
					: `Equipped Perk Cosmetic: ${item.name}!`,
				type: "success",
			});
		}
	};

	const categories = [
		{ id: "head", label: "Hats (11)", icon: LuCrown },
		{ id: "glasses", label: "Glasses (7)", icon: LuGlasses },
		{ id: "accessory", label: "Accessories (7)", icon: LuShirt },
		{ id: "skin", label: "Skins (8)", icon: LuPalette },
		{ id: "perks", label: "Perk Mastery (8)", icon: LuSparkles },
	];

	return (
		<DialogRoot
			open={open}
			onOpenChange={(details) => onOpenChange(details.open)}
			placement="center"
		>
			<DialogContent
				maxW="4xl"
				rounded="2xl"
				bg="bg.panel"
				borderWidth="1px"
				borderColor="border.glass"
				shadow="float"
				p={{ base: 4, md: 6 }}
			>
				<DialogHeader pb={2}>
					<Stack gap={0.5}>
						<DialogTitle fontSize="lg">
							Wardrobe & Perk Customization
						</DialogTitle>
						<DialogDescription fontSize="xs" color="fg.muted">
							Equip pixel-art hats, glasses, skins, and unlock exclusive
							perk prestige customizations for your 13×13 rabbit.
						</DialogDescription>
					</Stack>
				</DialogHeader>

				<DialogBody py={3} maxH="65vh" overflowY="auto">
					<Grid
						templateColumns={{ base: "1fr", md: "240px 1fr" }}
						gap={6}
						alignItems="start"
					>
						{/* Left: Live Rabbit Avatar Preview */}
						<Box
							p={4}
							rounded="card"
							bg="bg.muted"
							borderWidth="1px"
							borderColor="border.glass"
							textAlign="center"
						>
							<Stack align="center" gap={3}>
								<Text
									fontSize="xs"
									fontWeight="bold"
									textTransform="uppercase"
									letterSpacing="0.06em"
									color="fg.muted"
								>
									Live 13×13 Preview
								</Text>
								<Box
									p={3}
									rounded="xl"
									bg="bg.panel"
									borderWidth="1px"
									borderColor="border.glass"
									boxSize="130px"
									display="flex"
									alignItems="center"
									justifyContent="center"
								>
									<HeroAvatar
										size={96}
										animated
										slots={previewSlots}
									/>
								</Box>
								<Badge
									size="xs"
									rounded="pill"
									colorPalette="mint"
									variant="subtle"
								>
									Level {player.level} Rabbit
								</Badge>

								{/* Active Equipment Badges */}
								<Stack gap={1} w="full" pt={2} textAlign="left">
									<Text
										fontSize="10px"
										fontWeight="bold"
										color="fg.muted"
									>
										EQUIPPED SLOTS
									</Text>
									<HStack wrap="wrap" gap={1}>
										{Object.entries(previewSlots).map(
											([slot, id]) => (
												<Badge
													key={slot}
													size="xs"
													rounded="pill"
													variant="outline"
												>
													{slot}: {id}
												</Badge>
											),
										)}
									</HStack>
								</Stack>
							</Stack>
						</Box>

						{/* Right: Category Tabs & Customization Grid */}
						<Stack gap={3}>
							{/* Category Navigation Pills */}
							<HStack wrap="wrap" gap={1.5}>
								{categories.map((cat) => (
									<Button
										key={cat.id}
										size="xs"
										rounded="pill"
										variant={
											activeTab === cat.id
												? "solid"
												: "outline"
										}
										colorPalette={
											activeTab === cat.id
												? "mint"
												: undefined
										}
										onClick={() => setActiveTab(cat.id)}
									>
										<HStack gap={1.5}>
											<Icon as={cat.icon} boxSize={3.5} />
											<Text>{cat.label}</Text>
										</HStack>
									</Button>
								))}
							</HStack>

							{/* Perk Mastery Tab */}
							{activeTab === "perks" ? (
								<SimpleGrid columns={{ base: 1, sm: 2 }} gap={2.5}>
									{Object.entries(PERK_COSMETIC_MAP).map(
										([perkKey, pDef]) => {
											const perkId = perkKey as PerkID;
											const perkRank =
												playerPerkMap.get(perkId) || 0;
											const isUnlocked = perkRank > 0;
											const isEquipped =
												previewSlots[pDef.slot] ===
												pDef.itemId;

											return (
												<Box
													key={perkId}
													p={3}
													rounded="card"
													bg="bg.muted"
													borderWidth="1px"
													borderColor={
														isEquipped
															? "mint.fg"
															: "border.glass"
													}
												>
													<Stack
														gap={2}
														justify="space-between"
														h="full"
													>
														<Stack gap={1}>
															<HStack justify="space-between">
																<HStack gap={1.5}>
																	<Icon
																		as={
																			pDef.icon
																		}
																		boxSize={
																			4
																		}
																		color={
																			isUnlocked
																				? "mint.fg"
																				: "fg.muted"
																		}
																	/>
																	<Text
																		fontWeight="bold"
																		fontSize="xs"
																	>
																		{
																			pDef.name
																		}
																	</Text>
																</HStack>
																<Badge
																	size="xs"
																	rounded="pill"
																	colorPalette={
																		isUnlocked
																			? "mint"
																			: "gray"
																	}
																	variant="subtle"
																>
																	{isUnlocked
																		? `Rank ${perkRank}`
																		: "Locked"}
																</Badge>
															</HStack>
															<Text
																fontSize="11px"
																color="fg.muted"
															>
																{
																	pDef.description
																}
															</Text>
														</Stack>

														<Button
															size="xs"
															rounded="pill"
															variant={
																isEquipped
																	? "solid"
																	: "outline"
															}
															colorPalette={
																isEquipped
																	? "mint"
																	: undefined
															}
															disabled={!isUnlocked}
															onClick={() =>
																handleToggleSlot({
																	slot: pDef.slot,
																	id: pDef.itemId,
																	name: pDef.name,
																	description:
																		pDef.description,
																	requiredPerk:
																		perkId,
																})
															}
														>
															{!isUnlocked
																? "Unlock in Skill Tree"
																: isEquipped
																	? "Unequip"
																	: "Equip to Rabbit"}
														</Button>
													</Stack>
												</Box>
											);
										},
									)}
								</SimpleGrid>
							) : (
								<SimpleGrid columns={{ base: 1, sm: 2 }} gap={2.5}>
									{WARDROBE_CUSTOMIZATIONS.filter(
										(item) => item.slot === activeTab,
									).map((item) => {
										const isUnlocked = isItemUnlocked(item);
										const isEquipped =
											previewSlots[item.slot] === item.id;

										return (
											<Box
												key={item.id}
												p={3}
												rounded="card"
												bg="bg.muted"
												borderWidth="1px"
												borderColor={
													isEquipped
														? "mint.fg"
														: "border.glass"
												}
											>
												<Stack
													gap={2}
													justify="space-between"
													h="full"
												>
													<Stack gap={1}>
														<HStack justify="space-between">
															<Text
																fontWeight="bold"
																fontSize="xs"
															>
																{item.name}
															</Text>
															{isEquipped && (
																<Badge
																	size="xs"
																	rounded="pill"
																	colorPalette="mint"
																	variant="solid"
																>
																	Equipped
																</Badge>
															)}
															{item.requiredPerk &&
																!isUnlocked && (
																	<Badge
																		size="xs"
																		rounded="pill"
																		variant="subtle"
																	>
																		Perk:{" "}
																		{
																			item.requiredPerk
																		}
																	</Badge>
																)}
														</HStack>
														<Text
															fontSize="11px"
															color="fg.muted"
														>
															{item.description}
														</Text>
													</Stack>

													<Button
														size="xs"
														rounded="pill"
														variant={
															isEquipped
																? "solid"
																: "outline"
														}
														colorPalette={
															isEquipped
																? "mint"
																: undefined
														}
														disabled={!isUnlocked}
														onClick={() =>
															handleToggleSlot(
																item,
															)
														}
													>
														{!isUnlocked
															? "Locked by Perk"
															: isEquipped
																? "Unequip"
																: "Equip"}
													</Button>
												</Stack>
											</Box>
										);
									})}
								</SimpleGrid>
							)}
						</Stack>
					</Grid>
				</DialogBody>

				<DialogFooter pt={3}>
					<Button
						size="xs"
						variant="ghost"
						rounded="pill"
						onClick={() => onOpenChange(false)}
					>
						Close
					</Button>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
};

// ---------------------------------------------------------------------------
// Shop Section with Sliding Tabs and Bottom Sheet Reward Creator
// ---------------------------------------------------------------------------

interface ShopSectionProps {
	player: Player;
}

const ShopSection: React.FC<ShopSectionProps> = ({ player }) => {
	const [shopTab, setShopTab] = useState<string>("reward");
	const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);

	// New Reward Form State
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
			setIsAddRewardOpen(false);
		} catch (err) {
			handleFormApiError(err, setError);
		}
	};

	return (
		<Stack gap={5}>
			<Flex justify="space-between" align="center" wrap="wrap" gap={3}>
				<Stack gap={0.5}>
					<Heading size="lg">Reward Shop</Heading>
					<Text fontSize="xs" color="fg.muted">
						Redeem PX points for real-life self-rewards, powerful
						consumables, and cyber cosmetics.
					</Text>
				</Stack>

				<HStack gap={3} wrap="wrap">
					{/* Sliding Cyber-Pill Tabs with Tabs.Indicator */}
					<Tabs.Root
						value={shopTab}
						onValueChange={(details) =>
							details.value && setShopTab(details.value)
						}
						variant="plain"
						size="sm"
					>
						<Tabs.List
							bg="bg.panel"
							borderWidth="1px"
							borderColor="border.glass"
							rounded="pill"
							p={1}
							position="relative"
							gap={1}
						>
							<Tabs.Trigger
								value="reward"
								rounded="pill"
								px={4}
								py={1.5}
								fontSize="xs"
								fontWeight="bold"
								_selected={{
									bg: "bg.inverted",
									color: "fg.inverted",
								}}
							>
								<HStack gap={1.5}>
									<Icon as={LuGift} boxSize={3.5} />
									<Text>Real-World</Text>
								</HStack>
							</Tabs.Trigger>

							<Tabs.Trigger
								value="consumable"
								rounded="pill"
								px={4}
								py={1.5}
								fontSize="xs"
								fontWeight="bold"
								_selected={{
									bg: "bg.inverted",
									color: "fg.inverted",
								}}
							>
								<HStack gap={1.5}>
									<Icon as={LuSparkles} boxSize={3.5} />
									<Text>Consumables</Text>
								</HStack>
							</Tabs.Trigger>

							<Tabs.Trigger
								value="cosmetic"
								rounded="pill"
								px={4}
								py={1.5}
								fontSize="xs"
								fontWeight="bold"
								_selected={{
									bg: "bg.inverted",
									color: "fg.inverted",
								}}
							>
								<HStack gap={1.5}>
									<Icon as={LuShirt} boxSize={3.5} />
									<Text>Cosmetics</Text>
								</HStack>
							</Tabs.Trigger>
						</Tabs.List>
					</Tabs.Root>

					{/* Bottom Sheet Dialog Trigger Button for Reward Creation */}
					<PillButton
						variant="dark"
						icon={LuPlus}
						onClick={() => setIsAddRewardOpen(true)}
					>
						New Reward
					</PillButton>
				</HStack>
			</Flex>

			{shopTab === "reward" && (
				<Stack gap={6}>
					<CatalogGrid kind="reward" player={player} />
				</Stack>
			)}

			{shopTab === "consumable" && (
				<Stack gap={6}>
					<CatalogGrid kind="consumable" player={player} />
				</Stack>
			)}

			{shopTab === "cosmetic" && (
				<Stack gap={6}>
					<CatalogGrid kind="cosmetic" player={player} />
				</Stack>
			)}

			{/* Chakra Bottom Sheet Dialog for Creating Custom Rewards */}
			<DialogRoot
				open={isAddRewardOpen}
				onOpenChange={(details) => setIsAddRewardOpen(details.open)}
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
								Create Custom Real-World Reward
							</DialogTitle>
							<DialogDescription fontSize="xs" color="fg.muted">
								Define an offline reward incentive and price it
								in PX points.
							</DialogDescription>
						</Stack>
					</DialogHeader>

					<DialogBody py={3}>
						<form
							id="create-reward-form"
							noValidate
							onSubmit={handleSubmit(onSubmitReward)}
						>
							<Stack gap={3.5}>
								{errors.root?.message && (
									<Text color="red.500" fontSize="xs">
										{errors.root.message}
									</Text>
								)}

								<Field
									label="Reward Name"
									required
									invalid={Boolean(errors.title)}
									errorText={errors.title?.message}
								>
									<Input
										placeholder="e.g. Seiko Automatic Watch / Omakase Dinner"
										{...register("title")}
										rounded="pill"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
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
										label="Real-Life Cost (Optional)"
										invalid={Boolean(errors.currency_cost)}
										errorText={
											errors.currency_cost?.message
										}
									>
										<Input
											type="number"
											min={0}
											placeholder="4500"
											{...register("currency_cost", {
												valueAsNumber: true,
											})}
											rounded="pill"
											bg="bg.muted"
											borderColor="border"
											fontSize="sm"
										/>
									</Field>

									<Field
										label="Currency"
										required
										invalid={Boolean(
											errors.currency_symbol,
										)}
										errorText={
											errors.currency_symbol?.message
										}
									>
										<SearchableSelect
											items={CURRENCY_OPTIONS}
											value={currency}
											onValueChange={(val) =>
												setValue(
													"currency_symbol",
													val,
													{ shouldValidate: true },
												)
											}
											placeholder="Select currency..."
											searchPlaceholder="Search currency..."
										/>
									</Field>
								</Grid>

								<Field
									label="Price (PX Points)"
									required
									invalid={Boolean(errors.cost_px)}
									errorText={errors.cost_px?.message}
								>
									<Input
										type="number"
										min={1}
										placeholder="1000"
										{...register("cost_px", {
											valueAsNumber: true,
										})}
										rounded="pill"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
									/>
								</Field>

								{suggestion &&
									suggestion > 0 &&
									realCost &&
									realCost > 0 && (
										<HStack
											justify="space-between"
											p={3}
											rounded="card"
											bg="bg.panel"
											borderWidth="1px"
											borderColor="border.glass"
										>
											<HStack gap={2}>
												<Icon
													as={LuSparkles}
													boxSize={3.5}
													color="mint.fg"
												/>
												<Text
													fontSize="xs"
													color="fg.muted"
												>
													Suggested price based on{" "}
													{realCost} {currency}:{" "}
													<strong>
														{suggestion} PX
													</strong>
												</Text>
											</HStack>
											<Button
												size="xs"
												variant="ghost"
												rounded="pill"
												onClick={handleApplySuggested}
											>
												Apply
											</Button>
										</HStack>
									)}

								<Field
									label="Description (Optional)"
									invalid={Boolean(errors.description)}
									errorText={errors.description?.message}
								>
									<Textarea
										placeholder="Add notes or goals attached to this reward..."
										{...register("description")}
										rounded="card"
										bg="bg.muted"
										borderColor="border"
										fontSize="sm"
										rows={2}
									/>
								</Field>

								<Field label="Reward Expiration">
									<Stack gap={2.5}>
										<HStack justify="space-between">
											<Text
												fontSize="xs"
												color="fg.muted"
											>
												Set an expiration period for
												this voucher
											</Text>
											<Button
												type="button"
												size="xs"
												rounded="pill"
												variant={
													hasExpiration
														? "solid"
														: "outline"
												}
												colorPalette={
													hasExpiration
														? "mint"
														: undefined
												}
												onClick={() =>
													setHasExpiration(
														!hasExpiration,
													)
												}
											>
												{hasExpiration
													? "Expires Enabled"
													: "No Expiration"}
											</Button>
										</HStack>

										{hasExpiration && (
											<HStack gap={2}>
												<Input
													type="number"
													min={1}
													max={365}
													value={expiryDays}
													onChange={(e) =>
														setExpiryDays(
															Number(
																e.target.value,
															) || 30,
														)
													}
													rounded="pill"
													bg="bg.muted"
													borderColor="border"
													fontSize="sm"
													w="100px"
												/>
												<Text
													fontSize="xs"
													color="fg.muted"
												>
													days from purchase before
													expiration
												</Text>
											</HStack>
										)}
									</Stack>
								</Field>
							</Stack>
						</form>
					</DialogBody>

					<DialogFooter pt={3}>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsAddRewardOpen(false)}
						>
							Cancel
						</Button>
						<PillButton
							type="submit"
							form="create-reward-form"
							variant="dark"
							icon={LuPlus}
							loading={createItem.isPending || isSubmitting}
						>
							Create Reward
						</PillButton>
					</DialogFooter>

					<DialogCloseTrigger />
				</DialogContent>
			</DialogRoot>
		</Stack>
	);
};

// ---------------------------------------------------------------------------
// Inventory & Claims Section Component
// ---------------------------------------------------------------------------

interface InventoryAndClaimsSectionProps {
	player: Player;
	activeBuffs: Buff[];
	avatar?: Avatar;
}

const InventoryAndClaimsSection: React.FC<InventoryAndClaimsSectionProps> = ({
	player,
	activeBuffs,
	avatar,
}) => {
	const [now, setNow] = React.useState(() => Date.now());

	React.useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(interval);
	}, []);

	const { data: inventory, isLoading: invLoading } = useInventory();
	const { data: claims, isLoading: claimsLoading } = useClaims();
	const { data: allCatalog } = useShopCatalog();
	const useItem = useUseInventoryItem();
	const redeemClaim = useRedeemClaim();

	const confirmUseItem = useConfirm<string>();
	const confirmRedeem = useConfirm<string>();

	const handleUseItemConfirm = async () => {
		if (!confirmUseItem.target) return;
		try {
			await useItem.mutateAsync(confirmUseItem.target);
			toaster.create({
				title: "Item Used!",
				type: "success",
			});
			confirmUseItem.close();
		} catch (err) {
			toaster.create({
				title: "Failed to use item",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	const handleRedeemConfirm = async () => {
		if (!confirmRedeem.target) return;
		try {
			await redeemClaim.mutateAsync(confirmRedeem.target);
			toaster.create({
				title: "Reward Claim Redeemed!",
				description: "Enjoy your real-world reward!",
				type: "success",
			});
			confirmRedeem.close();
		} catch (err) {
			toaster.create({
				title: "Failed to redeem claim",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	return (
		<Stack gap={6}>
			{/* Active Buffs Matrix with Live Countdowns */}
			{activeBuffs.length > 0 && (
				<Box {...glassCard} p={5}>
					<HStack justify="space-between" mb={3}>
						<HStack gap={2}>
							<Icon as={LuSparkles} boxSize={4} color="mint.fg" />
							<Heading size="md">Active Consumable Buffs</Heading>
						</HStack>
						<Badge colorPalette="mint" rounded="pill" size="sm">
							{activeBuffs.length} active
						</Badge>
					</HStack>

					<Grid
						gap={3}
						templateColumns={{
							base: "1fr",
							sm: "repeat(2, 1fr)",
							lg: "repeat(3, 1fr)",
						}}
					>
						{activeBuffs.map((buff, i) => (
							<Box
								key={i}
								p={3.5}
								rounded="card"
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border.glass"
							>
								<HStack justify="space-between">
									<Stack gap={0.5}>
										<Text fontSize="xs" fontWeight="bold">
											{BUFF_LABEL[buff.effect] ??
												buff.effect}
										</Text>
										<Text fontSize="10px" color="fg.muted">
											Multiplier bonus active
										</Text>
									</Stack>
									<HStack
										gap={1}
										bg="bg.muted"
										px={2}
										py={0.5}
										rounded="pill"
									>
										<Icon
											as={LuClock}
											boxSize={3}
											color="mint.fg"
										/>
										<Text
											fontSize="xs"
											fontWeight="bold"
											fontFamily="mono"
											color="mint.fg"
										>
											{formatCountdown(
												buff.expires_at,
												now,
											)}
										</Text>
									</HStack>
								</HStack>
							</Box>
						))}
					</Grid>
				</Box>
			)}

			{/* Bag Inventory */}
			<Box {...glassCard} p={5}>
				<HStack justify="space-between" mb={3}>
					<Stack gap={0.5}>
						<Heading size="md">Inventory Bag</Heading>
						<Text fontSize="xs" color="fg.muted">
							Manage and use consumables or equip cyber avatar cosmetics.
						</Text>
					</Stack>
					<Icon as={LuPackage} boxSize={4} color="fg.muted" />
				</HStack>

				{invLoading ? (
					<Grid
						gap={3}
						templateColumns={{
							base: "1fr",
							sm: "repeat(2, 1fr)",
							lg: "repeat(3, 1fr)",
						}}
					>
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} h="120px" rounded="card" />
						))}
					</Grid>
				) : !inventory || inventory.length === 0 ? (
					<EmptyState
						title="Your bag is empty"
						description="Purchase consumables like Streak Shields or cosmetics from the Shop."
						icon={<Icon as={LuPackage} boxSize={6} />}
					/>
				) : (
					<Grid
						gap={3}
						templateColumns={{
							base: "1fr",
							sm: "repeat(2, 1fr)",
							lg: "repeat(3, 1fr)",
						}}
					>
						{inventory.map((inv) => {
							const shopItem = allCatalog?.find(
								(c) => c.id === inv.shop_item_id,
							);
							const isCosmetic = shopItem?.kind === "cosmetic";
							const slotType =
								shopItem?.slot?.split(":")[0] || "accessory";
							const isEquipped =
								Boolean(avatar?.equipped?.[slotType]) &&
								avatar?.equipped?.[slotType] === inv.shop_item_id;

							return (
								<Box
									key={inv.id}
									p={4}
									rounded="card"
									bg="bg.panel"
									borderWidth="1px"
									borderColor="border.glass"
								>
									<Stack gap={3} justify="space-between" h="full">
										<Stack gap={1}>
											<HStack justify="space-between">
												<Text
													fontWeight="bold"
													fontSize="sm"
												>
													{shopItem?.name ||
														BUFF_LABEL[inv.effect] ||
														inv.effect ||
														"Inventory Item"}
												</Text>
												<Badge
													size="xs"
													rounded="pill"
													variant="subtle"
													colorPalette={
														isCosmetic
															? isEquipped
																? "mint"
																: "purple"
															: "gray"
													}
												>
													{isCosmetic
														? isEquipped
															? "Equipped"
															: "Cosmetic"
														: `x${inv.quantity}`}
												</Badge>
											</HStack>
											<Text fontSize="xs" color="fg.muted">
												{isCosmetic
													? shopItem?.description ||
														`Slot: ${slotType}`
													: "Consumable boost item"}
											</Text>
										</Stack>

										<PillButton
											size="xs"
											variant={
												isCosmetic && isEquipped
													? "subtle"
													: "dark"
											}
											w="full"
											loading={
												useItem.isPending &&
												useItem.variables === inv.id
											}
											onClick={async () => {
												if (isCosmetic) {
													try {
														await useItem.mutateAsync(
															inv.id,
														);
														toaster.create({
															title: isEquipped
																? "Cosmetic Unequipped"
																: "Cosmetic Equipped!",
															type: "success",
														});
													} catch (err) {
														toaster.create({
															title: "Failed to update avatar cosmetic",
															description:
																err instanceof
																ApiError
																	? err.message
																	: undefined,
															type: "error",
														});
													}
												} else {
													confirmUseItem.ask(inv.id);
												}
											}}
										>
											{isCosmetic
												? isEquipped
													? "Unequip"
													: "Equip to Avatar"
												: "Use Item"}
										</PillButton>
									</Stack>
								</Box>
							);
						})}
					</Grid>
				)}
			</Box>

			{/* Real-World Reward Claims with Redemption Status */}
			<Box {...glassCard} p={5}>
				<HStack justify="space-between" mb={3}>
					<Stack gap={0.5}>
						<Heading size="md">Real-World Reward Claims</Heading>
						<Text fontSize="xs" color="fg.muted">
							Vouchers bought with PX to reward yourself offline.
						</Text>
					</Stack>
					<Icon as={LuGift} boxSize={4} color="fg.muted" />
				</HStack>

				{claimsLoading ? (
					<Grid
						gap={3}
						templateColumns={{
							base: "1fr",
							sm: "repeat(2, 1fr)",
							lg: "repeat(3, 1fr)",
						}}
					>
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} h="140px" rounded="card" />
						))}
					</Grid>
				) : !claims || claims.length === 0 ? (
					<EmptyState
						title="No active claims"
						description="When you buy custom real-world rewards, their redemption vouchers appear here."
						icon={<Icon as={LuClipboardList} boxSize={6} />}
					/>
				) : (
					<Grid
						gap={3}
						templateColumns={{
							base: "1fr",
							sm: "repeat(2, 1fr)",
							lg: "repeat(3, 1fr)",
						}}
					>
						{claims.map((claim) => {
							const isExpired =
								claim.status === "expired" ||
								(claim.status !== "redeemed" &&
									Boolean(claim.expires_at) &&
									new Date(claim.expires_at!).getTime() <
										now);

							return (
								<Box
									key={claim.id}
									p={4}
									rounded="card"
									bg="bg.panel"
									borderWidth="1px"
									borderColor="border.glass"
								>
									<Stack
										gap={3}
										justify="space-between"
										h="full"
									>
										<Stack gap={1}>
											<HStack justify="space-between">
												<Text
													fontWeight="bold"
													fontSize="sm"
												>
													{claim.name}
												</Text>
												<Badge
													size="xs"
													rounded="pill"
													colorPalette={
														claim.status ===
														"redeemed"
															? "mint"
															: isExpired
																? "red"
																: "gray"
													}
												>
													{isExpired
														? "Expired"
														: claim.status}
												</Badge>
											</HStack>
											<HStack
												justify="space-between"
												fontSize="xs"
												color="fg.muted"
											>
												<Text>
													Cost: {claim.price_paid} PX
												</Text>
												{claim.expires_at && (
													<Text
														color={
															isExpired
																? "red.500"
																: "fg.muted"
														}
													>
														{isExpired
															? "Expired"
															: `Expires ${new Date(claim.expires_at).toLocaleDateString()}`}
													</Text>
												)}
											</HStack>
										</Stack>

										{claim.status !== "redeemed" &&
											!isExpired && (
												<PillButton
													size="xs"
													variant="dark"
													w="full"
													onClick={() =>
														confirmRedeem.ask(
															claim.id,
														)
													}
												>
													Mark as Redeemed
												</PillButton>
											)}
									</Stack>
								</Box>
							);
						})}
					</Grid>
				)}
			</Box>

			{/* Confirm Use Item Dialog */}
			<ConfirmDialog
				open={confirmUseItem.open}
				onOpenChange={confirmUseItem.onOpenChange}
				title="Use Consumable Item"
				description="Are you sure you want to activate this consumable buff now?"
				confirmLabel="Activate Buff"
				loading={useItem.isPending}
				onConfirm={handleUseItemConfirm}
			/>

			{/* Confirm Redeem Dialog */}
			<ConfirmDialog
				open={confirmRedeem.open}
				onOpenChange={confirmRedeem.onOpenChange}
				title="Redeem Real-World Reward"
				description="Confirm you have rewarded yourself with this item offline?"
				confirmLabel="Confirm Redemption"
				loading={redeemClaim.isPending}
				onConfirm={handleRedeemConfirm}
			/>
		</Stack>
	);
};

// ---------------------------------------------------------------------------
// Catalog Grid
// ---------------------------------------------------------------------------

interface CatalogGridProps {
	kind: ShopItemKind;
	player: Player;
}

const CatalogGrid: React.FC<CatalogGridProps> = ({ kind, player }) => {
	const { data: items, isLoading } = useShopCatalog(kind);
	const purchase = usePurchaseItem();
	const deleteItem = useDeleteShopItem();

	const confirmPurchase = useConfirm<ShopItem>();
	const confirmDelete = useConfirm<string>();

	const handlePurchaseConfirm = async () => {
		if (!confirmPurchase.target) return;
		try {
			await purchase.mutateAsync(confirmPurchase.target.id);
			toaster.create({
				title: `Purchased ${confirmPurchase.target.name}!`,
				description: `Deducted ${confirmPurchase.target.price_px} PX points.`,
				type: "success",
			});
			confirmPurchase.close();
		} catch (err) {
			toaster.create({
				title: "Purchase failed",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
		}
	};

	const handleDeleteConfirm = async () => {
		if (!confirmDelete.target) return;
		try {
			await deleteItem.mutateAsync(confirmDelete.target);
			toaster.create({
				title: "Item removed from shop",
				type: "success",
			});
			confirmDelete.close();
		} catch (err) {
			toaster.create({
				title: "Failed to delete item",
				description: err instanceof ApiError ? err.message : undefined,
				type: "error",
			});
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
					<Skeleton key={i} h="160px" rounded="card" />
				))}
			</Grid>
		);
	}

	if (!items || items.length === 0) {
		return (
			<Box {...glassCard} p={6}>
				<EmptyState
					title="No items in this category"
					description="Add your own custom real-life rewards using the button above or check back later."
					icon={<Icon as={LuPackage} boxSize={6} />}
				/>
			</Box>
		);
	}

	return (
		<>
			<Grid
				gap={3.5}
				templateColumns={{
					base: "1fr",
					sm: "repeat(2, 1fr)",
					lg: "repeat(3, 1fr)",
				}}
			>
				{items.map((item) => {
					const locked = item.level_required > (player?.level ?? 0);
					const unaffordable = item.price_px > (player?.px ?? 0);
					const disabled = locked || unaffordable;

					// Check if description has expiration tag
					const expiryMatch = item.description?.match(
						/\[Expires:\s*([^\]]+)\]/,
					);
					const cleanDescription = item.description
						?.replace(/\[Expires:\s*[^\]]+\]/, "")
						.trim();

					return (
						<Box
							key={item.id}
							{...glassCard}
							p={4}
							bg="bg.panel"
							transition="all 0.15s ease-out"
							_hover={{
								transform: "translateY(-1px)",
								shadow: "glass",
							}}
						>
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
												onClick={() =>
													confirmDelete.ask(item.id)
												}
												_hover={{ color: "red.fg" }}
											/>
										)}
									</HStack>

									{cleanDescription ? (
										<Text
											fontSize="xs"
											color="fg.muted"
											lineHeight="tall"
										>
											{cleanDescription}
										</Text>
									) : null}

									<HStack gap={2} wrap="wrap" pt={1}>
										<Badge
											size="xs"
											rounded="pill"
											variant="surface"
											colorPalette="mint"
										>
											{item.price_px.toLocaleString()} PX
										</Badge>
										{item.level_required > 0 && (
											<Badge
												size="xs"
												rounded="pill"
												variant="subtle"
											>
												Req Lv {item.level_required}
											</Badge>
										)}
										{item.system && (
											<Badge
												size="xs"
												rounded="pill"
												variant="subtle"
											>
												System Item
											</Badge>
										)}
										{expiryMatch && (
											<Badge
												size="xs"
												rounded="pill"
												variant="subtle"
											>
												<HStack gap={1}>
													<Icon
														as={LuClock}
														boxSize={3}
													/>
													<Text>
														Exp: {expiryMatch[1]}
													</Text>
												</HStack>
											</Badge>
										)}
									</HStack>
								</Stack>

								<PillButton
									size="xs"
									variant="dark"
									w="full"
									disabled={disabled}
									onClick={() => confirmPurchase.ask(item)}
								>
									{locked
										? `Locked (Lv ${item.level_required})`
										: unaffordable
											? "Insufficient PX"
											: "Purchase"}
								</PillButton>
							</Stack>
						</Box>
					);
				})}
			</Grid>

			{/* Confirm Purchase Dialog */}
			<ConfirmDialog
				open={confirmPurchase.open}
				onOpenChange={confirmPurchase.onOpenChange}
				title="Purchase Shop Item"
				description={`Spend ${confirmPurchase.target?.price_px.toLocaleString()} PX to purchase "${confirmPurchase.target?.name}"?`}
				confirmLabel="Confirm Purchase"
				loading={purchase.isPending}
				onConfirm={handlePurchaseConfirm}
			/>

			{/* Confirm Delete Dialog */}
			<ConfirmDialog
				open={confirmDelete.open}
				onOpenChange={confirmDelete.onOpenChange}
				title="Delete Shop Item"
				description="Are you sure you want to permanently remove this custom reward from your catalog?"
				confirmLabel="Delete Item"
				destructive
				loading={deleteItem.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</>
	);
};

export default Heroes;
