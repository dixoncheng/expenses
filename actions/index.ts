import { AsyncStorage } from "react-native";
import contentful from "../constants/contentful";

const {
  createClient,
} = require("contentful-management/dist/contentful-management.browser.min.js");

// action types
export const actionTypes = {
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  SET_USER_TOKEN: "SET_USER_TOKEN",
  SET_CLIENT: "SET_CLIENT",
  GET_EXPENSES: "GET_EXPENSES",
};

// action creators
export const userLogin = () => ({ type: actionTypes.USER_LOGIN });
export const userLogout = () => ({ type: actionTypes.USER_LOGOUT });
export const setUserToken = (userToken: string | null) => ({
  type: actionTypes.SET_USER_TOKEN,
  userToken,
});
export const getExpenses = (items: Array<any>) => ({
  type: actionTypes.GET_EXPENSES,
  items,
});
export const setClient = (client) => ({
  type: actionTypes.SET_CLIENT,
  client,
});

export const fetchUserToken = () => {
  return async (dispatch: any) => {
    // TODO use expo-secure-store
    const userToken = await AsyncStorage.getItem("accessToken");
    if (userToken) {
      dispatch(loginUser(userToken));
    }
    dispatch(setUserToken(userToken));
  };
};

export const loginUser = (userToken: string) => {
  return async (dispatch: any) => {
    try {
      // TODO use expo-secure-store
      await AsyncStorage.setItem("accessToken", userToken);

      const client = createClient({
        accessToken: userToken,
      });
      dispatch(setClient(client));

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

export const fetchExpenses = () => {
  return async (dispatch: any, getState: Function) => {
    // console.log(getState());

    const { client } = getState().userReducer;
    if (!client) {
      return;
    }
    client
      .getSpace(contentful.spaceId)
      .then((space: any) => space.getEnvironment(contentful.env))
      .then((environment: any) =>
        environment.getEntries({
          content_type: contentful.contentType,
          select:
            "sys.id,fields.amount,fields.category,fields.date,fields.notes,fields.photo",
          order: "-fields.date",
        })
      )
      .then((response: any) => {
        // console.log(response);
        const items = response.items.map(
          ({ sys, fields: { photo, date, amount, category, notes } }) => {
            return {
              id: sys.id,
              photo: photo && photo["en-US"].sys.id,
              date: date && new Date(date["en-US"]),
              amount: amount && amount["en-US"] + "",
              category: category && category["en-US"],
              notes: notes && notes["en-US"],
            };
          }
        );
        dispatch(getExpenses(items));
      })
      .catch(function (error: any) {
        console.log(error);
      });
  };
};
