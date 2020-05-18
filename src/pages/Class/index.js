import React, {Component} from "react";
import {actionCreators as NavLeftAction} from "../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../components/PopupModal/store";
import {connect} from "react-redux";
import moment from 'moment';
import SearchBox from "../../components/SearchBox";
import request from "../../utils/request";
import api from "../../config/api";
import CardTable from "../../components/CardTable";
import {message, Popconfirm} from "antd";
import {PopupModal} from "../../components";
import {ruleObj} from "../../utils/utils";

class ClassManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableList: [],
      collegeList: [],
      sessionList: [],
      modalFields: {
        toggle: '1',
        collegeId: '',
        className: '',
        id: '',
        session: ''
      }
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    const thisSession = moment()
      .year();
    const lastSession = thisSession - 3;
    const sessionList = [...Array(thisSession - lastSession + 1)].map((e, i) => ({
      id: i,
      session: lastSession + i,
      value: lastSession + i,
      label: lastSession + i
    }));
    this.setState({sessionList});
    this.getSelectList()
      .then(() => this.getClassList());
  }

  _setModalFields({toggle = '1', collegeId = '', className = '', id = '', session = ''}) {
    this.setState({modalFields: {toggle, className, collegeId, session, id}})
  }

  getSelectList() {
    return request('get', {url: api.getCollegeList})
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = i.collegeName;
          return i;
        });
        this.setState({collegeList: res.data})
      })
      .catch(err => console.log(err));
  }

  getClassList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getClassList, data: fields})
      .then(res => this.setState({tableList: res.data, isTableLoading: false}))
      .catch(err => console.log(err));
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getClassList(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增班级'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    const {collegeList = [], sessionList = []} = this.state;
    return [
      [
        {type: 'INPUT', label: '班级名称', field: 'className'},
        {
          type: 'SELECT', label: '所属学院', field: 'collegeId', initialValue: '',
          opts: [...collegeList, {value: '', label: '全部'}]
        },
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
      ],
      [
        {
          type: 'SELECT', label: '年届列表', field: 'session', initialValue: '',
          opts: [...sessionList, {value: '', label: '全部'}]
        }
      ]
    ]
  }

//Table
  handleDelete(id) {
    const {searchFilter} = this.state;
    request('post', {url: api.deleteClass + id})
      .then((res) => {
        message.success(res.message);
        this.getClassList(searchFilter)
      })
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '班级名称', dataIndex: 'className'},
      {title: '所属学院', dataIndex: 'collegeName'},
      {title: '年届', dataIndex: 'session'},
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
        width: 200,
        align: 'center',
        render: (text, record) => this.renderTableOperation(record)
      }
    ];
    return <CardTable tableConfig={{dataSource, columns, loading, size: 'small', rowKey: (row) => row.id}}/>
  }

  renderTableOperation(record) {
    const {switchVisible} = this.props;
    const {toggle, collegeId, className, id, session} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({toggle, collegeId, className, id, session});
          switchVisible({visible: true, title: '编辑班级'})
        }}>编辑</a>
        <span>|</span>
        <Popconfirm
          title={'是否删除该班级?'}
          okText={'确认'}
          cancelText={'取消'}
          onConfirm={() => this.handleDelete(record.id)}
        >
          <a>删除</a>
        </Popconfirm>
        <span>|</span>
        <a onClick={() => this.props.history.push(`detail/${id}`)}>查看详情</a>
      </div>
    )
  }

  //Modal
  handleSubmit(form) {
    const {searchFilter, modalFields} = this.state;
    const {id} = modalFields;
    form.validateFields(['collegeId', 'className', 'session', 'toggle'], err => {
      if (!err) {
        const {collegeId, className, toggle, session} = form.getFieldsValue();
        request('post', {
          url: id ? api.updateClass + id : api.addClass,
          data: {collegeId, className, toggle, session}
        })
          .then(res => {
            message.success(res.message);
            this.props.switchVisible({visible: false, title: ''});
            this._setModalFields({});
            this.getClassList(searchFilter);
          })
          .catch(err => console.log(err));
      }
    });
  }

  renderModal() {
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {collegeList, sessionList, modalFields} = this.state;
    const {toggle = '1', collegeId, className = '', session} = modalFields;
    return [
      [{
        type: 'INPUT',
        label: '班级名称',
        field: 'className',
        initialValue: className,
        rules: [
          {required: true, message: '班级名称不能为空'},
          ruleObj.maxChar,
          ruleObj.whitespace
        ],
        placeholder: '请输入班级名称'
      }],
      [{
        type: 'SELECT',
        label: '所属学院',
        field: 'collegeId',
        placeholder: '请选择所属学院',
        initialValue: collegeId.toString() ? collegeId.toString() : '',
        rules: [{required: true, message: '所属班级不能为空'}],
        opts: collegeList
      }],
      [{
        type: 'SELECT',
        label: '所属年届',
        field: 'session',
        placeholder: '请选择所属年届',
        initialValue: session.toString() ? session.toString() : '',
        rules: [{required: true, message: '所属班级不能为空'}],
        opts: sessionList
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
    return <div>
      {this.renderSearchBox()}
      <br/>
      {this.renderTable()}
      {this.renderModal()}
    </div>
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(ClassManage)
