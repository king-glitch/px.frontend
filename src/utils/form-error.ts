import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/api/client";
import { toaster } from "@/components/ui/toaster";

/**
 * Handles API errors in React Hook Forms:
 * - Maps field-specific violations directly to form fields via `setError`.
 * - Emits a toast notification ONLY if the backend validation response contains an `_error` key.
 */
export function handleFormApiError<T extends FieldValues>(
	err: unknown,
	setError: UseFormSetError<T>,
): void {
	if (err instanceof ApiError) {
		const violations = err.violations;
		if (violations) {
			for (const [key, fieldErr] of Object.entries(violations)) {
				if (key === "_error") {
					toaster.create({
						title: "Validation Error",
						description: fieldErr.message,
						type: "error",
					});
					setError("root" as Path<T>, {
						type: "server",
						message: fieldErr.message,
					});
				} else {
					setError(key as Path<T>, {
						type: "server",
						message: fieldErr.message,
					});
				}
			}
			return;
		}

		setError("root" as Path<T>, {
			type: "server",
			message: err.message,
		});
		return;
	}

	if (err instanceof Error) {
		setError("root" as Path<T>, {
			type: "server",
			message: err.message,
		});
	}
}
