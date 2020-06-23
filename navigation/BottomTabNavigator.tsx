import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useSafeArea } from "react-native-safe-area-context";

import TabBarIcon from "../components/TabBarIcon";
import HomeScreen from "../screens/HomeScreen";
import ReportsScreen from "../screens/ReportsScreen";
import ExpenseScreen from "../screens/ExpenseScreen";
import SelectCategoryScreen from "../screens/SelectCategoryScreen";
import screenOptions from "../constants/screenOptions";

import Colors from "../constants/Colors";
import Theme from "../constants/Theme";

const BottomTab = createBottomTabNavigator();

const HomeStack = createStackNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen
      name="Home"
      component={HomeScreen}
      options={{ ...screenOptions, headerShown: false }}
    />
    <HomeStack.Screen
      name="Expense"
      component={ExpenseScreen}
      options={screenOptions}
    />
    <HomeStack.Screen
      name="SelectCategory"
      component={SelectCategoryScreen}
      options={screenOptions}
    />
  </HomeStack.Navigator>
);

const ReportsStack = createStackNavigator();
const ReportsStackScreen = () => (
  <ReportsStack.Navigator>
    <ReportsStack.Screen
      name="Reports"
      component={ReportsScreen}
      options={{ ...screenOptions, headerShown: false }}
    />
  </ReportsStack.Navigator>
);

export default function BottomTabNavigator() {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  //   navigation.setOptions({ headerTitle: getHeaderTitle(route) });

  const insets = useSafeArea();

  return (
    <BottomTab.Navigator
      tabBarOptions={{
        style: {
          height: 70 + insets.bottom,
          padding: 12,
        },
        activeTintColor: Colors.tabIconSelected,
        labelStyle: {
          fontFamily: Theme.fontFamily,
          marginBottom: 12,
        },
      }}
    >
      <BottomTab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          title: "Expenses",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="receipt" />
          ),
        }}
      />
      <BottomTab.Screen
        name="ReportsTab"
        component={ReportsStackScreen}
        options={{
          title: "Reports",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="file-alt" />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}
