import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../components/PopupModal/store";
import {connect} from "react-redux";
import api from "../../config/api";
import request from "../../utils/request";
import SearchBox from "../../components/SearchBox";
import {message, Popconfirm} from "antd";
import {CardTable, PopupModal} from "../../components";

class BookManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableList: [],
      isTableLoading: true,
      modalFields: {
        bookName: '',
        isbn: '',
        toggle: '1',
        id: ''
      },
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getBookList()
  }

  _setModalFields({bookName = '', isbn = '', id = '', toggle = '1'}) {
    this.setState({modalFields: {bookName, isbn, id, toggle}})
  }

  getBookList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getBookList, data: fields})
      .then(res => this.setState({tableList: res ? res.data : [], isTableLoading: false}))
      .catch(err => console.log(err));
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getBookList(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增教材'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    return [
      [
        {type: 'INPUT', label: '书名', field: 'bookName'},
        {type: 'INPUT', label: 'ISBN', field: 'isbn'},
        {
          type: 'SELECT', label: '是否启用', field: 'toggle', initialValue: '1',
          opts: [{value: '1', label: '是'}, {value: '0', label: '否'}, {value: '2', label: '全部'}]
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
    request('post', {url: api.deleteBook + id})
      .then(res => {
        message.success(res.message);
        this.getBookList(searchFilter);
      })
      .catch(err => console.log(err))
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '教材名称', dataIndex: 'name'},
      {title: 'isbn', dataIndex: 'isbn'},
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
    const {toggle, name: bookName, isbn, id} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({toggle, bookName, isbn, id});
          switchVisible({visible: true, title: '编辑教材'})
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

  //Modal
  handleSubmit(form) {
    const {searchFilter, modalFields} = this.state;
    const {id} = modalFields;
    form.validateFields(['bookName', 'isbn', 'toggle'], err => {
      !err && request('post', {url: id ? api.updateBook + id : api.addBook, data: form.getFieldsValue()})
        .then(res => {
          message.success(res.message);
          this.props.switchVisible({visible: false, title: ''});
          this._setModalFields({});
          this.getBookList(searchFilter);
        })
        .catch(err => console.log(err))
    })

  }

  renderModal() {
    return <PopupModal resetValue={()=>this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {toggle, bookName, isbn} = this.state.modalFields;
    return [
      [{
        type: 'INPUT',
        label: '教材名称',
        field: 'bookName',
        initialValue: bookName,
        rules: [{required: true, message: '教材名称不能为空'}],
        placeholder: '请输入教材名称'
      }],
      [{
        type: 'INPUT',
        label: 'ISBN',
        field: 'ISBN',
        initialValue: isbn,
        rules: [{required: true, message: 'ISBN不能为空'}],
        placeholder: '请输入ISBN'
      }],
      [{
        type: 'SELECT',
        label: '是否启用',
        field: 'toggle',
        initialValue: toggle,
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
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(BookManage);
