import React, {Component} from "react";
import {actionCreators as NavLeftAction} from "../../../components/NavLeft/store";
import {actionCreators as PopupModalAction} from "../../../components/PopupModal/store";
import {connect} from "react-redux";

class UserBookManage extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
      <div>
        132
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  switchMenuKey: (patch) => dispatch(NavLeftAction.switchMenuKey(patch)),
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});

export default connect(null, mapDispatchToProps)(UserBookManage);
