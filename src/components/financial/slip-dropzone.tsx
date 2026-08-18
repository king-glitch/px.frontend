import {
	Badge,
	Box,
	Button,
	Circle,
	Flex,
	HStack,
	Heading,
	Icon,
	Progress,
	SimpleGrid,
	Spinner,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	LuCheck,
	LuCircleAlert,
	LuCircleCheck,
	LuCloudUpload,
	LuFileImage,
	LuFileText,
	LuFlame,
	LuLayers,
	LuPlus,
	LuRefreshCw,
	LuTrash2,
	LuX,
	LuZap,
} from "react-icons/lu";
import { queryKeys, useActiveQueues } from "@/api";
import { bankService } from "@/api/services/bank-service";
import type { QueueItem } from "@/api/types";
import { toaster } from "@/components/ui/toaster";

export interface SlipDropzoneProps {
	/** Optional compact mode for dashboard peek */
	compact?: boolean;
	/** Optional callback when slip ingestion finishes */
	onSuccess?: () => void;
}

interface UploadProgressState {
	total: number;
	completed: number;
	failed: number;
	inFlight: number;
	isUploading: boolean;
	errors: Array<{ name: string; error: string }>;
}

const INITIAL_PROGRESS: UploadProgressState = {
	total: 0,
	completed: 0,
	failed: 0,
	inFlight: 0,
	isUploading: false,
	errors: [],
};

