import { PillButton } from "@/components/ui/pill-button";
import {
	Badge,
	Box,
	Button,
	Circle,
	Dialog,
	Field,
	Flex,
	Grid,
	HStack,
	Heading,
	Icon,
	IconButton,
	Input,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
	LuFolder,
	LuPencil,
	LuPlus,
	LuSave,
	LuTag,
	LuTrash2,
} from "react-icons/lu";
import {
	useCategories,
	useCreateCategory,
	useDeleteCategory,
	useUpdateCategory,
} from "@/api";
import {
	createCategorySchema,
	type CreateCategoryFormData,
} from "@/api/schemas";
import type { BankCategory } from "@/api/types";
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
import { toaster } from "@/components/ui/toaster";
import { glassCard } from "@/routes/financial/layout";

const presetColors = [
	"#3B82F6", // Blue
	"#10B981", // Emerald
	"#F59E0B", // Amber
	"#EF4444", // Red
	"#8B5CF6", // Purple
	"#EC4899", // Pink
	"#06B6D4", // Cyan
	"#84CC16", // Lime
	"#6366F1", // Indigo
	"#14B8A6", // Teal
];

export const FinancialCategories: React.FC = () => {
	const { data: categories = [], isLoading } = useCategories();
	const createMutation = useCreateCategory();
	const updateMutation = useUpdateCategory();
	const deleteMutation = useDeleteCategory();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<BankCategory | null>(
		null,
	);
	const [deletingCategory, setDeletingCategory] = useState<BankCategory | null>(
		null,
	);

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<CreateCategoryFormData>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: {
			name: "",
			color: presetColors[0],
			icon: "folder",
		},
	});

	const currentColor = watch("color");

	const handleOpenCreate = () => {
		setEditingCategory(null);
		reset({
			name: "",
			color: presetColors[0],
			icon: "folder",
		});
		setIsModalOpen(true);
	};

	const handleOpenEdit = (category: BankCategory) => {
		setEditingCategory(category);
		reset({
			name: category.name,
			color: category.color || presetColors[0],
			icon: category.icon || "folder",
		});
		setIsModalOpen(true);
	};

	const onSubmit = async (data: CreateCategoryFormData) => {
		try {
			if (editingCategory) {
				await updateMutation.mutateAsync({
					id: editingCategory.id,
					payload: {
						name: data.name,
						color: data.color,
						icon: data.icon,
					},
				});
				toaster.create({ title: "Category updated", type: "success" });
			} else {
				await createMutation.mutateAsync({
					name: data.name,
					color: data.color,
					icon: data.icon,
				});
				toaster.create({ title: "Category created", type: "success" });
			}
			setIsModalOpen(false);
		} catch (err: any) {
			toaster.create({
				title: editingCategory
					? "Failed to update category"
					: "Failed to create category",
				description: err?.message || "Something went wrong",
				type: "error",
			});
		}
	};

	const handleDelete = async () => {
		if (!deletingCategory) return;
		try {
			await deleteMutation.mutateAsync(deletingCategory.id);
			toaster.create({ title: "Category deleted", type: "success" });
			setDeletingCategory(null);
		} catch (err: any) {
			toaster.create({
				title: "Failed to delete category",
				description: err?.message || "Could not delete category",
				type: "error",
			});
		}
	};

	return (
		<Stack gap={6}>
			{/* Page Header */}
			<Flex justify="space-between" align="center" wrap="wrap" gap={3}>
				<VStack align="flex-start" gap={0}>
					<Heading fontSize="md" fontWeight="bold">
						Categories Management
					</Heading>
					<Text fontSize="xs" color="fg.muted">
						Organize and classify your income and expenses
					</Text>
				</VStack>

				<PillButton
					size="sm"
					variant="dark"
					icon={LuPlus}
					onClick={handleOpenCreate}
				>
					Create Category
				</PillButton>
			</Flex>

			{/* Create / Edit Category Modal Dialog */}
			<DialogRoot
				open={isModalOpen}
				onOpenChange={(details) => setIsModalOpen(details.open)}
				size="md"
			>
				<DialogContent {...glassCard} bg="bg.panel" p={6}>
					<DialogHeader p={0} mb={4}>
						<DialogTitle fontSize="md" fontWeight="bold">
							{editingCategory ? "Edit Category" : "New Category"}
						</DialogTitle>
					</DialogHeader>
					<DialogCloseTrigger />
					<DialogBody p={0}>
						<form noValidate onSubmit={handleSubmit(onSubmit)}>
							<Stack gap={4}>
								<Field.Root invalid={!!errors.name} required>
									<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
										Category Name
									</Field.Label>
									<Input
										placeholder="e.g. Groceries, Entertainment, Rent"
										size="sm"
										rounded="pill"
										bg="bg.muted"
										{...register("name")}
									/>
									{errors.name && (
										<Field.ErrorText fontSize="xs">
											{errors.name.message}
										</Field.ErrorText>
									)}
								</Field.Root>

								{/* Color Picker Palette */}
								<Field.Root>
									<Field.Label fontSize="xs" fontWeight="semibold" color="fg.muted">
										Accent Color
									</Field.Label>
									<HStack gap={2} wrap="wrap">
										{presetColors.map((color) => (
											<Circle
												key={color}
												size="6"
												bg={color}
												cursor="pointer"
												borderWidth={currentColor === color ? "2px" : "0"}
												borderColor="fg"
												shadow={currentColor === color ? "glass" : "none"}
												transition="transform 0.15s ease"
												_hover={{ transform: "scale(1.15)" }}
												onClick={() => setValue("color", color)}
											/>
										))}
									</HStack>
								</Field.Root>

								<HStack justify="flex-end" gap={2} pt={2}>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										rounded="pill"
										onClick={() => setIsModalOpen(false)}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										size="sm"
										rounded="pill"
										loading={
											createMutation.isPending || updateMutation.isPending
										}
									>
										<Icon as={LuSave} />
										{editingCategory ? "Update" : "Create"}
									</Button>
								</HStack>
							</Stack>
						</form>
					</DialogBody>
				</DialogContent>
			</DialogRoot>

			{/* Delete Confirmation Dialog */}
			<DialogRoot
				open={Boolean(deletingCategory)}
				onOpenChange={(details) => {
					if (!details.open) setDeletingCategory(null);
				}}
				size="sm"
			>
				<DialogContent {...glassCard} bg="bg.panel" p={6}>
					<DialogHeader p={0} mb={2}>
						<DialogTitle fontSize="md" fontWeight="bold">
							Delete Category
						</DialogTitle>
					</DialogHeader>
					<DialogCloseTrigger />
					<DialogBody p={0} mb={4}>
						<Text fontSize="sm" color="fg.muted">
							Are you sure you want to delete{" "}
							<Text as="span" fontWeight="bold" color="fg">
								{deletingCategory?.name}
							</Text>
							? Associated transactions will become uncategorized.
						</Text>
					</DialogBody>
					<DialogFooter p={0} gap={2}>
						<DialogActionTrigger asChild>
							<Button variant="ghost" size="sm" rounded="pill">
								Cancel
							</Button>
						</DialogActionTrigger>
						<Button
							colorPalette="red"
							size="sm"
							rounded="pill"
							loading={deleteMutation.isPending}
							onClick={handleDelete}
						>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</DialogRoot>

			{/* Categories Grid */}
			{isLoading ? (
				<SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
					<Skeleton h="28" rounded="card" />
					<Skeleton h="28" rounded="card" />
					<Skeleton h="28" rounded="card" />
					<Skeleton h="28" rounded="card" />
				</SimpleGrid>
			) : categories.length === 0 ? (
				<Box {...glassCard} p={12} textAlign="center">
					<VStack gap={3}>
						<Icon as={LuFolder} boxSize={10} color="fg.muted" />
						<Text fontSize="sm" fontWeight="medium">
							No categories created yet.
						</Text>
						<Button
							size="xs"
							rounded="pill"
							onClick={handleOpenCreate}
						>
							Create First Category
						</Button>
					</VStack>
				</Box>
			) : (
				<SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
					{categories.map((category) => (
						<Box
							key={category.id}
							{...glassCard}
							p={4}
							position="relative"
							transition="all 0.2s ease"
							_hover={{ transform: "translateY(-2px)", shadow: "float" }}
						>
							<Flex justify="space-between" align="flex-start">
								<HStack gap={2.5}>
									<Circle size="8" bg={category.color || "blue.500"} color="white">
										<Icon as={LuTag} boxSize={3.5} />
									</Circle>
									<VStack align="flex-start" gap={0}>
										<Text fontSize="sm" fontWeight="bold">
											{category.name}
										</Text>
										<Text fontSize="10px" color="fg.muted">
											ID: {category.id.slice(-6)}
										</Text>
									</VStack>
								</HStack>

								<HStack gap={1}>
									<IconButton
										size="xs"
										variant="ghost"
										aria-label="Edit category"
										title="Edit"
										rounded="full"
										onClick={() => handleOpenEdit(category)}
									>
										<Icon as={LuPencil} boxSize={3.5} />
									</IconButton>
									<IconButton
										size="xs"
										variant="ghost"
										colorPalette="red"
										aria-label="Delete category"
										title="Delete"
										rounded="full"
										onClick={() => setDeletingCategory(category)}
									>
										<Icon as={LuTrash2} boxSize={3.5} />
									</IconButton>
								</HStack>
							</Flex>
						</Box>
					))}
				</SimpleGrid>
			)}
		</Stack>
	);
};

export default FinancialCategories;
