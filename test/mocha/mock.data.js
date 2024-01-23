/*!
 * Copyright (c) 2019-2024 Digital Bazaar, Inc. All rights reserved.
 */
export const mockData = {};
const operations = mockData.operations = {};

operations.generate = ({type}) => {
  return {
    type: 'GenerateKeyOperation',
    invocationTarget: {
      id: '',
      type,
      controller: 'https://example.com/bar'
    }
  };
};

operations.sign = {
  type: 'SignOperation',
  invocationTarget: '',
  verifyData: ''
};

operations.verify = {
  type: 'VerifyOperation',
  invocationTarget: '',
  verifyData: ''
};
