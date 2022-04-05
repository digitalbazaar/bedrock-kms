/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import * as helpers from './helpers.js';
import {createRequire} from 'module';
import {defaultModuleManager as moduleManager} from '@bedrock/kms';
import {mockData} from './mock.data.js';
const require = createRequire(import.meta.url);
const {runOperation} = require('@digitalbazaar/webkms-switch');

const {util: {clone, uuid}} = bedrock;

describe('bulk operations', () => {
  describe('Ed25519VerificationKey2020', () => {
    let mockKeyId;
    let keystore;
    const operationCount = 10000;
    const vData = [];
    before(async () => {
      for(let i = 0; i < operationCount; ++i) {
        let v = '';
        for(let n = 0; n < 100; ++n) {
          v += uuid();
        }
        vData.push(v);
      }
    });
    before(async () => {
      let err;
      try {
        ({keystore, key: {id: mockKeyId}} = await helpers.generateKey(
          {mockData, type: 'Ed25519VerificationKey2020'}));
      } catch(e) {
        err = e;
      }
      assertNoError(err);
    });
    it(`performs ${operationCount} signatures`, async function() {
      this.timeout(0);
      const promises = [];
      for(let i = 0; i < operationCount; ++i) {
        const operation = clone(mockData.operations.sign);
        operation.invocationTarget = mockKeyId;
        operation.verifyData = vData[i];
        promises.push(runOperation({
          operation, keystore, moduleManager
        }));
      }
      let result;
      let err;
      try {
        result = await Promise.all(promises);
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.be.an('array');
      result.should.have.length(operationCount);
    });
  });
  describe('Sha256HmacKey2019', () => {
    let mockKeyId;
    let keystore;
    const operationCount = 10000;
    const vData = [];
    before(async () => {
      for(let i = 0; i < operationCount; ++i) {
        let v = '';
        for(let n = 0; n < 100; ++n) {
          v += uuid();
        }
        vData.push(v);
      }
    });
    before(async () => {
      let err;
      try {
        ({keystore, key: {id: mockKeyId}} = await helpers.generateKey(
          {mockData, type: 'Sha256HmacKey2019'}));
      } catch(e) {
        err = e;
      }
      assertNoError(err);
    });
    it(`performs ${operationCount} signatures`, async function() {
      this.timeout(0);
      const promises = [];
      for(let i = 0; i < operationCount; ++i) {
        const operation = clone(mockData.operations.sign);
        operation.invocationTarget = mockKeyId;
        operation.verifyData = vData[i];
        promises.push(runOperation({
          operation, keystore, moduleManager
        }));
      }
      let result;
      let err;
      try {
        result = await Promise.all(promises);
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.be.an('array');
      result.should.have.length(operationCount);
    });
  });
});
