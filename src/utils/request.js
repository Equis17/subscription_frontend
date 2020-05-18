import axios from 'axios'
import {message} from "antd";

const getQueryString = (obj) => {
  let str = '?';
  for (let i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    str += `${i}=${obj[i]}&`
  }
  return str.slice(0, -1);
};

const fetch = (method, options) => {
  const token = localStorage.getItem('token');
  axios.defaults.headers.Authorization = token || '';
  switch (method.toLowerCase()) {
    case 'get':
      const affix = getQueryString(options.data);
      return axios.get(options.url + affix);
    case 'post':
      return axios.post(options.url, options.data || {});
    default :
      return axios.post(options.url, options.data || {});
  }
};

export default (method, options) => {
  return fetch(method, options)
    .then((res) => {
      const {code, message} = res.data;
      return code === 9999
        ? Promise.reject({success: false, message: message || '系统内部错误,请联系管理员', code})
        : Promise.resolve({
          success: true,
          message: message || '查询成功',
          data: res.data.data || [],
          ...res.data
        });
    })
    .catch((err) => {
      if (err.response && err.response.status === 401) {
        window.location.replace('/Login');
      } else {
        message.error(err.message);
        console.error('request.js: ' + err.message)
      }
    })
}
