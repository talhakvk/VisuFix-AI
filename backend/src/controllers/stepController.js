const faultModel = require('../models/faultModel');
const stepModel = require('../models/stepModel');

function getStepsByFaultId(req, res, next) {
  try {
    const fault = faultModel.getFaultById(req.params.id);
    if (!fault) {
      return res.status(404).json({ error: 'Fault not found.' });
    }
    const steps = stepModel.getStepsByFaultId(req.params.id);
    return res.status(200).json(steps);
  } catch (error) {
    next(error);
  }
}

module.exports = { getStepsByFaultId };
