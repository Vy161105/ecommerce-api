const prisma = require('../prisma/client');

const createOrder = async (req, res) => {
  try {
    const uid = Number(req.user.uid);
    const { items } = req.body;

    if (!Number.isInteger(uid)) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid user'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'items must be a non-empty array'
      });
    }

    const seenProductIds = new Set();

    for (const item of items) {
      const pid = Number(item.pid);
      const qty = Number(item.qty);

      if (
        !Number.isInteger(pid) ||
        pid <= 0 ||
        !Number.isInteger(qty) ||
        qty <= 0
      ) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Each item must have a valid pid and positive integer qty'
        });
      }

      if (seenProductIds.has(pid)) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Each product can appear only once in items'
        });
      }

      seenProductIds.add(pid);
    }

    const order = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { uid }
      });

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      const orderItems = [];

      for (const item of items) {
        const pid = Number(item.pid);
        const qty = Number(item.qty);

        const product = await tx.product.findUnique({
          where: { pid }
        });

        if (!product) {
          const error = new Error(`Product ${pid} not found`);
          error.statusCode = 404;
          throw error;
        }

        if (product.quantity < qty) {
          const error = new Error(
            `Insufficient stock for product ${product.pname}`
          );
          error.statusCode = 400;
          throw error;
        }

        const updated = await tx.product.updateMany({
          where: {
            pid,
            quantity: { gte: qty }
          },
          data: {
            quantity: { decrement: qty }
          }
        });

        if (updated.count !== 1) {
          const error = new Error(
            `Insufficient stock for product ${product.pname}`
          );
          error.statusCode = 400;
          throw error;
        }

        orderItems.push({
          pid,
          qty,
          unit_price: product.price
        });
      }

      return tx.order.create({
        data: {
          uid,
          orderDetails: {
            create: orderItems.map((item) => ({
              pid: item.pid,
              qty: item.qty,
              unit_price: item.unit_price
            }))
          }
        },
        include: {
          orderDetails: {
            include: {
              product: {
                select: {
                  pid: true,
                  pname: true
                }
              }
            }
          }
        }
      });
    });

    return res.status(201).json({
      status: 'OK',
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      status: 'ERROR',
      message: error.statusCode ? error.message : 'Failed to create order'
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const uid = Number(req.user.uid);

    const orders = await prisma.order.findMany({
      where: { uid },
      orderBy: { createat: 'desc' },
      include: {
        orderDetails: {
          include: {
            product: {
              select: {
                pid: true,
                pname: true
              }
            }
          }
        },
        shipments: true
      }
    });

    return res.status(200).json({
      status: 'OK',
      data: orders
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get orders'
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders
};
