import JSEncrypt from 'jsencrypt'

export const encryptInfo = (publicKey, str) => {
  let encrypt = new JSEncrypt();
  // encrypt.setPublicKey("-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDEAkKgvpGfbJEHf4ScLdk1wK8W\nHkmtsaQac3+5pvK0yHIFdLb9PooGrbiO5Z/cs012d5NVLWzzTRFe6Z1/+tGympZ8\np8OVDmytaJNr/7jhFy30JducLjiRSDTGasKTk02+ePAgciz5fDnsB0ugHeUqNL1U\nvlqehSjQoQSMix34OwIDAQAB\n-----END PUBLIC KEY-----\n")
  encrypt.setPublicKey(publicKey);
  // const userInfo = '123@123';
  return encrypt.encrypt(str);
};
