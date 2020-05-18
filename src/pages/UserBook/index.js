import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../components/PopupModal/store";
import {connect} from "react-redux";
import api from "../../config/api";
import request from "../../utils/request";
import SearchBox from "../../components/SearchBox";
import {Popconfirm} from "antd";
import moment from "moment";
import CardTable from "../../components/CardTable";

class UserBookManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTableLoading: true,
      tableList: [],
      courseList: [],
      modalFields: {
        id: '',
        courseBookId: '-1',
        userId: '-1',
        isPay: ''
      },
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getSelectList()
      .then(() => this.getUserBookList());
  }

  _setModalFields({id = '', courseBookId = '-1', userId = '-1', isPay = ''}) {
    this.setState({modalFields: {id, courseBookId, userId, isPay}})
  }

  getSelectList() {
    return request('get', {url: api.getCourseList})
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = `${i.courseName}-${i.courseUserName}(${i.courseTime})`;
          return i;
        });
        this.setState({courseList:res.data});
      })
      .catch(err => console.log(err))
  }

  getUserBookList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getUserBookList, data: fields ? fields : {}})
      .then(res => this.setState({tableList:res.data, isTableLoading: false}))
      .catch(err => console.log(err))
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getUserBookList(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增用户教材'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    return [
      [
        {type: 'INPUT', label: '学号', field: 'stuNumber'},
        {type: 'INPUT', label: '姓名', field: 'name'},
        {
          type: 'SELECT', label: '支付状态  ', field: 'isPay', initialValue: '-1',
          opts: [{value: '0', label: '未支付'}, {value: '1', label: '已支付'}, {value: '-1', label: '全部'}]
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
        {type: 'INPUT', label: '课程名称', field: 'courseName'},
        {type: 'INPUT', label: '上课时间', field: 'time'},
        {type: 'INPUT', label: '教材名称', field: 'bookName'},
        {type: 'INPUT', label: 'ISBN', field: 'isbn'},
      ]
    ]
  }

  //Table
  handleDelete(id) {
    const {searchFilter} = this.state;
    request('post', {url: api.deleteUserBook + id})
      .then(() => this.getCourseBookList(searchFilter))
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '姓名', dataIndex: 'realName'},
      {title: '学号', dataIndex: 'stuNumber'},
      {title: '课程名称', dataIndex: 'courseName'},
      {title: '上课时间', dataIndex: 'courseTime'},
      {title: '教材名称', dataIndex: 'bookName'},
      {title: 'ISBN', dataIndex: 'isbn'},
      {
        title: '开始日期',
        dataIndex: 'startTime',
        render: (text) => moment(text)
          .format('YYYY-MM-DD')
      },
      {
        title: '截止日期',
        dataIndex: 'endTime',
        render: (text) => moment(text)
          .format('YYYY-MM-DD')
      },
      {
        title: '支付状态',
        dataIndex: 'isPay',
        width: 150,
        align: 'center',
        render: (text, record) => {
          return {0: '未支付', 1: '已支付'}[record.isPay]
        }
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
    const {id,userId,courseId,courseBookId} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({id,userId,courseId,courseBookId});
          switchVisible({visible: true, title: '编辑课程教材'})
        }}>编辑</a>
        <span>|</span>
        <Popconfirm
          title={'是否删除该教材?'}
          okText={'确认'}
          cancelText={'取消'}
          onConfirm={() => this.handleDelete(record.id)}
        >
          <a>删除</a>
        </Popconfirm>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderSearchBox()}
        <br/>
        {this.renderTable()}
        {/*{this.renderModal()}*/}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(UserBookManage);
