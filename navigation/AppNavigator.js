import React from 'react';
// import { createSwitchNavigator } from 'react-navigation';
import { createStackNavigator, createBottomTabNavigator, createAppContainer } from 'react-navigation';

import { Platform } from 'react-native';
// import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';

import HomeScreen from '../screens/HomeScreen';
import AddExpense from '../screens/AddExpense';
import SelectCategoryScreen from '../screens/SelectCategoryScreen';
// import CameraRollScreen from '../screens/CameraRollScreen';

import LinksScreen from '../screens/LinksScreen';
// import SettingsScreen from '../screens/SettingsScreen';



const HomeStack = createStackNavigator({
  Home: HomeScreen,
  // AddExpense: AddExpense,
  // SelectCategory: SelectCategoryScreen,
  
  // CameraRoll: CameraRollScreen,

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

const LinksStack = createStackNavigator({
  Links: LinksScreen,
});

LinksStack.navigationOptions = {
  tabBarLabel: 'Reports',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-link${focused ? '' : '-outline'}` : 'md-link'}
    />
  ),
};

// const SettingsStack = createStackNavigator({
//   Settings: SettingsScreen,
// });

// SettingsStack.navigationOptions = {
//   tabBarLabel: 'Settings',
//   tabBarIcon: ({ focused }) => (
//     <TabBarIcon
//       focused={focused}
//       name={Platform.OS === 'ios' ? `ios-options${focused ? '' : '-outline'}` : 'md-options'}
//     />
//   ),
// };

// export default createBottomTabNavigator({
//   HomeStack,
//   LinksStack
//   // SettingsStack,
// });




// import MainTabNavigator from './MainTabNavigator';

// export default createSwitchNavigator({
//   // You could add another route here for authentication.
//   // Read more at https://reactnavigation.org/docs/en/auth-flow.html
//   Main: MainTabNavigator,
// });

const TabNavigator = createBottomTabNavigator({
  HomeStack,
  LinksStack
});


const AddExpenseStack = createStackNavigator({
  
  AddExpense: AddExpense,
  SelectCategory: SelectCategoryScreen,
  
  // CameraRoll: CameraRollScreen,

});


const RootStack = createStackNavigator({
  // Home: HomeScreen,
  
  // SelectCategory: SelectCategoryScreen,
  TabNavigator: TabNavigator,
  // CameraRoll: CameraRollScreen,
  AddExpense: AddExpenseStack,

}, {
  headerMode: 'none',
  mode: 'modal'
});



export default createAppContainer(RootStack);