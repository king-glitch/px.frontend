import React from "react";
import { Button, Text } from "@chakra-ui/react";
import { LuArrowUp } from "react-icons/lu";
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

interface AscendModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	loading: boolean;
	onAscend: () => void;
}

export const AscendModal: React.FC<AscendModalProps> = ({
	open,
	onOpenChange,
	loading,
	onAscend,
}) => {
	return (
		<DialogRoot open={open} onOpenChange={(e) => onOpenChange(e.open)}>
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
						Ascending resets your hero level to 1, but permanently
						increases your base stats multiplier and awards 5 bonus
						skill points.
					</Text>
				</DialogBody>
				<DialogFooter>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<PillButton
						variant="dark"
						icon={LuArrowUp}
						loading={loading}
						onClick={onAscend}
					>
						Ascend Now
					</PillButton>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
};
