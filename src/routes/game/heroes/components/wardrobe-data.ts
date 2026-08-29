import type { AvatarSlot } from "@/components/game";
import type { PerkID } from "@/api";

export interface CustomizationDef {
	slot: AvatarSlot;
	id: string;
	name: string;
	description: string;
	requiredPerk?: PerkID;
}

export const WARDROBE_CUSTOMIZATIONS: CustomizationDef[] = [
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
