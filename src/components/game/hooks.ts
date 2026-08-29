import React from "react";

export function usePrefersReducedMotion(): boolean {
	const [reduced, setReduced] = React.useState(() =>
		typeof window === "undefined"
			? false
			: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
	);

	React.useEffect(() => {
		const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
		const handler = (event: MediaQueryListEvent) =>
			setReduced(event.matches);
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, []);

	return reduced;
}
