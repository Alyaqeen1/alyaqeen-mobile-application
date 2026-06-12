import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function PublicTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#FFFFFF" },
        tabBarActiveTintColor: "#C9A227",
        tabBarInactiveTintColor: "#6B7280",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: "Prayer",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>🕌</Text>,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: "Announcements",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>📢</Text>,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size, color }}>☰</Text>,
        }}
      />
    </Tabs>
  );
}
