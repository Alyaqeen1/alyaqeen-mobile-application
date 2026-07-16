import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts";

export const TAB_BAR_BASE_HEIGHT = 60;
export const TAB_BAR_SCENE_PADDING = 124;

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  const activeTabBackgroundColor = colors.goldSoft;
  const inactiveTabBackgroundColor = "transparent";
  const activeTextColor = colors.gold;
  const inactiveTextColor = colors.textMuted;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#0B1220" : "#F8F5EE", // Solid colors
          borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          paddingBottom: bottomInset,
          minHeight: TAB_BAR_BASE_HEIGHT + bottomInset,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              styles.tabItem,
              {
                backgroundColor: isFocused ? activeTabBackgroundColor : inactiveTabBackgroundColor,
              },
            ]}
          >
            {options.tabBarIcon &&
              options.tabBarIcon({
                color: isFocused ? activeTextColor : inactiveTextColor,
                size: 24,
                focused: isFocused,
              })}
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused ? activeTextColor : inactiveTextColor,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingTop: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },
});
