import React, {Component} from "react";
import {CardTable, PopupModal, SearchBox} from '../../components'
import * as NavLeftAction from "../../components/NavLeft/store/actionCreators";
import * as PopupModalAction from "../../components/PopupModal/store/actionCreators";
import {connect} from "react-redux";
import {Popconfirm, message} from "antd";
import request from "../../utils/request";
import api from "../../config/api";
import {ruleObj} from "../../utils/utils";

class RoleManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableList: [],
      isTableLoading: true,
      modalFields: {
        toggle: '1',
        roleName: '',
        id: ''
      },
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getRoleList({})
  }


  _setModalFields({toggle = '1', roleName = '', id = ''}) {
    this.setState({modalFields: {toggle, roleName, id}});
  }

  getRoleList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getRoleList, data: fields})
      .then(res => this.setState({tableList: res ? res.data : [], isTableLoading: false}))
      .catch(err => console.log(err));
  }

  //searchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getRoleList(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增角色'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    return [
      [
        {type: 'INPUT', label: '角色名称', field: 'roleName'},
        {
          type: 'SELECT', label: '是否启用', field: 'toggle', initialValue: '1',
          opts: [{value: '1', label: '是'}, {value: '0', label: '否'}, {value: '', label: '全部'}]
        },
        {field: 'hole'}
        ,
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
    request('post', {url: api.deleteRole + id})
      .then(err => {
        message.success(err.message);
        this.getRoleList(searchFilter)
      })
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '角色名称', dataIndex: 'roleName'},
      {
        title: '是否启用',
        dataIndex: 'toggle',
        width: 200,
        align: 'center',
        render: (text, record) => record.toggle ? '已启用' : '未启用'
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
    const {toggle, roleName, id} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({toggle, roleName, id});
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
    form.validateFields(['roleName', 'toggle'], err => {
      !err && request('post', {url: id ? api.updateRole + id : api.addRole, data: form.getFieldsValue()})
        .then(res => {
          message.success(res.message);
          this.props.switchVisible({visible: false, title: ''});
          this._setModalFields({});
          this.getRoleList(searchFilter);
        })
        .catch(err => console.log(err))
    })

  }

  renderModal() {
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {toggle, roleName} = this.state.modalFields;
    return [
      [{
        type: 'INPUT',
        label: '角色名称',
        field: 'roleName',
        initialValue: roleName,
        rules: [
          {required: true, message: '角色名称不能为空'},
          ruleObj.maxChar,
          ruleObj.minChar,
          ruleObj.whitespace
          ],
        placeholder: '请输入角色名称'
      }],
      [{
        type: 'SELECT',
        label: '是否启用',
        field: 'toggle',
        initialValue: toggle?'1':'0',
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
export default connect(null, mapDispatchToProps)(RoleManage);
