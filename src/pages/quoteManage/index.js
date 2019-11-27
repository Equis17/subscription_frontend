import React, {Component} from 'react'
import {actionCreators as NavLeftAction} from "../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../components/PopupModal/store";
import {connect} from "react-redux";
import {SearchBox} from "../../components";
import request from "../../utils/request";
import api from "../../config/api";


class quoteManage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isTableLoading: true,
      tableList: [],
      modalFields: {
        id: '',
        courseBookId: '-1',
        sellerId: '-1',
        price: '',
        status: ''
      },
      searchFilter: {}
    }
  }

  componentDidMount() {
    const {switchMenuKey, match} = this.props;
    switchMenuKey(match.path);

  }

  _setModalFields({id = '', courseBookId = '-1', sellerId = '-1', price = '', status = ''}) {
    this.setState({modalFields: {id, courseBookId, sellerId, price, status}})
  }

  getQuoteList(fields) {
    this.setState({isTableLoading: true});
    request('get', {url: api.getQuoteList, data: fields})
      .then(res => this.setState({tableList: res ? res.data : [], isTableLoading: false}))
      .catch(err => console.log(err));
  }

  //SearchBox
  handleSearch = (fields) => {
    this.setState({searchFilter: fields});
    this.getRouterList(fields);
  };

  renderSearchBox = () => <SearchBox title={'新增报价'} createMethod={(form) => this._createSearchForm(form)}/>;

  _createSearchForm(form) {
    return [
      [
        {type: 'INPUT', label: '批发商', field: 'sellerName'},
        {type: 'INPUT', label: '来源', field: 'sellerSource',},
        {
          type: 'SELECT', label: '报价状态', field: 'status', initialValue: '1',
          opts: [{value: '0', label: '未被征订'}, {value: '1', label: '征订中'}, {value: '2', label: '已被征订'}]
        },
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
      ]
    ]
  }


  render() {
    return (
      <div>
        {this.renderSearchBox()}
        <br/>
        {/*{this.renderTable()}*/}
        {/*{this.renderModal()}*/}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(quoteManage);
