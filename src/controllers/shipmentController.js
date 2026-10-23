const prisma = require('../prisma/client');

const createShipment = async (req, res) => {
  try {
    const uid = Number(req.user.uid);
    const oid = Number(req.body.oid);

    if (!Number.isInteger(oid) || oid <= 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'A valid oid is required'
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        oid,
        uid
      }
    });

    if (!order) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Order not found'
      });
    }

    const shipment = await prisma.shipment.create({
      data: {
        oid,
        status: 'Pending'
      }
    });

    return res.status(201).json({
      status: 'OK',
      message: 'Shipment created successfully',
      data: shipment
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to create shipment'
    });
  }
};

const getMyShipments = async (req, res) => {
  try {
    const uid = Number(req.user.uid);

    const shipments = await prisma.shipment.findMany({
      where: {
        order: {
          uid
        }
      },
      orderBy: {
        shipid: 'asc'
      },
      include: {
        order: {
          select: {
            oid: true,
            createat: true
          }
        }
      }
    });

    return res.status(200).json({
      status: 'OK',
      data: shipments
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to get shipments'
    });
  }
};

module.exports = {
  createShipment,
  getMyShipments
};
