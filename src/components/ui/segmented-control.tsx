"use client";

import { For, SegmentGroup } from "@chakra-ui/react";
import * as React from "react";

export interface SegmentedControlItem {
	value: string;
	label: React.ReactNode;
	disabled?: boolean;
}

export interface SegmentedControlProps extends SegmentGroup.RootProps {
	items: Array<string | SegmentedControlItem>;
}

function normalize(
	items: Array<string | SegmentedControlItem>,
): SegmentedControlItem[] {
	return items.map((item) => {
		if (typeof item === "string") return { value: item, label: item };
		return item;
	});
}

export const SegmentedControl = React.forwardRef<
	HTMLDivElement,
	SegmentedControlProps
>(function SegmentedControl(props, ref) {
	const { items, ...rest } = props;
	const data = React.useMemo(() => normalize(items), [items]);

	return (
		<SegmentGroup.Root ref={ref} {...rest}>
			<SegmentGroup.Indicator />
			<For each={data}>
				{(item) => (
					<SegmentGroup.Item
						key={item.value}
						value={item.value}
						disabled={item.disabled}
					>
						<SegmentGroup.ItemText>
							{item.label}
						</SegmentGroup.ItemText>
						<SegmentGroup.ItemHiddenInput />
					</SegmentGroup.Item>
				)}
			</For>
		</SegmentGroup.Root>
	);
});

export default SegmentedControl;
