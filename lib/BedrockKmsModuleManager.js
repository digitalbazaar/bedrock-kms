/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as brPackageManager from 'bedrock-package-manager';

// load config defaults
import './config.js';

export class BedrockKmsModuleManager {
  async get({id}) {
    const {packageName} = brPackageManager.get(
      {alias: id, type: 'webkms-module'});
    const api = await import(packageName);
    return api.default || api;
  }
}
