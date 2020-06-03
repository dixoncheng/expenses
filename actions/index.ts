import { AsyncStorage } from "react-native";
import * as contentful from "../functions/contentful";

// action types
export const actionTypes = {
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  SET_ACCESS_TOKEN: "SET_ACCESS_TOKEN",
  GET_EXPENSES: "GET_EXPENSES",
};

// action creators
export const userLogin = () => ({ type: actionTypes.USER_LOGIN });
export const userLogout = () => ({ type: actionTypes.USER_LOGOUT });
export const setAccessToken = (accessToken: string | null) => ({
  type: actionTypes.SET_ACCESS_TOKEN,
  accessToken,
});
export const setExpenses = (items: Array<any>) => ({
  type: actionTypes.GET_EXPENSES,
  items,
});

export const getAccessToken = () => {
  return async (dispatch: any) => {
    // TODO use expo-secure-store
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (accessToken) {
      dispatch(loginUser(accessToken));
    }
    dispatch(setAccessToken(accessToken));
  };
};

export const loginUser = (accessToken: string) => {
  return async (dispatch: any) => {
    try {
      // TODO use expo-secure-store
      await AsyncStorage.setItem("accessToken", accessToken);
      dispatch(userLogin());
    } catch (error) {
      alert(error);
    }
  };
};

export const logoutUser = () => {
  return async (dispatch: any) => {
    try {
      // TODO use expo-secure-store
      await AsyncStorage.removeItem("accessToken");
      dispatch(userLogout());
    } catch (error) {
      alert(error);
    }
  };
};

export const getExpenses = () => {
  return async (dispatch: any, getState: Function) => {
    const { accessToken } = getState().userReducer;
    if (!accessToken) {
      return;
    }
    const items = await contentful.getExpenses(accessToken);
    dispatch(setExpenses(items));
  };
};
