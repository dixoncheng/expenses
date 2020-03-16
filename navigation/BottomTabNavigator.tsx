import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import TabBarIcon from "../components/TabBarIcon";
import HomeScreen from "../screens/HomeScreen";
import ReportsScreen from "../screens/ReportsScreen";
import ExpenseScreen from "../screens/ExpenseScreen";
import SelectCategoryScreen from "../screens/SelectCategoryScreen";

const BottomTab = createBottomTabNavigator();

const HomeStack = createStackNavigator();
const HomeStackScreen = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="Expense" component={ExpenseScreen} />
    <HomeStack.Screen name="SelectCategory" component={SelectCategoryScreen} />
  </HomeStack.Navigator>
);

const ReportsStack = createStackNavigator();
const ReportsStackScreen = () => (
  <ReportsStack.Navigator>
    <ReportsStack.Screen name="Reports" component={ReportsScreen} />
  </ReportsStack.Navigator>
);

export default function BottomTabNavigator() {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  //   navigation.setOptions({ headerTitle: getHeaderTitle(route) });

  return (
    <BottomTab.Navigator>
      <BottomTab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          title: "Expenses",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="ios-paper" />
          )
        }}
      />
      <BottomTab.Screen
        name="ReportsTab"
        component={ReportsStackScreen}
        options={{
          title: "Reports",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="ios-archive" />
          )
        }}
      />
    </BottomTab.Navigator>
  );
}
