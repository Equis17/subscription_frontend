import {Button, Checkbox, Col, DatePicker, Form, Input, InputNumber, Row, Select} from "antd";
import React from "react";

const FormItem = Form.Item;
const Option = Select.Option;

export default (formList, form, formItemLayout, formLayout) => {
  const {getFieldDecorator} = form;
  if (formList && formList.length > 0) {
    return formList.map((itemList, i) => {
      return <Row gutter={10} key={i}>
        {itemList.map((item) => {
            const {type, label, field, search = false, initialValue = '', placeholder, btns = [], opts = [], rules, fieldList = []} = item;
            if (type === 'INPUT') {
              return <Col span={formLayout || 6} key={field}>
                <FormItem {...formItemLayout} label={label}>
                  {getFieldDecorator(field, {initialValue, rules})(
                    <Input type="text" id={field} placeholder={placeholder}/>
                  )}
                </FormItem>
              </Col>
            } else if (type === 'PASSWORD') {
              return <Col span={formLayout || 6} key={field}>
                <FormItem {...formItemLayout} label={label}>
                  {getFieldDecorator(field, {initialValue, rules})(
                    <Input type="password" id={field} placeholder={placeholder}/>
                  )}
                </FormItem>
              </Col>
            } else if (type === 'SELECT') {
              const showSearch = search
                ? {
                  showSearch: true,
                  optionFilterProp: "children",
                  filterOption: (input, option) => option.props.children.includes(input)
                }
                : {};
              return <Col span={formLayout || 6} key={field}>
                <FormItem {...formItemLayout} label={label}>
                  {getFieldDecorator(field, {initialValue, rules})(
                    <Select {...showSearch} style={formLayout && {width: '300px'}} placeholder={placeholder}>
                      {opts.map((opt) => <Option value={opt.value} key={opt.value}>{opt.label}</Option>)}
                    </Select>
                  )}
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
            } else if (type === 'LONG-SPAN') {
              return <Col span={22} key={field}>
                <div className="ant-row ant-form-item">
                  <div className="ant-col ant-col-4 ant-form-item-label">
                    <label title={label}>{label}</label>
                  </div>
                  <div
                    style={{lineHeight: '40px', color: 'rgba(0,0,0,.85)', overflow: 'hidden', textOverflow: 'ellipsis'}}
                    className="ant-col ant-col-20 ant-form-item-control-wrapper">
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
                                    disabled={!checkBoxItem.toggle}>{checkBoxItem.label}</Checkbox>
                        </Col>
                      })}
                    </Checkbox.Group>
                  )}
                </FormItem>

              </Col>
            } else if (type === 'TABLE') {
              return <Col span={formLayout || 6} key={field}>{item.node}</Col>
            } else if (type === 'DATE') {
              return <Col span={formLayout || 6} key={field}>
                <FormItem {...formItemLayout} label={label}>
                  {getFieldDecorator(field, {initialValue, rules})(<DatePicker placeholder={placeholder}/>)}
                </FormItem>
              </Col>
            } else if (type === 'MULTISELECT') {
              return <Col span={formLayout || 6} key={field}>
                <FormItem {...formItemLayout} label={label}>
                  {getFieldDecorator(field, {initialValue, rules})(
                    <Select
                      mode="multiple"
                      style={formLayout && {width: '300px'}}
                      placeholder={placeholder}
                    >
                      {opts.map((opt) => <Option value={opt.value} key={opt.value}>{opt.label}</Option>)}
                    </Select>)
                  }
                </FormItem>
              </Col>
            } else if (type === 'INPUT-NUMBER') {
              return <Col span={formLayout || 6} key={field}>
                <FormItem {...formItemLayout} label={label}>
                  {getFieldDecorator(field, {initialValue, rules})(
                    <InputNumber id={field} min={0} max={1000000} step={0.01} placeholder={placeholder}/>
                  )}
                </FormItem>
              </Col>
            } else {
              return <Col span={formLayout || 6} key={field}/>
            }
          }
        )}
      </Row>
    })
  }
};
