/**
 * 文件操作相关的API路由
 * 提供目录列表获取和文件内容读取功能
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');

/**
 * 获取指定目录下的文件和文件夹列表
 */
router.get('/list', async (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const absolutePath = path.join(req. rootDir, relativePath);

    if (! absolutePath. startsWith(req.rootDir)) {
      return res.status(403).json({
        success: false,
        message: '访问被拒绝：路径超出允许范围'
      });
    }

    const items = await fs.readdir(absolutePath, { withFileTypes: true });

    const fileList = await Promise.all(
      items. map(async (item) => {
        const itemPath = path.join(absolutePath, item.name);
        const stats = await fs.stat(itemPath);
        const isDirectory = item.isDirectory();

        return {
          name: item.name,
          isDirectory:  isDirectory,
          size: isDirectory ? null : stats.size,
          modifiedTime: stats.mtime,
          mimeType: isDirectory ? null : mime.lookup(item.name) || 'application/octet-stream'
        };
      })
    );

    fileList.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json({
      success: true,
      currentPath: relativePath,
      data: fileList
    });

  } catch (error) {
    console.error('读取目录失败:', error);
    res.status(500).json({
      success: false,
      message: '读取目录失败',
      error: error.message
    });
  }
});

/**
 * 获取文件内容
 */
router.get('/content', async (req, res) => {
  try {
    const relativePath = req.query.path || '';
    const absolutePath = path.join(req.rootDir, relativePath);

    if (!absolutePath.startsWith(req. rootDir)) {
      return res.status(403).json({
        success: false,
        message: '访问被拒绝：路径超出允许范围'
      });
    }

    const stats = await fs.stat(absolutePath);
    if (stats.isDirectory()) {
      return res.status(400).json({
        success: false,
        message: '请求的路径是一个目录，不是文件'
      });
    }

    const mimeType = mime.lookup(absolutePath) || 'application/octet-stream';
    console.log(`文件:  ${relativePath}, MIME类型: ${mimeType}`);

    // 文本类文件
    if (mimeType.startsWith('text/') || 
        mimeType === 'application/json' ||
        mimeType === 'application/x-ndjson' ||
        absolutePath.endsWith('.jsonl')) {
      const content = await fs.readFile(absolutePath, 'utf-8');
      res.json({
        success: true,
        type: 'text',
        mimeType:  mimeType,
        content:  content
      });
    } 
    // 图片文件
    else if (mimeType.startsWith('image/')) {
      const content = await fs.readFile(absolutePath);
      const base64 = content.toString('base64');
      res.json({
        success: true,
        type: 'image',
        mimeType: mimeType,
        content: `data:${mimeType};base64,${base64}`
      });
    } 
    // PDF文件
    else if (mimeType === 'application/pdf') {
      console.log(`PDF文件检测成功:  ${relativePath}`);
      res.json({
        success: true,
        type: 'pdf',
        mimeType: mimeType,
        url: `/static/${relativePath}`
      });
    }
    // 视频文件
    else if (mimeType.startsWith('video/')) {
      res.json({
        success: true,
        type: 'video',
        mimeType: mimeType,
        url: `/static/${relativePath}`
      });
    } 
    // 音频文件
    else if (mimeType.startsWith('audio/') || mimeType === 'audio/mpeg') {
      console.log(`音频文件检测成功: ${relativePath}`);
      res.json({
        success: true,
        type: 'audio',
        mimeType: mimeType,
        url: `/static/${relativePath}`
      });
    } 
    // 其他二进制文件
    else {
      res.json({
        success: true,
        type:  'binary',
        mimeType: mimeType,
        url: `/static/${relativePath}`,
        message: '此文件类型不支持预览，请下载查看'
      });
    }

  } catch (error) {
    console.error('读取文件失败:', error);
    res.status(500).json({
      success: false,
      message:  '读取文件失败',
      error: error.message
    });
  }
});

module.exports = router;