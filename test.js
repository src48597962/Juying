function sha256(str) {
  const data = new Uint8Array([...str].map(c => c.charCodeAt(0)));
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
keyPairPromise.then(keyPair => {
  const publicKeyPromise = crypto.subtle.exportKey('raw', keyPair.publicKey);
  const privateKeyPromise = crypto.subtle.exportKey('raw', keyPair.privateKey);
  Promise.all([publicKeyPromise, privateKeyPromise]).then(values => {
    const publicKey = toHex(values[0]);
    const privateKey = toHex(values[1]);
    const r = (appId, deviceId, userId, nonce) => {
      return `${appId}:${deviceId}:${userId}:${nonce}`;
    };
    const sign = (appId, deviceId, userId, nonce) => {
      const data = r(appId, deviceId, userId, nonce);
      sha256(data).then(hash => {
        crypto.subtle.sign(
          {
            name: 'ECDSA',
            hash: {name: 'SHA-256'},
          },
          keyPair.privateKey,
          fromHex(hash)
        ).then(signature => {
          const signatureHex = toHex(new Uint8Array(signature)) + '01';
          const headers = {
            'authorization': 'Bearer eyJhbGciOiJSUz',
            'origin': 'https://www.yundrive.com',
            'referer': 'https://www.yundrive.com/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41',
            'x-canary': 'client=web,app=adrive,version=v3.17.0',
            'x-device-id': deviceId,
            'x-signature': signatureHex,
          };
          const data = {
            'deviceName': 'Edge浏览器',
            'modelName': 'Windows网页版',
            'pubKey': publicKey,
          };
          const options = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
          };
          fetch('https://api.yundrive.com/session', options).then(response => {
            return response.json();
          }).then(data => {
            console.log(data);
          }).catch(error => {
            console.error(error);
          });
        }).catch(error => {
          console.error(error);
        });
      }).catch(error => {
        console.error(error);
      });
    };
    sign(appId, deviceId, userId, nonce);
  }).catch(error => {
    console.error(error);
  });
}).catch(error => {
  console.error(error);
});