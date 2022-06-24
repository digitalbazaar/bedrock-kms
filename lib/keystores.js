/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import * as database from '@bedrock/mongodb';
import assert from 'assert-plus';
import {LruCache} from '@digitalbazaar/lru-memoize';
import pAll from 'p-all';

const {util: {BedrockError}} = bedrock;

// load config defaults
import './config.js';

const USAGE_COUNTER_MAX_CONCURRENCY = 100;
let KEYSTORE_CONFIG_CACHE;
let DISABLE_CLEAR_CACHE_ON_UPDATE = false;

// cache only exported for testing purposes
export {KEYSTORE_CONFIG_CACHE as _KEYSTORE_CONFIG_CACHE};

bedrock.events.on('bedrock.init', async () => {
  const cfg = bedrock.config.kms;
  KEYSTORE_CONFIG_CACHE = new LruCache({
    max: cfg.keystoreConfigCache.maxSize,
    maxAge: cfg.keystoreConfigCache.maxAge
  });
});

bedrock.events.on('bedrock-mongodb.ready', async () => {
  await database.openCollections(['kms-keystore']);

  await database.createIndexes([{
    // cover queries keystore by ID
    collection: 'kms-keystore',
    fields: {'config.id': 1},
    options: {unique: true, background: false}
  }, {
    // cover config queries by controller
    collection: 'kms-keystore',
    fields: {'config.controller': 1},
    options: {unique: false, background: false}
  }, {
    // ensure config uniqueness of reference ID per controller
    collection: 'kms-keystore',
    fields: {'config.controller': 1, 'config.referenceId': 1},
    options: {
      partialFilterExpression: {
        'config.referenceId': {$exists: true}
      },
      unique: true,
      background: false
    }
  }, {
    // cover counting keystores in use by meter ID, if present
    collection: 'kms-keystore',
    fields: {'config.meterId': 1},
    options: {
      partialFilterExpression: {
        'config.meterId': {$exists: true}
      },
      unique: false, background: false
    }
  }]);
});

/**
 * An object containing information on the query plan.
 *
 * @typedef {object} ExplainObject
 */

/**
 * Establishes a new keystore by inserting its configuration into storage.
 *
 * @param {object} options - The options to use.
 * @param {object} options.config - The keystore configuration.
 *
 * @returns {Promise<object>} The database record.
 */
export async function insert({config} = {}) {
  assert.object(config, 'config');
  assert.string(config.id, 'config.id');
  assert.string(config.controller, 'config.controller');
  assert.string(config.kmsModule, 'config.kmsModule');

  // require starting sequence to be 0
  if(config.sequence !== 0) {
    throw new BedrockError(
      'Keystore config sequence must be "0".',
      'DataError', {
        public: true,
        httpStatusCode: 400
      });
  }

  // insert the configuration and get the updated record
  const now = Date.now();
  const meta = {created: now, updated: now};
  const record = {
    meta,
    config
  };
  try {
    const result = await database.collections['kms-keystore'].insertOne(record);
    return result.ops[0];
  } catch(e) {
    if(!database.isDuplicateError(e)) {
      throw e;
    }
    throw new BedrockError(
      'Duplicate keystore configuration.',
      'DuplicateError', {
        public: true,
        httpStatusCode: 409
      }, e);
  }
}

/**
 * Retrieves all keystore configs matching the given query.
 *
 * @param {object} options - The options to use.
 * @param {string} options.controller - The controller for the keystores to
 *   retrieve.
 * @param {object} [options.query={}] - The query to use.
 * @param {object} [options.options={}] - The query options (eg: 'sort').
 * @param {boolean} [options.explain=false] - An optional explain boolean.
 *
 * @returns {Promise<Array | ExplainObject>} Resolves with the records that
 *   matched the query or an ExplainObject if `explain=true`.
 */
export async function find({
  controller, query = {}, options = {}, explain = false
} = {}) {
  assert.string(controller, 'options.controller');
  const collection = database.collections['kms-keystore'];

  // force controller ID
  query['config.controller'] = controller;
  const cursor = await collection.find(query, options);

  if(explain) {
    return cursor.explain('executionStats');
  }

  return cursor.toArray();
}

/**
 * Updates a keystore config if its sequence number is next.
 *
 * @param {object} options - The options to use.
 * @param {object} options.config - The keystore configuration.
 * @param {boolean} [options.explain=false] - An optional explain boolean.
 *
 * @returns {Promise<boolean | ExplainObject>} Resolves with `true` on update
 *   success or an ExplainObject if `explain=true`.
 */
export async function update({config, explain = false} = {}) {
  assert.object(config, 'config');

  const collection = database.collections['kms-keystore'];
  const query = {
    'config.id': config.id,
    'config.sequence': config.sequence - 1,
    // it is illegal to change the `kmsModule`, so it must match
    'config.kmsModule': config.kmsModule
  };

  if(explain) {
    // 'find().limit(1)' is used here because 'updateOne()' doesn't return a
    // cursor which allows the use of the explain function.
    const cursor = await collection.find(query).limit(1);
    return cursor.explain('executionStats');
  }

  // updates the keystore configuration
  const result = await collection.updateOne(query, {
    $set: {
      config,
      'meta.updated': Date.now()
    }
  });

  if(result.result.n === 0) {
    // no records changed...
    throw new BedrockError(
      'Could not update keystore configuration. ' +
      'Record sequence and "kmsModule" do not match or keystore does ' +
      'not exist.',
      'InvalidStateError', {
        id: config.id,
        sequence: config.sequence,
        httpStatusCode: 409,
        public: true
      });
  }

  if(!DISABLE_CLEAR_CACHE_ON_UPDATE) {
    // delete record from cache
    KEYSTORE_CONFIG_CACHE.delete(config.id);
  }

  return true;
}

