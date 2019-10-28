import React, {Component} from 'react'
import {connect} from "react-redux";

import './index.less'

class Login extends Component {
  render() {
    return (
      <div className={'login'}>
        <div className={'login-header'}>
          <div className="login-header-logo">
            <img src="/assets/logo-ant.svg" alt=""/>
            <span>XXX</span>
          </div>
        </div>
        <div className={'login-wrap clearfix'}>
          <div className="login-content">
            <div className="login-content-words">
              <p>ssss sssss


                asdsad
              </p>
            </div>
            <div className={'login-content-form'}>
              form
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, null)(Login);
