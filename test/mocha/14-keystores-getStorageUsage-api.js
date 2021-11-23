/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {keystores, defaultModuleManager: moduleManager} = require('bedrock-kms');

describe('keystores APIs', () => {
  describe('getStorageUsage API', () => {
    it('successfully gets storage usage for a keystore', async () => {
      let err;
      let result;
      const config = {
        id: 'https://example.com/keystores/usage-test',
        controller: 'usage-test',
        kmsModule: 'ssm-v1',
        sequence: 0,
        meterId: 'foo'
      };
      try {
        await keystores.insert({config});
        result = await keystores.getStorageUsage({
          meterId: 'foo', moduleManager
        });
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.be.an('object');
      result.should.deep.equal({storage: 1});
    });
  }); // end getStorageUsage API
}); // end keystore APIs
