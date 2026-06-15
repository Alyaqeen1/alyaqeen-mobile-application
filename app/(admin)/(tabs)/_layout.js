import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";
import FloatingTabBar from "../../../components/navigation/FloatingTabBar";

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: "Approvals",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📋</Text>,
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
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🚨</Text>,
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
