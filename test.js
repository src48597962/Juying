require("https://cdn.jsdelivr.net/npm/crypto-es/crypto-es.js")
require("https://cdn.jsdelivr.net/npm/elliptic/dist/elliptic.min.js")

// 生成随机私钥
const privateKey = CryptoES.lib.WordArray.random(32).toString();
// 根据私钥生成公钥
const ec = new elliptic.ec('secp256k1');
const publicKey = ec.keyFromPrivate(privateKey).getPublic().encode('hex');
// 生成消息
const appId = "5ddexxxxdf9e4966b387ba58f4b3fdc3";
const deviceId = "2eexxxxb9fc4860b9427feb97a4c142";
const userId = "3426axxxxx04e1ea9ee01bd998d06d4";
let nonce = 0;
const message = `${appId}:${deviceId}:${userId}:${nonce}`;
// 计算消息哈希
const messageHash = CryptoES.SHA256(CryptoES.enc.Utf8.parse(message)).toString();
// 对哈希值进行签名
const signKey = ec.keyFromPrivate(privateKey);
const signature = signKey.sign(messageHash).toDER('hex');
// 验证签名
const verifyKey = ec.keyFromPublic(publicKey, 'hex');
const verify = verifyKey.verify(messageHash, signature);
console.log('Signature: ', signature);
console.log('Signature verification: ', verify);

toast('加载完')

setResult(d);