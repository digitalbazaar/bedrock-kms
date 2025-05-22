/*!
 * Copyright (c) 2019-2025 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';

const cfg = config.kms = {};
cfg.keystoreConfigCache = {
  max: 1000,
  ttl: 5 * 60 * 1000
};

// storage size to report to meter service
cfg.storageCost = {
  keystore: 1,
  key: 1
};
