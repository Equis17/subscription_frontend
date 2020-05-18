import * as constants from 'constants'
import {fromJs} from 'immutable';

const defaultState = fromJs({
  weather: '',
  weatherUrl: '',
  date: ''
});

export default (state = defaultState, action) => {

}
