import React from 'react';
import 'react-native-gesture-handler';
import { createStackNavigator, createBottomTabNavigator, createAppContainer } from 'react-navigation';
import { Platform } from 'react-native';

import TabBarIcon from '../components/TabBarIcon';

import HomeScreen from '../screens/HomeScreen';
import AddExpense from '../screens/AddExpense';
import SelectCategoryScreen from '../screens/SelectCategoryScreen';
// import CameraRollScreen from '../screens/CameraRollScreen';

import ReportsScreen from '../screens/ReportsScreen';

const HomeStack = createStackNavigator({
  Home: HomeScreen,
  // Expense: Expense
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Expenses',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const ReportsStack = createStackNavigator({
  Links: ReportsScreen,
});

ReportsStack.navigationOptions = {
  tabBarLabel: 'Reports',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-link${focused ? '' : '-outline'}` : 'md-link'}
    />
  ),
};

const TabNavigator = createBottomTabNavigator({
  HomeStack,
  ReportsStack
});

const AddExpenseStack = createStackNavigator({
  AddExpense: AddExpense,
  SelectCategory: SelectCategoryScreen
});

const RootStack = createStackNavigator({
  TabNavigator: TabNavigator,
  AddExpense: AddExpenseStack,
}, {
  headerMode: 'none',
  mode: 'modal'
});


export default createAppContainer(RootStack);