/*
 * Copyright (c) 2018-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {keystores} = require('bedrock-kms');
const helpers = require('./helpers');

describe('Keystores Database Tests', () => {
  describe('Indexes', async () => {
    let mockConfigAlpha;
    beforeEach(async () => {
      await helpers.prepareDatabase();
      mockConfigAlpha = {
        id: 'https://example.com/keystores/' +
          '8b688649-d546-4e88-9027-da434bac495a',
        kmsModule: 'ssm-v1',
        controller: 'caf40b44-0e66-44ef-b331-23f6ca0bb837',
        sequence: 0,
        meterId: '6fb34a1a-e26d-49bc-bd00-66873ab0d147'
      };

      const mockConfigBeta = {
        id: 'https://example.com/keystores/' +
          '6821b4ec-2630-4bf3-9464-39581d2c4499',
        kmsModule: 'ssm-v1',
        controller: 'caf40b44-0e66-44ef-b331-23f6ca0bb837',
        sequence: 0,
        meterId: '6fb34a1a-e26d-49bc-bd00-66873ab0d147'
      };

      await keystores.insert({config: mockConfigAlpha});
      // second record is inserted here in order to do proper assertions for
      // 'nReturned', 'totalKeysExamined' and 'totalDocsExamined'.
      await keystores.insert({config: mockConfigBeta});
    });
    it(`is properly indexed for 'config.controller' in find()`, async () => {
      // finds all records that match the 'config.controller' query since it is
      // a non unique index.
      const {executionStats} = await keystores.find({
        controller: mockConfigAlpha.controller,
        query: {},
        explain: true
      });
      executionStats.nReturned.should.equal(2);
      executionStats.totalKeysExamined.should.equal(2);
      executionStats.totalDocsExamined.should.equal(2);
      executionStats.executionStages.inputStage.stage
        .should.equal('IXSCAN');
    });
    it(`is properly indexed for 'config.id', 'config.sequence' and ` +
      `'config.kmsModule' in update()`, async () => {
      mockConfigAlpha.sequence += 1;
      const {executionStats} = await keystores.update({
        config: mockConfigAlpha,
        explain: true
      });
      executionStats.nReturned.should.equal(1);
      executionStats.totalKeysExamined.should.equal(1);
      executionStats.totalDocsExamined.should.equal(1);
      executionStats.executionStages.inputStage.inputStage.stage
        .should.equal('IXSCAN');
    });
    it(`is properly indexed for 'config.meter' in getStorageUsage()`,
      async () => {
        // finds all records that match the 'config.meter' query since it is
        // a non unique index.
        const {executionStats} = await keystores.getStorageUsage({
          meterId: mockConfigAlpha.meterId,
          explain: true
        });
        executionStats.nReturned.should.equal(2);
        executionStats.totalKeysExamined.should.equal(2);
        executionStats.totalDocsExamined.should.equal(2);
        executionStats.executionStages.inputStage.inputStage.stage
          .should.equal('IXSCAN');
      });
    it(`is properly indexed for 'config.id' in _getUncachedRecord()`,
      async () => {
        const {executionStats} = await keystores._helpers._getUncachedRecord({
          id: mockConfigAlpha.id,
          explain: true
        });
        executionStats.nReturned.should.equal(1);
        executionStats.totalKeysExamined.should.equal(1);
        executionStats.totalDocsExamined.should.equal(1);
        executionStats.executionStages.inputStage.inputStage.inputStage.stage
          .should.equal('IXSCAN');
      });

  });
});
