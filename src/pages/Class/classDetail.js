import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../components/PopupModal/store";
import {connect} from "react-redux";
import {Button, Form, message, Popconfirm, Popover, Select, Table} from "antd";
import request from "../../utils/request";
import api from "../../config/api";
import CardTable from "../../components/CardTable";

const {Option} = Select;
const {Item: FormItem} = Form;

class ClassDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      detailId: '',
      tableList: [],
      bookList: [],
      detailList: [],
      isTableLoading: true,
      isDetailLoading: true,
      modalFields: {}
    }
  }

  componentDidMount() {
    const {id} = this.props.match.params;
    this.getList(id)
  }

  getList(id) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getClassListByClassId + id})
      .then(res => this.setState({tableList: res ? res.data : [], isTableLoading: false}))
      .catch(err => console.log(err));
  }

  //Table
  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '姓名', dataIndex: 'realName'},
      {title: '角色类型', dataIndex: 'roleName'},
      {title: '学号', dataIndex: 'account'},
      {title: '手机号码', dataIndex: 'phoneNumber'},
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
    const {userId} = record;
    return (
      <div className={'handleBox'}>
        {this.renderDetailTable(userId)}
      </div>
    )
  }

  //DetailTable
  _handleDuplicate(length) {
    const {detailList = []} = this.state;
    //在动态增删的时候数组的length会变化,为了去除重复的length,动态的改变length的值
    if (detailList.some((item) => item.id.toString()
      .includes(length))) {
      return this._handleDuplicate(length + 1);
    } else {
      return length;
    }
  }

  getUserBookList(id) {
    this.setState({isDetailLoading: true});
    request('get', {url: api.getBookList, data: {status: '2'}})
      .then(res => {
        this.setState({bookList: res ? res.data : []});
        return request('get', {url: api.getUserBookListById + id})
      })
      .then(res => {
        this.setState({detailList: res ? res.data : [], isDetailLoading: false, detailId: id})
      })
  }

  addCourseBook() {
    const {detailList} = this.state;
    const length = this._handleDuplicate(detailList.length);
    const newData = {
      id: `add${length}`,
      bookId: '',
      isPay: 0
    };
    this.setState({detailList: [...detailList, newData]})
  }

  deleteUserBook(id) {
    const {detailId} = this.state;
    request('post', {url: api.deleteUserBook + id})
      .then(res => {
        message.success(res.message);
        this.getUserBookList(detailId);
      })
  }

  cancelAddUserBook(id) {
    const {form} = this.props;
    const {detailList = []} = this.state;
    //筛选要删除的item并保存到新的数组
    const newListData = detailList ? detailList.filter((item) => item.id !== id) : [];
    //还原被删除的表单,否则会导致数据残留报错
    form.resetFields([`bookId${id}`, `isPay${id}`]);
    this.setState({detailList: newListData});
  }

  handleCourseBook(id) {
    const {form} = this.props;
    const {detailList} = this.state;
    form.validateFields((err) => {
      if (!err) {
        const items = detailList
          ? detailList.map(item => item.id)
          : [];
        const formValues = items.map((item) => ({
          bookId: form.getFieldsValue([`bookId${item}`])[`bookId${item}`],
          isPay: form.getFieldsValue([`isPay${item}`])[`isPay${item}`]
        }));

        request('post', {url: api.updateUserBookDetail + id, data: {userBookList: formValues}})
          .then(res => {
            message.success(res.message);
            this.getUserBookList(id)
          })
          .catch(err => console.log(err));
      }
    })
  }

  renderDetailTable(id) {
    const {form} = this.props;
    const {detailList, bookList, isDetailLoading} = this.state;
    const columns = [
      {
        title: '教材名称', dataIndex: 'bookId', width: 300, align: 'center',
        render: (text, row) =>
          <FormItem style={{marginBottom: '0'}}>
            {form.getFieldDecorator(`bookId${row.id}`, {
              initialValue: row.bookId,
              placeholder: '请输入教材名称',
              rules: [{required: true, message: '教材名称不能为空'}]
            })(
              <Select size={'small'} style={{width: '100%'}}>
                {bookList.map(book => <Option key={book.id} value={book.id}>{book.bookName}({book.ISBN})</Option>)}
              </Select>
            )}
          </FormItem>
      },
      {
        title: '支付状态', dataIndex: 'isPay', width: 100, align: 'center',
        render: (text, row) =>
          <FormItem style={{marginBottom: '0'}}>
            {form.getFieldDecorator(`isPay${row.id}`, {
              placeholder: '请输入教材状态',
              initialValue: row.isPay || 0,
              rules: [{required: true, message: '支付状态不能为空'}]
            })(<Select size={'small'}>
              <Option value={0}>未支付</Option>
              <Option value={1}>已支付</Option>
            </Select>)}
          </FormItem>
      },
      {
        title: '操作', dataIndex: '_option', width: 100, align: 'center',
        render: (text, row) =>
          <div className={'handleBox'}>
            <Popconfirm
              title={'是否删除?'}
              onConfirm={() => this.deleteUserBook(row.id)}
            >
              {!row.id.toString()
                .includes('add')
                ? <a>删除</a>
                : <a onClick={() => this.cancelAddUserBook(row.id)}>取消</a>
              }
            </Popconfirm>
          </div>
      }
    ];
    return <Popover
      trigger={'click'}
      placement={'bottomRight'}
      autoAdjustOverflow={false}
      style={{width: '1000'}}
      content={<Table
        size={'small'}
        scroll={{y: 250}}
        rowKey={r => r.id}
        columns={columns}
        dataSource={detailList}
        loading={isDetailLoading}
        pagination={false}
        footer={() =>
          <div style={{position: 'relative'}}>
            <div className={'footer'}>
              <a onClick={() => this.addCourseBook()}>新增课程教材</a>
              <Button style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100px',
                height: '24px'
              }}
                      type="primary"
                      onClick={() => this.handleCourseBook(id)}
                      disabled={detailList.length <= 0 ? 'disabled' : null}
              >保存</Button>
            </div>
          </div>}
      />}
    >
      <a onClick={() => this.getUserBookList(id)}>查看教材</a>
    </Popover>
  }

  //Footer
  renderFooter() {
    return (
      <div style={{width: '100%', height: '80px', marginTop: '20px', textAlign: 'center', backgroundColor: '#fff'}}>
        <Button style={{width: '150px', marginTop: '21px'}} onClick={() => this.props.history.goBack()}>返回</Button>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderTable()}
        {this.renderFooter()}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});
const tableForm = Form.create()(ClassDetail);

export default connect(null, mapDispatchToProps)(tableForm);
