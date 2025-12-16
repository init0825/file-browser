# 文件浏览器 (File Browser)

一个基于 Vue 3 + Node.js 的网页文件浏览器，支持浏览目录、查看文件内容、播放视频等功能。

## 功能特性

- 📁 浏览目录结构
- 📄 查看文本文件内容
- 📋 JSON/JSONL 文件格式化显示
- 🖼️ 图片预览
- 🎬 视频播放
- 🎵 音频播放
- 📦 二进制文件下载

## 项目结构

```
file-browser/
├── backend/          # 后端服务
│   ├── server.js     # 主服务器
│   └── routes/       # API路由
├── frontend/         # 前端应用
│   └── src/
│       ├── components/  # Vue组件
│       └── ... 
└── test-files/       # 测试文件目录（可选）
```

## 快速开始

### 1. 安装后端依赖

```bash
cd backend
npm install
```

### 2. 安装前端依赖

```bash
cd frontend
npm install
```

### 3. 启动后端服务

```bash
cd backend
npm run dev
```

后端服务默认运行在 `http://localhost:3000`

### 4. 启动前端开发服务器

```bash
cd frontend
npm run dev
```

前端服务默认运行在 `http://localhost:5173`

### 5. 访问应用

打开浏览器访问 `http://localhost:5173`

## 配置说明

### 修改浏览的根目录

编辑 `backend/server.js`，修改 `ROOT_DIR` 变量：

```javascript
const ROOT_DIR = '/your/custom/path';
```

或通过环境变量设置：

```bash
ROOT_DIR=/your/custom/path npm start
```

## 后续扩展方向

- [ ] 文件搜索功能
- [ ] 文件上传功能
- [ ] 文件删除/重命名
- [ ] 多文件选择
- [ ] 文件排序选项
- [ ] 主题切换
- [ ] 用户认证