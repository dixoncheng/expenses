import React from "react";
import { Platform } from "react-native";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";

import TabBarIcon from "../components/TabBarIcon";
import HomeScreen from "../screens/HomeScreen";
import ExpenseScreen from "../screens/ExpenseScreen";
import SelectCategoryScreen from "../screens/SelectCategoryScreen";
import ReportsScreen from "../screens/ReportsScreen";

const config = Platform.select({
  web: { headerMode: "screen" },
  default: {}
});

const HomeStack = createStackNavigator(
  {
    Home: HomeScreen,
    Expense: ExpenseScreen,
    SelectCategory: SelectCategoryScreen
  },
  config
);

HomeStack.navigationOptions = {
  tabBarLabel: "Expenses",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      // name={
      //   Platform.OS === "ios"
      //     ? `ios-information-circle${focused ? "" : "-outline"}`
      //     : "md-information-circle"
      // }
      name="ios-paper"
    />
  )
};

HomeStack.path = "";

const ExpenseStack = createStackNavigator(
  {
    Expense: ExpenseScreen,
    SelectCategory: SelectCategoryScreen
  },
  config
);

const ReportsStack = createStackNavigator(
  {
    Links: ReportsScreen
  },
  config
);

ReportsStack.navigationOptions = {
  tabBarLabel: "Reports",
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      // name={Platform.OS === "ios" ? "ios-options" : "md-options"}
      name="ios-archive"
    />
  )
};

ReportsStack.path = "";

const tabNavigator = createBottomTabNavigator({
  HomeStack,
  ReportsStack
});

tabNavigator.path = "";

const RootStack = createStackNavigator(
  {
    TabNavigator: tabNavigator,
    AddExpense: ExpenseStack
  },
  {
    headerMode: "none",
    mode: "modal"
  }
);

// export default tabNavigator;
export default RootStack;
