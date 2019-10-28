import React, {Component} from "react";
import {actionCreators as NavLeftAction} from "../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../components/PopupModal/store";
import {connect} from "react-redux";
import request from "../../utils/request";
import api from "../../config/api";
import SearchBox from "../../components/SearchBox";
import CardTable from "../../components/CardTable";
import {Button, DatePicker, Form, message, Popconfirm, Popover, Select, Table} from "antd";
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
        courseTime: ''
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

  _setModalFields({id = '', collegeId = '-1', userId = '-1', courseName = '', courseTime = ''}) {
    this.setState({modalFields: {id, collegeId, userId, courseName, courseTime}})
  }

  getSelectList() {
    return request('get', {url: api.getUserList, data: {roleId: '12', collegeId: '-1', toggle: '1'}})
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = i.realName;
          return i;
        });
        this.setState({teacherList: res ? res.data : []});
        return request('get', {url: api.getCollegeList, data: {toggle: '1'}})
      })
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = i.name;
          return i;
        });
        this.setState({collegeList: res ? res.data : []})
      })
      .catch(err => console.log(err));
  }

  getCourseList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getCourseList, data: fields})
      .then(res => this.setState({tableList: res ? res.data : [], isTableLoading: false}))
      .catch(err => console.log(err));
  }

  getCourseBookList(id) {
    this.setState({isDetailLoading: true});
    request('get', {url: api.getBookList, data: {toggle: '1'}})
      .then(res => {
        this.setState({bookList: res ? res.data : []});
        return request('get', {url: api.getCourseBookList + id})
      })
      .then(res => {
        this.setState({detailList: res ? res.data : [], isDetailLoading: false, detailId: id})
      })
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getCourseList(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增课程'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    const {teacherList = [], collegeList = []} = this.state;
    return [
      [
        {type: 'INPUT', label: '课程名称', field: 'name'},
        {type: 'INPUT', label: '上课时间', field: 'time'},
        {
          type: 'SELECT', label: '开课单位', field: 'collegeId', initialValue: '-1',
          opts: [...collegeList, {value: '-1', label: '全部'}]
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
          type: 'SELECT', label: '任课教师', field: 'userId', initialValue: '-1',
          opts: [...teacherList, {value: '-1', label: '全部'}]
        }
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
      {title: '开课单位', dataIndex: 'courseCollegeName'},
      {title: '上课时间', dataIndex: 'courseTime'},
      {title: '任课教师', dataIndex: 'courseUserName'},
      {title: '教师所属学院', dataIndex: 'userCollegeName'},
      {title: '手机号', dataIndex: 'userPhoneNumber'},
      {
        title: '操作',
        dataIndex: 'unit',
        width: 200,
        align: 'center',
        render: (text, record) => this.renterTableOperation(record)
      }
    ];
    return <CardTable tableConfig={{dataSource, columns, loading, size: 'small', rowKey: (row) => row.id}}/>
  }

  renterTableOperation(record) {
    const {switchVisible} = this.props;
    const {id, courseCollegeId: collegeId, courseUserId: userId, courseName, courseTime} = record;

    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({collegeId, userId, courseName, courseTime, id});
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
      startTime: moment(),
      endTime: moment()
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
    form.resetFields([`name${id}`, `marketPrice${id}`, `countUnit${id}`, `unit${id}`]);
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
          startTime: form.getFieldsValue([`startTime${item}`])[`startTime${item}`].format('YYYY-MM-DD'),
          endTime: form.getFieldsValue([`endTime${item}`])[`endTime${item}`].format('YYYY-MM-DD')
        }));

        request('post', {url: api.updateCourseBook+id, data: {courseBookList: formValues}})
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
            })(<Select size={'small'} style={{width: '100%'}}>{bookList.map(book => <Option key={book.id}
                                                                                            value={book.id}>{book.name}({book.isbn})</Option>)}</Select>)}
          </FormItem>
      }, {
        title: '开始预订日期', dataIndex: 'startTime', width: 250, align: 'center',
        render: (text, row) =>
          <FormItem style={{marginBottom: '0'}}>
            {form.getFieldDecorator(`startTime${row.id}`, {
              placeholder: '请输入开始预订日期',
              initialValue: moment(row.startTime),
              rules: [{required: true, message: '开始预定日期不能为空'}]
            })(<DatePicker size={'small'}/>)}
          </FormItem>
      }, {
        title: '结束时间', dataIndex: 'endTime', width: 250, align: 'center',
        render: (text, row) =>
          <FormItem style={{marginBottom: '0'}}>
            {form.getFieldDecorator(`endTime${row.id}`, {
              placeholder: '请输入结束预订日期',
              initialValue: moment(row.endTime),
              rules: [{required: true, message: '结束预订日期不能为空'}]
            })(<DatePicker size={'small'}/>)}
          </FormItem>
      }, {
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
    form.validateFields(['name', 'time', 'userId', 'courseId'], err => {
      if (!err) {
        request('post', {url: id ? api.updateCourse + id : api.addCourse, data: form.getFieldsValue()})
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
    const {collegeId = '-1', userId = '-1', courseName = '', courseTime = ''} = modalFields;
    return [
      [{
        type: 'INPUT',
        label: '课程名称',
        field: 'name',
        initialValue: courseName,
        rules: [{required: true, message: '课程名称不能为空'}],
        placeholder: '请输入课程名称'
      }],
      [{
        type: 'INPUT',
        label: '上课时间',
        field: 'time',
        initialValue: courseTime,
        rules: [{required: true, message: '上课时间不能为空'}],
        placeholder: '请输入上课时间'
      }],
      [{
        type: 'SELECT',
        label: '任课教师',
        field: 'userId',
        initialValue: userId.toString() !== '-1' ? userId.toString() : '',
        rules: [{required: true, message: '任课教师师不能为空'}],
        opts: teacherList
      }],
      [{
        type: 'SELECT',
        label: '开课单位',
        field: 'collegeId',
        initialValue: collegeId.toString() !== '-1' ? collegeId.toString() : '',
        rules: [{required: true, message: '开课单位不能为空'}],
        opts: collegeList
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
