const prisma = require('../prisma/client');

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        pid: 'asc'
      }
    });

    res.status(200).json({
      status: 'OK',
      data: products
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get products'
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const pid = Number(req.params.pid);

    if (!Number.isInteger(pid)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid product id'
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        pid
      }
    });

    if (!product) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Product not found'
      });
    }

    res.status(200).json({
      status: 'OK',
      data: product
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get product'
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { pname, price, quantity } = req.body;

    if (!pname || price === undefined || quantity === undefined) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'pname, price and quantity are required'
      });
    }

    const product = await prisma.product.create({
      data: {
        pname,
        price: Number(price),
        quantity: Number(quantity)
      }
    });

    res.status(201).json({
      status: 'OK',
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create product'
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const pid = Number(req.params.pid);
    const { pname, price, quantity } = req.body;

    if (!Number.isInteger(pid)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid product id'
      });
    }

    const product = await prisma.product.update({
      where: {
        pid
      },
      data: {
        ...(pname !== undefined && { pname }),
        ...(price !== undefined && { price: Number(price) }),
        ...(quantity !== undefined && { quantity: Number(quantity) })
      }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to update product'
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const pid = Number(req.params.pid);

    if (!Number.isInteger(pid)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Invalid product id'
      });
    }

    await prisma.product.delete({
      where: {
        pid
      }
    });

    res.status(200).json({
      status: 'OK',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to delete product'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
