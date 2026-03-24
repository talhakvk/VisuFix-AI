const path = require('path');
const fs = require('fs');
const faultModel = require('../models/faultModel');

function createFault(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required.' });
    }
    const photoUrl = 'uploads/' + req.file.filename;
    const fault = faultModel.createFault(photoUrl);
    return res.status(201).json(fault);
  } catch (error) {
    next(error);
  }
}

function getAllFaults(req, res, next) {
  try {
    const faults = faultModel.getAllFaults();
    return res.status(200).json(faults);
  } catch (error) {
    next(error);
  }
}

function getFaultById(req, res, next) {
  try {
    const fault = faultModel.getFaultById(req.params.id);
    if (!fault) {
      return res.status(404).json({ error: 'Fault not found.' });
    }
    return res.status(200).json(fault);
  } catch (error) {
    next(error);
  }
}

function deleteFault(req, res, next) {
  try {
    const fault = faultModel.getFaultById(req.params.id);
    if (!fault) {
      return res.status(404).json({ error: 'Fault not found.' });
    }

    const filePath = path.join(process.cwd(), fault.photo_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    faultModel.deleteFault(req.params.id);
    return res.status(200).json({ message: 'Fault deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = { createFault, getAllFaults, getFaultById, deleteFault };
