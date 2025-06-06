/*!
 * Copyright (c) 2019-2025 Digital Bazaar, Inc. All rights reserved.
 */
import {keystores} from '@bedrock/kms';

describe('keystores APIs', () => {
  const mockConfigAlpha = {
    id: 'https://example.com/keystores/b122cc8a-39be-4680-b88e-2593b1295b1b',
    kmsModule: 'ssm-v1',
    controller: '8a945a10-9f6a-4096-8306-c6c6825a9fe2',
    sequence: 0
  };
  const mockConfigBeta = {
    id: 'https://example.com/keystores/f454ad49-90eb-4f15-aff9-13048adc84d0',
    kmsModule: 'ssm-v1',
    controller: '8e79ce0e-926d-457c-b520-849663e1d9de',
    sequence: 0,
  };
  const mockConfigGamma = {
    id: 'https://example.com/keystores/6be652c3-3ed6-452b-a98a-cb0ad6905f37',
    kmsModule: 'ssm-v1',
    controller: 'f2da13ee-50d2-46ab-865d-ee23d609edbd',
    sequence: 0,
  };
  const mockConfigDelta = {
    id: 'https://example.com/keystores/f9da6f23-6e13-42e9-88d3-5c03011ecbbf',
    kmsModule: 'ssm-v1',
    controller: '17e77da1-bb7e-4fe2-b4dd-1c4bba933d7c',
    sequence: 0,
  };

  before(async () => {
    let err;
    try {
      await keystores.insert({config: mockConfigAlpha});
      await keystores.insert({config: mockConfigBeta});
      await keystores.insert({config: mockConfigGamma});
      await keystores.insert({config: mockConfigDelta});
    } catch(e) {
      err = e;
    }
    assertNoError(err);
  });
  describe('update API', () => {
    it('throws error on missing config', async () => {
      let err;
      let result;
      try {
        result = await keystores.update();
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.message.should.contain('config (object) is required');
    });
    it('successfully updates a keystore', async () => {
      let err;
      let result;
      const config = structuredClone(mockConfigAlpha);
      config.sequence++;
      config.controller = 'someOtherController';
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      result.should.be.a('boolean');
      result.should.be.true;
    });
    it('successfully updates a keystore twice', async () => {
      let err;
      let result;
      const config = structuredClone(mockConfigBeta);
      config.sequence++;
      config.controller = 'someOtherController';
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      result.should.be.a('boolean');
      result.should.be.true;

      // update same config again
      config.sequence++;
      config.controller = 'someOtherController2';
      result = undefined;
      err = undefined;
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      result.should.be.a('boolean');
      result.should.be.true;
    });
    it('successfully updates a keystore and gets a fresh value', async () => {
      const config = structuredClone(mockConfigDelta);

      // get keystore config to prime cache
      await keystores.get({id: config.id});

      // now update config
      let err;
      let result;
      config.sequence++;
      config.controller = 'someOtherController';
      const oldDelete = keystores._KEYSTORE_CONFIG_CACHE.delete;
      try {
        // remove cache delete functionality to test fresh API
        keystores._KEYSTORE_CONFIG_CACHE.delete = () => {};
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      } finally {
        keystores._KEYSTORE_CONFIG_CACHE.delete = oldDelete;
      }
      assertNoError(err);
      result.should.be.a('boolean');
      result.should.be.true;

      // get keystore config, should be stale
      const stale = await keystores.get({id: config.id});
      stale.config.controller.should.not.equal(config.controller);

      // get fresh config
      const fresh = await keystores.get({id: config.id, fresh: true});
      fresh.config.controller.should.equal(config.controller);
    });
    it('fails to updates a keystore using wrong sequence number', async () => {
      let err;
      let result;
      const config = structuredClone(mockConfigGamma);
      config.sequence++;
      config.controller = 'someOtherController';
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      result.should.be.a('boolean');
      result.should.be.true;

      // update same config again without updating the sequence number
      // config.sequence++;

      config.controller = 'someOtherController2';
      result = undefined;
      err = undefined;
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.name.should.equal('InvalidStateError');
      err.details.id.should.equal(config.id);
      err.details.sequence.should.equal(config.sequence);
    });
    it('successfully updates a keystore and invalidates cache', async () => {
      let err;
      let result;
      const config = structuredClone(mockConfigBeta);
      config.sequence = 3;
      config.controller = 'someOtherController';
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      result.should.be.a('boolean');
      result.should.be.true;
      const keyRecord = await keystores.get({id: config.id});
      should.exist(keyRecord);
      keyRecord.config.sequence.should.equal(3);
    });
    it('throws error on unknown keystore id', async () => {
      let err;
      let result;
      const config = structuredClone(mockConfigBeta);
      config.sequence++;
      config.id = 'someOtherId';
      try {
        result = await keystores.update({config});
      } catch(e) {
        err = e;
      }
      should.not.exist(result);
      should.exist(err);
      err.name.should.equal('InvalidStateError');
    });
  });
});
