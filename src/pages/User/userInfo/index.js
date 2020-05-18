import React, {Component} from 'react'
import request from "../../../utils/request";
import api from "../../../config/api";
import {Button, Card, Col, Form, Input, message, Select} from "antd";
import {actionCreators} from "../../../components/NavLeft/store";
import {connect} from "react-redux";
import {ruleObj} from "../../../utils/utils";
import JSEncrypt from 'jsencrypt'

const {Item} = Form;
const {Option} = Select;

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 8},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 8},
  },
};

class UserInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      classList: []
    }
  }


  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    request('get', {url: api.getClientInfo})
      .then(res => {
        this.setState({userInfo: res.data});
        return request('get', {url: api.getUserClassList})
      })
      .then(res => {
        this.setState({classList: res.data})
      })
      .catch(err => console.log(err))
  }

  handleSubmit() {
    const {form} = this.props;
    const {userInfo} = this.state;
    userInfo.className ?
      form.validateFields(['password', 'phoneNumber'], (err) => {
        if (!err) {
          const {password, phoneNumber} = form.getFieldsValue();
          request('get', {url: api.getPublicKey})
            .then(res => {
              const encrypt = new JSEncrypt();
              encrypt.setPublicKey(res.data.publicKey);
              const encryptedPassword = encrypt.encrypt(password);
              return request('post', {
                url: api.editClientInfo,
                data: {password: encryptedPassword, phoneNumber}
              })
            })
            .then(res => {
              message.success(res.message);
              window.location.reload()
            })
        }
      })
      : form.validateFields(['classId'], err => {
        if (!err) {
          request('post', {url: api.addClassByUser, data: form.getFieldsValue()})
            .then(res => {
              message.success(res.message);
              window.location.reload()
            })
        }
      })
  }

  renderUserInfo() {
    const {userInfo} = this.state;
    const {form} = this.props;
    const {getFieldDecorator, resetFields} = form;
    return (
      <Card>
        <Form {...formItemLayout}>
          <Item label={'姓名'}>
            <span>{userInfo.realName}</span>
          </Item>
          <Item label={'用户类型'}><span>{userInfo.roleName}</span></Item>
          <Item label={'所在院系'}><span>{userInfo.collegeName}-{userInfo.session}-{userInfo.className}</span></Item>
          <Item label={'账号'}>
            <span>{userInfo.account}</span>
          </Item>
          <Item label={'密码'}>
            {getFieldDecorator('password', {
              rules: [
                {required: true, message: '密码不能为空'},
                ruleObj.maxChar,
                ruleObj.minChar
              ],
            })(<Input/>)}
          </Item>
          <Item label={'手机号码'}>
            {getFieldDecorator('phoneNumber', {
              initialValue: userInfo.phoneNumber,
              rules: [
                {required: true, message: '手机号码不能为空'},
                ruleObj.phoneNumber
              ],
            })(<Input/>)}
          </Item>
          <Col col={8} offset={8}>
            <Button type={"danger"} onClick={() => resetFields()}>重置</Button>
            <Button type={"primary"} onClick={() => this.handleSubmit()}>修改</Button>
          </Col>
        </Form>
      </Card>
    )
  }

  renderInit() {
    const {form} = this.props;
    const {classList, userInfo} = this.state;
    const {getFieldDecorator} = form;
    return (
      <Card>
        <Form {...formItemLayout}>
          <Item label={'姓名'}><span>{userInfo.realName}</span></Item>
          <Item label={'手机号码'}> <span>{userInfo.phoneNumber}</span></Item>
          <Item label={'用户账号'}> <span>{userInfo.account}</span></Item>
          <Item label={'用户类型'}> <span>{userInfo.roleName}</span></Item>
          <Item label={'班级'}>
            {getFieldDecorator('classId', {
              rule: [{required: true, message: '班级不能为空'}]
            })(
              <Select
                showSearch={true}
                optionFilterProp={'children'}
                filterOption={(input, option) => option.props.children.includes(input)}
              >
                {classList.map(item => <Option value={item.id} key={item.id}>
                  {`${item.collegeName}-${item.session}-${item.className}`}</Option>)
                }
              </Select>
            )
            }
          </Item>
          <Col col={8} offset={8}><Button type={"primary"} onClick={() => this.handleSubmit()}>确认</Button></Col>
        </Form>
      </Card>
    )
  }

  render() {
    const {userInfo} = this.state;
    return (
      <div>
        {userInfo.className ? this.renderUserInfo() : this.renderInit()}
      </div>
    )
  }
}

const userInfoForm = Form.create()(UserInfo);

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey(key) {
    dispatch(actionCreators.switchMenuKey(key));
  }
});
export default connect(null, mapDispatchToProps)(userInfoForm)
