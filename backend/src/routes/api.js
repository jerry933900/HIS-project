const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// API版本标识
router.use('/v1', require('./v1'));

/**
 * 健康检查接口
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API 服务正常运行',
    timestamp: Date.now()
  });
});

module.exports = router;