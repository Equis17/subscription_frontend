import axios from 'axios'
import {message} from "antd";

const getQueryString = (obj) => {
  let str = '?';
  for (let i in obj) {
    str += `${i}=${obj[i]}&`
  }
  return str.slice(0, -1);
};

const fetch = (method, options) => {
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
      return code == '9999'
        ? Promise.reject({success: false, message: message || '系统内部错误,请联系管理员'})
        : Promise.resolve({success:true,message:message||'查询成功',...res.data});
    })
    .catch((err) => {message.error('系统内部错误,请联系管理员');console.error('request.js: '+err.message)})
}
