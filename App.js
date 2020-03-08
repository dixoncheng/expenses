import React, { useState, useEffect } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  AsyncStorage
} from "react-native";
import { SplashScreen } from "expo";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import ExpenseScreen from "./screens/ExpenseScreen";
import SelectCategoryScreen from "./screens/SelectCategoryScreen";

import LoginScreen from "./screens/LoginScreen";

const Stack = createStackNavigator();
const ExpenseStack = createStackNavigator();

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = useState(false);
  // const [initialNavigationState, setInitialNavigationState] = React.useState();

  const [isLoggedIn, setLoggedIn] = useState(false);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        const value = await AsyncStorage.getItem("expensesLoggedIn");
        if (value !== null) {
          setLoggedIn(true);
        }

        SplashScreen.preventAutoHide();

        // Load our initial navigation state
        // setInitialNavigationState(await getInitialState());

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hide();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  const ExpenseStackScreens = () => (
    <ExpenseStack.Navigator>
      <ExpenseStack.Screen name="AddExpense" component={ExpenseScreen} />
      <ExpenseStack.Screen
        name="SelectCategory"
        component={SelectCategoryScreen}
      />
    </ExpenseStack.Navigator>
  );

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        {Platform.OS === "ios" && <StatusBar barStyle="default" />}

        <NavigationContainer>
          <Stack.Navigator headerMode="none" mode="modal">
            {isLoggedIn ? (
              <>
                <Stack.Screen name="Root" component={BottomTabNavigator} />
                <Stack.Screen
                  name="AddExpense"
                  component={ExpenseStackScreens}
                />
              </>
            ) : (
              <Stack.Screen
                name="Login"
                component={() => (
                  <LoginScreen login={() => setLoggedIn(true)} />
                )}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
