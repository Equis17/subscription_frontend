import React, {Component} from 'react'
import * as NavLeftAction from "../../components/NavLeft/store/actionCreators";
import * as PopupModalAction from "../../components/PopupModal/store/actionCreators";
import {connect} from "react-redux";
import request from "../../utils/request";
import api from "../../config/api";
import {CardTable, SearchBox} from "../../components";

class BookingListManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableList: [],
      isTableLoading: true,
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);
    this.getUserBookList();
  }


  getUserBookList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getUserBookList, data: fields})
      .then(res => this.setState({tableList:res.data, isTableLoading: false}))
      .catch(err => console.log(err));
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getUserBookList(fields);
  };

  renderSearchBox = () => <SearchBox createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    return [
      [
        {type: 'INPUT', label: '学号', field: 'account'},
        {type: 'INPUT', label: '真实姓名', field: 'realName'},
        {type: 'INPUT', label: '书名', field: 'phoneNumber'},
        {
          type: 'BUTTON', field: 'btns',
          btns: [{
            label: '搜索',
            attr: {
              icon: 'search',
              key: 'search',
              style: {float: 'right'},
              onClick: () => this.handleSearch(form.getFieldsValue())
            }
          }]
        }
      ],
      [
        {type: 'INPUT', label: 'ISBN', field: 'ISBN'},
        {type: 'INPUT', label: '学院名称', field: 'collegeName'},
        {type: 'INPUT', label: '班级名称', field: 'className'},
        {type: 'INPUT', label: '年级', field: 'session'},
      ]
    ]
  }

//Table
  renderTable() {
    const {isTableLoading: loading, tableList: dataSource} = this.state;
    const columns = [
      {title: '姓名', dataIndex: 'realName'},
      {title: '学号', dataIndex: 'account'},
      {title: '手机号', dataIndex: 'phoneNumber'},
      {title: '所在学院', dataIndex: 'collegeName'},
      {title: '所在年届', dataIndex: 'session'},
      {title: '所在班级', dataIndex: 'className'},
      {title: '书名', dataIndex: 'bookName'},
      {title: 'ISBN', dataIndex: 'ISBN'}
    ];
    return <CardTable tableConfig={{dataSource, columns, loading, size: 'small', rowKey: (row) => row.id}}/>
  }

  render() {
    return (
      <div>
        {this.renderSearchBox()}
        <br/>
        {this.renderTable()}
      </div>
    )
  }
}


const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});
export default connect(null, mapDispatchToProps)(BookingListManage);
