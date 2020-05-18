import React, {Component} from "react";
import {actionCreators as NavLeftAction} from "../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../components/PopupModal/store";
import {connect} from "react-redux";
import request from "../../utils/request";
import api from "../../config/api";
import SearchBox from "../../components/SearchBox";
import CardTable from "../../components/CardTable";
import {Button, Form, message, Popconfirm, Popover, Select, Table} from "antd";
import {PopupModal} from "../../components";
import moment from "moment";

const {Option} = Select;
const {Item: FormItem} = Form;

class CourseManage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isTableLoading: true,
      isDetailLoading: true,
      tableList: [],
      detailList: [],
      detailId: '',
      teachList: [],
      collegeList: [],
      bookList: [],
      modalFields: {
        id: '',
        collegeId: '',
        userId: '',
        courseName: '',
        courseTime: '',
        collegeIds: '',
        sessions: ''
      },
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getSelectList()
      .then(() => this.getCourseList())
  }

  _setModalFields({id = '', collegeId = '', userId = '', courseName = '', courseTime = '', collegeIds = '', sessions = ''}) {
    this.setState({modalFields: {id, collegeId, userId, courseName, courseTime, collegeIds, sessions}})
  }

  getSelectList() {
    return request('get', {url: api.getTeacherList})
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = i.realName;
          return i;
        });
        this.setState({teacherList:res.data});
        return request('get', {url: api.getCollegeList, data: {toggle: '1'}})
      })
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = i.collegeName;
          return i;
        });
        this.setState({collegeList:res.data})
      })
      .catch(err => console.log(err));
  }

  getCourseList(fields) {
    const {collegeList} = this.state;
    this.setState({isTableLoading: true});
    request('get', {url: api.getCourseList, data: fields})
      .then(res => {
        const data = res.data;
        this.setState({
          isTableLoading: false,
          tableList: data.map(item => ({
            ...item,
            collegeNameList: item.collegeIds.split(',')
              .map(num => collegeList.filter(college => college.id.toString() === num)[0]['collegeName'])
              .join(',\n')
          }))
        })
      })
      .catch(err => console.log(err));
  }

  getCourseBookList(id) {
    this.setState({isDetailLoading: true});
    request('get', {url: api.getBookList, data: {status: '2', toggle: '1'}})
      .then(res => {
        this.setState({bookList:res.data});
        return request('get', {url: api.getCourseBookList + id})
      })
      .then(res => {
        this.setState({detailList:res.data, isDetailLoading: false, detailId: id})
      })
  }

  //SearchBox
  handleSearch = (fields) => {
    const searchFields = {...fields, sessions: fields.sessions.join(','), collegeIds: fields.collegeIds.join(',')}
    this.setState({searchFilter: searchFields});
    this.getCourseList(searchFields);
  };

  renderSearchBox = () => <SearchBox title={'新增课程'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    const {teacherList = [], collegeList = []} = this.state;
    const thisSession = moment()
      .year();
    const lastSession = thisSession - 3;
    const sessionList = [...Array(thisSession - lastSession + 1)].map((e, i) => ({
      id: i,
      value: `${lastSession + i}`,
      label: `${lastSession + i}`
    }));
    return [
      [
        {type: 'INPUT', label: '课程名称', field: 'courseName'},
        {type: 'INPUT', label: '上课时间', field: 'courseTime'},
        {
          type: 'SELECT', label: '开课单位', field: 'collegeId', initialValue: '',
          opts: [...collegeList, {value: '', label: '全部'}]
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
          type: 'SELECT', label: '任课教师', field: 'userId', initialValue: '',
          opts: [...teacherList, {value: '', label: '全部'}]
        },
        {type: 'MULTISELECT', label: '开放年届', field: 'sessions', initialValue: [], opts: sessionList},
        {type: 'MULTISELECT', label: '开放学院', field: 'collegeIds', initialValue: [], opts: collegeList}
      ]
    ]
  }

  //Table
  handleDelete(id) {
    const {searchFilter} = this.state;
    request('post', {url: api.deleteCourse + id})
      .then(() => this.getCourseList(searchFilter))
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '课程名称', dataIndex: 'courseName'},
      {title: '开课单位', dataIndex: 'collegeName'},
      {title: '上课时间', dataIndex: 'courseTime'},
      {title: '开放年届', dataIndex: 'sessions'},
      {
        title: '开放院系',
        dataIndex: 'collegeNameList',
        width: 160
      },
      {title: '任课教师', dataIndex: 'realName'},
      {title: '手机号', dataIndex: 'phoneNumber'},
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
    const {id, collegeId, userId, courseName, courseTime, sessions, collegeIds} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({collegeId, userId, courseName, courseTime, id, sessions, collegeIds});
          switchVisible({visible: true, title: '编辑课程'})
        }}>编辑</a>
        <span>|</span>
        {this.renderDetailTable(id)}
        <span>|</span>
        <Popconfirm
          title={'是否删除该课程?'}
          okText={'确认'}
          cancelText={'取消'}
          onConfirm={() => this.handleDelete(record.id)}
        >
          <a>删除</a>
        </Popconfirm>
      </div>
    )
  }

  //DetailTable
  _handleDuplicate(length) {
    const {detailList = []} = this.state;
    //在动态增删的时候数组的length会变化,为了去除重复的length,动态的改变length的值
    if (detailList.some((item) => item.id.toString()
      .includes(length))) {
      return this._handleDuplicate(length + 1);
    } else {
      return length;
    }
  }

  addCourseBook() {
    const {detailList} = this.state;
    const length = this._handleDuplicate(detailList.length);
    const newData = {
      id: `add${length}`,
      bookId: '',
      status: 1
    };
    this.setState({detailList: [...detailList, newData]})
  }

  deleteCourseBook(id) {
    const {detailId} = this.state;
    request('get', {url: api.deleteCourseBook + id})
      .then(res => {
        message.success(res.message);
        this.getCourseBookList(detailId);
      })
  }

  cancelAddCourseBook(id) {
    const {form} = this.props;
    const {detailList = []} = this.state;
    //筛选要删除的item并保存到新的数组
    const newListData = detailList ? detailList.filter((item) => item.id !== id) : [];
    //还原被删除的表单,否则会导致数据残留报错
    form.resetFields([`bookId${id}`, `status${id}`]);
    this.setState({detailList: newListData});
  }

  handleCourseBook(id) {
    const {form} = this.props;
    const {detailList} = this.state;
    form.validateFields((err) => {
      if (!err) {
        const items = detailList
          ? detailList.map(item => item.id)
          : [];
        const formValues = items.map((item) => ({
          bookId: form.getFieldsValue([`bookId${item}`])[`bookId${item}`],
          status: form.getFieldsValue([`status${item}`])[`status${item}`]
        }));

        request('post', {url: api.updateCourseBook + id, data: {courseBookList: formValues}})
          .then(res => {
            message.success(res.message);
            this.getCourseBookList(id)
          })
          .catch(err => console.log(err));
      }
    })
  }

  renderDetailTable(id) {
    const {form} = this.props;
    const {detailList, bookList, isDetailLoading} = this.state;
    const columns = [
      {
        title: '教材名称', dataIndex: 'bookId', width: 300, align: 'center',
        render: (text, row) =>
          <FormItem style={{marginBottom: '0'}}>
            {form.getFieldDecorator(`bookId${row.id}`, {
              initialValue: row.bookId,
              placeholder: '请输入教材名称',
              rules: [{required: true, message: '教材名称不能为空'}]
            })(
              <Select size={'small'} style={{width: '100%'}}>
                {bookList.map(book => <Option key={book.id} value={book.id}>{book.bookName}({book.ISBN})</Option>)}
              </Select>
            )}
          </FormItem>
      },
      {
        title: '教材状态', dataIndex: 'status', width: 100, align: 'center',
        render: (text, row) =>
          <FormItem style={{marginBottom: '0'}}>
            {form.getFieldDecorator(`status${row.id}`, {
              placeholder: '请输入教材状态',
              initialValue: row.status || 1,
              rules: [{required: true, message: '教材状态不能为空'}]
            })(<Select  size={'small'}>
              <Option value={1}>审核中</Option>
              <Option value={2}>审核成功</Option>
              <Option value={3}>审核失败</Option>
            </Select>)}
          </FormItem>
      },
      {
        title: '操作', dataIndex: '_option', width: 100, align: 'center',
        render: (text, row) =>
          <div className={'handleBox'}>
            <Popconfirm
              title={'是否删除?'}
              onConfirm={() => this.deleteCourseBook(row.id)}
            >
              {!row.id.toString()
                .includes('add')
                ? <a>删除</a>
                : <a onClick={() => this.cancelAddCourseBook(row.id)}>取消</a>
              }
            </Popconfirm>
          </div>
      }
    ];
    return <Popover
      trigger={'click'}
      placement={'bottomRight'}
      autoAdjustOverflow={false}
      style={{width: '1000'}}
      content={<Table
        size={'small'}
        scroll={{y: 250}}
        rowKey={r => r.id}
        columns={columns}
        dataSource={detailList}
        loading={isDetailLoading}
        pagination={false}
        footer={() =>
          <div style={{position: 'relative'}}>
            <div className={'footer'}>
              <a onClick={() => this.addCourseBook()}>新增课程教材</a>
              <Button style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100px',
                height: '24px'
              }}
                      type="primary"
                      onClick={() => this.handleCourseBook(id)}
                      disabled={detailList.length <= 0 ? 'disabled' : null}
              >保存</Button>
            </div>
          </div>}
      />}
    >
      <a onClick={() => this.getCourseBookList(id)}>查看教材</a>
    </Popover>
  }

  //Modal
  handleSubmit(form) {
    const {searchFilter, modalFields} = this.state;
    const {id} = modalFields;
    form.validateFields(['courseName', 'courseTime', 'userId', 'courseId', 'sessions', 'collegeIds', 'collegeId'], err => {
      if (!err) {
        const {courseTime, courseName, userId, courseId, collegeId, sessions, collegeIds} = form.getFieldsValue();
        request('post', {
          url: id ? api.updateCourse + id : api.addCourse,
          data: {
            courseName,
            courseTime,
            userId,
            courseId,
            collegeId,
            sessions: sessions.join(','),
            collegeIds: collegeIds.join(',')
          }
        })
          .then(res => {
            message.success(res.message);
            this.props.switchVisible({visible: false, title: ''});
            this._setModalFields({});
            this.getCourseList(searchFilter);
          })
          .catch(err => console.log(err));
      }
    });
  }

  renderModal() {
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {teacherList, collegeList, modalFields} = this.state;
    const {collegeId = '', userId = '', courseName = '', courseTime = '', collegeIds = '', sessions = ''} = modalFields;
    const thisSession = moment()
      .year();
    const lastSession = thisSession - 3;
    const sessionList = [...Array(thisSession - lastSession + 1)].map((e, i) => ({
      id: i,
      value: `${lastSession + i}`,
      label: lastSession + i
    }));

    return [
      [{
        type: 'INPUT',
        label: '课程名称',
        field: 'courseName',
        initialValue: courseName,
        rules: [{required: true, message: '课程名称不能为空'}],
        placeholder: '请输入课程名称'
      }],
      [{
        type: 'INPUT',
        label: '上课时间',
        field: 'courseTime',
        initialValue: courseTime,
        rules: [{required: true, message: '上课时间不能为空'}],
        placeholder: '请输入上课时间'
      }],
      [{
        type: 'SELECT',
        label: '任课教师',
        field: 'userId',
        initialValue: userId.toString() ? userId.toString() : '',
        rules: [{required: true, message: '任课教师不能为空'}],
        opts: teacherList
      }],
      [{
        type: 'SELECT',
        label: '开课单位',
        field: 'collegeId',
        initialValue: collegeId.toString() ? collegeId.toString() : '',
        rules: [{required: true, message: '开课单位不能为空'}],
        opts: collegeList
      }],
      [{
        type: 'MULTISELECT',
        label: '开放院系',
        field: 'collegeIds',
        initialValue: collegeIds ? collegeIds.split(',') : [],
        opts: collegeList,
        rules: [{required: true, message: '开放院系不能为空'}],
      }],
      [{
        type: 'MULTISELECT',
        label: '开放年届',
        field: 'sessions',
        initialValue: sessions ? sessions.split(',') : [],
        opts: sessionList,
        rules: [{required: true, message: '开放年届不能为空'}],

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

const tableForm = Form.create()(CourseManage);
export default connect(null, mapDispatchToProps)(tableForm);
