import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  ...prefix("authentication", [
    route("login", "routes/authentication/login.tsx"),
    route("register", "routes/authentication/register.tsx"),
  ]),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
] satisfies RouteConfig;
