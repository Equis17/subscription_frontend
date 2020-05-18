import {combineReducers} from "redux-immutable";
import {reducer as NavLeft} from './../components/NavLeft/store'
import {reducer as PopupModal} from './../components/PopupModal/store'

const reducer = combineReducers({navLeft: NavLeft,popupModal:PopupModal});
export default reducer;
