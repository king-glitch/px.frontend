import {
	type RouteConfig,
	index,
	layout,
	prefix,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/app-layout.tsx", [
		index("routes/index.tsx"),
		route("dashboard", "routes/dashboard.tsx"),
		route("tasks", "routes/tasks.tsx"),
		route("health", "routes/health.tsx"),
		route("settings", "routes/settings.tsx"),
		route("settings/duolingo", "routes/settings/duolingo.tsx"),
		...prefix("game", [
			// The shop and inventory are sections of the hero page, not pages
			// of their own — the optional segment gives them real URLs without
			// splitting the layout.
			route("heroes/:section?", "routes/game/heroes.tsx"),
			route("finance", "routes/game/finance.tsx"),
		]),
	]),
	...prefix("authentication", [
		route("login", "routes/authentication/login.tsx"),
		route("register", "routes/authentication/register.tsx"),
	]),
	route("login", "routes/login.tsx"),
	route("register", "routes/register.tsx"),
] satisfies RouteConfig;
