const express = require('express');

const {
  createOrder,
  getMyOrders
} = require('../controllers/orderController');

const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);

module.exports = router;