const CONCURRENCY_LIMIT = 5; // 5 parallel HTTP uploads for maximum speed without network choke

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const SlipDropzone: React.FC<SlipDropzoneProps> = ({
	compact = false,
	onSuccess,
}) => {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [isDragging, setIsDragging] = useState(false);
	const [uploadProgress, setUploadProgress] =
		useState<UploadProgressState>(INITIAL_PROGRESS);

	// Thumbnail preview cache for small batches
	const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());

	// Server active queues
	const { activeQueues, hasActiveQueues, refetch: refetchQueues } =
		useActiveQueues({
			tag: "bank.slip",
			onFinished: () => {
				toaster.create({
					title: "Bank slip ingestion complete!",
					description: "All transactions have been parsed and recorded.",
					type: "success",
				});
				onSuccess?.();
			},
		});

	const isProcessing = uploadProgress.isUploading || hasActiveQueues;

	// Revoke preview URLs on unmount
	useEffect(() => {
		return () => {
			previewUrls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [previewUrls]);

	const processFiles = useCallback(
		async (newFiles: File[]) => {
			const validFiles = newFiles.filter((f) => f.type.startsWith("image/"));
			if (validFiles.length === 0) {
				toaster.create({
					title: "Invalid file format",
					description: "Please upload valid slip images (PNG, JPG, WEBP).",
					type: "error",
				});
				return;
			}

			const count = validFiles.length;

			// Memory optimization: only create object URLs if batch <= 6
			if (count <= 6) {
				const newMap = new Map<string, string>();
				validFiles.forEach((f) => {
					newMap.set(f.name, URL.createObjectURL(f));
				});
				setPreviewUrls((prev) => {
					prev.forEach((url) => URL.revokeObjectURL(url));
					return newMap;
				});
			} else {
				setPreviewUrls((prev) => {
					prev.forEach((url) => URL.revokeObjectURL(url));
					return new Map();
				});
			}

			setUploadProgress({
				total: count,
				completed: 0,
				failed: 0,
				inFlight: 0,
				isUploading: true,
				errors: [],
			});

			toaster.create({
				title: `Uploading ${count} slip${count > 1 ? "s" : ""} in parallel...`,
				description: "Batch upload started.",
				type: "info",
			});

			// High-performance worker pool with concurrency limit
			let cursor = 0;
			let completedCount = 0;
			let failedCount = 0;
			const errorsList: Array<{ name: string; error: string }> = [];

			async function worker() {
				while (cursor < validFiles.length) {
					const index = cursor++;
					const file = validFiles[index];

					setUploadProgress((prev) => ({
						...prev,
						inFlight: prev.inFlight + 1,
					}));

					try {
						await bankService.uploadSlip(file);
						completedCount++;
					} catch (err: any) {
						failedCount++;
						errorsList.push({
							name: file.name,
							error: err?.message || "Upload error",
						});
					} finally {
						setUploadProgress((prev) => ({
							...prev,
							completed: completedCount,
							failed: failedCount,
							inFlight: Math.max(0, prev.inFlight - 1),
							errors: [...errorsList],
						}));
					}
				}
			}

			// Spawn concurrent workers
			const workers = Array.from(
				{ length: Math.min(CONCURRENCY_LIMIT, count) },
				() => worker(),
			);

			await Promise.all(workers);

			setUploadProgress((prev) => ({
				...prev,
				isUploading: false,
			}));

			// Refetch backend queues once batch is submitted
			refetchQueues();
			queryClient.invalidateQueries({ queryKey: queryKeys.queue.all });

			toaster.create({
				title: `Batch upload complete! (${completedCount} queued${
					failedCount > 0 ? `, ${failedCount} failed` : ""
				})`,
				description: "OCR analysis running in background.",
				type: failedCount === 0 ? "success" : "warning",
			});
		},
		[refetchQueues, queryClient],
	);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			processFiles(Array.from(e.dataTransfer.files));
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			processFiles(Array.from(e.target.files));
		}
	};

	const handleReset = (e: React.MouseEvent) => {
		e.stopPropagation();
		previewUrls.forEach((url) => URL.revokeObjectURL(url));
		setPreviewUrls(new Map());
		setUploadProgress(INITIAL_PROGRESS);
	};

	const totalActive = activeQueues.length;
	const isLargeBatch = uploadProgress.total > 8 || totalActive > 8;

	// Calculate overall percentage
	const progressPercent = useMemo(() => {
		if (uploadProgress.isUploading && uploadProgress.total > 0) {
			return Math.round(
				((uploadProgress.completed + uploadProgress.failed) /
					uploadProgress.total) *
					100,
			);
		}
		return null;
	}, [uploadProgress]);

	return (
		<Box
			bg={isDragging ? "bg.muted" : "bg.glass"}
			borderWidth="2px"
			borderStyle={isDragging ? "solid" : "dashed"}
			borderColor={isDragging ? "fg" : "border.glass"}
			rounded="card"
			p={compact ? 4 : 6}
			shadow="glass"
			backdropFilter="blur(30px) saturate(1.4)"
			transition="all 0.2s ease"
			cursor={isProcessing ? "default" : "pointer"}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			onClick={() => {
				if (!isProcessing && fileInputRef.current) {
					fileInputRef.current.value = "";
					fileInputRef.current.click();
				}
			}}
		>
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept="image/*"
				style={{ display: "none" }}
				onChange={handleInputChange}
			/>

			{!isProcessing &&
			uploadProgress.total === 0 &&
			uploadProgress.errors.length === 0 ? (
				/* Empty State */
				<VStack gap={compact ? 2 : 3} textAlign="center">
					<Circle size="12" bg="bg.muted" shadow="glass">
						<Icon as={LuCloudUpload} boxSize={6} color="fg.muted" />
					</Circle>

					<Stack gap={0.5}>
						<Text fontSize={compact ? "xs" : "sm"} fontWeight="semibold">
							Drop one or multiple bank slips here, or{" "}
							<Text
								as="span"
								color="fg"
								fontWeight="bold"
								textDecoration="underline"
							>
								browse
							</Text>
						</Text>
						<Text fontSize="11px" color="fg.muted">
							Fast batch ingestion: 50+ slips supported (PNG, JPG, WEBP)
						</Text>
					</Stack>
				</VStack>
			) : (
				/* Active Ingestion & Processing Dashboard */
				<Stack gap={3.5}>
					{/* Header Row */}
					<Flex justify="space-between" align="center" wrap="wrap" gap={2}>
						<HStack gap={2}>
							{isProcessing ? (
								<Spinner size="xs" color="fg" />
							) : uploadProgress.errors.length > 0 ? (
								<Icon as={LuCircleAlert} color="red.fg" boxSize={4} />
							) : (
								<Icon as={LuCircleCheck} color="green.fg" boxSize={4} />
							)}
							<Text fontSize="xs" fontWeight="semibold">
								{uploadProgress.isUploading
									? `Uploading ${uploadProgress.completed}/${uploadProgress.total} slips in parallel (${uploadProgress.inFlight} active)...`
									: hasActiveQueues
										? `Analyzing OCR: ${totalActive} slip${
												totalActive > 1 ? "s" : ""
											} in queue...`
										: "Batch Ingestion Finished"}
							</Text>
						</HStack>

						<HStack gap={1.5}>
							<Button
								size="xs"
								rounded="pill"
								variant="ghost"
								onClick={(e) => {
									e.stopPropagation();
									if (fileInputRef.current) {
										fileInputRef.current.value = "";
										fileInputRef.current.click();
									}
								}}
							>
								<Icon as={LuPlus} />
								Add More
							</Button>
							{!isProcessing && (
								<Button
									size="xs"
									rounded="pill"
									variant="ghost"
									onClick={handleReset}
								>
									<Icon as={LuTrash2} />
									Clear
								</Button>
							)}
						</HStack>
					</Flex>

					{/* Overall Progress Meter */}
					{isProcessing && (
						<Stack gap={1}>
							<Progress.Root
								value={progressPercent}
								max={100}
								size="xs"
							>
								<Progress.Track bg="bg.muted" rounded="pill">
									<Progress.Range bg="bg.solid" rounded="pill" />
								</Progress.Track>
							</Progress.Root>
							{progressPercent !== null && (
								<Flex justify="space-between" fontSize="10px" color="fg.muted">
									<Text>Upload Progress</Text>
									<Text fontWeight="semibold">{progressPercent}%</Text>
								</Flex>
							)}
						</Stack>
					)}

					{/* High-Level Batch Metrics for 8+ slips */}
					{isLargeBatch && (
						<SimpleGrid columns={{ base: 2, sm: 4 }} gap={2}>
							<Box
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border"
								rounded="card"
								p={2}
								textAlign="center"
							>
								<Text fontSize="10px" color="fg.muted">
									Total Slips
								</Text>
								<Text fontSize="sm" fontWeight="bold">
									{uploadProgress.total || totalActive}
								</Text>
							</Box>
							<Box
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border"
								rounded="card"
								p={2}
								textAlign="center"
							>
								<Text fontSize="10px" color="fg.muted">
									Uploading
								</Text>
								<Text fontSize="sm" fontWeight="bold">
									{uploadProgress.inFlight}
								</Text>
							</Box>
							<Box
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border"
								rounded="card"
								p={2}
								textAlign="center"
							>
								<Text fontSize="10px" color="fg.muted">
									In OCR Queue
								</Text>
								<Text fontSize="sm" fontWeight="bold" color="mint.fg">
									{totalActive}
								</Text>
							</Box>
							<Box
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border"
								rounded="card"
								p={2}
								textAlign="center"
							>
								<Text fontSize="10px" color="fg.muted">
									Failed
								</Text>
								<Text
									fontSize="sm"
									fontWeight="bold"
									color={uploadProgress.failed > 0 ? "red.fg" : "fg.muted"}
								>
									{uploadProgress.failed + uploadProgress.errors.length}
								</Text>
							</Box>
						</SimpleGrid>
					)}

					{/* Optimized Scrollable Feed (Max 12 rendered nodes to prevent DOM lag) */}
					<VStack align="stretch" gap={1.5} maxH="200px" overflowY="auto">
						{activeQueues.slice(0, 15).map((queue) => (
							<Flex
								key={queue.id}
								align="center"
								justify="space-between"
								bg="bg.panel"
								borderWidth="1px"
								borderColor="border"
								rounded="pill"
								px={3}
								py={1.5}
								gap={2}
							>
								<HStack gap={2} overflow="hidden">
									<Circle size="6" bg="bg.muted" flexShrink={0}>
										<Icon as={LuFileImage} boxSize={3} color="fg.muted" />
									</Circle>
									<VStack align="flex-start" gap={0} overflow="hidden">
										<Text fontSize="xs" fontWeight="medium" truncate>
											Slip Job #{queue.id.slice(-6)}
										</Text>
										<Text fontSize="10px" color="fg.muted">
											{queue.action_type}
										</Text>
									</VStack>
								</HStack>

								<HStack gap={1} px={2} py={0.5} bg="bg.muted" rounded="pill" flexShrink={0}>
									<Spinner size="xs" />
									<Text fontSize="10px" color="fg.muted">
										{queue.status === "pending"
											? "Queued"
											: queue.status === "dequeued"
												? "Analyzing OCR"
												: queue.status}
									</Text>
								</HStack>
							</Flex>
						))}

						{totalActive > 15 && (
							<Text fontSize="10px" color="fg.muted" textAlign="center" py={1}>
								+ {totalActive - 15} more slip jobs processing in background...
							</Text>
						)}

						{/* Errors list */}
						{uploadProgress.errors.slice(0, 5).map((err, i) => (
							<Flex
								key={i}
								align="center"
								justify="space-between"
								bg="bg.panel"
								borderWidth="1px"
								borderColor="red.500"
								rounded="pill"
								px={3}
								py={1.5}
								gap={2}
							>
								<HStack gap={2} overflow="hidden">
									<Circle size="6" bg="red.muted" color="red.fg" flexShrink={0}>
										<Icon as={LuCircleAlert} boxSize={3} />
									</Circle>
									<VStack align="flex-start" gap={0} overflow="hidden">
										<Text fontSize="xs" fontWeight="medium" truncate>
											{err.name}
										</Text>
										<Text fontSize="10px" color="red.fg">
											{err.error}
										</Text>
									</VStack>
								</HStack>
								<Badge size="xs" rounded="pill" colorPalette="red">
									Failed
								</Badge>
							</Flex>
						))}
					</VStack>
				</Stack>
			)}
		</Box>
	);
};

export default SlipDropzone;
