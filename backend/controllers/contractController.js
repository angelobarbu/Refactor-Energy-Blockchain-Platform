const contractService = require('../services/contractService');

exports.interactWithContract = async (req, res) => {
  try {
    const result = await contractService.interact(req.body);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
