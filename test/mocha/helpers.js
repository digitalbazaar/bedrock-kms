/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const brKms = require('bedrock-kms');
const {runOperation} = require('webkms-switch');
const {util: {clone}} = require('bedrock');
const {generateId} = require('bnid');
const database = require('bedrock-mongodb');
const {promisify} = require('util');

exports.generateKey = async ({mockData, type}) => {
  // create a keystore
  const mockKeystoreId = `https://example.com/keystore/${await generateId()}`;
  const keystore = {
    id: mockKeystoreId,
    controller: 'foo',
    kmsModule: 'ssm-v1',
    sequence: 0,
  };
  await brKms.keystores.insert({config: keystore});

  const keyId = `${mockKeystoreId}/keys/${await generateId()}`;
  const operation = clone(mockData.operations.generate({type}));
  operation.invocationTarget.id = keyId;
  operation.invocationTarget.type = type;
  const moduleManager = brKms.defaultModuleManager;
  return {
    keystore,
    key: await runOperation({operation, keystore, moduleManager})
  };
};

exports.prepareDatabase = async () => {
  await exports.removeCollections();
};

exports.removeCollections = async (
  collectionNames = [
    'kms-keystore',
  ]) => {
  await promisify(database.openCollections)(collectionNames);
  for(const collectionName of collectionNames) {
    await database.collections[collectionName].deleteMany({});
  }
};
