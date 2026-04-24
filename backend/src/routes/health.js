const express = require('express');
const router = express.Router();

// 健康检查路由
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BIOVIBE后端服务运行正常',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;