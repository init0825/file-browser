const tosRoutes = require('./routes/tos'); // 引入 TOS 路由模块

// 添加 /api/tos 前缀路由
app.use('/api/tos', tosRoutes);