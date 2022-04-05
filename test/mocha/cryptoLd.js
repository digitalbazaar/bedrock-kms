/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {createRequire} from 'module';
const require = createRequire(import.meta.url);
const {CryptoLD} = require('crypto-ld');
const {Ed25519VerificationKey2018} =
  require('@digitalbazaar/ed25519-verification-key-2018');
const {Ed25519VerificationKey2020} =
  require('@digitalbazaar/ed25519-verification-key-2020');
const {X25519KeyAgreementKey2019} =
  require('@digitalbazaar/x25519-key-agreement-key-2019');
const {X25519KeyAgreementKey2020} =
  require('@digitalbazaar/x25519-key-agreement-key-2020');

const cryptoLd = new CryptoLD();
cryptoLd.use(Ed25519VerificationKey2018);
cryptoLd.use(Ed25519VerificationKey2020);
cryptoLd.use(X25519KeyAgreementKey2019);
cryptoLd.use(X25519KeyAgreementKey2020);

export {cryptoLd};
