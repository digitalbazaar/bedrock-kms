/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as brPackageManager from '@bedrock/package-manager';

// load config defaults
import './config.js';

const importMap = new Map();

export class BedrockKmsModuleManager {
  async get({id}) {
    const {packageName} = brPackageManager.get(
      {alias: id, type: 'webkms-module'});
    let api = await importMap.get(packageName);
    if(!api) {
      const promise = import(packageName);
      importMap.set(packageName, promise);
      api = await promise;
    }
    return api.default || api;
  }
}
