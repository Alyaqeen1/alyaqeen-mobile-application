export function getDashboardRouteForRole(role) {
  switch (role) {
    case "admin":
      return "/(admin)/(tabs)";
    case "teacher":
      return "/(teacher)/(tabs)";
    case "parent":
      return "/(parent)/(tabs)";
    default:
      return "/(public)/(tabs)";
  }
}
