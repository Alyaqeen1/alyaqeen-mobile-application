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
          drawerActiveTintColor: "#C9A227",
          drawerInactiveTintColor: "#1F3A32",
        }}
      >
        {/* This is the main tab navigator - it will show tabs at the bottom */}
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "Home",
            headerTitle: "Alyaqeen Academy",
            drawerLabel: "Home",
          }}
        />
        
        {/* Individual screens that will show without tabs */}
        <Drawer.Screen
          name="about"
          options={{
            title: "About Academy",
            drawerLabel: "About Academy",
          }}
        />
        <Drawer.Screen
          name="vacancies"
          options={{
            title: "Vacancies",
            drawerLabel: "Vacancies",
          }}
        />
        <Drawer.Screen
          name="volunteer-opportunities"
          options={{
            title: "Volunteer Opportunities",
            drawerLabel: "Volunteer Opportunities",
          }}
        />
        <Drawer.Screen
          name="contact"
          options={{
            title: "Contact Us",
            drawerLabel: "Contact Us",
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
            drawerLabel: "Settings",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}