function generateKeyPair() {
  const privateKey = new Uint8Array(32);
  crypto.getRandomValues(privateKey);
  const curve = {
    p: hexToBigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f'),
    a: hexToBigInt('0x0000000000000000000000000000000000000000000000000000000000000000'),
    b: hexToBigInt('0x0000000000000000000000000000000000000000000000000000000000000007'),
    n: hexToBigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141'),
    Gx: hexToBigInt('0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'),
    Gy: hexToBigInt('0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')
  };
  const G = {
    x: curve.Gx,
    y: curve.Gy
  };
  const publicKey = pointMultiply(G, privateKey);
  return {
    privateKey: privateKey,
    publicKey: '04' + publicKey.x.toString(16, 64) + publicKey.y.toString(16, 64)
  };
}
log('aaa');