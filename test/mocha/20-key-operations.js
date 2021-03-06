/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const brKms = require('bedrock-kms');
const {util: {clone, uuid}} = require('bedrock');
const helpers = require('./helpers');
const mockData = require('./mock.data');

describe('bedrock-kms', () => {
  before(async () => {});

  describe('runOperation API', () => {
    describe('GenerateKeyOperation', () => {
      it('successfully generates a Ed25519VerificationKey2018', async () => {
        const keyId = `https://example.com/keystores/x/keys/e1d40821`;
        const operation = clone(
          mockData.operations.generate({type: 'Ed25519VerificationKey2018'}));
        operation.kmsModule = 'ssm-v1';
        operation.invocationTarget.id = keyId;
        operation.invocationTarget.type = 'Ed25519VerificationKey2018';
        let error;
        let result;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.have.keys(['id', 'publicKeyBase58', 'type']);
        result.id.should.equal(keyId);
        result.type.should.equal(operation.invocationTarget.type);
        result.publicKeyBase58.should.be.a('string');
      });
      it('successfully generates a Ed25519VerificationKey2020', async () => {
        const keyId = `https://example.com/keystores/x/keys/e1d40823`;
        const operation = clone(
          mockData.operations.generate({type: 'Ed25519VerificationKey2020'}));
        operation.kmsModule = 'ssm-v1';
        operation.invocationTarget.id = keyId;
        operation.invocationTarget.type = 'Ed25519VerificationKey2020';
        let error;
        let result;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.have.keys(['id', 'publicKeyMultibase', 'type']);
        result.id.should.equal(keyId);
        result.type.should.equal(operation.invocationTarget.type);
        result.publicKeyMultibase.should.be.a('string');
      });
      it('successfully generates a Sha256HmacKey2019', async () => {
        const keyId = `https://example.com/keystores/x/keys/2adfef65`;
        const operation = clone(
          mockData.operations.generate({type: 'Sha256HmacKey2019'}));
        operation.kmsModule = 'ssm-v1';
        operation.invocationTarget.id = keyId;
        operation.invocationTarget.type = 'Sha256HmacKey2019';
        let error;
        let result;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        result.should.have.keys(['id', 'type']);
        result.id.should.equal(keyId);
      });
      it('successfully generates a AesKeyWrappingKey2019', async () => {
        const keyId = `https://example.com/keystores/x/keys/a8b26a4c`;
        const operation = clone(
          mockData.operations.generate({type: 'AesKeyWrappingKey2019'}));
        operation.kmsModule = 'ssm-v1';
        operation.invocationTarget.id = keyId;
        operation.invocationTarget.type = 'AesKeyWrappingKey2019';
        let error;
        let result;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        result.should.have.keys(['id', 'type']);
        result.id.should.equal(keyId);
      });
      it('throws on UnknownKeyType', async () => {
        const keyId = `https://example.com/keystores/x/keys/44b2d099`;
        const operation = clone(
          mockData.operations.generate({type: 'AesKeyWrappingKey2019'}));
        operation.kmsModule = 'ssm-v1';
        operation.invocationTarget.id = keyId;
        operation.invocationTarget.type = 'UnknownKeyType';
        let error;
        let result;
        try {
          result = await brKms.runOperation({operation});
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
        const {id: keyId} = await helpers.generateKey(
          {mockData, type: 'Ed25519VerificationKey2018'});
        const operation = clone(mockData.operations.sign);
        operation.invocationTarget = keyId;
        operation.verifyData = uuid();
        let result;
        let error;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        result.should.have.keys(['signatureValue']);
        should.exist(result.signatureValue);
        const {signatureValue} = result;
        signatureValue.should.be.a('string');
      });
      it('signs a string using Ed25519VerificationKey2020', async () => {
        const {id: keyId} = await helpers.generateKey(
          {mockData, type: 'Ed25519VerificationKey2020'});
        const operation = clone(mockData.operations.sign);
        operation.invocationTarget = keyId;
        operation.verifyData = uuid();
        let result;
        let error;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        result.should.have.keys(['signatureValue']);
        should.exist(result.signatureValue);
        const {signatureValue} = result;
        signatureValue.should.be.a('string');
      });
      it('signs a string using Sha256HmacKey2019', async () => {
        const {id: keyId} = await helpers.generateKey(
          {mockData, type: 'Sha256HmacKey2019'});
        const operation = clone(mockData.operations.sign);
        operation.invocationTarget = keyId;
        operation.verifyData = uuid();
        let result;
        let error;
        try {
          result = await brKms.runOperation({operation});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        result.should.have.keys(['signatureValue']);
        const {signatureValue} = result;
        signatureValue.should.be.a('string');
        signatureValue.should.have.length(43);
      });
    }); // end SignOperation

    describe('VerifyOperation', () => {
      it('verifies a string using Sha256HmacKey2019', async () => {
        const verifyData = uuid();
        const {id: keyId} = await helpers.generateKey(
          {mockData, type: 'Sha256HmacKey2019'});
        const signOperation = clone(mockData.operations.sign);
        signOperation.invocationTarget = keyId;
        signOperation.verifyData = verifyData;
        const {signatureValue} = await brKms.runOperation(
          {operation: signOperation});
        const verifyOperation = clone(mockData.operations.verify);
        verifyOperation.invocationTarget = keyId;
        verifyOperation.verifyData = verifyData;
        verifyOperation.signatureValue = signatureValue;
        let result;
        let error;
        try {
          result = await brKms.runOperation({operation: verifyOperation});
        } catch(e) {
          error = e;
        }
        assertNoError(error);
        should.exist(result);
        result.should.be.an('object');
        result.should.have.keys(['verified']);
        result.verified.should.be.true;
      });
    }); // end VerifyOperation
  }); // end runOperation API
}); // end bedrock-kms
