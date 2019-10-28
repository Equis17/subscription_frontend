import React, {Component} from 'react'
import {connect} from "react-redux";
import {NavLink} from "react-router-dom";
import './index.less'
import {actionCreators} from './store/index.js'
import {Menu} from "antd";
import request from "../../utils/request";
import api from "../../config/api";


const {SubMenu, Item: MenuItem} = Menu;

class NavLeft extends Component {

  componentDidMount() {
    request('get', {url: api.getRouterList, data: {toggle: '1'}})
      .then(res => {
        res.data.map(i => {
          i.title = i.name;
          i.key = i.url;
          return i;
        });
        this.props.getNavList(res.data);
      })
      .catch(err => console.log(err))
  }

  componentWillReceiveProps(nextProps) {
    const {navListData, menuKey} = nextProps;
    this.getMenuKey(navListData, menuKey);
  }

  getMenuKey(data, key) {
    const {switchMenuName} = this.props;
    data && data.map((item) => {
      item.children && this.getMenuKey(item.children);
      item.key === key && switchMenuName(item.title);
      return true;
    })
  }

  renderMenu = (data) => data ? data.map((item) => {
    if (item.children) {
      return (
        <SubMenu title={item.title} key={item.key}>
          {this.renderMenu(item.children)}
        </SubMenu>
      )
    }
    return <MenuItem title={item.title} key={item.key}>
      <NavLink to={item.key}>{item.title}</NavLink>
    </MenuItem>
  }) : [];

  render() {
    const {menuKey, navListData} = this.props;
    return (
      <div>
        <NavLink to={'/home'}>
          <div className={'logo'}>
            <img src="/assets/logo-ant.svg" alt=""/>
            <span>Title</span>
          </div>
        </NavLink>
        <Menu
          theme={'dark'}
          selectedKeys={[menuKey]}
        >
          {navListData && this.renderMenu(navListData)}
        </Menu>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  navListData: state.getIn(['navLeft', 'data']),
  menuName: state.getIn(['navLeft', 'menuName']),
  menuKey: state.getIn(['navLeft', 'menuKey'])

});
const mapDispatchToProps = (dispatch) => ({
  getNavList(patch) {
    dispatch(actionCreators.getList(patch))
  },
  switchMenuName(title) {
    dispatch(actionCreators.switchMenuName(title))
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(NavLeft);
