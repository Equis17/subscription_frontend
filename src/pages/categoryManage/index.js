import React, {Component} from "react";
import * as NavLeftAction from "../../components/NavLeft/store/actionCreators";
import * as PopupModalAction from "../../components/PopupModal/store/actionCreators";
import {connect} from "react-redux";
import request from "../../utils/request";
import api from "../../config/api";
import {message} from 'antd';
import {CardTable, PopupModal} from "../../components";

class CategoryManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableList: [],
      routerList: [],
      isTableLoading: true,
      modalFields: {
        selectedList: [],
        roleName: '',
        id: '',
        categoryId: ''
      }
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getCategoryList();
    this.getRouterList();
  }

  _setModalFields({toggle = '1', roleName = '', selectedList = [], id = '', categoryId = ''}) {
    this.setState({modalFields: {toggle, roleName, selectedList, id, categoryId}})
  }

  getRouterList() {
    request('get', {url: api.getRouterList, data: {toggle: '2'}})
      .then(res => {
        res.data.map(item => item.label = `${item.name}(${item.url})`);
        this.setState({routerList: res ? res.data : []});
      })
      .catch(err => console.log(err));
  }

  getCategoryList() {
    this.setState({isTableLoading: true});
    request('get', {url: api.getCategoryList})
      .then(res => this.setState({tableList: res ? res.data : [], isTableLoading: false}));
  }

  //Table
  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '角色名称', dataIndex: 'name'},
      {
        title: '是否启用',
        dataIndex: 'toggle',
        width: 200,
        align: 'center',
        render: (text, record) => record.toggle === '1' ? '已启用' : '未启用'
      },
      {
        title: '操作',
        dataIndex: 'unit',
        width: 100,
        align: 'center',
        render: (text, record) => this.renterTableOperation(record)
      }
    ];
    return <CardTable tableConfig={{dataSource, columns, loading, size: 'small', rowKey: (row) => row.id}}/>
  }

  renterTableOperation(record) {
    const {switchVisible} = this.props;
    const {toggle, name: roleName, router_ids, id, categoryId} = record;
    const selectedList = router_ids ? router_ids.split(',') : [];
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({
            toggle,
            roleName,
            selectedList: selectedList.map(i => parseInt(i, 10)),
            id,
            categoryId
          });
          switchVisible({visible: true, title: '编辑角色菜单'})
        }}>修改权限</a>
      </div>
    )
  }

  //Modal
  handleSubmit(form) {
    const {modalFields, routerList: routers} = this.state;
    const {id, categoryId} = modalFields;
    let routerList = form.getFieldsValue()
      .routerList
      .filter(i => routers.some(r => r.id == i));
    request('post', {
      url: categoryId ? api.updateCategory + categoryId : api.addCategory,
      data: {routerList, roleId: id}
    })
      .then(res => {
        message.success(res.message);
        this.props.switchVisible({visible: false, title: ''});
        this._setModalFields({});
        this.getCategoryList();
      })
      .catch(err => console.log(err))
  }

  renderModal() {
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {modalFields, routerList} = this.state;
    const {roleName, selectedList} = modalFields;
    return [
      [{
        type: 'SPAN',
        label: '角色名称',
        field: 'roleName',
        initialValue: roleName,
      }],
      [{
        type: 'CHECKBOX',
        label: '菜单权限',
        field: 'routerList',
        fieldList: routerList,
        initialValue: selectedList,
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
export default connect(null, mapDispatchToProps)(CategoryManage)
