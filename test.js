eval(getCryptoJS());
const curve = {
  curve: CryptoJS.ECDSA.getCurveByName('secp256r1'),
  G: null,
  n: null,
  h: null
};
const appId = '5ddexxxbdf9e4966b387ba58f4b3fdc3';
const deviceId = '2eexxx84b9fc4860b9427feb97a4c142';
const userId = '3426axxxbaa04e1ea9ee01bd998d06d4';
let nonce = 0;
// 生成密钥对
const keyPair = CryptoJS.ECDSA.generateKeyPair(curve);
function sha256(str) {
  const hash = CryptoJS.SHA256(str);
  return hash.toString(CryptoJS.enc.Hex);
}
function getRandomBytes(len) {
  const arr = new Uint8Array(len);
  CryptoJS.lib.WordArray.random(len).toArray().forEach((val, idx) => arr[idx] = val);
  return Array.from(arr, (dec) => ('0' + dec.toString(16)).substr(-2)).join('');
}
function toHex(buf) {
  return Array.prototype.map.call(buf, x => ('00' + x.toString(16)).slice(-2)).join('');
}
function fromHex(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

toast('加载完')

setResult(d);