/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {keystores, defaultModuleManager: moduleManager} = require('bedrock-kms');

describe('keystores APIs', () => {
  describe('getStorageUsage API', () => {
    it('gets storage usage for a keystore', async () => {
      let err;
      let result;
      const config = {
        id: 'https://example.com/keystores/usage-test1',
        controller: 'usage-test',
        kmsModule: 'ssm-v1',
        sequence: 0,
        meterId: 'usage-meter-1'
      };
      try {
        await keystores.insert({config});
        result = await keystores.getStorageUsage({
          meterId: 'usage-meter-1', moduleManager
        });
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.be.an('object');
      result.should.deep.equal({storage: 1});
    });
    it('gets custom storage usage for a keystore', async () => {
      let err;
      let result;
      const config = {
        id: 'https://example.com/keystores/usage-test2',
        controller: 'usage-test',
        kmsModule: 'ssm-v1',
        sequence: 0,
        meterId: 'usage-meter-2'
      };
      try {
        await keystores.insert({config});
        result = await keystores.getStorageUsage({
          meterId: 'usage-meter-2', moduleManager,
          async aggregate({usage}) {
            usage.storage++;
          }
        });
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.be.an('object');
      result.should.deep.equal({storage: 2});
    });
  }); // end getStorageUsage API
}); // end keystore APIs
