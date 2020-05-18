import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../../components/PopupModal/store";
import {connect} from "react-redux";
import request from "../../../utils/request";
import api from "../../../config/api";
import {CardTable} from "../../../components";

class BookManageQuote extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isTableLoading: true,
      tableList: []
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getList();
  }

  getList() {
    this.setState({isTableLoading: true});
    request('get', {url: api.getBookQuoteList})
      .then(res => this.setState({tableList:res.data, isTableLoading: false}))
  }

//Table
  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '教材名称', dataIndex: 'bookName'},
      {title: 'isbn', dataIndex: 'ISBN'},
      {
        title: '教材征订状态',
        dataIndex: 'status',
        width: 200,
        align: 'center',
        render: (text, record) => {
          return {0: '未征订', 1: '征订中', 2: '已被征订',3:'批发商取消报价'}[record.status]
        }
      }
    ];
    return <CardTable tableConfig={{dataSource, columns, loading, size: 'small', rowKey: (row) => row.id}}/>
  }

  render() {
    return (<div>{this.renderTable()}</div>)
  }
}


const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(BookManageQuote);
