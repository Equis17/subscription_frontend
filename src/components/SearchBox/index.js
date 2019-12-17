import React, {Component} from 'react';
import {Button, Card, Form, Row} from 'antd'
import renderFormItem from '../common'
import {connect} from "react-redux";
import * as PopupModalAction from "../PopupModal/store/actionCreators";

const formItemLayout = {labelCol: {span: 6}, wrapperCol: {span: 18}};

class SearchBox extends Component {

  renderForm() {
    const {form, createMethod} = this.props;
    return renderFormItem(createMethod(form), form, formItemLayout);
  }

  render() {
    const {form, switchVisible, title} = this.props;
    return (
      <Card title={'查询'}
            size={'small'}
            extra={title
              ? <div>
                <Button type={'primary'} icon={'plus'} onClick={() => switchVisible({visible: true, title})}>新增</Button>
                <Button type={'danger'} icon={'redo'} onClick={() => form.resetFields()}>重置</Button>
              </div>
              : ''}
      >
        <Row>
          <Form>
            {this.renderForm()}
          </Form>
        </Row>
      </Card>
    );
  }
}

const form = Form.create()(SearchBox);

const mapDispatchToProps = (dispatch) => ({
  switchVisible: (patch) => dispatch(PopupModalAction.switchVisible(patch))
});
export default connect(null, mapDispatchToProps)(form);
