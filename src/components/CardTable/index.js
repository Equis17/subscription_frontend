import React, {Component} from 'react';
import {Card, Table} from "antd";

export default class CardTable extends Component {render=()=><Card style={this.props.style} title={this.props.cardTitle}><Table {...this.props.tableConfig}/></Card>}


