import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../../components/PopupModal/store";
import {connect} from "react-redux";
import request from "../../../utils/request";
import api from "../../../config/api";
import SearchBox from "../../../components/SearchBox";
import CardTable from "../../../components/CardTable";
import {message} from "antd";
import {PopupModal} from "../../../components";

class BookListManageEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTableLoading: true,
      bookList: [],
      tableList: [],
      bookLists: [],
      classList: [],
      collegeList: [],
      subscriptionList: [],
      modalFields: {
        id: '',
        bookListName: '',
        collegeId: '',
        toggle: '',
        bookIds: '',
        classIds: '',
        subscriptionId: '',
        subscriptionName: '',
        collegeName: '',
        status: '',
      },
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getSelectList()
      .then(() => this.getBookLists())
  }

  _setModalFields({id = '', bookListName = '', collegeId = '', toggle = '', bookIds = '', classIds = '', subscriptionId = '', subscriptionName = '', collegeName = ''}) {
    this.setState({
      modalFields: {
        id,
        bookListName,
        collegeId,
        toggle,
        bookIds,
        classIds,
        subscriptionId,
        collegeName,
        subscriptionName
      }
    });
  }

  getSelectList() {
    return request('get', {url: api.getBookList, data: {toggle: '1'}})
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = i.bookName;
          return i;
        });
        this.setState({bookList: res.data});
        return request('get', {url: api.getClassList, data: {toggle: '1'}})
      })
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = `${i.className}(${i.session})`;
          return i;
        });
        this.setState({classList: res.data});
        return request('get', {url: api.getCollegeList, data: {toggle: '1'}})
      })
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = i.collegeName;
          return i;
        });
        this.setState({collegeList: res.data});
        return request('get', {url: api.getSubscriptionList})
      })
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = i.subscriptionName;
          return i;
        });
        this.setState({subscriptionList: res.data});
      })
      .catch(err => console.log(err));
  }


  getBookLists(fields) {
    const {bookList, classList} = this.state;

    this.setState({isTableLoading: true});
    request('get', {url: api.getBookLists, data: {...fields, toggle: '1'}})
      .then(res => {
        const data = res.data;
        this.setState({
          isTableLoading: false,
          tableList: data.map(item => {
            console.log(
              item.bookIds.split(',')
              .map(num => bookList.filter(book => book.id.toString() === num))
            )
            return ({
              ...item,
              classNameList: item.classIds!==''?item.classIds.split(',')
                .map(num => classList.filter(className => className.id.toString() === num)[0]['className'])
                .join(',\n'):[],
              bookNameList: item.bookIds!==''?item.bookIds.split(',')
                .map(num => bookList.filter(book => book.id.toString() === num)[0]['bookName'])
                .join(',\n'):[]

            })
          })
        })
      })
      .catch(err => console.log(err))
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getBookLists(fields);
  };

  renderSearchBox = () => <SearchBox createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    const {collegeList, subscriptionList} = this.state;
    return [
      [
        {type: 'INPUT', label: '书单名称', field: 'bookListName'},
        {
          type: 'SELECT', label: '所属学院', field: 'collegeId', initialValue: '',
          opts: [...collegeList, {value: '', label: '全部'}]
        },
        {
          type: 'SELECT', label: '征订年份', field: 'subscriptionId', initialValue: '',
          opts: [...subscriptionList, {value: '', label: '全部'}]
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
    request('post', {url: api.deleteBookLists + id})
      .then(() => this.getBookLists(searchFilter))
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '书单名称', dataIndex: 'bookListName'},
      {title: '所属学院', dataIndex: 'collegeName'},
      {title: '征订年份', dataIndex: 'subscriptionName'},
      {
        title: '征订状态',
        dataIndex: 'status',
        render: (text) => ({'0': '未开始', '1': '开始征订', '2': '结束征订', '3': '开始预订', '4': '结束预订', '5': '结束'}[text])
      },
      {title: '是否启用', dataIndex: 'toggle', render: (text, record) => record.toggle ? '已启用' : '未启用'},
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
    const {id, bookListName, collegeId, toggle, bookIds, classIds, subscriptionId, subscriptionName, collegeName, status} = record;
    return (
      <div className={'handleBox'}>
        {
          status === 0
            ? <a onClick={() => {
              this._setModalFields({
                id,
                bookListName,
                collegeId,
                toggle,
                bookIds,
                classIds,
                subscriptionId,
                subscriptionName,
                collegeName
              });
              switchVisible({visible: true, title: '编辑书单'})
            }}>编辑</a>
            : <span style={{color: '#999'}}>编辑</span>
        }
      </div>
    )
  }

  //Modal
  handleSubmit(form) {
    const {searchFilter, modalFields} = this.state;
    const {id} = modalFields;
    form.validateFields(err => {
      if (!err) {
        const {bookIds, classIds} = form.getFieldsValue();
        request('post', {
          url: api.editBookList + id,
          data: {
            bookIds: bookIds.join(','),
            classIds: classIds.join(',')
          }
        })
          .then(res => {
            message.success(res.message);
            this.props.switchVisible({visible: false, title: ''});
            this._setModalFields({});
            this.getBookLists(searchFilter);
          })
          .catch(err => console.log(err));
      }
    });
  }

  renderModal() {
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {bookList, classList, modalFields} = this.state;
    const {bookListName, collegeName, subscriptionName, bookIds, classIds} = modalFields;
    return [
      [{
        type: 'SPAN',
        label: '书单名称',
        field:'bookListName',
        initialValue: bookListName,
      }],
      [{
        type: 'SPAN',
        label: '所属学院',
        field:'collegeName',
        initialValue: collegeName,
      }],
      [{
        type: 'LONG-SPAN',
        label: '征订年份',
        field:'subscriptionName',
        initialValue: subscriptionName,
      }],
      [{
        type: 'MULTISELECT',
        label: '书单',
        field: 'bookIds',
        initialValue: bookIds ? bookIds.split(',') : [],
        opts: bookList,
        rules: [{required: true, message: '书单不能为空'}],
      }],
      [{
        type: 'MULTISELECT',
        label: '开放班级',
        field: 'classIds',
        initialValue: classIds ? classIds.split(',') : [],
        opts: classList,
        rules: [{required: true, message: '开放院系不能为空'}],
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

export default connect(null, mapDispatchToProps)(BookListManageEdit);
