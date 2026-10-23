const express = require('express');

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:pid', getProductById);

router.post('/', authMiddleware, createProduct);
router.put('/:pid', authMiddleware, updateProduct);
router.delete('/:pid', authMiddleware, deleteProduct);

module.exports = router;
