import { actionTypes } from "../actions";

const initialState = {
  items: [],
};

const expenseReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case actionTypes.GET_EXPENSES:
      return { ...state, items: action.items };
    default:
      return state;
  }
};

export default expenseReducer;
