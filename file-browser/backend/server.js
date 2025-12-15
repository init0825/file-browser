/**
 * 文件浏览器后端服务
 * 提供文件系统访问的REST API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 默认根目录
let ROOT_DIR = path.join(__dirname, '../test-files');

// 中间件配置
app.use(cors());
app.use(express.json());

// 动态静态文件服务中间件
app.use('/static', (req, res, next) => {
  const filePath = path. join(ROOT_DIR, req. path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ success: false, message: '文件不存在' });
  }
});

// 将当前根目录注入到请求对象中
app.use((req, res, next) => {
  req.rootDir = ROOT_DIR;
  next();
});

// 获取当前根目录
app.get('/api/config/root', (req, res) => {
  res.json({
    success: true,
    rootDir:  ROOT_DIR
  });
});

// 设置新的根目录
app.post('/api/config/root', (req, res) => {
  const { rootDir } = req.body;
  
  if (!rootDir) {
    return res.status(400).json({
      success: false,
      message: '请提供根目录路径'
    });
  }
  
  // 验证路径是否存在
  const absolutePath = path.resolve(rootDir);
  
  if (!fs.existsSync(absolutePath)) {
    return res.status(400).json({
      success: false,
      message: '指定的路径不存在'
    });
  }
  
  // 验证是否为目录
  const stats = fs.statSync(absolutePath);
  if (!stats.isDirectory()) {
    return res.status(400).json({
      success: false,
      message:  '指定的路径不是一个目录'
    });
  }
  
  // 更新根目录
  ROOT_DIR = absolutePath;
  console.log(`根目录已更新为:  ${ROOT_DIR}`);
  
  res.json({
    success: true,
    message:  '根目录设置成功',
    rootDir: ROOT_DIR
  });
});

// 文件操作路由
const filesRouter = require('./routes/files');
app.use('/api/files', filesRouter);

// 启动服务器
app.listen(PORT, () => {
  console.log(`文件浏览器服务已启动，端口: ${PORT}`);
  console.log(`当前根目录: ${ROOT_DIR}`);
});