import React, {Component} from "react";
import * as NavLeftAction from "../../components/NavLeft/store/actionCreators";
import * as PopupModalAction from "../../components/PopupModal/store/actionCreators";
import {connect} from "react-redux";
import request from "../../utils/request";
import api from "../../config/api";
import SearchBox from "../../components/SearchBox";
import CardTable from "../../components/CardTable";
import {message, Popconfirm} from "antd";
import {PopupModal} from "../../components";

class SubscriptionManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTableLoading: true,
      tableList: [],
      modalFields: {
        id: '',
        subscriptionName: '',
        status: '',
      },
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getSubscriptionList();
  }

  _setModalFields({id = '', subscriptionName = '', status = ''}) {
    this.setState({modalFields: {id, subscriptionName, status}});
  }

  getSubscriptionList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getSubscriptionList, data: fields})
      .then(res => this.setState({tableList: res.data, isTableLoading: false}))
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getSubscriptionList(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增征订年份'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    return [
      [
        {type: 'INPUT', label: '年份名称', field: 'subscriptionName'},
        {
          type: 'SELECT', label: '征订状态', field: 'status', initialValue: '',
          opts: [
            {value: '0', label: '未开始'},
            {value: '1', label: '开始征订'},
            {value: '2', label: '结束征订'},
            {value: '3', label: '开始预订'},
            {value: '4', label: '结束预订'},
            {value: '5', label: '结束'},
            {value: '', label: '全部'}]
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
    request('post', {url: api.deleteSubscription + id})
      .then(() => this.getSubscriptionList(searchFilter))
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '征订年份', dataIndex: 'subscriptionName'},
      {
        title: '征订状态',
        dataIndex: 'status',
        render: (text) => ({
          '0': () => <span style={{color: '#777'}}>未开始</span>,
          '1': () => <span style={{color: '#00d232'}}>开始征订</span>,
          '2': () => <span style={{color: '#FF4D4F'}}>结束征订</span>,
          '3': () => <span style={{color: '#00d232'}}>开始预订</span>,
          '4': () => <span style={{color: '#FF4D4F'}}>结束预订</span>,
          '5': () => <span style={{color: '#777'}}>结束</span>
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
    const {id, subscriptionName, status} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({id, subscriptionName, status});
          switchVisible({visible: true, title: '编辑征订单'})
        }}>编辑</a>
        <span>|</span>
        <Popconfirm
          title={'是否删除该征订单?'}
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
    form.validateFields(['subscriptionName', 'status'], err => {
      if (!err) {
        const {subscriptionName, status} = form.getFieldsValue();
        request('post', {
          url: id ? api.updateSubscription + id : api.addSubscription,
          data: {subscriptionName, status}
        })
          .then(res => {
            message.success(res.message);
            this.props.switchVisible({visible: false, title: ''});
            this._setModalFields({});
            this.getSubscriptionList(searchFilter);
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
    const {status, subscriptionName} = modalFields;
    return [
      [{
        type: 'INPUT',
        label: '征订名',
        field: 'subscriptionName',
        initialValue: subscriptionName,
        rules: [{required: true, message: '征订名不能为空'}],
      }],
      [{
        type: 'SELECT',
        label: '状态',
        field: 'status',
        initialValue: status.toString() ? status.toString() : '',
        rules: [{required: true, message: '状态不能为空'}],
        opts: [
          {value: '0', label: '未开始'},
          {value: '1', label: '开始征订'},
          {value: '2', label: '结束征订'},
          {value: '3', label: '开始预订'},
          {value: '4', label: '结束预订'},
          {value: '5', label: '结束'},
        ]
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
      }]
    ]
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

export default connect(null, mapDispatchToProps)(SubscriptionManage);
