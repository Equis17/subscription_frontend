import React, {Component} from "react";
import {CardTable, PopupModal, SearchBox} from '../../components'
import * as NavLeftAction from "../../components/NavLeft/store/actionCreators";
import * as PopupModalAction from "../../components/PopupModal/store/actionCreators";
import {connect} from "react-redux";
import {Popconfirm, message} from "antd";
import JSEncrypt from 'jsencrypt';
import request from "../../utils/request";
import api from "../../config/api";
import {ruleObj} from "../../utils/utils";

class UserManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableList: [],
      roleList: [],
      isTableLoading: true,
      modalFields: {
        toggle: 1,
        roleId: '',
        account: '',
        realName: '',
        phoneNumber: '',
        id: ''
      },
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getSelectList()
      .then(() => this.getUserList({}));
  }

  _setModalFields({toggle = '1', roleId = '', account = '', realName = '', phoneNumber = '', id = ''}) {
    this.setState({modalFields: {toggle, roleId, account, realName, phoneNumber, id}})
  }

  getSelectList() {
    return request('get', {url: api.getRoleList, data: {}})
      .then(res => {
        const roleList = res.data.map(i => {
          i.value = i.id.toString();
          i.label = i.roleName;
          return i;
        })
          .filter(i => !i.label.includes('管理员') && !i.label.includes('批发商'));
        this.setState({roleList});
      })
      .catch(err => console.log(err));
  }

  getUserList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getUserList, data: fields})
      .then(res => this.setState({tableList: res.data, isTableLoading: false}))
      .catch(err => console.log(err));
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getUserList(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增用户'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    const {roleList = []} = this.state;
    return [
      [
        {type: 'INPUT', label: '用户名', field: 'account'},
        {type: 'INPUT', label: '真实姓名', field: 'realName'},
        {type: 'INPUT', label: '手机号', field: 'phoneNumber'},
        {
          type: 'BUTTON', field: 'btns',
          btns: [{
            label: '搜索',
            attr: {
              icon: 'search',
              key: 'search',
              style: {float: 'right'},
              onClick: () => this.handleSearch(form.getFieldsValue())
            }
          }]
        }
      ],
      [
        {
          type: 'SELECT', label: '用户类型', field: 'roleId', initialValue: '',
          opts: [...roleList, {value: '', label: '全部'}]
        },
        {
          type: 'SELECT', label: '是否启用', field: 'toggle', initialValue: '1',
          opts: [{value: '1', label: '是'}, {value: '0', label: '否'}, {value: '', label: '全部'}]
        }
      ]
    ]
  }

