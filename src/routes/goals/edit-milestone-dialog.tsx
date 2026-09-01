import { useUpdateMilestone } from "@/api";
import type { Milestone } from "@/api/types";
import {
	DialogActionTrigger,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { Button, HStack, Icon, Input, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { LuCheck, LuFlag } from "react-icons/lu";

interface EditMilestoneDialogProps {
	milestone: Milestone | null;
	isOpen: boolean;
	onClose: () => void;
}

export const EditMilestoneDialog: React.FC<EditMilestoneDialogProps> = ({
	milestone,
	isOpen,
	onClose,
}) => {
	const [title, setTitle] = useState("");

	const updateMutation = useUpdateMilestone();

	useEffect(() => {
		if (milestone) {
			setTitle(milestone.title || "");
		}
	}, [milestone]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!milestone || !title.trim()) return;

		try {
			await updateMutation.mutateAsync({
				milestoneId: milestone.id,
				payload: {
					title: title.trim(),
				},
			});
			toaster.create({
				title: "Milestone Updated",
				description: `"${title}" has been updated.`,
				type: "success",
			});
			onClose();
		} catch (err: any) {
			toaster.create({
				title: "Failed to update milestone",
				description: err?.message || "An unexpected error occurred",
				type: "error",
			});
		}
	};

	return (
		<DialogRoot
			open={isOpen}
			onOpenChange={(e) => !e.open && onClose()}
			placement="center"
		>
			<DialogContent bg="bg.panel" backdropFilter="blur(20px)" maxW="sm">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<VStack align="flex-start" gap={1} w="full">
							<HStack gap={2}>
								<Icon as={LuFlag} color="lime.500" boxSize={5} />
								<DialogTitle>Edit Milestone</DialogTitle>
							</HStack>
							<DialogDescription>
								Update this checkpoint's description.
							</DialogDescription>
						</VStack>
					</DialogHeader>

					<DialogBody>
						<VStack gap={4} align="stretch">
							<Field label="Milestone Title" required>
								<Input
									placeholder="e.g. Chapter 1-6 Grammar Drills"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									rounded="pill"
									bg="bg.muted"
								/>
							</Field>
						</VStack>
					</DialogBody>

					<DialogFooter>
						<DialogActionTrigger asChild>
							<Button variant="outline">Cancel</Button>
						</DialogActionTrigger>
						<Button
							type="submit"
							colorPalette="lime"
							loading={updateMutation.isPending}
							disabled={!title.trim()}
						>
							<Icon as={LuCheck} mr={1} /> Save
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</DialogRoot>
	);
};
