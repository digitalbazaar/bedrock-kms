/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {keystores, defaultModuleManager as moduleManager} from '@bedrock/kms';

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
    it('gets custom storage usage for a keystore when max concurrency is ' +
      'reached', async () => {
      let err;
      let result;
      // 54 is used in order to have a counters.length of 102 to ensure max
      // concurrency of 100 (`USAGE_COUNTER_MAX_CONCURRENCY`) is reached;
      // if this max concurrency changes, this test will need to change too
      for(let i = 3; i < 54; i++) {
        const config = {
          id: `https://example.com/keystores/usage-test${i}`,
          controller: 'usage-test',
          kmsModule: 'ssm-v1',
          sequence: 0,
          meterId: `usage-meter-3`
        };
        await keystores.insert({config});
      }
      try {
        result = await keystores.getStorageUsage({
          meterId: 'usage-meter-3', moduleManager,
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
      result.should.deep.equal({storage: 102});
    });
    it('aborts computing metered storage', async () => {
      let err;
      let result;
      const config = {
        id: 'https://example.com/keystores/usage-test55',
        controller: 'usage-test',
        kmsModule: 'ssm-v1',
        sequence: 0,
        meterId: 'usage-meter-55'
      };
      try {
        await keystores.insert({config});
        result = await keystores.getStorageUsage({
          signal: {
            abort: true
          },
          meterId: 'usage-meter-55', moduleManager,
          async aggregate({usage}) {
            usage.storage++;
          }
        });
      } catch(e) {
        err = e;
      }

      should.exist(err);
      should.not.exist(result);
      err.name.should.equal('AbortError');
    });
  }); // end getStorageUsage API
}); // end keystore APIs
