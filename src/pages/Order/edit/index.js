import React, {Component} from "react";
import {actionCreators as NavLeftAction} from "../../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../../components/PopupModal/store";
import {connect} from "react-redux";
import request from "../../../utils/request";
import api from "../../../config/api";
import CardTable from "../../../components/CardTable";
import {Popconfirm} from "antd";

class OrderManageEdit extends Component {
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
    this.getList()
  }

  getList() {
    this.setState({isTableLoading: true});
    request('get', {url: api.getClientOrderList})
      .then(res => this.setState({tableList:res.data, isTableLoading: false}))
  }

  //Table
  handleDelete(id) {
    request('post', {url: api.deleteClientOrder + id})
      .then(() => this.getList())
      .catch(err => console.log(err));
  }

  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '教材名称', dataIndex: 'bookName', render: (text, record) => `${text}(${record.ISBN})`},
      {title: '价格', dataIndex: 'price'},
      {title: '数量', dataIndex: 'count'},
      {title: '教材批发商', dataIndex: 'sellerName', render: (text, record) => `${record.source}-${text}`},
      {title: 'E-mail', dataIndex: 'email'},
      {title: '手机号码', dataIndex: 'phoneNumber'},
      {title: '地址', dataIndex: 'address'},
      {title: '订单状态', dataIndex: 'status', render: (text) => ({'0': '正在配送', '1': '正在分配', '2': '分配完毕'}[text])},
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
          record.status>0
            ?<span style={{color:'#777'}}>删除</span>
            :<Popconfirm
              title={'是否删除该订单?'}
              okText={'确认'}
              cancelText={'取消'}
              onConfirm={() => this.handleDelete(record.id)}
            >
              <a>删除</a>
            </Popconfirm>

        }
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderTable()}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(OrderManageEdit);
