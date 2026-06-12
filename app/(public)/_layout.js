import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerContent from "../../components/navigation/DrawerContent";

export default function PublicLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <DrawerContent role="public" {...props} />}
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: "#F8F5EE" },
          headerTintColor: "#1E3A5F",
          drawerStyle: { backgroundColor: "#F8F5EE" },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "Alyaqeen Academy",
            headerTitle: "Alyaqeen Academy",
          }}
        />
        <Drawer.Screen
          name="about"
          options={{ title: "About Academy" }}
        />
        <Drawer.Screen
          name="vacancies"
          options={{ title: "Vacancies" }}
        />
        <Drawer.Screen
          name="volunteer-opportunities"
          options={{ title: "Volunteer Opportunities" }}
        />
        <Drawer.Screen
          name="contact"
          options={{ title: "Contact Us" }}
        />
        <Drawer.Screen
          name="settings"
          options={{ title: "Settings" }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
