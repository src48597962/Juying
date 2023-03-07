eval(getCryptoJS());
// 生成随机私钥
let privateKey = generateRandomPrivateKey();
// 根据私钥生成公钥
let publicKey = generatePublicKey(privateKey);
// 生成消息
let message = generateMessage(appId, deviceId, userId, nonce);
// 计算消息哈希
let messageHash = sha256(message);
// 对哈希值进行签名
let signature = sign(privateKey, messageHash);
// 将签名和公钥一起发送给服务器
sendToServer(signature, publicKey);
function generateRandomPrivateKey() {
  // 生成32字节随机数作为私钥
  return CryptoJS.randomBytes(32);
}
function generatePublicKey(privateKey) {
  // 根据私钥生成公钥
  let publicKey = secp256k1.publicKeyCreate(privateKey, false);
  return publicKey;
}
function generateMessage(appId, deviceId, userId, nonce) {
  // 拼接消息
  return `${appId}:${deviceId}:${userId}:${nonce}`;
}
function sha256(data) {
  // 计算SHA256哈希值
  return CryptoJS.createHash('sha256').update(data).digest();
}
function sign(privateKey, messageHash) {
  // 使用私钥对消息哈希值进行签名
  let signature = secp256k1.sign(messageHash, privateKey);
  return signature;
}
function sendToServer(signature, publicKey) {
  // 将签名和公钥发送给服务器
  // ...
}

toast('加载完')

setResult(d);