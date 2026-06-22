import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts";

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const activeTabBackgroundColor = colors.surfaceSoft;
  const inactiveTabBackgroundColor = "transparent";
  const activeTextColor = "#C9A227";
  const inactiveTextColor = colors.textMuted;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: "transparent",
          bottom: insets.bottom + 8,
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
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 18,
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
