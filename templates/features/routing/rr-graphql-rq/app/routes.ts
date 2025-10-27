import {
  type RouteConfig,
  route,
  index
} from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("maintenance-mode", "routes/maintenance-mode.tsx")
] satisfies RouteConfig;
