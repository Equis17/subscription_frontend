import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../components/PopupModal/store";
import {connect} from "react-redux";
import request from "../../utils/request";
import api from "../../config/api";
import SearchBox from "../../components/SearchBox";
import CardTable from "../../components/CardTable";
import {message, Popconfirm} from "antd";
import {PopupModal} from "../../components";
import {ruleObj} from "../../utils/utils";

class BooKListManage extends Component {
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

  _setModalFields({id = '', bookListName = '', collegeId = '', toggle = '', bookIds = '', classIds = '', subscriptionId = ''}) {
    this.setState({modalFields: {id, bookListName, collegeId, toggle, bookIds, classIds, subscriptionId}});
  }

  getSelectList() {
    return request('get', {url: api.getBookList, data: {toggle: '1', status: '2'}})
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = i.bookName;
          return i;
        });
        this.setState({bookList: res ? res.data : []});
        return request('get', {url: api.getClassList, data: {toggle: '1'}})
      })
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = `${i.className}(${i.session})`;
          return i;
        });
        this.setState({classList: res ? res.data : []});
        return request('get', {url: api.getCollegeList, data: {toggle: '1'}})
      })
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = i.collegeName;
          return i;
        });
        this.setState({collegeList: res ? res.data : []});
        return request('get', {url: api.getSubscriptionList})
      })
      .then(res => {
        res.data.map(i => {
          i.value = i.id.toString();
          i.label = i.subscriptionName;
          return i;
        });
        this.setState({subscriptionList: res ? res.data : []});
      })
      .catch(err => console.log(err));
  }

  getBookLists(fields) {
    const {bookList, classList} = this.state;

    this.setState({isTableLoading: true});
    request('get', {url: api.getBookLists, data: fields})
      .then(res => {
        const data = res.data ? res.data : [];
        this.setState({
          isTableLoading: false,
          tableList: data.map(item => {
            const classNameList = item.classIds.split(',')
              .map(num => {
                const info = classList.filter(className => className.id.toString() === num);
                return info.length > 0 ? info[0]['className'] : ''
              })
              .join(',\n');
            const bookNameList = item.bookIds.split(',')
              .map(num => {
                const info = bookList.filter(book => book.id.toString() === num);
                return info.length > 0 ? info[0]['bookName'] : ''
              })
              .join(',\n');
            return {...item, classNameList, bookNameList}
          })
        })
      })
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getBookLists(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增书单'} createMethod={(form) => this._createSearchForm(form)}/>;

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
          type: 'SELECT', label: '是否启用', field: 'toggle', initialValue: '1',
          opts: [{value: '1', label: '已启用'}, {value: '0', label: '未启用'}, {value: '', label: '全部'}]
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
          type: 'SELECT', label: '征订年份', field: 'subscriptionId', initialValue: '',
          opts: [...subscriptionList, {value: '', label: '全部'}]
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
        width: 200,
        align: 'center',
        render: (text, record) => this.renderTableOperation(record)
      }
    ];
    return <CardTable tableConfig={{dataSource, columns, loading, size: 'small', rowKey: (row) => row.id}}/>
  }

  renderTableOperation(record) {
    const {switchVisible} = this.props;
    const {id, bookListName, collegeId, toggle, bookIds, classIds, subscriptionId} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({id, bookListName, collegeId, toggle, bookIds, classIds, subscriptionId});
          switchVisible({visible: true, title: '编辑书单'})
        }}>编辑</a>
        <span>|</span>
        <Popconfirm
          title={'是否删除该书单?'}
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
    form.validateFields(['bookIds', 'classIds', 'toggle', 'subscriptionId', 'bookListName', 'collegeId'], err => {
      if (!err) {
        console.log(form.getFieldsValue());
        const {bookIds, classIds, toggle, subscriptionId, bookListName, collegeId} = form.getFieldsValue();
        request('post', {
          url: id ? api.updateBookLists + id : api.addBookLists,
          data: {
            toggle, bookListName, collegeId, subscriptionId,
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
    const {bookList, collegeList, classList, modalFields, subscriptionList} = this.state;
    const {bookListName, collegeId, toggle, bookIds, classIds, subscriptionId} = modalFields;
    return [
      [{
        type: 'INPUT',
        label: '书单名称',
        field: 'bookListName',
        initialValue: bookListName,
        rules: [
          {required: true, message: '书单名称不能为空'},
          ruleObj.maxChar,
          ruleObj.whitespace,
          ],
        placeholder: '请输入书单名称'
      }],
      [{
        type: 'SELECT',
        label: '所属学院',
        field: 'collegeId',
        initialValue: collegeId.toString() ? collegeId.toString() : '',
        rules: [{required: true, message: '所属学院不能为空'}],
        opts: collegeList
      }],
      [{
        type: 'SELECT',
        label: '征订年份',
        field: 'subscriptionId',
        initialValue: subscriptionId.toString() ? subscriptionId.toString() : '',
        rules: [{required: true, message: '征订年份不能为空'}],
        opts: subscriptionList
      }],
      [{
        type: 'MULTISELECT',
        label: '书单',
        field: 'bookIds',
        initialValue: bookIds ? bookIds.split(',') : [],
        opts: bookList,
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
        type: 'SELECT',
        label: '是否启用',
        field: 'toggle',
        initialValue: toggle ? '1' : '0',
        rules: [{required: true, message: '开课单位不能为空'}],
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
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(BooKListManage);
