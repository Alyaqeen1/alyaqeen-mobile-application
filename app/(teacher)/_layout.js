import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerContent from "../../components/navigation/DrawerContent";
import ProtectedRoute from "../../components/navigation/ProtectedRoute";
import CustomHeader from "../../components/navigation/CustomHeader";
import { useTheme } from "../../contexts";
import AppBackground from "../../components/common/AppBackground";

export default function TeacherLayout() {
  const { colors } = useTheme();

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppBackground>
          <Drawer
            drawerContent={(props) => <DrawerContent {...props} />}
            screenOptions={{
              headerShown: true,
              header: (props) => <CustomHeader {...props} />,
              drawerStyle: { backgroundColor: colors.drawerBackground },
              sceneStyle: { backgroundColor: "transparent" },
              drawerActiveTintColor: colors.gold,
              drawerInactiveTintColor: colors.text,
            }}
          >
            <Drawer.Screen
              name="(tabs)"
              options={{
                title: "Teacher Portal",
              }}
            />
          </Drawer>
        </AppBackground>
      </GestureHandlerRootView>
    </ProtectedRoute>
  );
}
