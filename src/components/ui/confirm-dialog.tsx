import { Button, Text } from "@chakra-ui/react";
import * as React from "react";
import {
	DialogActionTrigger,
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";

export interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	/** State what the action does and what it costs. Never "Are you sure?". */
	description: React.ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	/** Red confirm button. Use for anything that destroys or spends. */
	destructive?: boolean;
	loading?: boolean;
	onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	destructive = false,
	loading = false,
	onConfirm,
}) => (
	<DialogRoot
		open={open}
		onOpenChange={(event) => onOpenChange(event.open)}
		placement="center"
		role="alertdialog"
	>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
			</DialogHeader>
			<DialogBody>
				<Text color="fg.muted" fontSize="sm">
					{description}
				</Text>
			</DialogBody>
			<DialogFooter>
				<DialogActionTrigger asChild>
					<Button variant="ghost" size="sm">
						{cancelLabel}
					</Button>
				</DialogActionTrigger>
				<Button
					size="sm"
					colorPalette={destructive ? "red" : undefined}
					loading={loading}
					onClick={onConfirm}
				>
					{confirmLabel}
				</Button>
			</DialogFooter>
			<DialogCloseTrigger />
		</DialogContent>
	</DialogRoot>
);

/**
 * Drives a ConfirmDialog for one pending target at a time — the id of the row
 * being deleted, the item being bought. `null` means the dialog is closed, so
 * the target and the open state can never disagree.
 */
export function useConfirm<T>() {
	const [target, setTarget] = React.useState<T | null>(null);

	return {
		target,
		open: target !== null,
		ask: setTarget,
		close: () => setTarget(null),
		onOpenChange: (open: boolean) => {
			if (!open) {
				setTarget(null);
			}
		},
	};
}
