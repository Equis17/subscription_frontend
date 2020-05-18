import React, {Component} from 'react'
import {connect} from "react-redux";
import {SearchBox, CardTable, PopupModal} from '../../components';
import {actionCreators as PopupModalAction} from './../../components/PopupModal/store'
import {actionCreators as NavLeftAction} from "./../../components/NavLeft/store";
import {message, Popconfirm} from "antd";

import api from '../../config/api'
import request from '../../utils/request'
import {ruleObj} from "../../utils/utils";

class RouterManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableList: [],
      isTableLoading: true,
      modalFields: {
        toggle: '1',
        routerName: '',
        routerUrl: '',
        id: ''
      },
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getRouterList({});
  }

  _setModalFields({toggle = '1', routerName = '', routerUrl = '', id = ''}) {
    this.setState({modalFields: {toggle, routerName, routerUrl, id}})
  }

  getRouterList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getRouterList, data: fields})
      .then(res => this.setState({tableList: res.data, isTableLoading: false}))
      .catch(err => console.log(err));
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getRouterList(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增路由'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    return [
      [
        {type: 'INPUT', label: '路由名称', field: 'routerName'},
        {type: 'INPUT', label: '路由地址', field: 'routerUrl',},
        {
          type: 'SELECT', label: '是否启用', field: 'toggle', initialValue: '1',
          opts: [{value: '1', label: '是'}, {value: '0', label: '否'}, {value: '', label: '全部'}]
        },
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
    request('post', {url: api.deleteRouter + id})
      .then(res => {
        message.success(res.message);
        this.getRouterList(searchFilter);
      })
      .catch(err => console.log(err))
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '路由名称', dataIndex: 'routerName'},
      {title: '路由地址', dataIndex: 'routerUrl'},
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
    const {toggle, routerName, routerUrl, id} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({toggle, routerName, routerUrl, id});
          switchVisible({visible: true, title: '编辑路由'})
        }}>编辑</a>
        <span>|</span>
        <Popconfirm
          title={'是否删除该路由?'}
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
    form.validateFields(['routerName', 'routerUrl', 'toggle'], err => {
      !err && request('post', {url: id ? api.updateRouter + id : api.addRouter, data: form.getFieldsValue()})
        .then(res => {
          message.success(res.message);
          this.props.switchVisible({visible: false, title: ''});
          this._setModalFields({});
          this.getRouterList(searchFilter);
        })
        .catch(err => console.log(err))
    })
  }

  renderModal() {
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {toggle, routerName, routerUrl} = this.state.modalFields;
    return [
      [{
        type: 'INPUT',
        label: '路由名称',
        field: 'routerName',
        initialValue: routerName,
        rules: [
          {required: true, message: '路由名称不能为空'},
          ruleObj.maxChar,
          ruleObj.whitespace
        ],
        placeholder: '请输入路由名称'
      }],
      [{
        type: 'INPUT',
        label: '路由地址',
        field: 'routerUrl',
        initialValue: routerUrl,
        rules: [
          {required: true, message: '路由地址不能为空'},
          ruleObj.maxChar,
          ruleObj.whitespace,
          ruleObj.url
        ],
        placeholder: '请输入路由地址'
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

export default connect(null, mapDispatchToProps)(RouterManage);
