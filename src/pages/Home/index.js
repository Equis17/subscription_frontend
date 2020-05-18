import React, {Component} from 'react'
import {connect} from "react-redux";
import {SearchBox,CardTable} from './../../components'
import {actionCreators as NavLeftAction} from './../../components/NavLeft/store'

class Home extends Component {
  componentDidMount() {
    const {switchMenuKey} = this.props;
    switchMenuKey(this.props.match.path);
  }

  render() {
    const SearchList = [
      [{
        type: 'INPUT',
        label: '1',
        field: '1',
        initialValue: '1',
        placeholder: '1'
      }, {
        type: 'INPUT',
        label: '2',
        field: '2',
        initialValue: '2',
        placeholder: '2'
      },
        {
          type: 'INPUT',
          label: '3',
          field: '3',
          initialValue: '3',
          placeholder: '3'
        }, {
        type: 'INPUT',
        label: '4',
        field: '4',
        initialValue: '4',
        placeholder: '4'
      }]
      , [{
        type: 'INPUT',
        label: '5',
        field: '5',
        initialValue: '5',
        placeholder: '5'
      }, {
        type: 'INPUT',
        label: '6',
        field: '6',
        initialValue: '6',
        placeholder: '6'
      }, {
        type: 'INPUT',
        label: '7',
        field: '7',
        initialValue: '7',
        placeholder: '7'
      }, {
        type: 'BUTTON',
        field:'button',
        btns:[{label:'查询',key:'check',attr:{style:{float:'right',marginRight:'0'},icon:'search'}}]
      }]
    ];
    return (
      <div>
        <SearchBox formList={SearchList}/>
        <br/>
        <CardTable/>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey:(patch)=> dispatch(NavLeftAction.switchMenuKey(patch))
});
export default connect(null, mapDispatchToProps)(Home)
