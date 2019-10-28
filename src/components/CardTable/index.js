import React, {Component} from 'react';
import {Card, Table} from "antd";

export default class CardTable extends Component {render=()=><Card><Table {...this.props.tableConfig}/></Card>}


