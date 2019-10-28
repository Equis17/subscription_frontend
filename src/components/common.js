import {Button, Checkbox, Col, Form, Input, Row, Select} from "antd";
import React from "react";

const FormItem = Form.Item;
const Option = Select.Option;
/*
* formList:{
*   type:INPUT|SELECT|BUTTON          类型
*   label:INPUT|SELECT                标签
*   field:INPUT|SELECT|BUTTON         表单key
*   initialValue:INPUT|SELECT         初始值
*   placeholder:INPUT|SELECT
*   btns:[BUTTON                      btn数组
*     {
*       label
*       attr
*     }
*   ]
* }
*
* */
export default (formList, form, formItemLayout, formLayout) => {
  const {getFieldDecorator} = form;
  if (formList && formList.length > 0) {
    return formList.map((itemList, i) => {
      return <Row gutter={10} key={i}>
        {itemList.map((item) => {
          const {type, label, field, initialValue = '', placeholder, btns = [], opts = [], rules, fieldList = []} = item;
          if (type === 'INPUT') {
            return <Col span={formLayout || 6} key={field}>
              <FormItem {...formItemLayout} label={label}>
                {getFieldDecorator(field, {initialValue, rules})(<Input type="text" id={field}
                                                                        placeholder={placeholder}/>)}
              </FormItem>
            </Col>
          } else if (type === 'PASSWORD') {
            return <Col span={formLayout || 6} key={field}>
              <FormItem {...formItemLayout} label={label}>
                {getFieldDecorator(field, {initialValue, rules})(<Input type="password" id={field}
                                                                        placeholder={placeholder}/>)}
              </FormItem>
            </Col>
          } else if (type === 'SELECT') {
            return <Col span={formLayout || 6} key={field}>
              <FormItem {...formItemLayout} label={label}>
                {getFieldDecorator(field, {initialValue, rules})(
                  <Select style={formLayout && {width: '200px'}} placeholder={placeholder}>
                    {opts.map((opt) => <Option value={opt.value} key={opt.value}>{opt.label}</Option>)}
                  </Select>)}
              </FormItem>
            </Col>
          } else if (type === 'BUTTON') {
            return <Col span={formLayout || 6} key={field}>
              {btns.map((btn) => <Button {...btn.attr}>{btn.label}</Button>)}
            </Col>
          } else if (type === 'SPAN') {
            return <Col span={11} key={field}>
              <div className="ant-row ant-form-item">
                <div className="ant-col ant-col-8 ant-form-item-label">
                  <label title={label}>{label}</label>
                </div>
                <div
                  style={{lineHeight: '40px', color: 'rgba(0,0,0,.85)', overflow: 'hidden', textOverflow: 'ellipsis'}}
                  className="ant-col ant-col-16 ant-form-item-control-wrapper">
                  <span style={{whiteSpace: 'nowrap'}}>{initialValue}</span>
                </div>
              </div>
            </Col>
          } else if (type === 'CHECKBOX') {
            return <Col span={formLayout || 6} key={field}>
              <FormItem  {...formItemLayout} label={label}>
                {getFieldDecorator(field, {initialValue, rules})(
                  <Checkbox.Group style={{marginTop: '10px', maxHeight: '200px', overflowY: 'scroll'}}>
                    {fieldList.map((checkBoxItem) => {
                      return <Col span={24} key={checkBoxItem.id}>
                        <Checkbox value={checkBoxItem.id}
                                  disabled={checkBoxItem.toggle !== '1'}>{checkBoxItem.label}</Checkbox>
                      </Col>
                    })}
                  </Checkbox.Group>
                )}
              </FormItem>

            </Col>
          } else if (type === 'TABLE') {
            return <Col span={formLayout || 6} key={field}>
              {item.node}
            </Col>
          } else {
            return <Col span={formLayout || 6} key={field}/>;
          }
        })}
      </Row>
    })
  }
};
