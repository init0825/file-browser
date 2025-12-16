/**
 * 文件浏览器后端服务主入口
 * 提供文件列表和文件内容的API服务
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const filesRouter = require('./routes/files');

// 创建Express应用实例
const app = express();

// 服务器端口配置
const PORT = process.env.PORT || 3000;

// 配置要浏览的根目录（可根据需要修改）
const ROOT_DIR = process.env.ROOT_DIR || path.join(__dirname, '../test-files');

// 中间件配置
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体

// 将根目录路径挂载到请求对象上，供路由使用
app.use((req, res, next) => {
  req.rootDir = ROOT_DIR;
  next();
});

// 注册文件相关路由
app.use('/api/files', filesRouter);

// 静态文件服务（用于视频等大文件的直接访问）
app.use('/static', express.static(ROOT_DIR));

// 错误处理中间件
app. use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`文件浏览器服务已启动，端口:  ${PORT}`);
  console.log(`浏览根目录: ${ROOT_DIR}`);
});