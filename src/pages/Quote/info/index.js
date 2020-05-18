import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../../components/PopupModal/store";
import {connect} from "react-redux";
import request from "../../../utils/request";
import api from "../../../config/api";
import {CardTable, PopupModal} from "../../../components";
import {message} from "antd";

class QuoteManageInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTableLoading: true,
      tableList: [],
      modalFields: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getToSubList();
  }

  _setModalFields({id = '', bookName = '', ISBN = '', price = '', status = '',subscriptionName='',subscriptionId=''}) {
    this.setState({modalFields: {id, bookName, ISBN, price, status,subscriptionName,subscriptionId}})
  }

  getToSubList() {
    this.setState({isTableLoading: true});
    request('get', {url: api.getToSubList})
      .then(res => this.setState({tableList: res.data, isTableLoading: false}))
  }

//Table
  renderTable() {
    const {isTableLoading: loading, tableList: dataSources} = this.state;
    const columns = [
      {title: '教材名称', dataIndex: 'bookName'},
      {title: 'isbn', dataIndex: 'ISBN'},
      {title: '价格', dataIndex: 'price'},
      {
        title: '状态',
        dataIndex: 'status',
        render: (text) => (text
          ? {'1': '征订中', '2': '征订成功', '3': '未被采购'}[text]
          : '未报价')
      },

      {
        title: '操作', dataIndex: 'unit', render: (text, record) => this.renderTableOperation(record)
      }
    ];
    const statusObj={
      0:'未开始',
      1:'开始征订',
      2:'结束征订',
      3:'开始预订',
      4:'结束预订',
      5:'结束'
    };
    return dataSources.map((dataSource,index)=>(<CardTable key={dataSource[0].subscriptionId} style={{marginBottom:20}} cardTitle={`${dataSource[0].subscriptionName}-${statusObj[dataSource[0].subscriptionStatus]}`} tableConfig={{dataSource, columns, loading, size: 'small', rowKey: (row) => row.id}}/>))
  }

  renderTableOperation(record) {
    const {switchVisible} = this.props;
    const {bookName, id, ISBN, price, status,subscriptionName,subscriptionId,subscriptionStatus} = record;
    return (
      <div className={'handleBox'}>
        {
          status === 2 || status === 3 || subscriptionStatus > 1
            ? '报价'
            : <a onClick={() => {
              this._setModalFields({id, bookName, ISBN, price, status,subscriptionName,subscriptionId});
              switchVisible({visible: true, title: '教材报价'})
            }}>报价</a>
        }
      </div>
    )
  }


  //Modal
  handleSubmit(form) {
    const {searchFilter, modalFields} = this.state;
    const {id, status,subscriptionId} = modalFields;
    form.validateFields(err => {
      !err && request('post', {
        url: !status ? api.addBookQuote : api.updateBookQuote + id, data: {
          ...form.getFieldsValue(),
          id,
          subscriptionId
        }
      })
        .then(res => {
          message.success(res.message);
          this.props.switchVisible({visible: false, title: ''});
          this._setModalFields({});
          this.getToSubList(searchFilter);
        })
        .catch(err => console.log(err))
    })

  }

  renderModal() {
    return <PopupModal resetValue={() => this._setModalFields({})} createMethod={form => this._createModalForm(form)}/>
  }

  _createModalForm(form) {
    const {bookName, ISBN, status, price,subscriptionName} = this.state.modalFields;
    return [
      [{
        type: 'SPAN',
        label: '教材名称',
        field: 'bookName',
        initialValue: bookName,
      }],
      [{
        type: 'SPAN',
        label: '征订年份',
        field: 'subscriptionName',
        initialValue: subscriptionName,
      }],
      [{
        type: 'SPAN',
        label: 'ISBN',
        field: 'ISBN',
        initialValue: ISBN,
      }],
      [{
        type: 'SPAN',
        label: '状态',
        field: 'status',
        initialValue: status ? {'1': '征订中', '2': '征订成功', '3': '未被采购'}[status] : '未报价',
      }],
      [{
        type: 'INPUT-NUMBER',
        label: '价格',
        field: 'price',
        initialValue: price
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

export default connect(null, mapDispatchToProps)(QuoteManageInfo);
