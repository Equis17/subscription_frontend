import request from "../../utils/request";
import api from "../../config/api";
import SearchBox from "../../components/SearchBox";
import React, {Component} from "react";
import CardTable from "../../components/CardTable";
import {message, Popconfirm} from "antd";
import {PopupModal} from "../../components";
import {actionCreators as NavLeftAction} from "../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../components/PopupModal/store";
import {connect} from "react-redux";
import JSEncrypt from 'jsencrypt'
import {ruleObj} from "../../utils/utils";

class SellerManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableList: [],
      isTableLoading: true,
      modalFields: {
        sellerName: '',
        source: '',
        phoneNumber: '',
        email: '',
        address: '',
        toggle: '1',
        account: '',
        id: ''
      },
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getSellerList({});
  }

  _setModalFields({sellerName = '', source = '', phoneNumber = '', email = '', address = '', account, toggle = '1', id = ''}) {
    this.setState({modalFields: {sellerName, source, phoneNumber, email, address, toggle, account, id}})
  }

  getSellerList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getSellerList, data: fields})
      .then(res => this.setState({tableList:res.data, isTableLoading: false}))
      .catch(err => console.log(err));
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getSellerList(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增教材批发商'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    return [
      [
        {type: 'INPUT', label: '姓名', field: 'sellerName'},
        {type: 'INPUT', label: '来源', field: 'source'},
        {type: 'INPUT', label: '手机号', field: 'phoneNumber'},
        {type: 'INPUT', label: 'E-mail', field: 'email'},
      ],
      [
        {type: 'INPUT', label: '地址', field: 'address'},
        {
          type: 'SELECT', label: '是否启用', field: 'toggle', initialValue: '1',
          opts: [{value: '1', label: '是'}, {value: '0', label: '否'}, {value: '', label: '全部'}]
        },
        {field: 'hole'},
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
      ]
    ]
  }

  //Table
  handleDelete(id) {
    const {searchFilter} = this.state;
    request('post', {url: api.deleteSeller + id})
      .then(() => this.getSellerList(searchFilter))
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '姓名', dataIndex: 'sellerName'},
      {title: '用户名', dataIndex: 'phoneNumber'},
      {title: '角色类型', dataIndex: 'roleName'},
      {title: '来源', dataIndex: 'source'},
      {title: 'E-mail', dataIndex: 'email'},
      {title: '地址', dataIndex: 'address'},
      {
        title: '是否启用',
        dataIndex: 'toggle',
        width: 200,
        align: 'center',
        render: (text, record) => record.toggle
          ? <span style={{color: '#00d232'}}>已启用</span>
          : <span style={{color: '#FF4D4F'}}>未启用</span>
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
    const {toggle, account, id, sellerName, phoneNumber, source, email, address} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({toggle:toggle.toString(), account, id, sellerName, phoneNumber, source, email, address});
          switchVisible({visible: true, title: '编辑批发商'})
        }}>编辑</a>
        <span>|</span>
        <Popconfirm
          title={'是否删除该批发商?'}
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
    form.validateFields(['sellerName', 'phoneNumber', 'password', 'email', 'address', 'source', 'toggle'], err => {
      if (!err) {
        const {password, sellerName, phoneNumber, email, address, source, toggle} = form.getFieldsValue();
        request('get', {url: api.getPublicKey})
          .then(res => {
            const encrypt = new JSEncrypt();
            encrypt.setPublicKey(res.data.publicKey);
            const encryptedPassword = encrypt.encrypt(password);
            return request('post', {
              url: id ? api.updateSeller + id : api.addSeller,
              data: {password: encryptedPassword, sellerName, phoneNumber, email, address, toggle, source}
            })
          })
          .then(res => {
            message.success(res.message);
            this.props.switchVisible({visible: false, title: ''});
            this._setModalFields({});
            this.getSellerList(searchFilter);
          })
          .catch(err => console.log(err));
      }
    });
  }

  renderModal() {
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {modalFields} = this.state;
    const {sellerName = '', source = '', phoneNumber = '', email = '', address = '', toggle = '1'} = modalFields;
    return [
      [{
        type: 'INPUT',
        label: '姓名',
        field: 'sellerName',
        initialValue: sellerName,
        rules: [
          {required: true, message: '不能为空'},
          ruleObj.whitespace,
          {min: 2, message: "最小2个字符"},
          {max: 10, message: "最大10个字符"}
        ],
        placeholder: '请输入姓名'
      }],
      [{
        type: 'PASSWORD',
        label: '密码',
        field: 'password',
        rules: [
          {required: true, message: '密码不能为空'},
          ruleObj.maxChar,
          ruleObj.minChar,
          ruleObj.whitespace
        ],
        placeholder: '请输入密码'
      }],
      [{
        type: 'INPUT',
        label: '手机号码',
        field: 'phoneNumber',
        initialValue: phoneNumber,
        rules: [
          {required: true, message: '手机号码不能为空'},
          ruleObj.phoneNumber
        ],
        placeholder: '请输入手机号码'
      }],
      [{
        type: 'INPUT',
        label: 'E-mail',
        field: 'email',
        initialValue: email,
        rules: [{required: true, message: 'E-mail不能为空'}],
        placeholder: '请输入E-mail'
      }],
      [{
        type: 'INPUT',
        label: '地址',
        field: 'address',
        initialValue: address,
        rules: [
          {required: true, message: '地址不能为空'},
          ],
        placeholder: '请输入地址'
      }],
      [{
        type: 'INPUT',
        label: '批发商来源',
        field: 'source',
        initialValue: source,
        rules: [{required: true, message: '批发商来源不能为空'}],
        placeholder: '请输入批发商来源'
      }],
      [{
        type: 'SELECT',
        label: '是否启用',
        field: 'toggle',
        initialValue: toggle ? toggle : '',
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
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(SellerManage);
