/*!
 * Copyright (c) 2019-2026 Digital Bazaar, Inc. All rights reserved.
 */
import * as brPackageManager from '@bedrock/package-manager';

// load config defaults
import './config.js';

const importMap = new Map();

export class BedrockKmsModuleManager {
  async get({id} = {}) {
    const {packageName} = brPackageManager.get(
      {alias: id, type: 'webkms-module'});
    let mod = await importMap.get(packageName);
    if(!mod) {
      const promise = import(packageName);
      importMap.set(packageName, promise);
      mod = await promise;
    }
    const api = await mod.getKmsModuleApi?.() ?? mod.default ?? mod;
    return api;
  }
}
