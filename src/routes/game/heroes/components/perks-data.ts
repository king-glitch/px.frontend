import type React from "react";
import {
	LuActivity,
	LuAward,
	LuBadgeCheck,
	LuCoins,
	LuFlame,
	LuShield,
	LuSparkles,
	LuZap,
} from "react-icons/lu";
import type { AvatarSlot } from "@/components/game";
import type { PerkID } from "@/api";
import type { SearchableSelectItem } from "@/components/ui/searchable-select";

export const glassCard = {
	bg: "bg.glass",
	borderWidth: "1px",
	borderColor: "border.glass",
	rounded: "card",
	shadow: "glass",
	backdropFilter: "blur(30px) saturate(1.4)",
} as const;

export const CURRENCY_OPTIONS: SearchableSelectItem[] = [
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
		description:
			"Unlocked via Second Wind Perk (50% recovery cost reduction)",
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

export const PERK_DEFS: {
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

export function getPerkCurrentEffect(id: PerkID, rank: number): string {
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

export function getPerkUpgradeGain(id: PerkID): string {
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

export const BUFF_LABEL: Record<string, string> = {
	streak_shield: "Streak Shield",
	streak_repair: "Streak Repair",
	focus_elixir: "Focus Elixir (2x EXP)",
	coin_charm: "Coin Charm (2x PX)",
	quest_reroll: "Quest Reroll",
	rest_day: "Rest Day Pass",
};

export function formatCountdown(expiresAt: string, now: number): string {
	const diffMs = new Date(expiresAt).getTime() - now;
	if (diffMs <= 0) return "Expired";
	const totalSeconds = Math.floor(diffMs / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}
