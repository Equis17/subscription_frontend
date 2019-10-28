import * as constants from './constants'

export const switchMenuName = (menuName) => ({
  type: constants.SWITCH_MENU_NAME,
  menuName
});

export const switchMenuKey = (menuKey) => ({
  type: constants.SWITCH_MENU_KEY,
  menuKey
});

export const getList = (list) => ({
  type: constants.GET_LIST,
  data: list
});
