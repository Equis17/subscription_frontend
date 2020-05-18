import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../../components/PopupModal/store";
import {connect} from "react-redux";
import request from "../../../utils/request";
import api from "../../../config/api";
import {Collapse, Empty, Popconfirm, Table} from "antd";

const {Panel} = Collapse;

class AssignManageBookList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTableLoading: true,
      bookList: []
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getList();
  }

  getList() {
    request('get', {url: api.getAssignerBookList})
      .then((res => {
        this.setState({bookList: res.data});
        return request('get', {url: api.getUserBook})
      }))
      .then(res => {
        const {bookList} = this.state;
        this.setState({
          bookList: bookList
            .map(list => ({
              ...list,
              books: list.bookIds.split(',')
                .map(bookId => res.data.filter((book) => book.id.toString() === bookId)[0])
            }))
        });
      })
      .catch(err => console.log(err))
  }

  renderCollapse() {
    const {bookList} = this.state;
    return (
      bookList.length > 0
        ? <Collapse accordion>
          {bookList.map(list =>
            <Panel header={`${list.subscriptionName}-${list.bookListName}`} key={list.id}>
              <Table
                columns={
                  [
                    {title: '教材名称', dataIndex: 'bookName'},
                    {title: 'ISBN', dataIndex: 'ISBN'}
                  ]
                }
                dataSource={list.books}
                rowKey={(row) => row.id}
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
        {this.renderCollapse()}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(AssignManageBookList);
