import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import { Provider } from "@/components/ui/provider";
import type { Route } from "./+types/root";

export const links: Route.LinksFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<Meta />
				<Links />
			</head>
			<body>
				<Provider>{children}</Provider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected application error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : `${error.status}`;
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (error && error instanceof Error) {
		details = error.message;
		if (import.meta.env.DEV) {
			stack = error.stack;
		}
	}

	return (
		<main
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "2rem",
			}}
		>
			<div
				style={{
					maxWidth: "480px",
					width: "100%",
					textAlign: "center",
				}}
			>
				<h1
					style={{
						fontSize: "2rem",
						fontWeight: "bold",
						marginBottom: "0.5rem",
					}}
				>
					{message}
				</h1>
				<p
					style={{
						color: "gray",
						marginBottom: "1.5rem",
						fontSize: "0.95rem",
					}}
				>
					{details}
				</p>
				{stack && (
					<pre
						style={{
							textAlign: "left",
							padding: "1rem",
							borderRadius: "8px",
							background: "rgba(0,0,0,0.05)",
							overflowX: "auto",
							fontSize: "0.75rem",
							marginBottom: "1.5rem",
						}}
					>
						<code>{stack}</code>
					</pre>
				)}
				<div
					style={{
						display: "flex",
						gap: "0.75rem",
						justifyContent: "center",
					}}
				>
					<button
						type="button"
						onClick={() => (window.location.href = "/")}
						style={{
							padding: "0.5rem 1.25rem",
							borderRadius: "9999px",
							background: "#0C0E14",
							color: "#fff",
							border: "none",
							cursor: "pointer",
							fontWeight: "600",
							fontSize: "0.875rem",
						}}
					>
						Return Home
					</button>
					<button
						type="button"
						onClick={() => window.location.reload()}
						style={{
							padding: "0.5rem 1.25rem",
							borderRadius: "9999px",
							background: "transparent",
							color: "#0C0E14",
							border: "1px solid rgba(0,0,0,0.15)",
							cursor: "pointer",
							fontWeight: "600",
							fontSize: "0.875rem",
						}}
					>
						Reload
					</button>
				</div>
			</div>
		</main>
	);
}
