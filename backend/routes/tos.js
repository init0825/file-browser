const express = require('express');
const router = express.Router();
const TOS = require('@volcengine/tos-sdk');
const path = require('path');
require('dotenv').config();

// 配置 TOS SDK
const tosClient = new TOS.TOS({
  accessKeyId: process.env.TOS_ACCESS_KEY,
  secretAccessKey: process.env.TOS_SECRET_KEY,
  endpoint: process.env.TOS_ENDPOINT
});

const BUCKET_NAME = process.env.TOS_BUCKET;

// 列出 TOS 中的目录内容
router.get('/list', async (req, res) => {
  try {
    const prefix = req.query.path || '';

    const result = await tosClient.listObjectsV2({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      Delimiter: '/'
    });

    const fileList = [
      ...(result.CommonPrefixes || []).map(folder => ({
        name: folder.Prefix,
        isDirectory: true
      })),
      ...(result.Contents || []).map(file => ({
        name: path.basename(file.Key),
        isDirectory: false,
        size: file.Size,
        modifiedTime: file.LastModified
      }))
    ];

    fileList.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json({ success: true, currentPath: prefix, data: fileList });
  } catch (error) {
    console.error('获取TOS目录失败:', error);
    res.status(500).json({ success: false, message: '获取文件列表失败', error: error.message });
  }
});

// 获取 TOS 中的文件内容
router.get('/content', async (req, res) => {
  try {
    const key = req.query.path;
    if (!key) {
      return res.status(400).json({ success: false, message: '未指定文件路径' });
    }

    const file = await tosClient.getObject({ Bucket: BUCKET_NAME, Key: key });
    const type = file.ContentType;

    if (type.startsWith('text/') || type === 'application/json') {
      res.send(await file.StreamPromise); // 文本内容直接返回
    } else {
      res.status(415).json({ success: false, message: '不支持的文件类型' });
    }
  } catch (error) {
    console.error('获取TOS文件失败:', error);
    res.status(500).json({ success: false, message: '获取文件内容失败', error: error.message });
  }
});

module.exports = router;
