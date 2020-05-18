import React, {Component} from 'react'
import {actionCreators} from "../../../components/NavLeft/store";
import {connect} from "react-redux";
import request from "../../../utils/request";
import api from "../../../config/api";
import CardTable from "../../../components/CardTable";
import {Popconfirm} from "antd";

class UserBookManageInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tableList: [],
      isTableLoading: true
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getClientUserBook();
  }

  getClientUserBook() {
    this.setState({isTableLoading: true});
    request('get', {url: api.getClientUserBook})
      .then(res => {
        this.setState({tableList:res.data, isTableLoading: false});
      })
      .catch(err=>
      console.log(err))
  }


  //Table
  handleDelete(id, subscriptionId) {
    request('post', {url: api.handleUserBook, data: {bookId: id, isPay: '0', subscriptionId}})
      .then(() => this.getClientUserBook())
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '教材名称', dataIndex: 'bookName'},
      {title: 'ISBN', dataIndex: 'ISBN'},
      {
        title: '教材批发商',
        dataIndex: 'sellerName',
        render: (text, record) => record.source && record.sellerName
          ? `${record.source}-${text}`
          : '暂未征订'
      },
      {title: '征订年份', dataIndex: 'subscriptionName'},
      {title: '价格', dataIndex: 'price'},
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
          record.status === 3 ?
            <Popconfirm
              title={'是否取消预订?'}
              okText={'确认'}
              cancelText={'取消'}
              onConfirm={() => this.handleDelete(record.bookId, record.subscriptionId)}
            >
              <a>取消预订</a>
            </Popconfirm>
            :
            <span style={{color: '#777'}}>取消预订</span>
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
  switchMenuKey(key) {
    dispatch(actionCreators.switchMenuKey(key));
  }
});
export default connect(null, mapDispatchToProps)(UserBookManageInfo)
