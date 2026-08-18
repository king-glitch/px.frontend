import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { bankService } from "@/api/services/bank-service";
import type {
	BankCategory,
	CreateCategoryRequest,
	ObjectID,
	UpdateCategoryRequest,
} from "@/api/types";

/**
 * Hook to fetch all bank categories.
 */
export function useCategories(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: queryKeys.categories.lists(),
		queryFn: async () => {
			const res = await bankService.listCategories();
			return res.categories;
		},
		enabled: options?.enabled,
	});
}

/**
 * Hook to fetch a single category by ID.
 */
export function useCategory(id?: ObjectID, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: queryKeys.categories.detail(id || ""),
		queryFn: async () => {
			if (!id) throw new Error("Category ID is required");
			const res = await bankService.getCategory(id);
			return res.category;
		},
		enabled:
			Boolean(id) &&
			(options?.enabled !== undefined ? options.enabled : true),
	});
}

/**
 * Mutation to create a new category.
 */
export function useCreateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: CreateCategoryRequest) => {
			const res = await bankService.createCategory(payload);
			return res.category;
		},
		onSuccess: (newCategory: BankCategory) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.categories.all,
			});
			queryClient.setQueryData(
				queryKeys.categories.detail(newCategory.id),
				newCategory,
			);
		},
	});
}

/**
 * Mutation to update an existing category.
 */
export function useUpdateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			payload,
		}: {
			id: ObjectID;
			payload: UpdateCategoryRequest;
		}) => {
			const res = await bankService.updateCategory(id, payload);
			return res.category;
		},
		onSuccess: (updatedCategory: BankCategory) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.categories.all,
			});
			queryClient.setQueryData(
				queryKeys.categories.detail(updatedCategory.id),
				updatedCategory,
			);
		},
	});
}

/**
 * Mutation to delete a category.
 */
export function useDeleteCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: ObjectID) => {
			const res = await bankService.deleteCategory(id);
			return { id, deleted: res.deleted };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.categories.all,
			});
		},
	});
}
