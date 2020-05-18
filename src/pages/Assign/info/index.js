import React, {Component} from "react";
import {actionCreators} from "../../../components/NavLeft/store";
import {connect} from "react-redux";
import request from "../../../utils/request";
import api from "../../../config/api";
import {Button, Collapse, Empty, Table} from "antd";

const {Panel} = Collapse;

class AssignManageInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subscriptionList: [],
      bookList: [],
      isTableLoading: false,
      tableList: [],
      classList: []
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getList()
  }

  getList() {
    request('get', {url: api.getSubscriptionListByAssigner})
      .then(res => {
        this.setState({subscriptionList: res.data});
        return request('get', {url: api.getUserBook});
      })
      .then(res => {
        this.setState({bookList: res.data});
        return request('get', {url: api.getAssignerClassList})
      })
      .then(res => {
        this.setState({classList: res.data});
        return request('get', {url: api.getAssignerBookListWithClass})
      })
      .then(res => {
        const {subscriptionList, bookList, classList} = this.state;
        const data = res.data;
        const tableList = data.map(item => {
          const subscriptionName = subscriptionList.filter(subscription => subscription.id.toString() === item.subscriptionId)[0];
          const classInfo = classList.filter(classInfo => classInfo.id === item.classId)[0];
          const userBookList = item.bookList.map(book => ({...book, ...bookList.filter(userBook => userBook.id.toString() === book.bookId)[0]}));
          return {
            subscriptionId: item.subscriptionId,
            subscriptionName,
            className: `${classInfo.collegeName}-${classInfo.className}`,
            userBookList
          }
        });

        this.setState({
          isTableLoading: false,
          tableList:tableList.filter(item=>subscriptionList.filter(subscription=>subscription.id.toString()===item.subscriptionId)[0].status===4)
        })
      })
      .catch(err => console.log(err))
  }


  renderButton() {
    const {tableList} = this.state;
    return (
      <div style={{height: '50px'}}>
        <Button type="primary" disabled={tableList.length < 0} icon="download" size={'large'}
                style={{float: 'right', marginBottom: '10px'}}
                onClick={() => this.handleExport()}
        >导出书单</Button>
        <Button type="normal" disabled={tableList.length < 0} icon="download" size={'large'}
                style={{float: 'right', marginBottom: '10px',marginRight:'10px'}}
                onClick={() => this.handleExportDetail()}
        >导出学生名单</Button>
      </div>
    )
  }

  handleExport() {
    const token = localStorage.getItem('token');
    window.open(api.getExcel + token, '_blank');
  }
  handleExportDetail() {
    const token = localStorage.getItem('token');
    window.open(api.getExcelDetail + token, '_blank');
  }
  renderCollapse() {
    const {tableList} = this.state;
    return (
      tableList.length > 0
        ? <Collapse accordion>
          {tableList.map((item, index) =>
            <Panel
              key={index}
              header={
                <div style={{height: '30px'}}>
                  <span style={{float: 'left', fontSize: '15px', lineHeight: '30px'}}>
                    {item.subscriptionName.subscriptionName}
                  </span>
                  <span style={{float: "right", fontSize: '15px', lineHeight: '30px'}}>
                    {item.className}
                  </span>
                </div>}
            >
              <Table
                columns={
                  [
                    {title: '教材名称', dataIndex: 'bookName'},
                    {title: '数量', dataIndex: 'count'},
                  ]
                }
                dataSource={item.userBookList}
                rowKey={(row) => row.bookId}
                pagination={false}
              />
            </Panel>
          )}
        </Collapse>
        : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>

    )
  }

  render() {
    return (
      <div>
        {this.renderButton()}
        {this.renderCollapse()}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey(key) {
    dispatch(actionCreators.switchMenuKey(key));
  }
});
export default connect(null, mapDispatchToProps)(AssignManageInfo)
