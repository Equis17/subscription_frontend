import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../components/PopupModal/store";
import {connect} from "react-redux";
import {CardTable, PopupModal, SearchBox} from "../../components";
import request from "../../utils/request";
import api from "../../config/api";
import {message, Popconfirm} from "antd";
import moment from "moment";


class quoteManage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isTableLoading: true,
      tableList: [],
      sellerList: [],
      bookList: [],
      subscriptionList: [],
      modalFields: {
        id: '',
        bookId: '',
        sellerId: '',
        price: '',
        status: ''
      },
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getSelectList()
      .then(() => {
        this.getQuoteList()
      })
  }

  _setModalFields({id = '', bookId = '', sellerId = '', price = '', status = '', subscriptionId = ''}) {
    this.setState({modalFields: {id, bookId, sellerId, price, status, subscriptionId}})
  }

  getSelectList() {
    return request('get', {url: api.getSellerSelectList})
      .then(res => {
        const sellerList = res.data.map((seller) => ({
          ...seller,
          label: `${seller.source}-${seller.sellerName}-${seller.phoneNumber}`,
          value: seller.id
        }));
        this.setState({sellerList});
        return request('get', {url: api.getBookList, data: {toggle: '1', status: '2'}})
      })
      .then(res => {
        const bookList = res.data.map((book) => ({
          ...book,
          label: `${book.bookName}-(${book.ISBN})`,
          value: book.id
        }));
        this.setState({bookList});
        return request('get', {url: api.getSubscriptionList})
      })
      .then(res => {
        const subscriptionList = res.data.map(item => ({
          ...item,
          label: item.subscriptionName,
          value: item.id.toString()
        }));
        this.setState({subscriptionList})
      })
      .catch(err => console.log(err))
  }

  getQuoteList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getQuoteList, data: fields})
      .then(res => this.setState({tableList: res.data, isTableLoading: false}))
      .catch(err => console.log(err));
  }

  //searchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getQuoteList(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增报价'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    const {sellerList, bookList,subscriptionList} = this.state;
    return [
      [
        {
          type: 'SELECT', label: '书名', field: 'bookId', initialValue: '',
          opts: [...bookList, {label: '全部', value: ''}]
        },
        {
          type: 'SELECT', label: '批发商', field: 'sellerId', initialValue: '',
          opts: [...sellerList, {label: '全部', value: ''}]
        },
        {
          type: 'SELECT', label: '征订状态', field: 'status', initialValue: '1',
          opts: [{value: '1', label: '征订中'}, {value: '2', label: '已被征订'}, {value: '3', label: '未被征订'}, {
            value: '',
            label: '全部'
          }]
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
          }],
        }
      ],
      [
        {type: 'INPUT', label: '价格', field: 'price'},
        {
          type: 'SELECT', label: '征订年份', field: 'subscriptionId', initialValue: '1',
          opts: [...subscriptionList, {label: '全部', value: ''}]

        },
      ]
    ]
  }

  //Table
  handleDelete(id) {
    const {searchFilter} = this.state;
    request('post', {url: api.deleteQuote + id})
      .then(err => {
        message.success(err.message);
        this.getQuoteList(searchFilter)
      })
      .catch(err => console.log(err));
  }

  handleSub(sellerId, bookId,subscriptionId) {
    const {searchFilter} = this.state;

    request('post', {url: api.subQuote, data: {bookId, sellerId,subscriptionId}})
      .then(err => {
        message.success(err.message);
        this.getQuoteList(searchFilter)
      })
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '批发商名称', dataIndex: 'sellerName'},
      {title: '批发商来源', dataIndex: 'source'},
      {title: '手机号码', dataIndex: 'phoneNumber'},
      {title: '邮箱', dataIndex: 'email'},
      {title: '教材名称 ', dataIndex: 'bookName', render: (text, row) => `${row.bookName}-${row.ISBN}`},
      {title:'征订年份',dataIndex:'subscriptionName'},
      {title: '报价', dataIndex: 'price'},
      {
        title: '征订状态',
        dataIndex: 'status',
        width: 100,
        align: 'center',
        render: (text) => ({
          '1': () => <span style={{color: '#777'}}>征订中</span>,
          '2': () => <span style={{color: '#00d232'}}>已被征订</span>,
          '3': () => <span style={{color: '#FF4D4F'}}>未被征定</span>
        }[text]())
      },
      {
        title: '报价时间',
        dataIndex: 'time',
        render: (text) => moment(text)
          .format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '操作',
        dataIndex: 'unit',
        width: 150,
        align: 'center',
        render: (text, record) => this.renderTableOperation(record)
      }
    ];
    return <CardTable tableConfig={{dataSource, columns, loading, size: 'small', rowKey: (row) => row.id}}/>
  }

  renderTableOperation(record) {
    const {switchVisible} = this.props;
    const {id, bookId, sellerId, price, status} = record;
    return (
      <div className={'handleBox'}>
        <a onClick={() => {
          this._setModalFields({id, bookId, sellerId, price, status});
          switchVisible({visible: true, title: '编辑报价信息'})
        }}>编辑</a>
        <span>|</span>
        <Popconfirm
          title={'是否删除该路由?'}
          okText={'确认'}
          cancelText={'取消'}
          onConfirm={() => this.handleDelete(record.id)}
        >
          <a>删除</a>
        </Popconfirm>
        <span>|</span>
        <Popconfirm
          title={'是否征订该报价?'}
          okText={'确认'}
          cancelText={'取消'}
          onConfirm={() => this.handleSub(record.sellerId, record.bookId,record.subscriptionId)}
        >
          <a>征订</a>
        </Popconfirm>
      </div>
    )
  }

  //Modal
  handleSubmit(form) {
    const {searchFilter, modalFields} = this.state;
    const {id} = modalFields;
    form.validateFields(err => {
      !err && request('post', {url: id ? api.updateQuote + id : api.addQuote, data: form.getFieldsValue()})
        .then(res => {
          message.success(res.message);
          this.props.switchVisible({visible: false, title: ''});
          this._setModalFields({});
          this.getQuoteList(searchFilter);
        })
        .catch(err => console.log(err))
    })

  }

  renderModal() {
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {sellerList, bookList, modalFields} = this.state;
    const {bookId, sellerId, price, status} = modalFields;
    return [
      [{
        type: 'SELECT',
        label: '批发商',
        field: 'sellerId',
        initialValue: sellerId || '',
        rules: [{required: true, message: '批发商不能为空'}],
        opts: [...sellerList],
        search: true
      }],
      [{
        type: 'SELECT',
        label: '书名',
        field: 'bookId',
        initialValue: bookId || '',
        rules: [{required: true, message: '书名不能为空'}],
        opts: [...bookList],
        search: true
      }],
      [{
        type: 'INPUT-NUMBER',
        label: '报价',
        field: 'price',
        initialValue: price || '',
        rules: [{required: true, message: '报价不能为空'}],
      }],
      [{
        type: 'SELECT',
        label: '征订状态',
        field: 'status',
        initialValue: status ? status.toString() : '1',
        rules: [{required: true, message: '征订状态不能为空'}],
        opts: [{value: '1', label: '征订中'}, {value: '2', label: '已被征订'}, {value: '3', label: '未被征订'}],
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
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(quoteManage);
