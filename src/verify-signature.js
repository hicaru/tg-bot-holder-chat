const { sha256 } = require('js-sha256');
const { schnorr } = require('@zilliqa-js/crypto');
const { getAddressFromPublicKey } = require('@zilliqa-js/crypto');


module.exports = function verifySignature(
  message,
  publicKey,
  signature,
  address
) {
  console.log(message);
  const hashStr = sha256(message);
  const hashBytes = Buffer.from(hashStr, 'hex');
  const bytecSignature = schnorr.toSignature(signature);
  const fromPubkey = getAddressFromPublicKey(publicKey);

  if (String(fromPubkey).toLowerCase() !== String(address).toLowerCase()) {
    throw new Error('incorrect address.');
  }

  return schnorr.verify(
    hashBytes,
    bytecSignature,
    Buffer.from(publicKey, 'hex')
  );
}
