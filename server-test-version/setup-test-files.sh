#!/bin/bash

# 创建测试文件目录结构的脚本

echo "正在创建测试文件..."

# 创建目录
mkdir -p test-files/documents
mkdir -p test-files/data
mkdir -p test-files/images
mkdir -p test-files/media

# 创建 welcome.txt
cat > test-files/welcome.txt << 'EOF'
欢迎使用文件浏览器！

这是一个演示项目，您可以：
1. 浏览目录结构
2. 查看文本文件
3. 预览 JSON 和 JSONL 文件
4. 查看图片
5. 播放视频和音频文件

请点击左侧的文件夹进行浏览，或点击文件查看内容。
EOF

# 创建 documents/readme.txt
cat > test-files/documents/readme.txt << 'EOF'
项目说明文档
============

这是一个基于 Vue 3 + Node.js 的文件浏览器项目。

功能特性：
- 目录浏览
- 文件预览
- 多种文件类型支持

技术栈：
- 前端：Vue 3 + Vite + Axios
- 后端：Node.js + Express

作者：init0825
日期：2025-12-15
EOF

# 创建 documents/notes.md
cat > test-files/documents/notes.md << 'EOF'
# 开发笔记

## 2025-12-15

### 完成的功能

- [x] 目录列表显示
- [x] 文件预览功能
- [x] JSON 格式化显示
- [x] JSONL 文件支持

### 待完成功能

- [ ] 文件搜索
- [ ] 文件上传
- [ ] 拖拽排序

## 代码示例

```javascript
// 获取文件列表
const files = await fetchFiles('/api/files/list');
console.log(files);