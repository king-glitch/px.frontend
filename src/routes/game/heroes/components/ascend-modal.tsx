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
import { useTranslation } from "@/lib/i18n";

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
	const { t } = useTranslation();
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
					<DialogTitle>
						{t("routes.heroes.ascend.modal.title")}
					</DialogTitle>
					<DialogDescription fontSize="xs" color="fg.muted">
						{t("routes.heroes.ascend.modal.subtitle")}
					</DialogDescription>
				</DialogHeader>
				<DialogBody>
					<Text fontSize="sm" color="fg.muted" lineHeight="tall">
						{t("routes.heroes.ascend.modal.body")}
					</Text>
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
						onClick={onAscend}
					>
						{t("routes.heroes.ascend.modal.confirm")}
					</PillButton>
				</DialogFooter>
				<DialogCloseTrigger />
			</DialogContent>
		</DialogRoot>
	);
};
