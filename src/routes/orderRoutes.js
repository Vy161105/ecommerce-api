
const express = require('express');

const {
  createOrder,
  getMyOrders,
  getOrderDetail
} = require('../controllers/orderController');

const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:oid', getOrderDetail);

module.exports = router;
