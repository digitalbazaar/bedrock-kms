/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as helpers from './helpers.js';
import {klona} from 'klona';
import {mockData} from './mock.data.js';
import {defaultModuleManager as moduleManager} from '@bedrock/kms';
import {runOperation} from '@digitalbazaar/webkms-switch';
import {v4 as uuid} from 'uuid';

describe('bedrock-kms', () => {
  describe('integration with runOperation API', () => {
    describe('GenerateKeyOperation', () => {
      it('successfully generates a Ed25519VerificationKey2018', async () => {
        const keystore = {
          id: 'https://example.com/keystores/x',
          controller: 'urn:uuid:baa943d2-7338-11ec-b1c4-10bf48838a41',
          kmsModule: 'ssm-v1'
        };
        const operation = klona(
          mockData.operations.generate({type: 'Ed25519VerificationKey2018'}));
        operation.invocationTarget.type = 'Ed25519VerificationKey2018';
        let error;
        let result;
        try {
          result = await runOperation({operation, keystore, moduleManager});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.have.keys(['keyId', 'result']);
        result.result.should.have.keys(['keyId', 'keyDescription']);
        const {keyDescription} = result.result;
        keyDescription.should.have.keys(
          ['@context', 'id', 'publicKeyBase58', 'type', 'controller']);
        keyDescription.type.should.equal(operation.invocationTarget.type);
        keyDescription.publicKeyBase58.should.be.a('string');
      });
      it('successfully generates a Ed25519VerificationKey2020', async () => {
        const keystore = {
          id: 'https://example.com/keystores/x',
          controller: 'urn:uuid:baa943d2-7338-11ec-b1c4-10bf48838a41',
          kmsModule: 'ssm-v1'
        };
        const operation = klona(
          mockData.operations.generate({type: 'Ed25519VerificationKey2020'}));
        operation.invocationTarget.type = 'Ed25519VerificationKey2020';
        let error;
        let result;
        try {
          result = await runOperation({operation, keystore, moduleManager});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.have.keys(['keyId', 'result']);
        result.result.should.have.keys(['keyId', 'keyDescription']);
        const {keyDescription} = result.result;
        keyDescription.should.have.keys(
          ['@context', 'id', 'publicKeyMultibase', 'type', 'controller']);
        keyDescription.type.should.equal(operation.invocationTarget.type);
        keyDescription.publicKeyMultibase.should.be.a('string');
      });
      it('successfully generates a Sha256HmacKey2019', async () => {
        const keystore = {
          id: 'https://example.com/keystores/x',
          controller: 'urn:uuid:baa943d2-7338-11ec-b1c4-10bf48838a41',
          kmsModule: 'ssm-v1'
        };
        const operation = klona(
          mockData.operations.generate({type: 'Sha256HmacKey2019'}));
        operation.invocationTarget.type = 'Sha256HmacKey2019';
        let error;
        let result;
        try {
          result = await runOperation({operation, keystore, moduleManager});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        result.should.have.keys(['keyId', 'result']);
        result.result.should.have.keys(['keyId', 'keyDescription']);
        const {keyDescription} = result.result;
        keyDescription.should.have.keys(
          ['@context', 'id', 'type', 'controller']);
      });
      it('successfully generates a AesKeyWrappingKey2019', async () => {
        const keystore = {
          id: 'https://example.com/keystores/x',
          controller: 'urn:uuid:baa943d2-7338-11ec-b1c4-10bf48838a41',
          kmsModule: 'ssm-v1'
        };
        const operation = klona(
          mockData.operations.generate({type: 'AesKeyWrappingKey2019'}));
        operation.invocationTarget.type = 'AesKeyWrappingKey2019';
        let error;
        let result;
        try {
          result = await runOperation({operation, keystore, moduleManager});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        result.should.have.keys(['keyId', 'result']);
        result.result.should.have.keys(['keyId', 'keyDescription']);
        const {keyDescription} = result.result;
        keyDescription.should.have.keys(
          ['@context', 'id', 'type', 'controller']);
      });
      it('throws on UnknownKeyType', async () => {
        const keystore = {
          id: 'https://example.com/keystores/x',
          controller: 'urn:uuid:baa943d2-7338-11ec-b1c4-10bf48838a41',
          kmsModule: 'ssm-v1'
        };
        const operation = klona(
          mockData.operations.generate({type: 'AesKeyWrappingKey2019'}));
        operation.invocationTarget.type = 'UnknownKeyType';
        let error;
        let result;
        try {
          result = await runOperation({operation, keystore, moduleManager});
        } catch(e) {
          error = e;
        }
        should.exist(error);
        should.not.exist(result);
        error.message.should.include('UnknownKeyType');
      });
    }); // end GenerateKeyOperation

    describe('SignOperation', () => {
      it('signs a string using Ed25519VerificationKey2018', async () => {
        const {keystore, key: {id: keyId}} = await helpers.generateKey(
          {mockData, type: 'Ed25519VerificationKey2018'});
        const operation = klona(mockData.operations.sign);
        operation.invocationTarget = keyId;
        operation.verifyData = uuid();
        let result;
        let error;
        try {
          result = await runOperation({operation, keystore, moduleManager});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        result.should.have.keys(['keyId', 'result']);
        result.result.should.have.keys(['signatureValue']);
        should.exist(result.result.signatureValue);
        const {signatureValue} = result.result;
        signatureValue.should.be.a('string');
      });
      it('signs a string using Ed25519VerificationKey2020', async () => {
        const {keystore, key: {id: keyId}} = await helpers.generateKey(
          {mockData, type: 'Ed25519VerificationKey2020'});
        const operation = klona(mockData.operations.sign);
        operation.invocationTarget = keyId;
        operation.verifyData = uuid();
        let result;
        let error;
        try {
          result = await runOperation({operation, keystore, moduleManager});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        result.should.have.keys(['keyId', 'result']);
        result.result.should.have.keys(['signatureValue']);
        should.exist(result.result.signatureValue);
        const {signatureValue} = result.result;
        signatureValue.should.be.a('string');
      });
      it('signs a string using Sha256HmacKey2019', async () => {
        const {keystore, key: {id: keyId}} = await helpers.generateKey(
          {mockData, type: 'Sha256HmacKey2019'});
        const operation = klona(mockData.operations.sign);
        operation.invocationTarget = keyId;
        operation.verifyData = uuid();
        let result;
        let error;
        try {
          result = await runOperation({operation, keystore, moduleManager});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        result.should.have.keys(['keyId', 'result']);
        result.result.should.have.keys(['signatureValue']);
        const {signatureValue} = result.result;
        signatureValue.should.be.a('string');
        signatureValue.should.have.length(43);
      });
    }); // end SignOperation

    describe('VerifyOperation', () => {
      it('verifies a string using Sha256HmacKey2019', async () => {
        const verifyData = uuid();
        const {keystore, key: {id: keyId}} = await helpers.generateKey(
          {mockData, type: 'Sha256HmacKey2019'});
        const signOperation = klona(mockData.operations.sign);
        signOperation.invocationTarget = keyId;
        signOperation.verifyData = verifyData;
        const {result: {signatureValue}} = await runOperation(
          {operation: signOperation, keystore, moduleManager});
        const verifyOperation = klona(mockData.operations.verify);
        verifyOperation.invocationTarget = keyId;
        verifyOperation.verifyData = verifyData;
        verifyOperation.signatureValue = signatureValue;
        let result;
        let error;
        try {
          result = await runOperation(
            {operation: verifyOperation, keystore, moduleManager});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        result.should.have.keys(['keyId', 'result']);
        result.result.should.have.keys(['verified']);
        result.result.verified.should.be.true;
      });
    }); // end VerifyOperation
  }); // end runOperation API
}); // end bedrock-kms
