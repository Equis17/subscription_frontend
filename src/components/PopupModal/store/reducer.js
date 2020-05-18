import * as constants from './constants'
import {fromJS} from 'immutable'
const defaultState = fromJS({
  options:{
    visible:false,
    title:''
  }
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case constants.SWITCH_VISIBLE:
      return state.set('options', action.options);
    default:
      return state;
  }
}
