/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as brKms from '@bedrock/kms';
import * as database from '@bedrock/mongodb';
import {klona} from 'klona';
import {runOperation} from '@digitalbazaar/webkms-switch';
import {generateId} from 'bnid';

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
  const operation = klona(mockData.operations.generate({type}));
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
  await removeCollections();
}

export async function removeCollections(collectionNames = ['kms-keystore']) {
  await database.openCollections(collectionNames);
  for(const collectionName of collectionNames) {
    await database.collections[collectionName].deleteMany({});
  }
}
