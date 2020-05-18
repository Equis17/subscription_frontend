import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../../components/PopupModal/store";
import {connect} from "react-redux";
import request from "../../../utils/request";
import api from "../../../config/api";
import CardTable from "../../../components/CardTable";
import {Popconfirm, message} from "antd";
import moment from "moment";

class QuoteManageToSub extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getQuotedList();
  }

  getQuotedList() {
    this.setState({isTableLoading: true});
    request('get', {url: api.getQuotedList})
      .then(res => this.setState({tableList:res.data, isTableLoading: false}))
  }

  //Table
  handleDelete(id) {
    request('post', {url: api.cancelQuote, data: {id}})
      .then(() => this.getQuotedList())
      .catch(err => console.log(err));
  }

  handleOrder(id) {
    request('post', {url: api.addToOrder, data: {id}})
      .then((res) => {
        message.success(res.message);
        this.getQuotedList()
      })
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '教材名称', dataIndex: 'bookName'},
      {title: 'ISBN', dataIndex: 'ISBN'},
      {title: '价格', dataIndex: 'price'},
      {title: '征订年份', dataIndex: 'subscriptionName'},

      {
        title: '教材状态',
        dataIndex: 'bookListStatus',
        render: (text) => ({'1': '等待征订结束', '2': '等待预订', '3': '正在预订', '4': '等待批发商处理', '5': '结束'})[text]
      },
      {
        title: '数量',
        dataIndex: 'count',
        render: (text, record) => [4, 5].includes(record.bookListStatus) ? text : '正在统计'
      },
      {
        title: '时间',
        dataIndex: 'time',
        render: (text) => moment(text)
          .format('YYYY-MM-DD HH:mm:ss')
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
    return (
      <div className={'handleBox'}>
        {
          [1].includes(record.bookListStatus)
            ? <Popconfirm
              title={'是否取消报价?'}
              okText={'确认'}
              cancelText={'取消'}
              onConfirm={() => this.handleDelete(record.id)}
            >
              <a>取消报价</a>
            </Popconfirm>
            : [2,3].includes(record.bookListStatus)
            ? <span style={{color: '#777'}}>正在预订</span>
            : [4].includes(record.bookListStatus)
              ? <Popconfirm
                title={'是否去发货?'}
                okText={'确认'}
                cancelText={'取消'}
                onConfirm={() => this.handleOrder(record.id)}
              >
                <a>去发货</a>
              </Popconfirm>
              : <span style={{color: '#777'}}>结束</span>
        }

      </div>
    )
  }

  render() {
    return (
      <div>{this.renderTable()}</div>
    )
  }
}


const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(QuoteManageToSub);
