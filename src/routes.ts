import {
	type RouteConfig,
	index,
	layout,
	prefix,
	route,
} from "@react-router/dev/routes";

const financialRoutes = layout("routes/financial/layout.tsx", [
	index("routes/financial/index.tsx"),
	route("transactions", "routes/financial/transactions.tsx"),
	route("transactions/:id", "routes/financial/transaction.tsx"),
	route("categories", "routes/financial/categories.tsx"),
	route("counterparties", "routes/financial/counterparties.tsx"),
]);

export default [
	layout("routes/app-layout.tsx", [
		index("routes/index.tsx"),
		route("dashboard", "routes/dashboard.tsx"),
		route("tasks", "routes/tasks.tsx"),
		route("health", "routes/health.tsx"),
		...prefix("financial", [financialRoutes]),
	]),
	...prefix("authentication", [
		route("login", "routes/authentication/login.tsx"),
		route("register", "routes/authentication/register.tsx"),
	]),
	route("login", "routes/login.tsx"),
	route("register", "routes/register.tsx"),
] satisfies RouteConfig;
