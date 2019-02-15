import React from 'react';
import { createStackNavigator, createBottomTabNavigator, createAppContainer } from 'react-navigation';
import { Platform } from 'react-native';

import TabBarIcon from '../components/TabBarIcon';

import HomeScreen from '../screens/HomeScreen';
import ExpenseScreen from '../screens/ExpenseScreen';
import SelectCategoryScreen from '../screens/SelectCategoryScreen';
// import CameraRollScreen from '../screens/CameraRollScreen';

import ReportsScreen from '../screens/ReportsScreen';

const ExpenseStack = createStackNavigator({
  Expense: ExpenseScreen,
  SelectCategory: SelectCategoryScreen
});

const HomeStack = createStackNavigator({
  Home: HomeScreen,
  Expense: ExpenseScreen,
  SelectCategory: SelectCategoryScreen
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Expenses',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      // name={
      //   Platform.OS === 'ios'
      //     ? `ios-information-circle${focused ? '' : '-outline'}`
      //     : 'md-information-circle'
      // }
      name='ios-paper'
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
      // name={Platform.OS === 'ios' ? 'ios-link' : 'md-link'}
      name='ios-archive'
    />
  ),
};

const TabNavigator = createBottomTabNavigator({
  HomeStack,
  ReportsStack,
});

const RootStack = createStackNavigator({
  TabNavigator: TabNavigator,
  AddExpense: ExpenseStack
}, {
  headerMode: 'none',
  mode: 'modal'
});


export default createAppContainer(RootStack);