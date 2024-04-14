/*!
 * Copyright (c) 2019-2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as keystores from './keystores.js';
import {BedrockKmsModuleManager} from './BedrockKmsModuleManager.js';

// load config defaults
import './config.js';

const defaultModuleManager = new BedrockKmsModuleManager();

export {BedrockKmsModuleManager, keystores, defaultModuleManager};
