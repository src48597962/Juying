function generateKeyPair() {
  // Generate a random 256-bit private key
  const privateKey = new Uint8Array(32);
  crypto.getRandomValues(privateKey);
  // Derive the corresponding public key
  const curve = {
    p: '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f',
    a: '0x0000000000000000000000000000000000000000000000000000000000000000',
    b: '0x0000000000000000000000000000000000000000000000000000000000000007',
    n: '0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141',
    Gx: '0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
    Gy: '0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8'
  };
  const ecparams = getSECCurveFromHex(curve);
  const curvePt = ecparams.getG().multiply(BigInteger.fromByteArrayUnsigned(privateKey));
  const publicKeyBytes = curvePt.getEncoded(false);
  const publicKeyHex = bytesToHex(publicKeyBytes);
  const publicKey = '04' + publicKeyHex;
  return { privateKey:privateKey, publicKey:publicKey };
}
function getSECCurveFromHex(curve) {
  const p = new BigInteger(curve.p, 16);
  const a = new BigInteger(curve.a, 16);
  const b = new BigInteger(curve.b, 16);
  const n = new BigInteger(curve.n, 16);
  const Gx = new BigInteger(curve.Gx, 16);
  const Gy = new BigInteger(curve.Gy, 16);
  const curveParams = new ECCurveFp(p, a, b);
  const curve = curveParams.getCurve();
  const generator = new ECPointFp(curve, curve.fromBigInteger(Gx), curve.fromBigInteger(Gy));
  const secp256k1 = new X9ECParameters(curveParams, generator, n);
  return secp256k1.getCurve();
}
function bytesToHex(bytes) {
  const hex = [];
  for (let i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xf).toString(16));
  }
  return hex.join('');
}
const keyPair = generateKeyPair();
console.log('Private key:', keyPair.privateKey);
console.log('Public key:', keyPair.publicKey);