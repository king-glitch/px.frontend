import { useUpdateProject } from "@/api";
import type { Project } from "@/api/types";
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
import { Button, HStack, Icon, Input, Textarea, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { LuCheck, LuFolder } from "react-icons/lu";

interface EditProjectDialogProps {
	project: Project | null;
	isOpen: boolean;
	onClose: () => void;
}

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
	project,
	isOpen,
	onClose,
}) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [targetDate, setTargetDate] = useState("");

	const updateMutation = useUpdateProject();

	useEffect(() => {
		if (project) {
			setTitle(project.title || "");
			setDescription(project.description || "");
			setTargetDate(
				project.target_date ? project.target_date.split("T")[0] : "",
			);
		}
	}, [project]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!project || !title.trim()) return;

		try {
			await updateMutation.mutateAsync({
				projectId: project.id,
				payload: {
					title: title.trim(),
					description: description.trim() || undefined,
					target_date: targetDate || undefined,
				},
			});
			toaster.create({
				title: "Project Updated",
				description: `"${title}" has been updated.`,
				type: "success",
			});
			onClose();
		} catch (err: any) {
			toaster.create({
				title: "Failed to update project",
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
			<DialogContent bg="bg.panel" backdropFilter="blur(20px)" maxW="md">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<VStack align="flex-start" gap={1} w="full">
							<HStack gap={2}>
								<Icon as={LuFolder} color="lime.500" boxSize={5} />
								<DialogTitle>Edit Project</DialogTitle>
							</HStack>
							<DialogDescription>
								Update this project's name, scope, and target deadline.
							</DialogDescription>
						</VStack>
					</DialogHeader>

					<DialogBody>
						<VStack gap={4} align="stretch">
							<Field label="Project Title" required>
								<Input
									placeholder="e.g. Complete Genki II Textbook"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									rounded="pill"
									bg="bg.muted"
								/>
							</Field>

							<Field label="Description (Optional)">
								<Textarea
									placeholder="Project notes and deliverables..."
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									rounded="xl"
									bg="bg.muted"
									rows={3}
								/>
							</Field>

							<Field label="Target Date (Optional)">
								<Input
									type="date"
									value={targetDate}
									onChange={(e) => setTargetDate(e.target.value)}
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
							<Icon as={LuCheck} mr={1} /> Save Changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</DialogRoot>
	);
};
