import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../../components/PopupModal/store";
import {connect} from "react-redux";
import request from "../../../utils/request";
import api from "../../../config/api";
import SearchBox from "../../../components/SearchBox";
import {message} from "antd";
import {CardTable, PopupModal} from "../../../components";

class BookManageInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableList: [],
      isTableLoading: true,
      modalFields: {
        bookName: '',
        ISBN: '',
        toggle: '1',
        status: '',
        id: ''
      },
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getBookList();
  }

  _setModalFields({bookName = '', ISBN = '', status = '', id = '', toggle = '1'}) {
    this.setState({modalFields: {bookName, ISBN, status, id, toggle}})
  }

  getBookList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getBookList, data: fields})
      .then(res => this.setState({tableList:res.data, isTableLoading: false}))
      .catch(err => console.log(err));
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getBookList(fields);
  };

  renderSearchBox = () => <SearchBox title={'申请教材'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    return [
      [
        {type: 'INPUT', label: '书名', field: 'bookName'},
        {type: 'INPUT', label: 'ISBN', field: 'isbn'},
        {
          type: 'SELECT', label: '教材状态', field: 'status', initialValue: '',
          opts: [
            {value: '2', label: '审核通过'},
            {value: '3', label: '审核失败'},
            {value: '1', label: '审核中'},
            {value: '', label: '全部'}
          ]
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
  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '教材名称', dataIndex: 'bookName'},
      {title: 'isbn', dataIndex: 'ISBN'},
      {
        title: '教材状态',
        dataIndex: 'status',
        width: 200,
        align: 'center',
        render: (text, record) => {
          return {
            1: () => <span style={{color: '#777'}}>审核中</span>,
            2: () => <span style={{color: '#00d232'}}>审核通过</span>,
            3: () => <span style={{color: '#FF4D4F'}}>审核未通过</span>
          }[record.status]()
        }
      },
      {
        title: '是否启用',
        dataIndex: 'toggle',
        width: 200,
        align: 'center',
        render: (text, record) => record.toggle
          ? <span style={{color:'#00d232'}}>已启用</span>
          : <span style={{color:'#FF4D4F'}}>未启用</span>
      }
    ];
    return <CardTable tableConfig={{dataSource, columns, loading, size: 'small', rowKey: (row) => row.id}}/>
  }

  //Modal
  handleSubmit(form) {
    const {searchFilter} = this.state;
    form.validateFields(err => {
      !err && request('post', {url: api.applyBook, data: form.getFieldsValue()})
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
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {bookName, ISBN} = this.state.modalFields;
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
        initialValue: ISBN,
        rules: [{required: true, message: 'ISBN不能为空'}],
        placeholder: '请输入ISBN'
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

export default connect(null, mapDispatchToProps)(BookManageInfo);
