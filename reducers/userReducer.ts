import { actionTypes } from "../actions";

const initialState = {
  loggedIn: false,
  client: null,
};

const userReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.USER_LOGIN:
      return { ...state, loggedIn: true };
    case actionTypes.USER_LOGOUT:
      return { ...state, loggedIn: false };
    case actionTypes.SET_USER_TOKEN:
      return { ...state, userToken: action.userToken };
    case actionTypes.SET_CLIENT:
      return { ...state, client: action.client };
    default:
      return state;
  }
};

export default userReducer;
