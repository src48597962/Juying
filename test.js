function sha256(str) {
  const data = new Uint8Array(Array.from(str, c => c.charCodeAt(0)));
  return crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
  });
}
function getRandomBytes(len) {
  const arr = new Uint8Array(len);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (dec) => ('0' + dec.toString(16)).substr(-2)).join('');
}
function toHex(buf) {
  return Array.prototype.map.call(new Uint8Array(buf), x => ('00' + x.toString(16)).slice(-2)).join('');
}
function fromHex(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}
const curve = 'P-256';
const appId = '5ddexxxbdf9e4966b387ba58f4b3fdc3';
const deviceId = '2eexxx84b9fc4860b9427feb97a4c142';
const userId = '3426axxxbaa04e1ea9ee01bd998d06d4';
let nonce = 0;
const keyPairPromise = crypto.subtle.generateKey(
  {
    name: 'ECDSA',
    namedCurve: curve
  },
  true,
  ['sign', 'verify']
);
toast('加载完')