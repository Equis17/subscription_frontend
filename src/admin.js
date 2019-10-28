import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Row, Col} from 'antd';
import NavLeft from './components/NavLeft'
import Header from './components/Header'
import './style/common.less'
import {actionCreators} from "./components/NavLeft/store";

class Admin extends Component {

  render() {
    return (
      <Row className={'container'}>
        <Col span={4} className={'nav-left'}>
          <NavLeft/>
        </Col>
        <Col span={20} className={'main'}>
          <Header/>
          <Row className={'content'}>
            {this.props.children}
          </Row>
        </Col>
      </Row>
    );
  }
}
const mapDispatchToProps = (dispatch) => ({
  switchMenuName(name) {
    dispatch(actionCreators.switchMenuName(name));
  }
});
export default connect(null, mapDispatchToProps)(Admin)
