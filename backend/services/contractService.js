const { web3 } = require('../utils/contract');

exports.interact = async (data) => {
  // Interact with the smart contract here
  const result = await web3.eth.someMethod(data);
  return result;
};
