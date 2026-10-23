const express = require('express');

const {
  register,
  login
} = require('../controllers/authController');

const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', authMiddleware, (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Token is valid',
    data: req.user
  });
});

module.exports = router;