/**
 * Gets a keystore configuration.
 *
 * @param {object} options - The options to use.
 * @param {string} options.id - The ID of the keystore.
 * @param {boolean} [options.fresh=false] - False if it is safe to use a
 *   potentially cached value, true to always get a fresh value.
 *
 * @returns {Promise<object>} Resolves to `{config, meta}`.
 */
export async function get({id, fresh = false} = {}) {
  assert.string(id, 'id');
  if(fresh) {
    KEYSTORE_CONFIG_CACHE.delete(id);
  }
  const fn = () => _getUncachedRecord({id});
  return KEYSTORE_CONFIG_CACHE.memoize({key: id, fn});
}

/**
 * Gets storage statistics for the given meter. This includes the total number
 * of keystores and keys associated with a meter ID, represented as storage
 * units according to this module's configuration.
 *
 * @param {object} options - The options to use.
 * @param {string} options.meterId - The ID of the meter to get.
 * @param {object} options.moduleManager - The KMS module manager to use.
 * @param {AbortSignal} [options.signal] - An abort signal to check.
 * @param {Function} [options.aggregate] - An aggregate function that will
 *   receive each keystore config that matches the `meterId` and the current
 *   usage; this function may be called to add custom additional usage
 *   associated with a keystore.
 * @param {boolean} [options.explain=false] - An optional explain boolean.
 *
 * @returns {Promise<object | ExplainObject>} Resolves with the storage usage
 *   for the meter or an ExplainObject if `explain=true`.
 */
export async function getStorageUsage({
  meterId, moduleManager, signal, aggregate, explain = false
} = {}) {
  // find all keystores with the given meter ID
  const cursor = await database.collections['kms-keystore'].find(
    {'config.meterId': meterId},
    {projection: {_id: 0, config: 1}});

  if(explain) {
    return cursor.explain('executionStats');
  }

  const {storageCost} = bedrock.config.kms;
  const usage = {storage: 0};
  const counters = [];
  while(await cursor.hasNext()) {
    // get next keystore config
    const {config} = await cursor.next();

    // add storage units for keystore
    usage.storage += storageCost.keystore;

    // if custom aggregator has been given, call it
    if(aggregate) {
      counters.push(() => {
        _checkComputeStorageSignal({signal, meterId});
        return aggregate({meterId, config, usage});
      });
    }

    // add storage units for keys in keystore
    const {id: keystoreId, kmsModule} = config;

    // get KMS module API and ensure its keys can be counted
    const moduleApi = await moduleManager.get({id: kmsModule});
    if(!(moduleApi && typeof moduleApi.getKeyCount === 'function')) {
      throw new BedrockError(
        'Bedrock KMS Module API is missing "getKeyCount()".',
        'NotFoundError',
        {kmsModule, httpStatusCode: 404, public: true});
    }

    // start counting keys in keystore
    counters.push(() => {
      _checkComputeStorageSignal({signal, meterId});
      return _addKeyCount({usage, moduleApi, keystoreId, signal});
    });

    _checkComputeStorageSignal({signal, meterId});
  }

  // await any counters that didn't complete
  await pAll(counters, {concurrency: USAGE_COUNTER_MAX_CONCURRENCY});

  return usage;
}

function _checkComputeStorageSignal({signal, meterId}) {
  if(signal && signal.abort) {
    throw new BedrockError(
      'Computing metered storage aborted.',
      'AbortError',
      {meterId, httpStatusCode: 503, public: true});
  }
}

async function _addKeyCount({usage, moduleApi, keystoreId}) {
  const {storageCost} = bedrock.config.kms;
  const {count} = await moduleApi.getKeyCount({keystoreId});
  usage.storage += count * storageCost.key;
}

// exported for testing purposes
export async function _getUncachedRecord({id, explain = false} = {}) {
  const collection = database.collections['kms-keystore'];
  const query = {'config.id': id};
  const projection = {_id: 0, config: 1, meta: 1};

  if(explain) {
    // 'find().limit(1)' is used here because 'findOne()' doesn't return a
    // cursor which allows the use of the explain function.
    const cursor = await collection.find(query, {projection}).limit(1);
    return cursor.explain('executionStats');
  }

  const record = await collection.findOne(query, {projection});
  if(!record) {
    throw new BedrockError(
      'Keystore configuration not found.',
      'NotFoundError',
      {keystoreId: id, httpStatusCode: 404, public: true});
  }
  return record;
}

// exported for testing purposes
export function _disableClearCacheOnUpdate(disable) {
  DISABLE_CLEAR_CACHE_ON_UPDATE = disable;
}
