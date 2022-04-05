/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import * as brKms from '@bedrock/kms';
import * as database from '@bedrock/mongodb';
import {createRequire} from 'module';
import {promisify} from 'util';
const require = createRequire(import.meta.url);
const {runOperation} = require('@digitalbazaar/webkms-switch');
const {generateId} = require('bnid');

const {util: {clone}} = bedrock;

export async function generateKey({mockData, type}) {
  // create a keystore
  const mockKeystoreId = `https://example.com/keystore/${await generateId()}`;
  const keystore = {
    id: mockKeystoreId,
    controller: 'urn:foo',
    kmsModule: 'ssm-v1',
    sequence: 0,
  };
  await brKms.keystores.insert({config: keystore});

  const keyId = `${mockKeystoreId}/keys/${await generateId()}`;
  const operation = clone(mockData.operations.generate({type}));
  operation.invocationTarget.id = keyId;
  operation.invocationTarget.type = type;
  const moduleManager = brKms.defaultModuleManager;
  const {result} = await runOperation({operation, keystore, moduleManager});
  return {
    keystore,
    key: result.keyDescription
  };
}

export async function prepareDatabase() {
  await exports.removeCollections();
}

export async function removeCollections(collectionNames = ['kms-keystore']) {
  await promisify(database.openCollections)(collectionNames);
  for(const collectionName of collectionNames) {
    await database.collections[collectionName].deleteMany({});
  }
}
