import { combineReducers } from "redux";
import userReducer from "./userReducer";
import expenseReducer from "./expenseReducer";

export default combineReducers({
  userReducer,
  expenseReducer,
});
