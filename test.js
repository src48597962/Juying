require("https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js")
require("https://cdnjs.cloudflare.com/ajax/libs/elliptic/6.5.4/elliptic.min.js")

// 生成公私钥对
const ec = new elliptic.ec('secp256k1');
const keyPair = ec.genKeyPair();
const privateKey = keyPair.getPrivate();
const publicKey = keyPair.getPublic();
// 生成消息
const appId = '5ddexxxxdf9e4966b387ba58f4b3fdc3';
const deviceId = '2eexxxxb9fc4860b9427feb97a4c142';
const userId = '3426axxxxx04e1ea9ee01bd998d06d4';
let nonce = 0;
const message = `${appId}:${deviceId}:${userId}:${nonce}`;
const messageHash = CryptoJS.SHA256(message);
// 对哈希值进行签名
const signature = ec.sign(messageHash.words, privateKey, { canonical: true });
// 验证签名
const isVerified = ec.verify(messageHash.words, signature, publicKey);
console.log(`Message: ${message}`);
console.log(`Message hash: ${messageHash}`);
console.log(`Public key: ${publicKey.encode('hex')}`);
console.log(`Private key: ${privateKey.getPrivate('hex')}`);
console.log(`Signature: ${signature.toDER('hex')}`);
console.log(`Signature verification: ${isVerified}`);

toast('加载完')

setResult(d);