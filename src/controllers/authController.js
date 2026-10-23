const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

const register = async (req, res) => {
  try {
    const { username, fullname, password } = req.body;

    if (!username || !fullname || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'username, fullname and password are required'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'ERROR',
        message: 'Username already exists'
      });
    }

    let role = await prisma.role.findFirst({
      where: { rolename: 'normal' }
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          rolename: 'normal'
        }
      });
    }

    let memberShip = await prisma.memberShip.findFirst({
      where: { mname: 'Normal' }
    });

    if (!memberShip) {
      memberShip = await prisma.memberShip.create({
        data: {
          mname: 'Normal',
          score: 10
        }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        fullname,
        password: hashedPassword,
        roleid: role.roleid,
        mid: memberShip.mid
      },
      select: {
        uid: true,
        username: true,
        fullname: true,
        roleid: true,
        mid: true
      }
    });

    return res.status(201).json({
      status: 'OK',
      message: 'Register successful',
      data: user
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 'ERROR',
      message: 'Register failed'
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'username and password are required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid username or password'
      });
    }

    const passwordMatched = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatched) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Invalid username or password'
      });
    }

    const token = jwt.sign(
      {
        uid: user.uid,
        username: user.username,
        roleid: user.roleid
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    );

    return res.status(200).json({
      status: 'OK',
      message: 'Login successful',
      data: {
        token
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 'ERROR',
      message: 'Login failed'
    });
  }
};

module.exports = {
  register,
  login
};
