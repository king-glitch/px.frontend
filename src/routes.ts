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
			route("heroes", "routes/game/heroes.tsx"),
			route("shop", "routes/game/shop.tsx"),
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
