import JSEncrypt from 'jsencrypt'

export const encryptInfo = (publicKey, str) => {
  let encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  return encrypt.encrypt(str);
};

export const ruleObj = {
  maxChar: {max: 20, message: '最大为20个字符'},
  minChar: {min: 6, message: '最小为6个字符'},
  phoneNumber:{len: 11, message: '请输入正确的手机号码'},
  whitespace: {whitespace: true, message: '不能含有空格'},
  url: {pattern: /^\//g, message: "必须以/开头"}
};
