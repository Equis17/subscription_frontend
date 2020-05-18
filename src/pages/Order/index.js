import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../components/PopupModal/store";
import {connect} from "react-redux";
import request from "../../utils/request";
import api from "../../config/api";
import CardTable from "../../components/CardTable";
import {message, Popconfirm} from "antd";
import {PopupModal} from "../../components";

class OrderManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTableLoading: true,
      tableList: [],
      modalFields: {
        id: '',
        bookName: '',
        price: '',
        count: '',
        sellerName: '',
        email: '',
        phoneNumber: '',
        address: '',
        status: ''
      }
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getList();
  }

  _setModalFields({id = '', bookName = '', price = '', count = '', sellerName = '', email = '', phoneNumber = '', address = '', status = ''}) {
    this.setState({modalFields: {id, bookName, price, count, sellerName, email, phoneNumber, address, status}});
  }

  getList() {
    this.setState({isTableLoading: true});
    request('get', {url: api.getOrderList})
      .then(res => this.setState({tableList: res.data, isTableLoading: false}))
  }

  //Table
  handleDelete(id) {
    request('post', {url: api.deleteOrder + id})
      .then(() => this.getList())
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '教材名称', dataIndex: 'bookName', render: (text, record) => `${text}(${record.ISBN})`},
      {title: '价格', dataIndex: 'price'},
      {title: '数量', dataIndex: 'count'},
      {title: '教材批发商', dataIndex: 'sellerName', render: (text, record) => `${record.source}-${text}`},
      {title: 'E-mail', dataIndex: 'email'},
      {title: '手机号码', dataIndex: 'phoneNumber'},
      {title: '地址', dataIndex: 'address'},
      {
        title: '订单状态', dataIndex: 'status',
        render: (text) => ({
          '0': () => <span style={{color: '#00d232'}}>正在配送</span>,
          '1': () => <span style={{color: '#00d232'}}>正在分配</span>,
          '2': () => <span style={{color: '#FF4D4F'}}>分配结束</span>
        }[text]())
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
    const {id, bookName, price, count, sellerName, email, phoneNumber, address, status} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({id, bookName, price, count, sellerName, email, phoneNumber, address, status});
          switchVisible({visible: true, title: '编辑订单状态'})
        }}>编辑</a>
        <span>|</span>
        <Popconfirm
          title={'是否删除该订单?'}
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
    const {id} = this.state.modalFields;
    form.validateFields(err => {
      !err && request('post', {url: api.updateOrder + id, data: form.getFieldsValue()})
        .then(res => {
          message.success(res.message);
          this.props.switchVisible({visible: false, title: ''});
          this.getList();
        })
        .catch(err => console.log(err))
    })

  }

  renderModal() {
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {bookName, price, count, sellerName, email, phoneNumber, address, status} = this.state.modalFields;
    return [
      [{
        type: 'SPAN',
        label: '教材名称',
        field: 'bookName',
        initialValue: bookName || '',
      }],
      [{
        type: 'SPAN',
        label: '价格',
        field: 'price',
        initialValue: price || '',
      }],
      [{
        type: 'SPAN',
        label: '数量',
        field: 'count',
        initialValue: count || '',
      }],
      [{
        type: 'SPAN',
        label: '批发商',
        field: 'sellerName',
        initialValue: sellerName || '',
      }],
      [{
        type: 'SPAN',
        label: 'E-mail',
        field: 'email',
        initialValue: email || '',
      }],
      [{
        type: 'SPAN',
        label: '电话',
        field: 'phoneNumber',
        initialValue: phoneNumber || '',
      }],
      [{
        type: 'LONG-SPAN',
        label: '地址',
        field: 'address',
        initialValue: address || '',
      }],
      [{
        type: 'SELECT',
        label: '状态',
        field: 'status',
        initialValue: status.toString() || '',
        rules: [{required: true, message: '状态不能为空'}],
        opts: [{value: '0', label: '正在配送'}, {value: '1', label: '正在分配'}, {value: '2', label: '分配结束'}],
        search: true
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

export default connect(null, mapDispatchToProps)(OrderManage);
