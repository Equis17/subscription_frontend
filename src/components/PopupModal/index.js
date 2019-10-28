import React, {Component} from 'react'
import {Modal, Form} from "antd";
import renderFormItem from '../common'
import {connect} from "react-redux";
import * as PopupModalAction from "./store/actionCreators";

const formItemLayout = {labelCol: {span: 4}, wrapperCol: {span: 20}};

class PopupModal extends Component {
  componentWillReceiveProps(nextProps) {
    const {form, options} = nextProps;
    !options.visible && form.resetFields();
  }

  renderForm() {
    const {createMethod, form} = this.props;
    return renderFormItem(createMethod(form), form, formItemLayout, 22);
  }

  render() {
    const {switchVisible, resetValue, options} = this.props;
    return (
      <Modal
        {...options}
        footer={null}
        width={600}
        onCancel={() => {
          resetValue && resetValue();
          switchVisible({visible: false, title: ''});
        }}
      >
        {this.renderForm()}
      </Modal>
    );
  }
}

const form = Form.create()(PopupModal);

const mapStateToProps = (state) => ({
  options: state.getIn(['popupModal', 'options']),
});

const mapDispatchToProps = (dispatch) => ({
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch)),
});
export default connect(mapStateToProps, mapDispatchToProps)(form)