//Table
  handleDelete(id) {
    const {searchFilter} = this.state;
    request('post', {url: api.deleteUser + id})
      .then((res) => {
        message.success(res.message);
        this.getUserList(searchFilter)
      })
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '真实姓名', dataIndex: 'realName'},
      {title: '用户类型', dataIndex: 'roleName'},
      {title: '用户名', dataIndex: 'account'},
      {title: '手机号', dataIndex: 'phoneNumber'},
      {
        title: '是否启用',
        dataIndex: 'toggle',
        width: 200,
        align: 'center',
        render: (text, record) => record.toggle
          ? <span style={{color:'#00d232'}}>已启用</span>
          : <span style={{color:'#FF4D4F'}}>未启用</span>
      },
      {
        title: '操作',
        dataIndex: 'unit',
        width: 100,
        align: 'center',
        render: (text, record) => this.renderTableOperation(record)
      }
    ];
    return <CardTable tableConfig={{dataSource, columns, loading, size: 'small', rowKey: (row) => row.id}}/>
  }

  renderTableOperation(record) {
    const {switchVisible} = this.props;
    const {toggle, roleId, account, id, realName, phoneNumber} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({toggle, roleId, account, id, realName, phoneNumber});
          switchVisible({visible: true, title: '编辑用户'})
        }}>编辑</a>
        <span>|</span>
        <Popconfirm
          title={'是否删除该用户?'}
          okText={'确认'}
          cancelText={'取消'}
          onConfirm={() => this.handleDelete(record.id)}
        >
          <a>删除</a>
        </Popconfirm>
      </div>
    )
  }

  //Modal
  handleSubmit(form) {
    const {searchFilter, modalFields} = this.state;
    const {id} = modalFields;
    form.validateFields(['account', 'password', 'realName', 'phoneNumber', 'roleId', 'toggle'], err => {
      if (!err) {
        const {account, password, realName, phoneNumber, roleId, toggle} = form.getFieldsValue();
        request('get', {url: api.getPublicKey})
          .then(res => {
            const encrypt = new JSEncrypt();
            encrypt.setPublicKey(res.data.publicKey);
            const encryptedPassword = encrypt.encrypt(password);
            return request('post', {
              url: id ? api.updateUser + id : api.addUser,
              data: {account, password: encryptedPassword, realName, phoneNumber, roleId, toggle}
            })
          })
          .then(res => {
            message.success(res.message);
            this.props.switchVisible({visible: false, title: ''});
            this._setModalFields({});
            this.getUserList(searchFilter);
          })
          .catch(err => console.log(err));
      }
    });
  }

  renderModal() {
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {roleList = [], modalFields} = this.state;
    const {toggle = '1', roleId = '1', account = '', realName = '', phoneNumber = ''} = modalFields;
    return [
      [{
        type: 'INPUT',
        label: '用户名',
        field: 'account',
        initialValue: account,
        rules: [
          {required: true, message: '用户名不能为空'},
          ruleObj.maxChar,
          ruleObj.minChar,
          ruleObj.whitespace
        ],
        placeholder: '请输入用户名'
      }],
      [{
        type: 'PASSWORD',
        label: '密码',
        field: 'password',
        rules: [
          {required: true, message: '密码不能为空'},
          ruleObj.maxChar,
          ruleObj.minChar,
          ruleObj.whitespace],
        placeholder: '请输入密码'
      }],
      [{
        type: 'INPUT',
        label: '真实姓名',
        field: 'realName',
        initialValue: realName,
        rules: [
          {required: true, message: '真实姓名不能为空'},
          ruleObj.whitespace,
          {max: 10, message: '最大10个字符'},
          {min: 2, message: '最小2个字符'}
        ],
        placeholder: '请输入真实姓名'
      }],
      [{
        type: 'INPUT',
        label: '手机号码',
        field: 'phoneNumber',
        initialValue: phoneNumber,
        rules: [
          {required: true, message: '手机号码不能为空'},
          ruleObj.whitespace,
          ruleObj.phoneNumber
        ],
        placeholder: '请输入手机号码'
      }],
      [{
        type: 'SELECT',
        label: '用户类型',
        field: 'roleId',
        initialValue: roleId.toString(),
        rules: [{required: true, message: '角色类型不能为空'}],
        opts: roleList
      }],
      [{
        type: 'SELECT',
        label: '是否启用',
        field: 'toggle',
        initialValue: toggle ? '1' : '0',
        rules: [{required: true, message: '是否启用不能为空'}],
        opts: [{value: '1', label: '是'}, {value: '0', label: '否'}]
      }],
      [{
        type: 'BUTTON',
        field: 'commit',
        btns: [
          {
            label: '提交',
            attr: {
              type: 'primary', icon: 'check', key: 'commit', style: {float: 'right'},
              onClick: () => this.handleSubmit(form)
            }
          },
          {
            label: '重置',
            attr: {
              type: 'danger', key: 'reset', icon: 'redo', style: {float: 'right', marginRight: '30px'},
              onClick: () => form.resetFields()
            }
          }
        ]
      }],
    ];
  }

  render() {
    return (
      <div>
        {this.renderSearchBox()}
        <br/>
        {this.renderTable()}
        {this.renderModal()}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(UserManage);
