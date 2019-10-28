import * as constants from './constants'
import {fromJS} from 'immutable'

const defaultState = fromJS({
  menuName: '',
  menuKey: '',
  data: ''
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case constants.SWITCH_MENU_NAME:
      return state.set('menuName', action.menuName);
    case constants.SWITCH_MENU_KEY:
      return state.set('menuKey', action.menuKey);
    case constants.GET_LIST:
      return state.set('data', action.data);
    default:
      return state;
  }
}
