import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

export function AppButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}) {
  const baseClasses =
    "py-3 px-6 rounded-2xl items-center justify-center flex-row gap-2";

  const variantClasses = {
    primary: "bg-gold text-navy",
    secondary: "bg-secondary text-secondary-foreground border border-border",
    outline: "border-2 border-gold text-gold",
  };

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        disabled ? "opacity-50" : ""
      }`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "oklch(0.22 0.05 250)" : "oklch(0.78 0.12 75)"}
        />
      ) : (
        <Text className="font-semibold text-sm">{title}</Text>
      )}
    </TouchableOpacity>
  );
}
