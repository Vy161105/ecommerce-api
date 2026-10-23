const express = require('express');

const {
  createShipment,
  getMyShipments
} = require('../controllers/shipmentController');

const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createShipment);
router.get('/my-shipments', getMyShipments);

module.exports = router;
