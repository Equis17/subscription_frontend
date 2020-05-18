import React, {Component} from 'react'
import JWTDecode from 'jwt-decode'
import {connect} from 'react-redux'
import {Col, Row} from "antd";
import axios from './../../axios'
import moment from 'moment'
import './index.less'

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      sysTime: '',
      dayPictureUrl: '',
      weather: ''
    }
  }

  componentDidMount() {
    setInterval(() => {
      let sysTime = moment()
        .format('YYYY-MM-DD HH:mm:ss');
      this.setState({sysTime})
    }, 1000);
    const token = localStorage.getItem('token');
    const {_userName: userName} = JWTDecode(token);
    this.setState({userName});
    this.getWeatherAPIData();
  }

  handleExit() {
    localStorage.removeItem('token');
    window.location.replace('/Login')
  }

  getWeatherAPIData() {
    let city = '广州';
    axios.jsonp({
      url: 'http://api.map.baidu.com/telematics/v3/weather?location=' + encodeURIComponent(city) + '&output=json&ak=3p49MVra6urFRGOT9s8UBWr2'
    })
      .then((res) => {
        if (res.status === 'success') {
          let {dayPictureUrl, weather} = res.results[0].weather_data[0];
          this.setState({dayPictureUrl, weather})
        }
      })
  }

  render() {
    const {menuName} = this.props;
    const {userName, dayPictureUrl, weather} = this.state;
    return (
      <div className={'header'}>
        <Row className={'header-top'}>
          <Col span={24}>
            <span>欢迎,</span><span className={'bold'}>{userName}</span>
            <a onClick={() => this.handleExit()}>退出</a>
          </Col>
        </Row>
        <Row className={'header-breadcrumb'}>
          <Col span={4} className={'header-breadcrumb-title'}>{menuName}</Col>
          <Col span={20} className={'header-breadcrumb-weather'}>
            <span className="date">{this.state.sysTime}</span>
            <span className="img"><img src={dayPictureUrl} alt=""/></span>
            <span className="detail">{weather}</span>
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  menuName: state.getIn(['navLeft', 'menuName'])
});
export default connect(mapStateToProps, null)(Header)
