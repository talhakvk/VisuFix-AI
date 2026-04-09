const express = require('express');
const router = express.Router({ mergeParams: true });
const stepController = require('../controllers/stepController');

router.get('/', stepController.getStepsByFaultId);

module.exports = router;
