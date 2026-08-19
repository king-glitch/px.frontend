// Ranked/breakdown charts stay monochrome (single accent hue, opacity scaled
// by rank) — the one exception is Category Expense Allocation, which uses
// each category's own stored color as its actual identity.
export function monochromeIntensity(amount: number, maxAmount: number): number {
	if (amount <= 0) return 0.25;
	return 0.35 + 0.65 * (amount / maxAmount);
}
