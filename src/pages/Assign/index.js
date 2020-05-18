import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../components/PopupModal/store";
import {Form, message, Popconfirm} from "antd";
import {connect} from "react-redux";
import request from "../../utils/request";
import api from "../../config/api";
import SearchBox from "../../components/SearchBox";
import CardTable from "../../components/CardTable";
import {PopupModal} from "../../components";

class AssignManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTableLoading: true,
      tableList: [],
      assignList: [],
      userList: [],
      classId: [],
      modalFields: {
        id: '',
        userId: '',
        classId: '',
        assignId: '',
        status: ''
      }
    }
  }

  _setModalFields({id = '', userId = '', classId = '', assignId = '', status = ''}) {
    this.setState({modalFields: {id, userId, classId, assignId, status}})
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getSelectList()
      .then(() => this.getAssignList());
  }

  getSelectList() {
    return request('get', {url: api.getAssignUserList, data: {toggle: '1'}})
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = `${i.realName}(${i.account})`;
          return i;
        });
        this.setState({assignList: res.data});
        return request('get', {url: api.getAssignUserList})
      })
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = `${i.realName}(${i.account})`;
          return i;
        });
        this.setState({userList: res.data});
        return request('get', {url: api.getClassList})

      })
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = `${i.collegeName}${i.session}${i.className}`;
          return i;
        });
        this.setState({classList: res.data})
      })
      .catch(err => console.log(err));
  }


  getAssignList(fields) {
    this.setState({isDetailLoading: true});
    request('get', {url: api.getAssignList, data: fields})
      .then(res => {
        this.setState({tableList: res.data, isTableLoading: false});
      })
      .catch(err => console.log(err))
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getAssignList(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增分配员'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    return [
      [
        {type: 'INPUT', label: '用户名', field: 'userName'},
        {type: 'INPUT', label: '班级名', field: 'className'},
        {type: 'INPUT', label: '分配员', field: 'assignName'},
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
    request('post', {url: api.deleteAssign + id})
      .then(res => {
        message.success(res.message);
        this.getAssignList(searchFilter)
      })
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '用户名', dataIndex: 'realName'},
      {title: '学号', dataIndex: 'account'},
      {title: '手机号码', dataIndex: 'phoneNumber'},
      {
        title: '分配员所在班级',
        dataIndex: 'className',
        render: (text, record) => `${record.collegeName}${record.session}${record.className}`
      },
      {title: '分配员用户名', dataIndex: 'assignRealName'},
      {title: '分配员学号', dataIndex: 'assignAccount'},
      {title: '分配员手机号', dataIndex: 'assignPhoneNumber'},
      {
        title: '是否启用', dataIndex: 'status',
        render: (text, record) => record.status
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
    const {userId, classId, status, assignId, id} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({id, userId, classId, status, assignId});
          switchVisible({visible: true, title: '编辑分配员'})
        }}>编辑</a>
        <span>|</span>
        <Popconfirm
          title={'是否删除该分配员?'}
          okText={'确认'}
          cancelText={'取消'}
          onConfirm={() => this.handleDelete(id)}
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
    form.validateFields(['userId', 'classId', 'status', 'assignId'], err => {
      if (!err) {
        const {userId, classId, status, assignId} = form.getFieldsValue();
        request('post', {
          url: id ? api.updateAssign + id : api.addAssign,
          data: {userId, classId, status, assignId}
        })
          .then(res => {
            message.success(res.message);
            this.props.switchVisible({visible: false, title: ''});
            this._setModalFields({});
            this.getAssignList(searchFilter);
          })
          .catch(err => console.log(err));
      }
    });
  }

  renderModal() {
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {userList, classList, assignList, modalFields} = this.state;
    const {userId = '', classId = '', status = '', assignId = ''} = modalFields;
    return [
      [{
        type: 'SELECT',
        label: '用户',
        field: 'userId',
        search: true,
        initialValue: userId.toString() ? userId.toString() : '',
        rules: [{required: true, message: '用户不能为空'}],
        opts: userList
      }],
      [{
        type: 'SELECT',
        label: '班级',
        field: 'classId',
        search: true,
        initialValue: classId.toString() ? classId.toString() : '',
        rules: [{required: true, message: '班级不能为空'}],
        opts: classList,
      }],
      [{
        type: 'SELECT',
        label: '分配员',
        field: 'assignId',
        search: true,
        initialValue: assignId.toString() ? assignId.toString() : '',
        rules: [{required: true, message: '分配员不能为空'}],
        opts: assignList
      }],
      [{
        type: 'SELECT',
        label: '状态',
        field: 'status',
        search: true,
        initialValue: status.toString() ? status.toString() : '0',
        rules: [{required: true, message: '状态不能为空'}],
        opts: [{value: '1', label: '已启用'}, {value: '0', label: '未启用'}]
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

const tableForm = Form.create()(AssignManage);
export default connect(null, mapDispatchToProps)(tableForm);
