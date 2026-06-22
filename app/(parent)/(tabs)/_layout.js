import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";
import FloatingTabBar from "../../../components/navigation/FloatingTabBar";

export default function ParentTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="child"
        options={{
          title: "Child",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>👦</Text>,
        }}
      />
      <Tabs.Screen
        name="academy"
        options={{
          title: "Academy",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🏫</Text>,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🔔</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
