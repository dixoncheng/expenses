import { actionTypes } from "../actions";

const initialState = {
  loggedIn: false,
};

const userReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.USER_LOGIN:
      return { ...state, loggedIn: true };
    case actionTypes.USER_LOGOUT:
      return { ...state, loggedIn: false };
    case actionTypes.SET_ACCESS_TOKEN:
      return { ...state, accessToken: action.accessToken };
    default:
      return state;
  }
};

export default userReducer;
