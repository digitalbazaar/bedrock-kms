/*
 * Copyright (c) 2019-2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const base58 = require('bs58');
const jsigs = require('jsonld-signatures');
const didKeyDriver = require('did-method-key').driver();
const {Ed25519Signature2018} = jsigs.suites;
const {validateOperation, runOperation} = require('webkms-switch');
const keystores = require('./keystores.js');
const BedrockKmsModuleManager = require('./BedrockKmsModuleManager.js');
const MongoDBKeyDescriptionStorage =
  require('./MongoDBKeyDescriptionStorage.js');

// load config defaults
require('./config');

bedrock.events.on('bedrock.init', async () => {
  // ensure only one host is configured
  const cfg = bedrock.config.kms;

  // TODO: remove deprecated `allowedHosts`
  if(!cfg.allowedHost && cfg.allowedHosts) {
    if(Array.isArray(cfg.allowedHosts)) {
      cfg.allowedHost = cfg.allowedHosts[0];
    } else {
      cfg.allowedHost = cfg.allowedHosts;
    }
  }

  if(typeof cfg.allowedHost !== 'string') {
    throw new Error('"bedrock.config.kms.allowedHost" must be a string.');
  }
  if(!cfg.allowedHost) {
    throw new Error('"bedrock.config.kms.allowedHost" must be set.');
  }
});

const defaultModuleManager = new BedrockKmsModuleManager();
const defaultStorage = new MongoDBKeyDescriptionStorage();
const defaultDocumentLoader = async url => {
  // TODO: move to did-key lib
  if(url.startsWith('did:key:')) {
    const document = await didKeyDriver.get({url});
    return {
      contextUrl: null,
      documentUrl: url,
      document
    };
  }
  const error = new Error(`Dereferencing url "${url}" is prohibited.`);
  error.name = 'NotAllowedError';
  error.httpStatusCode = 400;
  throw error;
};

exports.BedrockKmsModuleManager = BedrockKmsModuleManager;
exports.MongoDBKeyDescriptionStorage = MongoDBKeyDescriptionStorage;
exports.keystores = keystores;
exports.keyDescriptionStorage = defaultStorage;
exports.defaultDocumentLoader = defaultDocumentLoader;

exports.validateOperation = async ({
  url, method, headers, operation,
  expectedHost, expectedRootCapability,
  getInvokedCapability, inspectCapabilityChain,
  storage = defaultStorage,
  documentLoader = defaultDocumentLoader
}) => {
  return validateOperation({
    url, method, headers, operation, storage,
    getInvokedCapability, documentLoader, expectedHost, expectedRootCapability,
    // TODO: support RsaSignature2018 and other suites?
    inspectCapabilityChain, suite: [new Ed25519Signature2018()]
  });
};

exports.runOperation = async ({
  operation,
  storage = defaultStorage,
  moduleManager = defaultModuleManager,
  documentLoader = defaultDocumentLoader
}) => {
  return await runOperation(
    {operation, storage, moduleManager, documentLoader});
};

exports.defaultDocumentLoader = defaultDocumentLoader;

function parsePublicKeyBase58(didKeyUrl) {
  const fingerprint = didKeyUrl.substr('did:key:'.length);
  // skip leading `z` that indicates base58 encoding
  const buffer = base58.decode(fingerprint.substr(1));
  // assume buffer is: 0xed 0x01 <public key bytes>
  return base58.encode(buffer.slice(2));
}
