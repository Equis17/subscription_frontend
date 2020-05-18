import React, {Component} from "react";
import {actionCreators as NavLeftAction} from "../../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../../components/PopupModal/store";
import {connect} from "react-redux";
import request from "../../../utils/request";
import api from "../../../config/api";
import CardTable from "../../../components/CardTable";

class OrderManageInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getList()
  }

  getList() {
    this.setState({isTableLoading: true});
    request('get', {url: api.getClientUserOrderList})
      .then(res => this.setState({tableList: res.data, isTableLoading: false}))
  }

  //Table
  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '教材名称', dataIndex: 'bookName', render: (text, record) => `${text}(${record.ISBN})`},
      {title: '价格', dataIndex: 'price'},
      {title: '教材批发商', dataIndex: 'sellerName', render: (text, record) => `${record.source}-${text}`},
      {title: '征订年份', dataIndex: 'subscriptionName'},
      {title: 'E-mail', dataIndex: 'email'},
      {title: '手机号码', dataIndex: 'phoneNumber'},
      {title: '地址', dataIndex: 'address'},
      {
        title: '订单状态',
        dataIndex: 'status',
        render: (text) => (text || text === 0 ? {0: '正在配送', 1: '正在分配', 2: '分配完毕'}[text] : '未分配')
      },
    ];
    return <CardTable tableConfig={{dataSource, columns, loading, size: 'small', rowKey: (row) => row.id}}/>
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

export default connect(null, mapDispatchToProps)(OrderManageInfo);
