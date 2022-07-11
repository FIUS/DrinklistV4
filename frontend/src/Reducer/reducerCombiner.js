import { combineReducers } from "redux";
import CommonReducer from "./CommonReducer";

const allReducer = combineReducers({
    common: CommonReducer
})

export default allReducer;