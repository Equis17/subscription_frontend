import React, {Component} from 'react'
import {actionCreators} from "../../../components/NavLeft/store";
import {connect} from "react-redux";
import request from "../../../utils/request";
import api from "../../../config/api";
import {Card, Collapse, Empty, message, Popconfirm, Table} from "antd";

const {Panel} = Collapse;

class BookListInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      bookList: [],
      book: [],
      userBookList: []
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getList();
  }

  getList() {
    request('get', {url: api.getUserBookListInfo, data: {status: 3}})
      .then((res => {
        this.setState({bookList: JSON.stringify(res.data) === "{}" ? [] : res.data});
        return request('get', {url: api.getUserBook})
      }))
      .then(res => {
        const {bookList} = this.state;
        this.setState({
          book: res.data,
          bookList: bookList
            .map(list => ({
              ...list,
              books: list.bookIds.split(',')
                .map(bookId => res.data.filter((book) => book.id.toString() === bookId)[0])
            }))
        });
        return request('get', {url: api.getClientBookList})
      })
      .then(res => this.setState({userBookList: res.data}))
      .catch(err => console.log(err))
  }

  handleBook(bookId, isPay, subscriptionId) {
    request('post', {url: api.handleUserBook, data: {bookId, isPay, subscriptionId}})
      .then(res => {
        message.success(res.message);
        this.getList();
      })
      .catch(err => console.log(err))
  }

  renderCollapse() {
    const {bookList, userBookList} = this.state;
    return (
      bookList.length > 0
        ? <Collapse accordion>
          {bookList.map(list =>
            <Panel header={`${list.subscriptionName}-${list.bookListName}`} key={list.id}>
              <Table
                columns={
                  [
                    {title: '教材名称', dataIndex: 'bookName'},
                    {title: 'ISBN', dataIndex: 'ISBN'},
                    {
                      title: '操作',
                      dataIndex: 'unit',
                      render: (text, record) => {
                        const htmlEnum = {
                          'book': (record) => <Popconfirm
                            title={'是否预订该教材?'}
                            okText={'确认'}
                            cancelText={'取消'}
                            onConfirm={() => this.handleBook(record.id, '1', list.subscriptionId)}
                          >
                            <a>预订</a>
                          </Popconfirm>,
                          'noBook': (record) => <Popconfirm
                            title={'是否取消预订该教材?'}
                            okText={'确认'}
                            cancelText={'取消'}
                            onConfirm={() => this.handleBook(record.id, '0', list.subscriptionId)}
                          >
                            <a style={{color: '#ff8605'}}>取消预订</a>
                          </Popconfirm>
                        };
                        const data = userBookList.filter(userBook => userBook.bookId === record.id && list.subscriptionId === userBook.subscriptionId)[0];
                        return data ? data.isPay === 1 ? htmlEnum['noBook'](record) : htmlEnum['book'](record) : htmlEnum['book'](record)
                      }
                    }
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
      <Card>
        {this.renderCollapse()}
      </Card>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey(key) {
    dispatch(actionCreators.switchMenuKey(key));
  }
});
export default connect(null, mapDispatchToProps)(BookListInfo)
