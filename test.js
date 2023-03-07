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
function hexToBigInt(hex) {
  return BigInt('0x' + hex.slice(2));
}
function pointMultiply(G, d) {
  let Q = null;
  let k = 1;
  let k2 = 0;
  while (d > 0) {
    if (d & 1) {
      if (Q === null) {
        Q = G;
      } else {
        Q = pointAdd(Q, G, curve);
      }
      k2 = k;
      k = 0;
    }
    G = pointAdd(G, G, curve);
    d >>= 1;
    k += k;
  }
  if (Q === null) {
    Q = pointMultiply(G, 0n);
  } else {
    Q = pointMultiply(Q, k2);
  }
  return Q;
}
function pointAdd(P, Q, curve) {
  const m = ((P.y - Q.y) * modInverse(P.x - Q.x, curve.p)) %!c(MISSING)urve.p;
  const x = (m * m - P.x - Q.x) %!c(MISSING)urve.p;
  const y = (m * (P.x - x) - P.y) %!c(MISSING)urve.p;
  return { x, y };
}
function modInverse(a, m) {
  a = a %!m(MISSING);
  for (let x = 1n; x < m; x++) {
    if ((a * x) %!m(MISSING) === 1n) {
      return x;
    }
  }
  return 1n;
}
const keyPair = generateKeyPair();
console.log('Private key:', keyPair.privateKey);
console.log('Public key:', keyPair.publicKey);