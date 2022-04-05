/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as keystores from './keystores.js';
import {BedrockKmsModuleManager} from './BedrockKmsModuleManager.js';
import {didIo} from '@bedrock/did-io';
import {documentLoader} from '@bedrock/jsonld-document-loader';
import '@bedrock/did-context';
import '@bedrock/security-context';
import '@bedrock/veres-one-context';

// load config defaults
import './config.js';

async function defaultDocumentLoader(url) {
  let document;
  if(url.startsWith('did:')) {
    document = await didIo.get({did: url});
    return {
      contextUrl: null,
      documentUrl: url,
      document
    };
  }

  // finally, try the bedrock document loader
  return documentLoader(url);
}
const defaultModuleManager = new BedrockKmsModuleManager();

export {
  BedrockKmsModuleManager, keystores,
  defaultDocumentLoader, defaultModuleManager
};
