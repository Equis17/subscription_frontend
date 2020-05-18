import React, {Component} from 'react'
import {connect} from "react-redux";
import './index.less'
import JSEncrypt from 'jsencrypt'
import {Button, Col, Form, message, Icon, Input, Row, Select} from "antd";
import request from "../../utils/request";
import api from '../../config/api'

const Option = Select.Option;

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      captchaElement: '',
      captchaSid: '',
      isLoading: false,
      roleList: []
    }
  }

  componentDidMount() {
    this.getRoleType();
    this.getCaptcha();
  }

  getRoleType() {
    request('get', {url: api.getPublicRoleList, data: {toggle: 1}})
      .then(res => this.setState({roleList: res.data}))
      .catch(err => console.log(err))
  }

  getCaptcha() {
    const captchaSid = parseInt(Math.random() * 1000000 + '', 10);
    request('get', {url: api.getCaptcha, data: {sid: captchaSid}})
      .then(res => res && this.setState({captchaElement: res.data ? res.data : '', captchaSid}))
  }

  getPublicKey() {
    return request('get', {url: api.getPublicKey})
  }


  handleSubmit() {
    const {form} = this.props;
    const {captchaSid: sid} = this.state;
    form.validateFields((err) => {
      if (!err) {
        this.setState({isLoading: true});
        this.getPublicKey()
          .then(res => {
            const encrypt = new JSEncrypt();
            encrypt.setPublicKey(res.data.publicKey);
            const {password: unencryptedPwd} = form.getFieldsValue();
            const password = encrypt.encrypt(unencryptedPwd);
            return request('post', {
              url: api.login,
              data: {...form.getFieldsValue(), sid, password}
            })
          })
          .then(res => {
            this.setState({isLoading: false});
            if (res.code === 200) {
              message.success(res.message);
              localStorage.setItem('token', `Bearer ${res.token}`);
              window.location.replace('/')
            } else {
              message.error(res.message);
              this.getCaptcha();
            }
          })
          .catch(err => console.log(err));
      }
    })
  }


  renderModal() {
    const {captchaElement, isLoading, roleList} = this.state;
    const {getFieldDecorator} = this.props.form;
    return (
      <div className={'login-modal'}>
        <p className={'login-modal-title'}>用户登录</p>
        <Form className="login-form" onKeyPress={(e) => e.charCode === 13 && this.handleSubmit()}>
          <Form.Item>
            {getFieldDecorator('account', {
              rules: [{required: true, message: '账号不能为空'}],
            })(
              <Input
                prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                placeholder="请输入账号"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{required: true, message: '密码不能为空'}],
            })(
              <Input
                prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                type="password"
                placeholder="请输入密码"
              />,
            )}
          </Form.Item>
          <Form.Item>
            <Row gutter={8}>
              <Col span={12}>
                {getFieldDecorator('roleId', {
                  initialValue: 4,
                  rules: [{required: true, message: '用户类型不能为空'}],
                })(
                  <Select
                    prefix={<Icon type="robot" style={{color: 'rgba(0,0,0,.25)'}}/>}
                  >
                    {roleList.map(item => <Option value={item.id} key={item.id}>{item.roleName}</Option>)}
                  </Select>
                )}
              </Col>
            </Row>
          </Form.Item>
          <Form.Item>
            <Row gutter={8}>
              <Col span={12}>
                {getFieldDecorator('captcha', {
                  rules: [
                    {required: true, message: '验证码不能为空'},
                    {min: 4, message: '请输入正确的验证码'},
                    {max: 4, message: '请输入正确的验证码'}
                  ],
                })(<Input placeholder="请输入验证码"/>)}
              </Col>
              <Col span={12}>
                <div onClick={() => this.getCaptcha()} dangerouslySetInnerHTML={{__html: captchaElement}}/>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item>
            <Button
              loading={isLoading}
              style={{width: '100%'}}
              type="primary"
              className="login-form-button"
              onClick={() => this.handleSubmit()}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }

  render() {
    return (
      <div className={'login'}>
        <div className={'login-header'}>
          <img src="/assets/logo-ant.svg" alt=""/>
          <span>高校教材征订系统</span>
        </div>
        <div className={'login-wrap'}>
          {this.renderModal()}
        </div>
      </div>
    );
  }
}

const LoginForm = Form.create()(Login);

export default connect(null, null)(LoginForm);
