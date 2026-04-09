const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const faultController = require('../controllers/faultController');

router.post('/', upload, faultController.createFault);
router.get('/', faultController.getAllFaults);
router.get('/:id', faultController.getFaultById);
router.delete('/:id', faultController.deleteFault);

module.exports = router;
