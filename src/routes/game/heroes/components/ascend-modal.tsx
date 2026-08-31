import React, { useState } from "react";
import {
	Badge,
	Box,
	Button,
	Flex,
	HStack,
	Icon,
	SimpleGrid,
	Text,
	VStack,
} from "@chakra-ui/react";
import {
	LuArrowUp,
	LuCompass,
	LuHeart,
	LuShield,
	LuSparkles,
	LuUsers,
} from "react-icons/lu";
import { PillButton } from "@/components/ui/pill-button";
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
import { useTranslation } from "@/lib/i18n";
import type { AscensionPath } from "@/api";

interface AscendModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	loading: boolean;
	onAscend: (path: AscensionPath) => void;
}

const PATHS: Array<{
	id: AscensionPath;
	name: string;
	icon: any;
	color: string;
	desc: string;
	perk: string;
}> = [
	{
		id: "sage",
		name: "Sage",
		icon: LuSparkles,
		color: "purple.400",
		desc: "Mind & Wisdom. +20% Learning & Mindfulness XP.",
		perk: "+1 Max Perk Rank across all mental trees.",
	},
	{
		id: "vanguard",
		name: "Vanguard",
		icon: LuHeart,
		color: "red.400",
		desc: "Action & Vitality. +20% Health & Work XP.",
		perk: "Earn 1 extra Rest Day every 10-day streak.",
	},
	{
		id: "steward",
		name: "Steward",
		icon: LuShield,
		color: "yellow.400",
		desc: "Discipline & Order. +20% Chores & Finance XP.",
		perk: "10% bonus PX on savings and budget targets.",
	},
	{
		id: "connector",
		name: "Connector",
		icon: LuUsers,
		color: "pink.400",
		desc: "Social & Synergy. +20% Social XP.",
		perk: "+25% XP bonus from Co-op Circle shared activities.",
	},
];

export const AscendModal: React.FC<AscendModalProps> = ({
	open,
	onOpenChange,
	loading,
	onAscend,
}) => {
	const { t } = useTranslation();
	const [selectedPath, setSelectedPath] = useState<AscensionPath>("sage");

	return (
		<DialogRoot open={open} onOpenChange={(e) => onOpenChange(e.open)}>
			<DialogContent
				maxW="lg"
				rounded="2xl"
				bg="bg.panel"
				borderWidth="1px"
				borderColor="border.glass"
			>
				<DialogHeader>
					<DialogTitle>
						{t("routes.heroes.ascend.modal.title")}
					</DialogTitle>
					<DialogDescription fontSize="xs" color="fg.muted">
						Choose your specialization archetype for this ascension
						cycle.
					</DialogDescription>
				</DialogHeader>
				<DialogBody>
					<VStack gap={3} align="stretch">
						<Text fontSize="xs" color="fg.muted">
							Ascending resets your level to 1 while retaining all
							permanent skill perks and granting path bonuses:
						</Text>

						<SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
							{PATHS.map((p) => {
								const isSelected = selectedPath === p.id;
								return (
									<Box
										key={p.id}
										p={3.5}
										rounded="lg"
										bg={
											isSelected
												? "bg.subtle"
												: "bg.canvas"
										}
										borderWidth="2px"
										borderColor={
											isSelected
												? p.color
												: "border.subtle"
										}
										cursor="pointer"
										onClick={() => setSelectedPath(p.id)}
										transition="all 0.15s ease"
									>
										<HStack
											justify="space-between"
											mb={1.5}
										>
											<HStack gap={2}>
												<Icon
													as={p.icon}
													color={p.color}
													boxSize={4}
												/>
												<Text
													fontWeight="bold"
													fontSize="sm"
												>
													{p.name}
												</Text>
											</HStack>
											{isSelected && (
												<Badge
													colorPalette="purple"
													size="xs"
												>
													Selected
												</Badge>
											)}
										</HStack>
										<Text
											fontSize="2xs"
											color="fg.muted"
											mb={2}
										>
											{p.desc}
										</Text>
										<Text
											fontSize="2xs"
											fontWeight="semibold"
											color={p.color}
										>
											{p.perk}
										</Text>
									</Box>
								);
							})}
						</SimpleGrid>
					</VStack>
				</DialogBody>
				<DialogFooter>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onOpenChange(false)}
					>
						{t("routes.heroes.ascend.modal.cancel")}
					</Button>
					<PillButton
						variant="dark"
						icon={LuArrowUp}
						loading={loading}
						onClick={() => onAscend(selectedPath)}
					>
						Ascend as{" "}
						{PATHS.find((p) => p.id === selectedPath)?.name}
					</PillButton>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
};
