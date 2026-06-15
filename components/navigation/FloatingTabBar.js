import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../contexts";

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const { isDark } = useTheme();

  const activeTabBackgroundColor = isDark ? "#1E293B" : "#FFFFFF";
  const inactiveTabBackgroundColor = isDark ? "#1E293B" : "#FFFFFF";
  const activeTextColor = "#C9A227";
  const inactiveTextColor = isDark ? "#94A3B8" : "#6B7280";

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
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
              isFocused && styles.activeTabItem,
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
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 20,
  },
  activeTabItem: {
    backgroundColor: "transparent",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
});
