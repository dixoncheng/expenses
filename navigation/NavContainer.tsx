import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useSelector, useDispatch } from "react-redux";

import BottomTabNavigator from "./BottomTabNavigator";
import LoginScreen from "../screens/LoginScreen";
import ExpenseScreen from "../screens/ExpenseScreen";
import SelectCategoryScreen from "../screens/SelectCategoryScreen";

import { fetchUserToken } from "../actions";

const RootStack = createStackNavigator();

const ExpenseStack = createStackNavigator();
const ExpenseStackScreen = () => (
  <ExpenseStack.Navigator>
    <ExpenseStack.Screen name="AddExpense" component={ExpenseScreen} />
    <ExpenseStack.Screen
      name="SelectCategory"
      component={SelectCategoryScreen}
    />
  </ExpenseStack.Navigator>
);

const NavContainer = () => {
  const dispatch = useDispatch();
  const { loggedIn } = useSelector((state: any) => state.userReducer);

  useEffect(() => {
    dispatch(fetchUserToken());
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator headerMode="none" mode="modal">
        {loggedIn ? (
          <>
            <RootStack.Screen name="Root" component={BottomTabNavigator} />
            <RootStack.Screen
              name="AddExpense"
              component={ExpenseStackScreen}
            />
          </>
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default NavContainer;
